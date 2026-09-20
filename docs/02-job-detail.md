# 02 — Job detail & the application form (`/jobs/[id]`)

**File:** [`components/JobDetailClient.tsx`](../components/JobDetailClient.tsx)

This is the dark, Upwork-style workspace and the **most important screen** — it's where
a candidate actually applies. The same component renders in two modes:

- `mode="candidate"` (default, at `/jobs/[id]`) — shows the full application form.
- `mode="client"` (at `/client/jobs/[id]`) — hides the form and instead records that
  the client viewed the job.

## Layout (left to right)

1. **Workspace rail** — decorative icons (Search, Home, Messages, …). Not clickable in
   any meaningful way; it's there to look like Upwork.
2. **Job list preview** — three "Best matches" preview cards. The first one mirrors the
   real job you're viewing.
3. **Main pane** — the job title, summary, core requirements, screening questions, the
   client card, and the proposal form.

## State it keeps

```ts
candidateName, bidAmount, boostConnects, milestone, coverLetter, answer  // form fields
message        // the inline result message under the submit button
applications   // loaded from localStorage
```

If an application for this job already exists, a `useEffect` pre-fills every field from
it, so re-visiting a job lets the candidate **edit** their proposal.

## Derived numbers (computed live as you type)

```ts
parsedBid                 = Number(bidAmount)
parsedBoost               = Number(boostConnects)
totalConnectsForProposal  = job.connectsRequired + parsedBoost
serviceFee                = parsedBid * 0.10      // Upwork's 10% fee
receiveAmount             = parsedBid - serviceFee
remainingConnects         = 75 - (everything already spent)
```

`boostRanks` builds the little leaderboard table showing where different boost bids
would place (1st = 9 connects "now", etc.).

## Every selection in the form

| Selection | Required? | Effect |
|-----------|-----------|--------|
| **"What is your name?"** input | ✅ | Sets `candidateName` |
| **"By milestone" radio** | choice | Sets `milestone` to the two-milestone text |
| **"By project" radio** | choice | Sets `milestone` to the single-payment text |
| **"…full amount you would like to bid?"** number | ✅ (> 0) | Sets `bidAmount`; drives the fee lines |
| **"Cover letter"** textarea | ✅ | Sets `coverLetter` |
| **"Attach files"** button | — | Demo only |
| **Profile highlight buttons** | — | Demo only |
| **"Your expert answer"** textarea | ✅ | Sets `answer`; ≥ 90 chars earns bonus points |
| **"Your boosted Connects bid"** number | ✅ (≥ 0) | Sets `boostConnects`; adds to connects spent |
| **"Apply now" / "Update application"** | — | Calls `submit()` |

## What `submit()` does, step by step

1. Reject if **name** is empty.
2. Reject if **bid** is empty, not a number, or ≤ 0.
3. Reject if **boost** is empty, not a number, or < 0.
4. Reject if **cover letter** is empty.
5. Reject if **answer** is empty.
6. If this is a *new* application and there aren't enough connects for it, show the
   "thanks for completing this test" message and stop.
7. Build the `Application` object and either replace the existing one for this job or
   append a new one.
8. Save the array to `uet-applications`.
9. Show a result message. If remaining connects drop **below 40**, show the polite
   "thanks, please leave the site" message instead of the normal confirmation.

## Client mode (the "viewed" signal)

When `mode="client"`, a `useEffect` adds this job's ID to `uet-client-views` (once).
The form is replaced by a short note and a green **"Viewed"** pill. This is how the
admin later knows which jobs were opened as a client. See
[03 — Client view](03-client-view.md).

## The client verification detail

Each job's client (from `lib/jobs.ts`) has `paymentVerified` and `phoneVerified`
booleans. **Some clients intentionally have one set to `false`** and render greyed-out
("not verified"), so the admin can judge whether a candidate spotted the risk.
