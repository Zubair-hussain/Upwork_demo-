# Docs — understand this app end to end

Welcome. These docs are written for someone who wants to **understand the whole app
without reading every line of code** — whether you're vibe coding, reviewing, or just
handing this off. Read them in order, or jump to what you need.

## What this app is (in one paragraph)

It's a fake, single-machine "Upwork for hiring tests". A candidate lands on a home
page, fills a profile, browses seven jobs, and applies to them by writing a proposal
(bid, cover letter, screening answer, and a Connects "boost"). Every action costs
Connects. A hidden admin page scores the candidate and lets a reviewer save the best
applications. There is **no real backend** — everything the candidate does is stored in
the browser's `localStorage`. The only server code is a tiny JWT login for the admin.

## The map (files → what they do)

| File | Role |
|------|------|
| `app/page.tsx` | Home route `/` → renders `PlatformClient` |
| `app/jobs/[id]/page.tsx` | Job detail route → renders `JobDetailClient` |
| `app/client/jobs/*` | Client routes → job list + view-tracking detail |
| `app/admin/page.tsx` + `app/api/admin/login/route.ts` | Admin board + JWT login |
| `components/PlatformClient.tsx` | Home screen UI + candidate state |
| `components/PlusBanner.tsx` | The rotating Freelancer Plus carousel |
| `components/JobDetailClient.tsx` | The dark job page + the application form |
| `components/ClientJobs.tsx` | The client job list |
| `components/AdminClient.tsx` | The admin review board |
| `components/AdminLoginClient.tsx` | The admin login form |
| `lib/jobs.ts` | The seven jobs, their bids, and their clients (all data) |
| `lib/assessment.ts` | The math: connects spent, fit score, fit label |
| `lib/adminAuth.ts` | Password check + JWT create/verify |
| `app/globals.css` | All styling **and all animations** |

## Read these next

1. [01 — Candidate home](01-candidate-home.md)
2. [02 — Job detail & the application form](02-job-detail.md)
3. [03 — Client view & the "viewed" signal](03-client-view.md)
4. [04 — Admin login & review board](04-admin.md)
5. [05 — Scoring, connects & data model](05-scoring-and-data.md)
6. [06 — Animations, how they work](06-animations.md)

## The one mental model to keep

Three things live in `localStorage` and everything else is derived from them:

- `uet-candidate-profile` — the candidate's name + description.
- `uet-applications` — the array of proposals the candidate submitted.
- `uet-client-views` — the list of job IDs opened in client mode.

The home page, the job page, and the admin page all read and write these same three
keys. That's the whole "database".
