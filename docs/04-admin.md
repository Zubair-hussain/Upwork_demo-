# 04 — Admin login & review board (`/admIn`)

**Files:**
- [`components/AdminLoginClient.tsx`](../components/AdminLoginClient.tsx) — login form
- [`app/api/admin/login/route.ts`](../app/api/admin/login/route.ts) — login API
- [`lib/adminAuth.ts`](../lib/adminAuth.ts) — password check + JWT
- [`components/AdminClient.tsx`](../components/AdminClient.tsx) — the review board
- [`app/admin/page.tsx`](../app/admin/page.tsx) — decides login vs. board

> The route is spelled **`/admIn`** (capital I) on purpose — it's a lightly hidden admin
> entrance that isn't linked anywhere in the public UI.

## How the gate works

`app/admin/page.tsx` reads the JWT cookie and calls `verifyAdminJwt()`. If the token is
missing or invalid, it renders the **login form**. If valid, it renders the **review
board**. No client-side flicker — the decision happens on the server.

## Login screen selections

| Selection | What it does |
|-----------|--------------|
| **"Email"** input | Pre-filled with the seeded admin email |
| **"Password"** input | The admin password (masked) |
| **"Enter admin"** button | POSTs `{email, password}` to `/api/admin/login` |

The API verifies the credentials with `verifyAdminCredentials()`. On success it creates
an HS256 JWT (`createAdminJwt()`, 8-hour expiry) and sets it as a cookie, then the page
reloads into the board. On failure it shows "Admin login failed."

**Seeded credentials** (demo only) live in `lib/adminAuth.ts`:
- Email: `thezubairh@gmail.com`
- The JWT secret falls back to a local string if `ADMIN_JWT_SECRET` isn't set.

Signature verification uses `crypto.timingSafeEqual` to avoid timing leaks, and rejects
expired or non-admin tokens.

## Review board selections

The board reads all three `localStorage` keys and derives everything.

**Fit decision panel:**
- Candidate name + description (from the saved profile, falling back to the first
  application's name).
- The big animated **Fit score / 100** and its label.
- Mini stats: **Applied jobs**, **Connects left**, **Record picks**.

**Job Review Board** — one row per job:
- Title, category, connects, bid count.
- A **"Client viewed" / "Not viewed"** pill.
- If the candidate applied: the **bid**, **boost connects**, **milestone**, **cover
  letter**, and **answer**, plus the job's post guide.
- **"Select record" / "Remove record"** button — calls `toggleRecord(jobId)`, flipping
  `selectedForRecord` on that application and saving. Selected records are worth fit
  points and show a "Saved for final selection" pill.

**Top bar:**
- **"Candidate Portal"** — back to `/`.
- **"Reset"** — calls `resetDemo()`, which clears `uet-applications`,
  `uet-client-views`, and `uet-candidate-profile`. Use this to start a fresh run.

## Extending it

- Swap the demo seed in `lib/adminAuth.ts` for a real DB + hashed passwords before any
  real use.
- The board is read-only except for record toggles and reset — add columns by reading
  more fields off each `Application`.
