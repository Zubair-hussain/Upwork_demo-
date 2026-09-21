# Firebase + Vercel setup (so candidate data is never lost)

The app now saves applications to **Firestore** in production and shows them in
the admin page. Follow these steps once before deploying.

## 1. Create the Firebase project + Firestore
1. Go to https://console.firebase.google.com → **Add project**.
2. Left menu → **Build → Firestore Database → Create database**.
3. Choose **Production mode**, pick a region, click **Enable**.

## 2. Get the service account key
1. Gear icon ⚙️ → **Project settings → Service accounts**.
2. Click **Generate new private key** → a **JSON file** downloads.
3. Open it. You need three values: `project_id`, `client_email`, `private_key`.

## 3. Add environment variables in Vercel
In your Vercel project → **Settings → Environment Variables**, add (for
Production, Preview, and Development):

| Name | Value |
|------|-------|
| `FIREBASE_PROJECT_ID` | the JSON's `project_id` |
| `FIREBASE_CLIENT_EMAIL` | the JSON's `client_email` |
| `FIREBASE_PRIVATE_KEY` | the JSON's `private_key` — paste it **in double quotes**, keeping the `\n` characters exactly |
| `ADMIN_JWT_SECRET` | any long random string |

Then **Redeploy** so the variables take effect.

## 4. Verify
1. Open `https://<your-app>.vercel.app`, apply to a job as a test candidate.
2. Open `https://<your-app>.vercel.app/admin`, log in, click **Refresh** — the
   candidate appears. Their data is now stored permanently in Firestore.

## Notes
- **Locally** you don't need Firebase: without these env vars the app uses a
  local JSON file (`data/submissions.json`). Tests and local dev keep working.
- Data lives in the Firestore `submissions` collection; you can also view it in
  the Firebase console.
