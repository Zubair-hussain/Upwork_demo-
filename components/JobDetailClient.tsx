"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  DollarSign,
  Eye,
  ExternalLink,
  Flag,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Save,
  Search,
  Send,
  Star,
  Tag,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Application, calculateRemainingConnects } from "@/lib/assessment";
import { Job, startingConnects } from "@/lib/jobs";

const applicationKey = "uet-applications";
const viewsKey = "uet-client-views";
const profileKey = "uet-candidate-profile";

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

export function JobDetailClient({ job, mode = "candidate" }: { job: Job; mode?: "candidate" | "client" }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateDescription, setCandidateDescription] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [boostConnects, setBoostConnects] = useState("0");
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<"portfolio" | "certificate" | null>(null);
  const [milestone, setMilestone] = useState("One milestone after complete delivery");
  const [milestones, setMilestones] = useState([{ title: "", description: "" }]);
  const [coverLetter, setCoverLetter] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const application = applications.find((item) => item.jobId === job.id);
  const remainingConnects = calculateRemainingConnects(applications, startingConnects);
  const parsedBid = Number(bidAmount);
  // The proposal cost is simply the job's Connects — there is no separate "boost" bid.
  const parsedBoostConnects = Number(boostConnects);
  const validBoostConnects = Number.isInteger(parsedBoostConnects) && parsedBoostConnects >= 0 ? parsedBoostConnects : 0;
  const totalConnectsForProposal = job.connectsRequired + validBoostConnects;
  const serviceFee = Number.isFinite(parsedBid) ? parsedBid * 0.1 : 0;
  const receiveAmount = Number.isFinite(parsedBid) ? parsedBid - serviceFee : 0;

  useEffect(() => {
    function refreshApplications() {
      setApplications(readJson<Application[]>(applicationKey, []));
    }

    refreshApplications();

    const savedProfile = readJson<CandidateProfile | null>(profileKey, null);
    setHasSavedProfile(Boolean(savedProfile?.name?.trim() && savedProfile?.email?.trim() && savedProfile?.description?.trim()));
    if (savedProfile?.name) {
      setCandidateName(savedProfile.name);
      setCandidateEmail(savedProfile.email ?? "");
      setCandidateDescription(savedProfile.description ?? "");
    }

    if (mode === "client") {
      const views = readJson<string[]>(viewsKey, []);
      if (!views.includes(job.id)) {
        saveJson(viewsKey, [...views, job.id]);
      }
    }

    // Keep the available-connects figure in sync with what the candidate has
    // spent elsewhere (other tabs / after returning to this page).
    window.addEventListener("storage", refreshApplications);
    window.addEventListener("focus", refreshApplications);
    return () => {
      window.removeEventListener("storage", refreshApplications);
      window.removeEventListener("focus", refreshApplications);
    };
  }, [job.id, mode]);

  useEffect(() => {
    if (application) {
      setCandidateName(application.candidateName);
      setBidAmount(String(application.bidAmount));
      setBoostConnects(String(application.boostConnects));
      setMilestone(application.milestone);
      setMilestones(
        application.milestones?.length
          ? application.milestones
          : [{ title: application.milestoneTitle ?? "", description: application.milestoneDescription ?? "" }]
      );
      setCoverLetter(application.coverLetter);
      setAnswer(application.answer);
    }
  }, [application]);

  function submit() {
    const byMilestone = milestone.includes("milestone");

    if (!candidateName.trim() || !candidateEmail.trim() || !candidateDescription.trim()) {
      setMessage("Please add your name, email, and title before applying.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(candidateEmail.trim())) {
      setMessage("Please enter a valid email address before applying.");
      return;
    }

    if (!bidAmount.trim() || !Number.isFinite(parsedBid) || parsedBid <= 0) {
      setMessage("Please add your bid amount before applying.");
      return;
    }

    if (!Number.isInteger(parsedBoostConnects) || parsedBoostConnects < 0) {
      setMessage("Your visibility bid must be a whole number of Connects, or zero.");
      return;
    }

    const normalizedMilestones = milestones.map((item) => ({
      title: item.title.trim(),
      description: item.description.trim()
    }));

    if (byMilestone && normalizedMilestones.some((item) => !item.title || !item.description)) {
      setMessage("Please add a milestone title and description for every milestone before applying.");
      return;
    }

    if (!coverLetter.trim()) {
      setMessage("Please add your cover letter before applying.");
      return;
    }

    if (!answer.trim()) {
      setMessage("Answer the screening question before applying.");
      return;
    }

    if (!application && remainingConnects < totalConnectsForProposal) {
      setMessage(
        `Not enough Connects for this job. You have ${remainingConnects} left and this proposal needs ${totalConnectsForProposal}. Apply to a lower-cost job or reduce your boost.`
      );
      return;
    }

    const normalizedProfile: CandidateProfile = {
      name: candidateName.trim(),
      email: candidateEmail.trim().toLowerCase(),
      description: candidateDescription.trim(),
      savedAt: new Date().toISOString()
    };
    saveJson(profileKey, normalizedProfile);
    setHasSavedProfile(true);

    const nextApplication: Application = {
      jobId: job.id,
      candidateName: candidateName.trim(),
      bidAmount: parsedBid,
      boostConnects: validBoostConnects,
      milestone,
      milestoneTitle: byMilestone ? normalizedMilestones[0]?.title ?? "" : "",
      milestoneDescription: byMilestone ? normalizedMilestones[0]?.description ?? "" : "",
      milestones: byMilestone ? normalizedMilestones : [],
      coverLetter: coverLetter.trim(),
      answer: answer.trim(),
      selectedForRecord: application?.selectedForRecord ?? false,
      appliedAt: application?.appliedAt ?? new Date().toISOString()
    };

    const next = application
      ? applications.map((item) => (item.jobId === job.id ? nextApplication : item))
      : [...applications, nextApplication];

    setApplications(next);
    saveJson(applicationKey, next);

    // Also push to the shared server store so this candidate's application
    // shows up on the admin page alongside every other candidate's data.
    void fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nextApplication,
        candidateEmail: normalizedProfile.email,
        candidateDescription: normalizedProfile.description
      })
    }).catch(() => {
      /* Keep the local application even if the network sync fails. */
    });

    setMessage(
      application
        ? "Application updated."
        : `Application sent. ${totalConnectsForProposal} connects used.`
    );
  }

  const rankedConnects = [
    ...job.bids.map((bid, index) => ({
      id: bid.id,
      label: `User ${index + 1}`,
      connects: bid.connectsSpent,
      current: false
    })),
    ...(validBoostConnects > 0
      ? [{ id: "current-user", label: "You", connects: validBoostConnects, current: true }]
      : [])
  ].sort((a, b) => b.connects - a.connects);

  return (
    <main className="upwork-dark">
      {profileNotice ? (
        <div className="uw-welcome-overlay" role="presentation">
          <section
            aria-describedby="test-feature-description"
            aria-labelledby="test-feature-title"
            aria-modal="true"
            className="uw-welcome-dialog"
            role="dialog"
          >
            <div className="uw-welcome-stack" aria-hidden="true"><span /><span /></div>
            <article className="uw-welcome-card uw-test-notice-card">
              <header className="uw-welcome-card-header">
                <span className="uw-welcome-card-icon">
                  {profileNotice === "portfolio" ? <BriefcaseBusiness size={25} /> : <CheckCircle2 size={25} />}
                </span>
                <button aria-label="Close message" onClick={() => setProfileNotice(null)} type="button"><X size={20} /></button>
              </header>
              <div className="uw-welcome-card-content">
                <span className="uw-welcome-kicker">Test proposal</span>
                <h2 id="test-feature-title">No {profileNotice} needed</h2>
                <p id="test-feature-description">
                  This is a test proposal, so you do not need to add a {profileNotice}. Focus on your bid, cover letter, and expert answer.
                </p>
              </div>
              <footer className="uw-welcome-actions">
                <span className="uw-test-notice-label">You can continue your application</span>
                <button className="uw-welcome-next" onClick={() => setProfileNotice(null)} type="button">Got it</button>
              </footer>
            </article>
          </section>
        </div>
      ) : null}
      <aside className="uw-rail" aria-label="Workspace navigation">
        <img src="/assets/upwork-logo.svg" alt="Upwork logo" />
        <span className="uw-avatar">ZH</span>
        <span><Search size={21} />Search</span>
        <span className="active"><Home size={21} />Home</span>
        <span><MessageSquare size={21} />Messages</span>
        <span><BriefcaseBusiness size={21} />Contracts</span>
        <span><DollarSign size={21} />Finances</span>
        <span><Bell size={21} /></span>
        <span><HelpCircle size={21} /></span>
      </aside>

      <section className="uw-list-pane" aria-label="Job list preview">
        <div className="uw-search"><Search size={22} /> Search for jobs</div>
        <div className="uw-tabs"><strong>Best matches</strong><span>Most recent</span><span>Saved jobs</span></div>
        {["AI-Powered Custom CRM Developer", "AI-Native Developer", "n8n Workflow Builder"].map((title, index) => (
          <article className={`uw-preview ${index === 0 ? "selected" : ""}`} key={title}>
            <p>Posted {index === 0 ? "42 minutes ago" : "yesterday"} · Proposals: 20 to 50</p>
            <h3>{index === 0 ? job.title : title}</h3>
            <span>{job.budget} - {job.level} - Est. Time: More than 6 months</span>
            <p>{job.summary}</p>
            <div className="skills">{job.skills.slice(0, 3).map((skill) => <span className="skill dark" key={skill}>{skill}</span>)}</div>
          </article>
        ))}
      </section>

      <section className="uw-main-pane">
        <header className="uw-main-top">
          <Link href="/" className="uw-back"><ArrowLeft size={26} /></Link>
          <Link href={`/jobs/${job.id}`} className="uw-open"><ExternalLink size={18} /> Open job in a new window</Link>
        </header>

        <div className="uw-content-grid">
          <article className="uw-job-card">
            <div className="uw-job-title">
              <h1>{job.title}</h1>
              <div className="job-meta dark">
                <span>Posted {job.postedAgo}</span>
                <span><MapPin size={18} /> Worldwide</span>
              </div>
            </div>

            <section className="uw-block">
              <h3>Summary</h3>
              <p>{job.summary}</p>
              <p>Core Requirements:</p>
              <ul>
                {job.postGuide.map((guide) => <li key={guide}>{guide}</li>)}
              </ul>
            </section>

            <section className="uw-block">
              <h3>Screening Questions</h3>
              <ul>{job.questions.map((question) => <li key={question}>{question}</li>)}</ul>
            </section>
          </article>

          <aside className="uw-client-card">
            <Link href="#proposal-form" className="uw-apply">Apply now</Link>
            <button className="uw-save" type="button"><Heart size={20} /> Save job</button>
            <span className="uw-flag"><Flag size={18} /> Flag as inappropriate</span>
            <p>Send a proposal for: <strong>{job.connectsRequired} Connects</strong></p>
            <p>Available Connects: <strong>{remainingConnects}</strong></p>
            <h2>About the client</h2>
            <p><Star size={18} className="orange" /> {job.client.rating} of {job.client.reviews} reviews</p>
            <p className={job.client.paymentVerified ? "verified" : "not-verified"}>
              <img src="/assets/payment-verified.svg" alt="" /> Payment {job.client.paymentVerified ? "verified" : "not verified"}
            </p>
            <p className={job.client.phoneVerified ? "verified" : "not-verified"}>
              <img src="/assets/payment-verified.svg" alt="" /> Phone number {job.client.phoneVerified ? "verified" : "not verified"}
            </p>
            <span className="uw-chip">Experienced client</span>
            <p><strong>{job.client.country}</strong><br />{job.client.city} {job.client.localTime}</p>
            <p><strong>{job.client.jobsPosted} jobs posted</strong><br />{job.client.hireRate} hire rate, {job.client.openJobs} open jobs</p>
            <p><strong>{job.client.totalSpent} total spent</strong><br />{job.client.hires} hires, {job.client.activeHires} active</p>
          </aside>
        </div>

        <section className="uw-proposal" id="proposal-form">
          {mode !== "client" && !hasSavedProfile ? (
            <div className="uw-plus-banner" role="alert">
              <span>
                Please complete your name, email, and title below before applying.
              </span>
            </div>
          ) : null}
          <section className="uw-form-card">
            <h2>Terms</h2>
            {mode === "client" ? (
              <>
                <p className="muted">
                  Opening this screen records that the client viewed this job. The admin screen shows that signal.
                </p>
                <p className="pill good">
                  <Eye size={15} /> Viewed
                </p>
              </>
            ) : (
              <>
                <div className="uw-plus-banner">
                  <span><Tag size={21} /> Upgrade to Freelancer Plus. Work smarter with proposal insights and track stats over time to help you win the jobs you want.</span>
                  <strong>Subscribe now</strong>
                  <X size={24} />
                </div>
                <div className="field-grid">
                  {!hasSavedProfile ? (
                    <>
                      <div className="field">
                        <label htmlFor="detail-name">What is your name?</label>
                        <input id="detail-name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} placeholder="Candidate name" />
                      </div>
                      <div className="field">
                        <label htmlFor="detail-email">Email address</label>
                        <input autoComplete="email" id="detail-email" inputMode="email" onChange={(event) => setCandidateEmail(event.target.value)} placeholder="you@example.com" type="email" value={candidateEmail} />
                      </div>
                      <div className="field">
                        <label htmlFor="detail-title">Professional title</label>
                        <input id="detail-title" onChange={(event) => setCandidateDescription(event.target.value)} placeholder="Example: Full stack + AI specialist" value={candidateDescription} />
                      </div>
                    </>
                  ) : null}
                  <div className="uw-radio-group">
                    <strong>How do you want to be paid?</strong>
                    <label><input checked={milestone.includes("milestone")} onChange={() => setMilestone("Payment by milestones")} type="radio" /> By milestone</label>
                    <p>Divide the project into smaller segments, called milestones. You will be paid for milestones as they are completed and approved.</p>
                    <label><input checked={!milestone.includes("milestone")} onChange={() => setMilestone("One project payment after complete delivery")} type="radio" /> By project</label>
                    <p>Get your entire payment at the end, when all work has been delivered.</p>
                  </div>
                  {milestone.includes("milestone") ? (
                    <div className="uw-milestone-builder">
                      <div className="uw-milestone-heading">
                        <div><strong>Project milestones</strong><p className="uw-muted">Break the project into as many delivery stages as you need.</p></div>
                        <button
                          className="uw-outline"
                          onClick={() => setMilestones((items) => [...items, { title: "", description: "" }])}
                          type="button"
                        >
                          <Plus size={17} /> Add milestone
                        </button>
                      </div>
                      {milestones.map((item, index) => (
                        <section className="uw-milestone-item" key={`milestone-${index}`}>
                          <div className="uw-milestone-number">
                            <strong>Milestone {index + 1}</strong>
                            {milestones.length > 1 ? (
                              <button
                                aria-label={`Remove milestone ${index + 1}`}
                                onClick={() => setMilestones((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                                type="button"
                              >
                                <X size={17} /> Remove
                              </button>
                            ) : null}
                          </div>
                          <div className="field">
                            <label htmlFor={`milestone-title-${index}`}>Milestone title {index + 1}</label>
                            <input
                              id={`milestone-title-${index}`}
                              onChange={(event) => setMilestones((items) => items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))}
                              placeholder="Example: Prototype delivery"
                              value={item.title}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor={`milestone-description-${index}`}>Milestone description {index + 1}</label>
                            <textarea
                              id={`milestone-description-${index}`}
                              onChange={(event) => setMilestones((items) => items.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))}
                              placeholder="Describe what this milestone delivers and when."
                              value={item.description}
                            />
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}
                  <div className="field">
                    <label htmlFor="bid-amount">What is the full amount you would like to bid for this job?</label>
                    <input
                      id="bid-amount"
                      min="1"
                      step="1"
                      type="number"
                      value={bidAmount}
                      onChange={(event) => setBidAmount(event.target.value)}
                      placeholder="Example: 1200"
                    />
                  </div>
                  <div className="field boost-field">
                    <label htmlFor="boost-connects">Bid Connects for higher visibility (optional)</label>
                    <input id="boost-connects" min="0" onChange={(event) => setBoostConnects(event.target.value)} step="1" type="number" value={boostConnects} />
                    <p className="uw-muted">Your position updates live in the anonymous ranking below.</p>
                  </div>
                  <div className="uw-fees">
                    <div><span>Freelancer Service Fee: 10%</span><strong>-${serviceFee.toFixed(2)}</strong></div>
                    <div><span>You will receive</span><strong>${receiveAmount.toFixed(2)}</strong></div>
                  </div>
                  <div className="uw-protection">
                    <img src="/assets/money-protection.svg" alt="" />
                    <span>Includes fixed-price protection.</span>
                  </div>
                </div>
              </>
            )}
          </section>

          {mode !== "client" ? (
            <section className="uw-form-card uw-proposal-activity">
              <div className="uw-activity-heading">
                <div>
                  <h2>Connects bid ranking</h2>
                  <p className="uw-muted">Freelancers stay anonymous. Add a visibility bid above to see your live position.</p>
                </div>
                <span className="uw-chip">{rankedConnects.length} proposals</span>
              </div>
              <div className="uw-rank-table-wrap">
                <table className="uw-rank-table">
                  <thead><tr><th>Rank</th><th>Freelancer</th><th>Connects bid</th></tr></thead>
                  <tbody>
                    {rankedConnects.map((bid, index) => (
                      <tr className={bid.current ? "uw-current-bid" : ""} key={bid.id}>
                        <td>#{index + 1}</td>
                        <td><span className="uw-bid-avatar">{bid.current ? "Y" : bid.label.replace("User ", "")}</span><strong>{bid.label}</strong></td>
                        <td><strong>{bid.connects}</strong> Connects</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {mode !== "client" ? (
            <>
              <section className="uw-form-card">
                <h2>Additional details</h2>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="cover-letter">Cover letter</label>
                    <textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Write a focused proposal description like Upwork."
                    />
                  </div>
                  <div className="uw-attachments">
                    <strong>Attachments</strong>
                    <p>Add work samples to strengthen your proposal. Please remove any contact details.</p>
                    <span>Up to 10 files (max 25 MB each)</span>
                    <button className="uw-outline" type="button"><Paperclip size={18} /> Attach files</button>
                  </div>
                  <div className="field">
                    <label htmlFor="detail-answer">Your expert answer</label>
                    <textarea
                      id="detail-answer"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Answer the questions and reference the post guide."
                    />
                  </div>
                </div>
              </section>

              <section className="uw-form-card">
                <h2>Profile highlights</h2>
                <p className="uw-muted">Highlight the most relevant items from your profile to demonstrate your experience and skills. You can add up to four highlights total.</p>
                <div className="uw-blue-banner">
                  <img src="/assets/profile-portfolio.svg" alt="" />
                  <div><strong>Show off your best work, easily and beautifully.</strong><span>Portfolios now have more options and a new design.</span></div>
                  <button type="button">See what&apos;s new</button>
                  <X size={22} />
                </div>
                <div className="uw-highlight-grid">
                  <button onClick={() => setProfileNotice("portfolio")} type="button"><img src="/assets/profile-portfolio.svg" alt="" /> Add a portfolio project</button>
                  <button onClick={() => setProfileNotice("certificate")} type="button"><img src="/assets/profile-certificate.svg" alt="" /> Add a certificate</button>
                </div>
              </section>

              <section className="uw-form-card">
                <h2>Submit your proposal</h2>
                <p>This job costs {job.connectsRequired} Connects. Review your Connects, then apply.</p>
                <div className="connect-meter">
                  <div className="meter-line">
                    <span style={{ width: `${(remainingConnects / startingConnects) * 100}%` }} />
                  </div>
                  <div className="meter-copy">
                    <span>{remainingConnects} connects left</span>
                    <span>{totalConnectsForProposal} total needed</span>
                  </div>
                </div>
                <button className="btn primary" onClick={submit} type="button">
                  {application ? <Save size={16} /> : <Send size={16} />}
                  {application ? "Update application" : "Apply now"}
                </button>
                {application ? (
                  <p className="pill good">
                    <CheckCircle2 size={15} /> Applied
                  </p>
                ) : null}
                {message ? <p className="muted">{message}</p> : null}
              </section>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
