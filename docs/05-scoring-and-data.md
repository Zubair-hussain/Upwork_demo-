# 05 — Scoring, connects & data model

**Files:** [`lib/assessment.ts`](../lib/assessment.ts) and [`lib/jobs.ts`](../lib/jobs.ts)

This is the "brain" of the demo. Both files are pure data + pure functions, so they're
easy to unit test (see `__tests__/`).

## The data model

Everything the candidate does becomes an `Application`:

```ts
type Application = {
  jobId: string;
  candidateName: string;
  bidAmount: number;
  boostConnects: number;
  milestone: string;
  coverLetter: string;
  answer: string;
  selectedForRecord: boolean;  // toggled by the admin
  appliedAt: string;
};
```

Applications are stored as an array under the `uet-applications` localStorage key.
Two more keys complete the "database":

- `uet-client-views` — `string[]` of job IDs opened in client mode.
- `uet-candidate-profile` — `{ name, description, savedAt }`.

## The jobs (`lib/jobs.ts`)

Seven jobs across three categories (Full Stack, AI Engineering, n8n Automation). Each
job has a fixed `connectsRequired` of `5 | 10 | 30`, a budget, skills, screening
questions, a post guide, seven generated `bids`, and a `client` object (with the
`paymentVerified` / `phoneVerified` risk flags).

Two exported constants matter:

```ts
startingConnects       // 75
totalConnectsRequired  // sum of every job's connectsRequired — equals 75 by design
```

Because the seven jobs cost **exactly 75**, a candidate can apply to all of them *only
if they don't over-boost*. That tension is the point of the test.

## Connects math — `calculateRemainingConnects`

```ts
spent = Σ over applications of (job.connectsRequired + application.boostConnects)
remaining = max(startingConnects - spent, 0)
```

Boosting costs real connects, so a big boost on one job can lock the candidate out of
another. Never goes below 0.

## Fit score — `calculateFitScore`

```ts
applicationScore = applications.length            * 9
detailScore      = answers with ≥ 90 chars        * 5
recordScore      = admin-selected records         * 3
viewedScore      = client-viewed jobs             * 2
allJobsBonus     = applied to all 7 ? 14 : 0
score            = min(100, sum of the above)
```

So the ceiling behaviour is: **apply to all seven jobs with thoughtful (≥90-char)
answers**, and the extras (records, views) push toward 100.

## Fit label — `getFitLabel`

| Score | Label |
|-------|-------|
| ≥ 85 | Excellent fit |
| 65–84 | Promising fit |
| 42–64 | Needs review |
| < 42 | Not enough signal |

## Tests

- `__tests__/jobs.test.ts` — checks job data integrity (counts, connect totals, etc.).
- `__tests__/assessment.test.ts` — checks the connects math and fit scoring.

Run them with `npm test`. If you change the scoring weights or job data, update these
tests — they're the guardrail that keeps the "75 = 75" invariant true.
