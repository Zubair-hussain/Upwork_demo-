"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardCheck, RefreshCcw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Application, calculateFitScore, calculateRemainingConnects, getFitLabel } from "@/lib/assessment";
import { jobs, startingConnects } from "@/lib/jobs";

type Submission = Application & { candidateEmail: string; candidateDescription: string; updatedAt: string };

type CandidateRecord = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateDescription: string;
  updatedAt: string;
  applications: Submission[];
};

export function AdminClient() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/applications", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { candidates: CandidateRecord[] };
      setCandidates(data.candidates ?? []);
    } catch {
      /* ignore transient network errors; the next poll will retry */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Keep the admin board live so applications from every candidate appear
    // in near real time without a manual reload.
    const interval = window.setInterval(refresh, 4000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refresh]);

  // Keep a valid selection as the candidate list changes.
  useEffect(() => {
    if (candidates.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) =>
      current && candidates.some((candidate) => candidate.candidateId === current)
        ? current
        : candidates[0].candidateId
    );
  }, [candidates]);

  const selected = useMemo(
    () => candidates.find((candidate) => candidate.candidateId === selectedId) ?? null,
    [candidates, selectedId]
  );

  const totalApplications = candidates.reduce((sum, candidate) => sum + candidate.applications.length, 0);

  async function toggleRecord(candidateName: string, jobId: string, current: boolean) {
    // Optimistic update, then persist to the shared store.
    setCandidates((prev) =>
      prev.map((candidate) => ({
        ...candidate,
        applications: candidate.applications.map((application) =>
          application.candidateName === candidateName && application.jobId === jobId
            ? { ...application, selectedForRecord: !current }
            : application
        )
      }))
    );

    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateName, jobId, selected: !current })
      });
    } catch {
      /* ignore; a later refresh will reconcile */
    }
    refresh();
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
          <button className="btn" onClick={refresh} type="button">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <div className="admin-panel">
          <p className="eyebrow" style={{ color: "#607066" }}>
            Candidate pipeline
          </p>
          <h1>
            <Users size={22} style={{ verticalAlign: "-3px", marginRight: 8 }} />
            {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
          </h1>
          <p className="muted">
            {loaded
              ? `${totalApplications} application${totalApplications === 1 ? "" : "s"} received across all candidates.`
              : "Loading candidate data..."}
          </p>
          <div className="mini-stats section">
            <div className="mini-stat">
              <strong>{candidates.length}</strong>
              <span>Candidates</span>
            </div>
            <div className="mini-stat">
              <strong>{totalApplications}</strong>
              <span>Applications</span>
            </div>
            <div className="mini-stat">
              <strong>{jobs.length}</strong>
              <span>Open jobs</span>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <h2>How Admin Should Read This</h2>
          <ul className="clean-list">
            <li>Every candidate who applies appears here automatically — pick one to review their proposals.</li>
            <li>Excellent candidates apply to all seven jobs and write answers specific to each post guide.</li>
            <li>Record selection marks the applications worth saving for final review.</li>
            <li>High-connect jobs reveal whether the candidate can prioritize important opportunities.</li>
          </ul>
        </div>
      </section>

      <section className="admin-grid section">
        <div className="admin-panel">
          <h2>Candidates</h2>
          {candidates.length === 0 ? (
            <p className="muted">
              {loaded ? "No candidate has applied yet." : "Loading..."}
            </p>
          ) : (
            <div className="bid-list">
              {candidates.map((candidate) => {
                const remaining = calculateRemainingConnects(candidate.applications, startingConnects);
                const score = calculateFitScore(candidate.applications, []);
                const isActive = candidate.candidateId === selectedId;
                return (
                  <button
                    className={`record-row candidate-row${isActive ? " active" : ""}`}
                    key={candidate.candidateId}
                    onClick={() => setSelectedId(candidate.candidateId)}
                    style={{ textAlign: "left", cursor: "pointer", width: "100%" }}
                    type="button"
                  >
                    <div className="record-top">
                      <div>
                        <strong>{candidate.candidateName}</strong>
                        <div className="job-meta">
                          <span>{candidate.candidateEmail || "No email saved"}</span>
                          <span>{candidate.candidateDescription || "No title saved"}</span>
                        </div>
                      </div>
                      <span className="pill good">{candidate.applications.length}/{jobs.length} applied</span>
                    </div>
                    <div className="job-meta">
                      <span>Fit {score}/100 · {getFitLabel(score)}</span>
                      <span>{remaining} connects left</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <h2>{selected ? selected.candidateName : "Select a candidate"}</h2>
          {selected ? (
            <>
              {selected.candidateEmail ? (
                <p><strong>Email:</strong> <a href={`mailto:${selected.candidateEmail}`}>{selected.candidateEmail}</a></p>
              ) : (
                <p className="muted">No email address saved.</p>
              )}
              <p className="muted">{selected.candidateDescription || "No short description saved."}</p>
              <div className="score">{calculateFitScore(selected.applications, [])}/100</div>
              <p className="muted">
                {getFitLabel(calculateFitScore(selected.applications, []))} · last activity{" "}
                {new Date(selected.updatedAt).toLocaleString()}
              </p>
              <div className="mini-stats section">
                <div className="mini-stat">
                  <strong>{selected.applications.length}</strong>
                  <span>Applied jobs</span>
                </div>
                <div className="mini-stat">
                  <strong>{calculateRemainingConnects(selected.applications, startingConnects)}</strong>
                  <span>Connects left</span>
                </div>
                <div className="mini-stat">
                  <strong>{selected.applications.filter((item) => item.selectedForRecord).length}</strong>
                  <span>Record picks</span>
                </div>
              </div>
            </>
          ) : (
            <p className="muted">Candidate details appear here once someone applies.</p>
          )}
        </div>
      </section>

      {selected ? (
        <section className="admin-panel section">
          <h2>
            Jobs {selected.candidateName} applied to ({selected.applications.length})
          </h2>
          <div className="bid-list">
            {selected.applications.length === 0 ? (
              <p className="muted">This candidate has not applied to any job yet.</p>
            ) : (
              selected.applications.map((application) => {
                const job = jobs.find((item) => item.id === application.jobId);
                const title = job?.title ?? application.jobId;

                return (
                  <div className="record-row" key={application.jobId}>
                    <div className="record-top">
                      <div>
                        <strong>{title}</strong>
                        <div className="job-meta">
                          {job ? <span>{job.category}</span> : null}
                          <span>{job?.connectsRequired ?? 0} connects used</span>
                          <span>Bid: ${application.bidAmount}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn"
                          onClick={() =>
                            toggleRecord(application.candidateName, application.jobId, application.selectedForRecord)
                          }
                          type="button"
                        >
                          <ClipboardCheck size={16} />
                          {application.selectedForRecord ? "Remove record" : "Select record"}
                        </button>
                      </div>
                    </div>
                    <p><strong>Bid amount:</strong> ${application.bidAmount}</p>
                    <p><strong>Connects used:</strong> {(job?.connectsRequired ?? 0) + application.boostConnects}</p>
                    <p><strong>Payment:</strong> {application.milestone}</p>
                    {application.milestones?.length ? (
                      <div className="admin-milestones">
                        <strong>Milestones:</strong>
                        <ol>
                          {application.milestones.map((item, index) => (
                            <li key={`${application.jobId}-milestone-${index}`}>
                              <strong>{item.title}</strong>
                              <p>{item.description}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : application.milestoneTitle ? (
                      <p><strong>Milestone:</strong> {application.milestoneTitle} — {application.milestoneDescription}</p>
                    ) : null}
                    <p><strong>Cover letter:</strong> {application.coverLetter || "No cover letter entered."}</p>
                    <p><strong>Expert answer:</strong> {application.answer || "No answer entered."}</p>
                    <p className="muted">Applied {new Date(application.appliedAt).toLocaleString()}</p>
                    {application.selectedForRecord ? (
                      <span className="pill good">
                        <CheckCircle2 size={15} /> Saved for final selection
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
