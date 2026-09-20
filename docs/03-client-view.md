# 03 — Client view & the "viewed" signal

**Files:**
- [`components/ClientJobs.tsx`](../components/ClientJobs.tsx) — the list at `/client/jobs`
- [`app/client/jobs/[id]/page.tsx`](../app/client/jobs/[id]/page.tsx) — the detail, which
  reuses `JobDetailClient` in `mode="client"`

## Why this exists

The demo pretends there are two audiences: the **candidate** (who applies) and the
**client** (who posted the job). The "client view" lets you simulate a client opening a
job, which drops a breadcrumb the admin dashboard reads. It's a simple way to add a
second signal to the fit score without a real backend.

## The list — `/client/jobs`

`ClientJobs` is a plain server component (no state). It maps over all seven jobs and
renders a card for each with:

- Title, a connects pill, summary, posted-time, budget, and bid count.
- One button: **"View as client"** → links to `/client/jobs/[id]`.

## The detail — `/client/jobs/[id]`

This route renders `JobDetailClient` with `mode="client"`. In that mode:

- The application form is **not** shown.
- A `useEffect` reads `uet-client-views`, and if this job's ID isn't already there, it
  appends it and saves. That's the entire "viewed" mechanism.
- The page shows a note explaining the view was recorded, plus a green **"Viewed"** pill.

## Where the signal shows up

- On the **candidate home**, viewed jobs get a small "Client viewed" flag on their card.
- On the **admin board**, each job row shows a **"Client viewed" / "Not viewed"** pill,
  and each view adds **2 points** to the fit score (see
  [05 — Scoring](05-scoring-and-data.md)).

## Gotcha

Views are keyed by **job ID**, and the list is de-duplicated — opening the same client
job twice only counts once. To reset views, use the admin **"Reset"** button, which
clears `uet-client-views` (along with the other keys).
