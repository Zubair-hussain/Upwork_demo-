"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Application, calculateFitScore, calculateRemainingConnects, getFitLabel } from "@/lib/assessment";
import { jobs, startingConnects } from "@/lib/jobs";

const applicationKey = "uet-applications";
const viewsKey = "uet-client-views";
const profileKey = "uet-candidate-profile";

type CandidateProfile = {
  name: string;
  description: string;
  savedAt: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function AdminClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewedJobIds, setViewedJobIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    setApplications(readJson<Application[]>(applicationKey, []));
    setViewedJobIds(readJson<string[]>(viewsKey, []));
    setProfile(readJson<CandidateProfile | null>(profileKey, null));
  }, []);

  const score = calculateFitScore(applications, viewedJobIds);
  const remainingConnects = calculateRemainingConnects(applications, startingConnects);
  const candidateName = profile?.name ?? applications[0]?.candidateName ?? "No candidate yet";
  const selectedCount = applications.filter((item) => item.selectedForRecord).length;
  const appliedById = useMemo(() => new Map(applications.map((item) => [item.jobId, item])), [applications]);

  function toggleRecord(jobId: string) {
    const next = applications.map((application) =>
      application.jobId === jobId
        ? { ...application, selectedForRecord: !application.selectedForRecord }
        : application
    );

    setApplications(next);
    saveJson(applicationKey, next);
  }

  function resetDemo() {
    setApplications([]);
    setViewedJobIds([]);
    setProfile(null);
    saveJson(applicationKey, []);
    saveJson(viewsKey, []);
    saveJson(profileKey, null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">UT</span>
          <span>Admin Site</span>
        </Link>
        <div className="nav-actions">
          <Link className="btn" href="/">
            <ArrowLeft size={16} /> Candidate Portal
          </Link>
          <button className="btn" onClick={resetDemo} type="button">
            <RefreshCcw size={16} /> Reset
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <div className="admin-panel">
          <p className="eyebrow" style={{ color: "#607066" }}>
            Fit decision
          </p>
          <h1>{candidateName}</h1>
          <p className="muted">{profile?.description ?? "No short description saved yet."}</p>
          {profile ? <p className="muted">Profile saved: {new Date(profile.savedAt).toLocaleString()}</p> : null}
          <div className="score">{score}/100</div>
          <p className="muted">{getFitLabel(score)} based on applications, answer depth, client views, and record selections.</p>
          <div className="mini-stats section">
            <div className="mini-stat">
              <strong>{applications.length}</strong>
              <span>Applied jobs</span>
            </div>
            <div className="mini-stat">
              <strong>{remainingConnects}</strong>
              <span>Connects left</span>
            </div>
            <div className="mini-stat">
              <strong>{selectedCount}</strong>
              <span>Record picks</span>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <h2>How Admin Should Read This</h2>
          <ul className="clean-list">
            <li>Excellent candidates apply to all seven jobs and write answers specific to each post guide.</li>
            <li>Client viewed jobs show which posts were opened from the client route.</li>
            <li>Record selection marks the applications worth saving for final review.</li>
            <li>High-connect jobs reveal whether the candidate can prioritize important opportunities.</li>
          </ul>
        </div>
      </section>

      <section className="admin-panel section">
        <h2>Job Review Board</h2>
        <div className="bid-list">
          {jobs.map((job) => {
            const application = appliedById.get(job.id);
            const viewed = viewedJobIds.includes(job.id);

            return (
              <div className="record-row" key={job.id}>
                <div className="record-top">
                  <div>
                    <strong>{job.title}</strong>
                    <div className="job-meta">
                      <span>{job.category}</span>
                      <span>{job.connectsRequired} connects</span>
                      <span>{job.bids.length} bids</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    {viewed ? (
                      <span className="pill good">
                        <Eye size={15} /> Client viewed
                      </span>
                    ) : (
                      <span className="pill">Not viewed</span>
                    )}
                    {application ? (
                      <button className="btn" onClick={() => toggleRecord(job.id)} type="button">
                        <ClipboardCheck size={16} />
                        {application.selectedForRecord ? "Remove record" : "Select record"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {application ? (
                  <>
                    <p><strong>Bid:</strong> ${application.bidAmount}</p>
                    <p><strong>Boost Connects:</strong> {application.boostConnects}</p>
                    <p><strong>Milestone:</strong> {application.milestone}</p>
                    <p><strong>Cover letter:</strong> {application.coverLetter || "No cover letter entered."}</p>
                    <p className="muted">{application.answer}</p>
                    {application.selectedForRecord ? (
                      <span className="pill good">
                        <CheckCircle2 size={15} /> Saved for final selection
                      </span>
                    ) : null}
                  </>
                ) : (
                  <p className="muted">Candidate has not applied to this job yet.</p>
                )}
                <div>
                  <strong>Post guide:</strong>
                  <ul className="clean-list">
                    {job.postGuide.map((guide) => (
                      <li key={guide}>{guide}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
