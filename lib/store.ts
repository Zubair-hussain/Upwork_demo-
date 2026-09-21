import { promises as fs } from "fs";
import path from "path";
import type { Application } from "./assessment";
import { getDb, isFirestoreConfigured } from "./firebaseAdmin";

// Server-side shared store so applications from *every* candidate (across
// different browsers/devices) land in one place the admin page can read.
//
// Two backends:
//   - Firestore  — used when FIREBASE_* env vars are set (production/Vercel).
//     Durable and safe across many serverless instances; nothing is lost on
//     redeploy or under concurrent applicants.
//   - JSON file  — used locally (and in tests) when Firebase is not configured,
//     so development needs no cloud setup.

export type Submission = Application & {
  candidateEmail: string;
  candidateDescription: string;
  updatedAt: string;
};

type StoreShape = { submissions: Submission[] };

const dataFile = path.join(process.cwd(), "data", "submissions.json");

// Firestore document ids cannot contain "/", so encode the composite key.
const COLLECTION = "submissions";
function docId(candidateName: string, jobId: string): string {
  return encodeURIComponent(`${candidateId(candidateName)}__${jobId}`);
}

function candidateId(name: string): string {
  return name.trim().toLowerCase();
}

// ---- shared grouping (identical output for both backends) --------------------

export type CandidateRecord = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateDescription: string;
  updatedAt: string;
  applications: Submission[];
};

function groupCandidates(submissions: Submission[]): CandidateRecord[] {
  const byCandidate = new Map<string, CandidateRecord>();

  for (const submission of submissions) {
    const id = candidateId(submission.candidateName);
    const existing = byCandidate.get(id);
    if (existing) {
      existing.applications.push(submission);
      if (submission.updatedAt > existing.updatedAt) {
        existing.updatedAt = submission.updatedAt;
        existing.candidateEmail = submission.candidateEmail ?? "";
        existing.candidateDescription = submission.candidateDescription;
        existing.candidateName = submission.candidateName;
      }
    } else {
      byCandidate.set(id, {
        candidateId: id,
        candidateName: submission.candidateName,
        candidateEmail: submission.candidateEmail ?? "",
        candidateDescription: submission.candidateDescription,
        updatedAt: submission.updatedAt,
        applications: [submission]
      });
    }
  }

  return [...byCandidate.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ---- Firestore backend -------------------------------------------------------

async function upsertSubmissionFirestore(submission: Submission): Promise<void> {
  const ref = getDb().collection(COLLECTION).doc(docId(submission.candidateName, submission.jobId));
  const snapshot = await ref.get();
  if (snapshot.exists) {
    // Preserve an admin's record selection across candidate re-submits.
    const prev = snapshot.data() as Submission;
    submission.selectedForRecord = prev.selectedForRecord ?? false;
  }
  await ref.set(submission);
}

async function setRecordSelectionFirestore(
  candidateName: string,
  jobId: string,
  selected: boolean
): Promise<void> {
  const ref = getDb().collection(COLLECTION).doc(docId(candidateName, jobId));
  const snapshot = await ref.get();
  if (snapshot.exists) {
    await ref.update({ selectedForRecord: selected });
  }
}

async function getAllCandidatesFirestore(): Promise<CandidateRecord[]> {
  const snapshot = await getDb().collection(COLLECTION).get();
  const submissions = snapshot.docs.map((doc) => doc.data() as Submission);
  return groupCandidates(submissions);
}

// ---- JSON-file backend (local/dev/tests) ------------------------------------

let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  // Keep the chain alive regardless of success/failure.
  lock = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<T>;
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    return { submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [] };
  } catch {
    return { submissions: [] };
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

async function upsertSubmissionFile(submission: Submission): Promise<void> {
  await withLock(async () => {
    const store = await readStore();
    const id = candidateId(submission.candidateName);
    const index = store.submissions.findIndex(
      (item) => candidateId(item.candidateName) === id && item.jobId === submission.jobId
    );

    if (index >= 0) {
      // Preserve an admin's record selection across candidate re-submits.
      submission.selectedForRecord = store.submissions[index].selectedForRecord;
      store.submissions[index] = submission;
    } else {
      store.submissions.push(submission);
    }

    await writeStore(store);
  });
}

async function setRecordSelectionFile(
  candidateName: string,
  jobId: string,
  selected: boolean
): Promise<void> {
  await withLock(async () => {
    const store = await readStore();
    const id = candidateId(candidateName);
    const item = store.submissions.find(
      (entry) => candidateId(entry.candidateName) === id && entry.jobId === jobId
    );
    if (item) {
      item.selectedForRecord = selected;
      await writeStore(store);
    }
  });
}

async function getAllCandidatesFile(): Promise<CandidateRecord[]> {
  const store = await readStore();
  return groupCandidates(store.submissions);
}

// ---- public API (picks the backend) -----------------------------------------

export async function upsertSubmission(
  candidateEmail: string,
  candidateDescription: string,
  application: Application
): Promise<void> {
  const submission: Submission = {
    ...application,
    candidateEmail,
    candidateDescription,
    updatedAt: new Date().toISOString()
  };

  if (isFirestoreConfigured()) {
    await upsertSubmissionFirestore(submission);
  } else {
    await upsertSubmissionFile(submission);
  }
}

export async function setRecordSelection(
  candidateName: string,
  jobId: string,
  selected: boolean
): Promise<void> {
  if (isFirestoreConfigured()) {
    await setRecordSelectionFirestore(candidateName, jobId, selected);
  } else {
    await setRecordSelectionFile(candidateName, jobId, selected);
  }
}

export async function getAllCandidates(): Promise<CandidateRecord[]> {
  if (isFirestoreConfigured()) {
    return getAllCandidatesFirestore();
  }
  return getAllCandidatesFile();
}
