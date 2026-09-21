import { promises as fs } from "fs";
import path from "path";
import type { Application } from "./assessment";

// Server-side shared store so applications from *every* candidate (across
// different browsers/devices) land in one place the admin page can read.
// Backed by a JSON file so data survives dev-server restarts. A small
// in-process lock serializes read-modify-write so concurrent applicants
// (40+ at once) do not clobber each other's writes.

export type Submission = Application & {
  candidateEmail: string;
  candidateDescription: string;
  updatedAt: string;
};

type StoreShape = { submissions: Submission[] };

const dataFile = path.join(process.cwd(), "data", "submissions.json");

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

function candidateId(name: string): string {
  return name.trim().toLowerCase();
}

export async function upsertSubmission(
  candidateEmail: string,
  candidateDescription: string,
  application: Application
): Promise<void> {
  await withLock(async () => {
    const store = await readStore();
    const id = candidateId(application.candidateName);
    const index = store.submissions.findIndex(
      (item) => candidateId(item.candidateName) === id && item.jobId === application.jobId
    );

    const submission: Submission = {
      ...application,
      candidateEmail,
      candidateDescription,
      updatedAt: new Date().toISOString()
    };

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

export async function setRecordSelection(
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

export type CandidateRecord = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateDescription: string;
  updatedAt: string;
  applications: Submission[];
};

export async function getAllCandidates(): Promise<CandidateRecord[]> {
  const store = await readStore();
  const byCandidate = new Map<string, CandidateRecord>();

  for (const submission of store.submissions) {
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
