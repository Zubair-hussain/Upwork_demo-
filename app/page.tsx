import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found - Upwork",
  description: "The requested page could not be found."
};

function AbductionIllustration() {
  return (
    <svg className="home-404-art" viewBox="0 0 360 350" role="img" aria-label="A cat being lifted into a flying saucer">
      <defs>
        <linearGradient id="beam" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f0aaa5" />
          <stop offset=".55" stopColor="#cb9ee2" />
          <stop offset="1" stopColor="#a78ce0" />
        </linearGradient>
        <linearGradient id="ground" x1="0" x2="1">
          <stop offset="0" stopColor="#ffd08e" />
          <stop offset="1" stopColor="#f3a06c" />
        </linearGradient>
        <linearGradient id="dome" x1="0" x2="1">
          <stop stopColor="#94e9bb" />
          <stop offset=".72" stopColor="#61dd7c" />
          <stop offset="1" stopColor="#16a800" />
        </linearGradient>
        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#050d0b" floodOpacity=".38" />
        </filter>
      </defs>
      <path d="M135 118 52 302c-10 25 56 42 130 36 72-6 115-27 102-48l-50-173Z" fill="url(#beam)" />
      <ellipse cx="168" cy="311" rx="118" ry="31" fill="url(#ground)" />
      <ellipse cx="170" cy="308" rx="27" ry="4" fill="#f18c45" opacity=".7" />
      <g filter="url(#soft-shadow)">
        <path d="M146 80c5-34 28-55 57-52 27 3 45 26 43 58Z" fill="url(#dome)" />
        <path d="M118 66c47-8 102 0 155 25 53 25 47 48-9 45-58-3-130-20-175-43-38-20-25-36 29-27Z" fill="#0b5d52" />
        <path d="M107 72c46-3 112 11 159 34 12 6 21 12 26 18-4 6-15 10-31 11-57-5-127-21-171-43-7-4-13-7-17-11 7-4 18-7 34-9Z" fill="#0d685c" opacity=".55" />
        <ellipse cx="191" cy="112" rx="77" ry="19" transform="rotate(15 191 112)" fill="#073d38" />
        <ellipse cx="186" cy="108" rx="58" ry="10" transform="rotate(15 186 108)" fill="#164c48" />
      </g>
      <g transform="translate(140 198) rotate(-3)" fill="#eaffee" stroke="#cfeede" strokeWidth="3" strokeLinejoin="round">
        <path d="M11 42c-8-18 3-42 22-43 15-1 20 11 35 8 12-2 24-13 28-28 2-7 10-5 9 2-3 20-17 36-35 42 5 14 2 35-5 49-3 6-13 3-12-4l2-34c-10 1-19 0-27-4l-5 37c-1 8-12 8-13 1Z" />
        <path d="m13 5-10-9 1 16M29 1 37-9l1 16" />
        <circle cx="15" cy="8" r="2" fill="#5b7466" stroke="none" />
        <circle cx="27" cy="7" r="2" fill="#5b7466" stroke="none" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="home-404">
      <a className="home-404-logo" href="https://www.upwork.com" aria-label="Upwork homepage">upwork</a>
      <section className="home-404-content" aria-labelledby="not-found-title">
        <AbductionIllustration />
        <div className="home-404-message">
          <h1 id="not-found-title">Looking for something?</h1>
          <p>
            We can&apos;t find this page. But we can help you find
            <br className="home-404-break" /> new opportunities:{" "}
            <a href="https://www.upwork.com/hire/">hire talent</a>,{" "}
            <a href="https://www.upwork.com/freelance-jobs/">find work</a> or{" "}
            <a href="https://support.upwork.com/">get help</a>.
          </p>
        </div>
        <a className="home-404-button" href="https://www.upwork.com">Go to homepage</a>
      </section>
      <footer className="home-404-footer">
        <p>Error 404</p>
        <p>Request ID: a3f116e0b808fd7d-SIN</p>
        <p>© 2015 - 2026 Upwork® Global LLC</p>
      </footer>
    </main>
  );
}
