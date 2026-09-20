import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { jobs } from "@/lib/jobs";

export function ClientJobs() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">UT</span>
          <span>Client Job View</span>
        </Link>
        <Link className="btn" href="/">
          <ArrowLeft size={16} /> Candidate Portal
        </Link>
      </header>

      <section className="filter-panel">
        <h1>Client visible jobs</h1>
        <p className="muted">Open any job here to mark it as seen by the private review dashboard.</p>
      </section>

      <section className="job-grid">
        {jobs.map((job) => (
          <article className="job-card" key={job.id}>
            <div className="job-head">
              <h3>{job.title}</h3>
              <span className="pill">{job.connectsRequired} connects</span>
            </div>
            <p className="job-summary">{job.summary}</p>
            <div className="job-meta">
              <span>{job.postedAgo}</span>
              <span>{job.budget}</span>
              <span>{job.bids.length} bids</span>
            </div>
            <Link className="btn primary" href={`/client/jobs/${job.id}`}>
              <Eye size={16} /> View as client
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
