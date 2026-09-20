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
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [milestone, setMilestone] = useState("One milestone after complete delivery");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const application = applications.find((item) => item.jobId === job.id);
  const remainingConnects = calculateRemainingConnects(applications, startingConnects);
  const parsedBid = Number(bidAmount);
  // The proposal cost is simply the job's Connects — there is no separate "boost" bid.
  const totalConnectsForProposal = job.connectsRequired;
  const serviceFee = Number.isFinite(parsedBid) ? parsedBid * 0.1 : 0;
  const receiveAmount = Number.isFinite(parsedBid) ? parsedBid - serviceFee : 0;

  useEffect(() => {
    function refreshApplications() {
      setApplications(readJson<Application[]>(applicationKey, []));
    }

    refreshApplications();

    const savedProfile = readJson<CandidateProfile | null>(profileKey, null);
    setProfile(savedProfile);
    if (savedProfile?.name) {
      setCandidateName(savedProfile.name);
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
      setMilestone(application.milestone);
      setMilestoneTitle(application.milestoneTitle ?? "");
      setMilestoneDescription(application.milestoneDescription ?? "");
      setCoverLetter(application.coverLetter);
      setAnswer(application.answer);
    }
  }, [application]);

  function submit() {
    const byMilestone = milestone.includes("milestone");

    if (!profile?.name?.trim() || !profile?.description?.trim()) {
      setMessage("Please add your name and title before applying. Go to the home page and save your profile first.");
      return;
    }

    if (!candidateName.trim()) {
      setMessage("Your name is required before applying.");
      return;
    }

    if (!bidAmount.trim() || !Number.isFinite(parsedBid) || parsedBid <= 0) {
      setMessage("Please add your bid amount before applying.");
      return;
    }

    if (byMilestone && (!milestoneTitle.trim() || !milestoneDescription.trim())) {
      setMessage("Please add a milestone title and description before applying.");
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

    const nextApplication: Application = {
      jobId: job.id,
      candidateName: candidateName.trim(),
      bidAmount: parsedBid,
      boostConnects: 0,
      milestone,
      milestoneTitle: byMilestone ? milestoneTitle.trim() : "",
      milestoneDescription: byMilestone ? milestoneDescription.trim() : "",
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
      body: JSON.stringify({ ...nextApplication, candidateDescription: profile?.description ?? "" })
    }).catch(() => {
      /* Keep the local application even if the network sync fails. */
    });

    setMessage(
      application
        ? "Application updated."
        : `Application sent. ${totalConnectsForProposal} connects used.`
    );
  }

  return (
    <main className="upwork-dark">
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
          {mode !== "client" && (!profile?.name?.trim() || !profile?.description?.trim()) ? (
            <div className="uw-plus-banner" role="alert">
              <span>
                Please add your name and title before applying. Open the{" "}
                <Link href="/">home page</Link> and save your profile first.
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
                  <div className="field">
                    <label htmlFor="detail-name">What is your name?</label>
                    <input
                      id="detail-name"
                      value={candidateName}
                      onChange={(event) => setCandidateName(event.target.value)}
                      placeholder="Candidate name"
                    />
                  </div>
                  <div className="uw-radio-group">
                    <strong>How do you want to be paid?</strong>
                    <label><input checked={milestone.includes("milestone")} onChange={() => setMilestone("Two milestones: prototype then production")} type="radio" /> By milestone</label>
                    <p>Divide the project into smaller segments, called milestones. You will be paid for milestones as they are completed and approved.</p>
                    <label><input checked={!milestone.includes("milestone")} onChange={() => setMilestone("One project payment after complete delivery")} type="radio" /> By project</label>
                    <p>Get your entire payment at the end, when all work has been delivered.</p>
                  </div>
                  {milestone.includes("milestone") ? (
                    <>
                      <div className="field">
                        <label htmlFor="milestone-title">Milestone title</label>
                        <input
                          id="milestone-title"
                          value={milestoneTitle}
                          onChange={(event) => setMilestoneTitle(event.target.value)}
                          placeholder="Example: Prototype delivery"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="milestone-description">Milestone description</label>
                        <textarea
                          id="milestone-description"
                          value={milestoneDescription}
                          onChange={(event) => setMilestoneDescription(event.target.value)}
                          placeholder="Describe what this milestone delivers and when."
                        />
                      </div>
                    </>
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
                  <button type="button"><img src="/assets/profile-portfolio.svg" alt="" /> Add a portfolio project</button>
                  <button type="button"><img src="/assets/profile-certificate.svg" alt="" /> Add a certificate</button>
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
