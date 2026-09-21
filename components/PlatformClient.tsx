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
const onboardingKey = "uet-onboarding-seen";

type CandidateProfile = {
  name: string;
  email: string;
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
  const [candidateEmail, setCandidateEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [popup, setPopup] = useState("");
  const [activeCategory, setActiveCategory] = useState<Job["category"] | "All">("All");
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewedJobIds, setViewedJobIds] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingCard, setOnboardingCard] = useState(0);

  useEffect(() => {
    function refresh() {
      setApplications(readJson<Application[]>(applicationKey, []));
      setViewedJobIds(readJson<string[]>(viewsKey, []));
    }

    refresh();
    const profile = readJson<CandidateProfile | null>(profileKey, null);
    if (profile) {
      setCandidateName(profile.name);
      setCandidateEmail(profile.email ?? "");
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

  useEffect(() => {
    if (window.localStorage.getItem(onboardingKey) !== "true") {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!onboardingOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [onboardingOpen]);

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
    if (!candidateName.trim() || !candidateEmail.trim() || !headline.trim()) {
      setPopup("Please add your name, email, and short description before saving.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(candidateEmail.trim())) {
      setPopup("Please enter a valid email address.");
      return;
    }

    saveJson<CandidateProfile>(profileKey, {
      name: candidateName.trim(),
      email: candidateEmail.trim().toLowerCase(),
      description: headline.trim(),
      savedAt: new Date().toISOString()
    });
    setPopup("Profile saved. Admin can now see your name, email, and short description.");
  }

  function closeOnboarding() {
    window.localStorage.setItem(onboardingKey, "true");
    setOnboardingOpen(false);
  }

  return (
    <main className="uw-home">
      {onboardingOpen ? (
        <div className="uw-welcome-overlay" role="presentation">
          <section
            aria-describedby="welcome-card-description"
            aria-labelledby="welcome-card-title"
            aria-modal="true"
            className="uw-welcome-dialog"
            role="dialog"
          >
            <div className="uw-welcome-stack" aria-hidden="true"><span /><span /></div>
            <article className="uw-welcome-card">
              <header className="uw-welcome-card-header">
                <span className="uw-welcome-card-icon">
                  {onboardingCard === 0 ? <UserRound size={25} /> : <BriefcaseBusiness size={25} />}
                </span>
                <button aria-label="Skip instructions" onClick={closeOnboarding} type="button"><X size={20} /></button>
              </header>

              {onboardingCard === 0 ? (
                <div className="uw-welcome-card-content">
                  <span className="uw-welcome-kicker">Getting started</span>
                  <h2 id="welcome-card-title">Set up your candidate profile</h2>
                  <p id="welcome-card-description">Add your personal information before exploring jobs.</p>
                  <ol className="uw-welcome-checklist">
                    <li><span>1</span><div><strong>Add your details</strong><p>Enter your name, email address, and professional title.</p></div></li>
                    <li><span>2</span><div><strong>Save your profile</strong><p>Your details will be included with each application.</p></div></li>
                    <li><span>3</span><div><strong>Choose the right jobs</strong><p>Use your {startingConnects} Connects on the opportunities that fit you best.</p></div></li>
                  </ol>
                </div>
              ) : (
                <div className="uw-welcome-card-content">
                  <span className="uw-welcome-kicker">Applying for work</span>
                  <h2 id="welcome-card-title">Send a strong proposal</h2>
                  <p id="welcome-card-description">Each application needs a few important details.</p>
                  <ul className="uw-welcome-checklist">
                    <li><CheckCircle2 size={20} /><div><strong>Set your bid and payment plan</strong><p>Add milestone details when you choose milestone payments.</p></div></li>
                    <li><CheckCircle2 size={20} /><div><strong>Write for the client</strong><p>Include a focused cover letter and your expert answer.</p></div></li>
                    <li><CheckCircle2 size={20} /><div><strong>Review and apply</strong><p>The job&apos;s Connects are deducted when you submit.</p></div></li>
                  </ul>
                </div>
              )}

              <footer className="uw-welcome-actions">
                <div className="uw-welcome-dots" aria-label={`Card ${onboardingCard + 1} of 2`}>
                  <span className={onboardingCard === 0 ? "active" : ""} />
                  <span className={onboardingCard === 1 ? "active" : ""} />
                </div>
                <button
                  className="uw-welcome-next"
                  onClick={onboardingCard === 0 ? () => setOnboardingCard(1) : closeOnboarding}
                  type="button"
                >
                  {onboardingCard === 0 ? "Next" : "Get started"} <ArrowRight size={17} />
                </button>
              </footer>
            </article>
          </section>
        </div>
      ) : null}
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
              <label htmlFor="candidate-email">Email address</label>
              <input
                autoComplete="email"
                id="candidate-email"
                inputMode="email"
                type="email"
                value={candidateEmail}
                onChange={(event) => setCandidateEmail(event.target.value)}
                placeholder="Enter candidate email"
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
              <article
                className="job-card uw-feed-job uw-clickable-job"
                key={job.id}
              >
                <Link aria-label={`Open job: ${job.title}`} className="uw-card-link" href={`/jobs/${job.id}`} />
                <div className="uw-job-overline">
                  <span>Posted {job.postedAgo}</span><i>•</i><span>Proposals: {job.bids.length}</span>
                  <div className="uw-job-icon-actions" aria-label="Job actions">
                    <button aria-label="Not interested" type="button"><ThumbsDown size={20} /></button>
                    <button aria-label="Save job" type="button"><Heart size={21} /></button>
                  </div>
                </div>
                <h3>{job.title}</h3>
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
                  <div className="uw-job-bid-summary">
                    <span>{job.connectsRequired} Connects required</span>
                    <span>{job.bids.length} freelancer bids</span>
                    <span>Top visibility bid: {Math.max(...job.bids.map((bid) => bid.connectsSpent))} Connects</span>
                  </div>
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
