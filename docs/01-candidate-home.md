# 01 — Candidate home (`/`)

**File:** [`components/PlatformClient.tsx`](../components/PlatformClient.tsx)

This is the first thing a candidate sees. It has four parts stacked top to bottom:
the **Freelancer Plus banner**, the **welcome + profile hero**, the **filter tabs**,
and the **job grid**.

## State it keeps

```ts
candidateName   // the name typed into the profile
headline        // the short description typed into the profile
popup           // toast message text ("" means no toast)
activeCategory  // which filter tab is selected ("All" by default)
applications    // loaded from localStorage key "uet-applications"
viewedJobIds    // loaded from localStorage key "uet-client-views"
```

On mount, a `useEffect` loads the profile, applications, and views from `localStorage`
so the page always reflects what the candidate has already done.

## Section 1 — Freelancer Plus banner

Rendered by `<PlusBanner />`. It's a self-contained rotating carousel — see
[06 — Animations](06-animations.md) for exactly how it moves. It has no effect on
scoring; it exists to match the real Upwork dashboard.

## Section 2 — Welcome + profile hero

**Left ("welcome panel"):** the required label **"Welcome to Upwork expert test"** and
four guideline cards. These are static guidance, built by the small `<Guideline />`
helper.

**Right ("Candidate Test Profile"):** the interactive part.

| Selection | What it does |
|-----------|--------------|
| **"What is your name?"** input | Sets `candidateName` |
| **"Short description"** input | Sets `headline` |
| **"Save profile"** button | Calls `saveProfile()` |
| **Connects meter** | Read-only bar of `remaining / 75` |
| **Mini stats** | Live Fit score, Client views, Records |

`saveProfile()` refuses to save if either field is blank (it shows a toast). Otherwise
it writes `{ name, description, savedAt }` to `uet-candidate-profile` and toasts
"Profile saved. Admin can now see your name and short description."

## Section 3 — Filter tabs

Four buttons: **All**, **Full Stack**, **AI Engineering**, **n8n Automation**. Clicking
one sets `activeCategory`. The job grid is filtered by:

```ts
const visibleJobs = activeCategory === "All"
  ? jobs
  : jobs.filter((job) => job.category === activeCategory);
```

## Section 4 — Job grid

One `<article className="job-card">` per visible job. What each card shows:

- Title, posted-time, budget, level.
- A **connects pill** — gets the `warn` (orange) style when the job costs 30 connects.
- Summary text.
- **Bid counts** — total bids and how many bidders "spent 100+".
- A **"Client viewed"** flag if this job's ID is in `viewedJobIds`.
- Skill chips.
- Two links: **"Open"** and **"Apply"**. Both go to `/jobs/[id]`. The Apply button
  reads **"Applied"** with a check icon when an application already exists for that job
  (computed from the `appliedIds` set).

## What to change if you're extending it

- **Add a job?** Edit `lib/jobs.ts` — the grid, filters, and admin board all read from
  it automatically.
- **Change a guideline?** Edit the four `<Guideline>` blocks in this file.
- **Change what "saved" means?** Edit `saveProfile()` and the `CandidateProfile` type.
