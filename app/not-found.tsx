import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

/**
 * Custom 404 page.
 * Next.js renders this automatically for any unmatched route. It uses the same
 * green marketplace branding as the rest of the app, animated icons, and a
 * floating "404" so a wrong URL still feels on-brand.
 */
export default function NotFound() {
  return (
    <main className="app-shell notfound-shell">
      <section className="notfound-card">
        <span className="notfound-badge">
          <Compass size={30} />
        </span>

        <p className="notfound-code">404</p>
        <h1>This job posting could not be found</h1>
        <p className="muted">
          The page you are looking for may have been closed, moved, or never existed.
          Let&apos;s get you back to the open jobs.
        </p>

        <div className="notfound-actions">
          <Link className="btn primary" href="/">
            <Home size={16} /> Back to jobs
          </Link>
          <Link className="btn" href="/client/jobs">
            <Search size={16} /> Browse as client
          </Link>
        </div>
      </section>
    </main>
  );
}
