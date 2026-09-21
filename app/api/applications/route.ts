import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Application } from "@/lib/assessment";
import { verifyAdminJwt } from "@/lib/adminAuth";
import { getAllCandidates, setRecordSelection, upsertSubmission } from "@/lib/store";

// Node runtime so the file-backed store (fs) works.
export const runtime = "nodejs";
// Never cache: the admin must always see the latest candidate data.
export const dynamic = "force-dynamic";

type IncomingApplication = Partial<Application> & {
  candidateEmail?: string;
  candidateDescription?: string;
};

function isValid(body: IncomingApplication): body is IncomingApplication &
  Pick<Application, "jobId" | "candidateName" | "bidAmount" | "boostConnects"> {
  return (
    typeof body.jobId === "string" &&
    body.jobId.length > 0 &&
    typeof body.candidateName === "string" &&
    body.candidateName.trim().length > 0 &&
    typeof body.candidateEmail === "string" &&
    /^\S+@\S+\.\S+$/.test(body.candidateEmail.trim()) &&
    typeof body.bidAmount === "number" &&
    Number.isFinite(body.bidAmount) &&
    typeof body.boostConnects === "number" &&
    Number.isFinite(body.boostConnects)
  );
}

export async function POST(request: Request) {
  let body: IncomingApplication;
  try {
    body = (await request.json()) as IncomingApplication;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: "Missing required application fields." }, { status: 400 });
  }

  const application: Application = {
    jobId: body.jobId,
    candidateName: body.candidateName.trim(),
    bidAmount: body.bidAmount,
    boostConnects: body.boostConnects,
    milestone: body.milestone ?? "",
    milestoneTitle: body.milestoneTitle ?? "",
    milestoneDescription: body.milestoneDescription ?? "",
    milestones: Array.isArray(body.milestones) ? body.milestones : [],
    coverLetter: body.coverLetter ?? "",
    answer: body.answer ?? "",
    selectedForRecord: false,
    appliedAt: body.appliedAt ?? new Date().toISOString()
  };

  await upsertSubmission(
    (body.candidateEmail ?? "").trim().toLowerCase(),
    (body.candidateDescription ?? "").trim(),
    application
  );

  return NextResponse.json({ ok: true });
}

async function requireAdmin() {
  const cookieStore = await cookies();
  return verifyAdminJwt(cookieStore.get("uet_admin_jwt")?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const candidates = await getAllCandidates();
  return NextResponse.json({ candidates });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { candidateName?: string; jobId?: string; selected?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.candidateName !== "string" || typeof body.jobId !== "string" || typeof body.selected !== "boolean") {
    return NextResponse.json({ error: "Missing candidateName, jobId, or selected." }, { status: 400 });
  }

  await setRecordSelection(body.candidateName, body.jobId, body.selected);
  return NextResponse.json({ ok: true });
}
