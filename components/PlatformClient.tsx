"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  Gauge,
  Sparkles,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Application, calculateFitScore, calculateRemainingConnects, getFitLabel } from "@/lib/assessment";
import { Job, jobs, startingConnects } from "@/lib/jobs";
import { PlusBanner } from "./PlusBanner";

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

export function PlatformClient() {
  const [candidateName, setCandidateName] = useState("");
  const [headline, setHeadline] = useState("");
  const [popup, setPopup] = useState("");
  const [activeCategory, setActiveCategory] = useState<Job["category"] | "All">("All");
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewedJobIds, setViewedJobIds] = useState<string[]>([]);

  useEffect(() => {
    setApplications(readJson<Application[]>(applicationKey, []));
    setViewedJobIds(readJson<string[]>(viewsKey, []));
    const profile = readJson<CandidateProfile | null>(profileKey, null);
    if (profile) {
      setCandidateName(profile.name);
      setHeadline(profile.description);
    }
  }, []);

  const remainingConnects = calculateRemainingConnects(applications, startingConnects);
  const score = calculateFitScore(applications, viewedJobIds);
  const visibleJobs = activeCategory === "All" ? jobs : jobs.filter((job) => job.category === activeCategory);
  const appliedIds = useMemo(() => new Set(applications.map((application) => application.jobId)), [applications]);

  function saveProfile() {
    if (!candidateName.trim() || !headline.trim()) {
      setPopup("Please add your name and short description before saving.");
      return;
    }

    saveJson<CandidateProfile>(profileKey, {
      name: candidateName.trim(),
      description: headline.trim(),
      savedAt: new Date().toISOString()
    });
    setPopup("Profile saved. Admin can now see your name and short description.");
  }

  return (
    <main className="app-shell">
      <Header />

      <PlusBanner />

      <section className="hero">
        <div className="welcome-panel">
          <div className="welcome-art">
            <p className="eyebrow">Welcome label</p>
            <h1>Welcome to Upwork expert test</h1>
          </div>
          <div className="guidelines" aria-label="Candidate guidelines">
            <Guideline icon={<ClipboardList size={22} />} title="Read every post">
              Each job includes a post guide. Use it to shape your answer and show client awareness.
            </Guideline>
            <Guideline icon={<UserRound size={22} />} title="Start with your name">
              Every application asks who you are so the admin can match records quickly.
            </Guideline>
            <Guideline icon={<Sparkles size={22} />} title="Show expert judgment">
              Explain tradeoffs for full stack, AI engineering, and n8n automation work.
            </Guideline>
            <Guideline icon={<Gauge size={22} />} title="Spend connects wisely">
              You have 75 connects and the seven jobs cost exactly 75, so all jobs are reachable.
            </Guideline>
          </div>
        </div>

        <aside className="candidate-panel" aria-label="Candidate profile">
          <h2>Candidate Test Profile</h2>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="candidate-name">What is your name?</label>
              <input
                id="candidate-name"
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="Enter candidate name"
              />
            </div>
            <div className="field">
              <label htmlFor="candidate-headline">Short description</label>
              <input
                id="candidate-headline"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Example: Full stack + AI + n8n specialist"
              />
            </div>
          </div>
          <button className="btn primary profile-save" onClick={saveProfile} type="button">
            <CheckCircle2 size={16} /> Save profile
          </button>

          <div className="connect-meter">
            <div className="meter-line">
              <span style={{ width: `${(remainingConnects / startingConnects) * 100}%` }} />
            </div>
            <div className="meter-copy">
              <span>{remainingConnects} / {startingConnects} connects</span>
              <span>{applications.length}/7 applied</span>
            </div>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <strong>{score}</strong>
              <span>Fit score</span>
            </div>
            <div className="mini-stat">
              <strong>{viewedJobIds.length}</strong>
              <span>Client views</span>
            </div>
            <div className="mini-stat">
              <strong>{applications.filter((item) => item.selectedForRecord).length}</strong>
              <span>Records</span>
            </div>
          </div>
          <p className="muted">{getFitLabel(score)} for the current test record.</p>
        </aside>
      </section>
      {popup ? (
        <div className="toast" role="status">
          <strong>{popup}</strong>
          <button onClick={() => setPopup("")} type="button">Close</button>
        </div>
      ) : null}

      <section className="filter-panel">
        <h2>Jobs posted within hours</h2>
        <div className="tabs" aria-label="Job filters">
          {(["All", "Full Stack", "AI Engineering", "n8n Automation"] as const).map((category) => (
            <button
              className={`tab ${activeCategory === category ? "active" : ""}`}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category === "All" ? <Filter size={15} /> : null}
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="job-grid" aria-label="Open jobs">
        {visibleJobs.map((job) => {
          const applied = appliedIds.has(job.id);
          const viewed = viewedJobIds.includes(job.id);

          return (
            <article className="job-card" key={job.id}>
              <div className="job-head">
                <div>
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span>{job.postedAgo}</span>
                    <span>{job.budget}</span>
                    <span>{job.level}</span>
                  </div>
                </div>
                <span className={`pill ${job.connectsRequired === 30 ? "warn" : ""}`}>
                  {job.connectsRequired} connects
                </span>
              </div>
              <p className="job-summary">{job.summary}</p>
              <div className="job-meta">
                <span>
                  <BriefcaseBusiness size={15} /> {job.bids.length} bids
                </span>
                <span>
                  <BadgeCheck size={15} /> {job.bids.filter((bid) => bid.connectsSpent > 100).length} spent 100+
                </span>
                {viewed ? (
                  <span>
                    <Eye size={15} /> Client viewed
                  </span>
                ) : null}
              </div>
              <div className="skills">
                {job.skills.map((skill) => (
                  <span className="skill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <div className="card-actions">
                <Link className="btn" href={`/jobs/${job.id}`}>
                  <Eye size={16} /> Open
                </Link>
                <Link className={`btn ${applied ? "" : "primary"}`} href={`/jobs/${job.id}`}>
                  {applied ? <CheckCircle2 size={16} /> : <BriefcaseBusiness size={16} />}
                  {applied ? "Applied" : "Apply"}
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <img className="brand-logo-img" src="/assets/upwork-logo.svg" alt="Upwork logo" />
        <span>Upwork Expert Test</span>
      </Link>
      <nav className="nav-actions" aria-label="Portal navigation">
        <Link className="btn" href="/client/jobs">
          Client View
        </Link>
      </nav>
    </header>
  );
}

function Guideline({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <div className="guideline">
      {icon}
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Demo assessment platform inspired by marketplace hiring patterns.</span>
      <strong>Zubair-Hussain</strong>
    </footer>
  );
}
