"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  Filter,
  Gauge,
  Heart,
  Menu,
  Search,
  SlidersHorizontal,
  Star,
  Sparkles,
  ThumbsDown,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Application, calculateFitScore, calculateRemainingConnects, getFitLabel } from "@/lib/assessment";
import { Job, jobs, startingConnects } from "@/lib/jobs";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    function refresh() {
      setApplications(readJson<Application[]>(applicationKey, []));
      setViewedJobIds(readJson<string[]>(viewsKey, []));
    }

    refresh();
    const profile = readJson<CandidateProfile | null>(profileKey, null);
    if (profile) {
      setCandidateName(profile.name);
      setHeadline(profile.description);
    }

    // Reflect connects/applications live when the candidate applies in another
    // tab or comes back to this page after applying.
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const remainingConnects = calculateRemainingConnects(applications, startingConnects);
  const score = calculateFitScore(applications, viewedJobIds);
  const visibleJobs = (activeCategory === "All" ? jobs : jobs.filter((job) => job.category === activeCategory)).filter(
    (job) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      const searchable = [job.title, job.summary, job.category, ...job.skills].join(" ").toLowerCase();
      return query.split(/\s+/).some((word) => searchable.includes(word));
    }
  );
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
    <main className="uw-home">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <section className="uw-home-hero">
        <div className="uw-home-hero-inner">
          <h1>Work at the speed of your ambition</h1>
          <p>Hire experts who use AI to amplify their talent, turning complex work into high impact business outcomes</p>
          <div className="uw-intent-switch" aria-label="Choose how to use the marketplace">
            <button type="button">I want to hire</button>
            <button className="active" type="button">I want to work</button>
          </div>
          <form
            className="uw-hero-search"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById("open-jobs")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search aria-hidden="true" size={22} />
            <input
              aria-label="Search jobs"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for jobs"
              value={searchTerm}
            />
            <button aria-label="Search" type="submit"><Search size={21} /></button>
          </form>
          <div className="uw-popular-searches">
            <span>Popular searches</span>
            {["AI development", "Web design", "n8n automation", "Full stack"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  document.getElementById("open-jobs")?.scrollIntoView({ behavior: "smooth" });
                }}
                type="button"
              >
                {term} <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="uw-trust-strip" aria-label="Trusted companies">
        <span>Trusted by ambitious teams</span>
        <strong>Microsoft</strong>
        <strong>airbnb</strong>
        <strong>Glassdoor</strong>
        <strong>bissell</strong>
      </section>

      <div className="app-shell uw-home-content">
      <section className="hero uw-profile-hero">
        <div className="welcome-panel">
          <div className="welcome-art">
            <p className="eyebrow">Upwork expert test</p>
            <h2>Build your freelancing career on your terms</h2>
            <p className="welcome-lede">Show how you think, choose the right opportunities, and submit expert proposals to stand out.</p>
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
              You have 50 connects. Jobs cost 5 to 30 connects each, so choose the opportunities that matter most.
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

      <section className="uw-onboard" aria-label="Getting started">
        <article className="uw-onboard-card">
          <div className="uw-onboard-head">
            <span className="uw-onboard-icon"><UserRound size={22} /></span>
            <div>
              <h2>New here? Start in 3 steps</h2>
              <p>A quick guide to using this platform.</p>
            </div>
          </div>
          <ol className="uw-onboard-steps">
            <li><strong>Save your profile.</strong> Add your name and a short title above, then press <em>Save profile</em>. You must do this before applying.</li>
            <li><strong>Choose jobs that fit.</strong> You have {startingConnects} Connects. Each job costs 5 to 30 Connects, so pick the opportunities that matter most.</li>
            <li><strong>Open a job and apply.</strong> Click <em>View job</em>, complete the proposal, and submit. Your applications appear in your progress panel.</li>
          </ol>
        </article>

        <article className="uw-onboard-card">
          <div className="uw-onboard-head">
            <span className="uw-onboard-icon"><BriefcaseBusiness size={22} /></span>
            <div>
              <h2>How to apply for a job</h2>
              <p>What each proposal needs.</p>
            </div>
          </div>
          <ul className="uw-onboard-list">
            <li><CheckCircle2 size={16} /> Enter your <strong>bid amount</strong> for the job.</li>
            <li><CheckCircle2 size={16} /> Pick how you want to be paid. <strong>By milestone</strong> also needs a milestone title and description.</li>
            <li><CheckCircle2 size={16} /> Write your <strong>cover letter</strong> and your <strong>expert answer</strong> to the screening questions.</li>
            <li><CheckCircle2 size={16} /> Press <strong>Apply now</strong>. The job&apos;s Connects are deducted from your balance.</li>
          </ul>
          <a className="uw-onboard-cta" href="#open-jobs">Browse open jobs <ArrowRight size={15} /></a>
        </article>
      </section>

      <section className="uw-jobs-board" id="open-jobs" aria-label="Open jobs">
        <div className="uw-job-feed">
          <header className="uw-feed-header">
            <div className="uw-feed-tabs" aria-label="Job feed views">
              <button className="active" type="button">Best matches</button>
              <button type="button">Most recent</button>
              <button type="button">Saved jobs</button>
              <button type="button">Invites</button>
            </div>
            <button className="uw-filter-button" type="button"><SlidersHorizontal size={19} /> Filters</button>
          </header>
          <div className="uw-category-tabs" aria-label="Job filters">
            {(["All", "Full Stack", "AI Engineering", "n8n Automation"] as const).map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category === "All" ? <Filter size={14} /> : null}
                {category}
              </button>
            ))}
          </div>

          <div className="uw-job-list">
          {visibleJobs.map((job) => {
            const applied = appliedIds.has(job.id);
            const viewed = viewedJobIds.includes(job.id);

            return (
              <article className="job-card uw-feed-job" key={job.id}>
                <div className="uw-job-overline">
                  <span>Posted {job.postedAgo}</span><i>•</i><span>Proposals: {job.bids.length}</span>
                  <div className="uw-job-icon-actions" aria-label="Job actions">
                    <button aria-label="Not interested" type="button"><ThumbsDown size={20} /></button>
                    <button aria-label="Save job" type="button"><Heart size={21} /></button>
                  </div>
                </div>
                <h3><Link href={`/jobs/${job.id}`}>{job.title}</Link></h3>
                <p className="uw-job-terms">{job.budget} · {job.level} · Est. time: 1 to 3 months</p>
                <p className="job-summary">{job.summary}</p>
                <div className="skills">
                  {job.skills.map((skill) => <span className="skill" key={skill}>{skill}</span>)}
                </div>
                <div className="uw-client-signals">
                  <span className={job.client.paymentVerified ? "verified" : ""}>
                    <BadgeCheck size={18} /> {job.client.paymentVerified ? "Payment verified" : "Payment unverified"}
                  </span>
                  <span className="uw-stars"><Star size={17} /> {job.client.rating}</span>
                  <span>{job.client.totalSpent} spent</span>
                  <span>{job.client.city}, {job.client.country}</span>
                  {viewed ? <span><Eye size={16} /> Client viewed</span> : null}
                </div>
                <div className="uw-job-footer-actions">
                  <span>{job.connectsRequired} Connects required</span>
                  <Link className="uw-open-job" href={`/jobs/${job.id}`}>
                    {applied ? <CheckCircle2 size={16} /> : <BriefcaseBusiness size={16} />}
                    {applied ? "Applied" : "View job"}
                  </Link>
                </div>
              </article>
            );
          })}
          </div>
        </div>

        <aside className="uw-job-sidebar" aria-label="Freelancer tools">
          <section className="uw-side-card uw-connects-card">
            <strong>Connects: {remainingConnects}</strong><ChevronDown size={22} />
          </section>
        </aside>
      </section>

      <Footer />
      </div>
    </main>
  );
}

function Header({
  mobileMenuOpen,
  setMobileMenuOpen
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="uw-site-header">
      <div className="uw-header-inner">
        <Link className="uw-wordmark" href="/" aria-label="Upwork Expert Test home">upwork</Link>
        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          className="uw-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
        <nav className={`uw-primary-nav ${mobileMenuOpen ? "open" : ""}`} aria-label="Main navigation">
          <button type="button">Hire talent <ChevronDown size={15} /></button>
          <button type="button">Get outcomes <ChevronDown size={15} /></button>
          <button type="button">Find work <ChevronDown size={15} /></button>
          <button type="button">Why Upwork <ChevronDown size={15} /></button>
        </nav>
        <div className="uw-header-actions">
          <button className="uw-header-search" aria-label="Search" type="button"><Search size={20} /></button>
          <Link href="#open-jobs">Log in</Link>
          <Link className="uw-signup" href="#open-jobs">Sign up</Link>
        </div>
      </div>
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
