import { NextRequest, NextResponse } from "next/server";

// Temporary application pause. Candidate pages return a real 404, while the
// admin and client review areas remain available. Set this to false to reopen.
const applicationsPaused = true;

const closedPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 - Applications unavailable</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Arial, sans-serif; color: #181818; background: #f5f7f4; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      section { width: min(620px, 100%); padding: 54px 42px; border: 1px solid #dce3da; border-radius: 28px; background: #fff; box-shadow: 0 24px 70px rgba(23, 50, 24, .12); text-align: center; }
      .badge { display: grid; width: 58px; height: 58px; margin: 0 auto 24px; place-items: center; border-radius: 18px; color: #fff; background: #108a00; font-size: 25px; font-weight: 700; }
      .code { margin: 0; color: #108a00; font-size: clamp(4.5rem, 18vw, 8rem); font-weight: 800; line-height: .9; letter-spacing: -.07em; }
      h1 { margin: 25px 0 12px; font-size: clamp(1.6rem, 5vw, 2.3rem); }
      p { margin: 0 auto; max-width: 470px; color: #667066; font-size: 1.05rem; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <span class="badge">!</span>
        <p class="code">404</p>
        <h1>Applications are currently unavailable</h1>
        <p>This candidate application site is temporarily closed. Please check back later.</p>
      </section>
    </main>
  </body>
</html>`;

export function middleware(request: NextRequest) {
  if (!applicationsPaused) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/api/applications") {
    if (request.method === "POST") {
      return NextResponse.json(
        { error: "Applications are currently unavailable." },
        { status: 404 }
      );
    }

    return NextResponse.next();
  }

  return new NextResponse(closedPage, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

export const config = {
  matcher: ["/", "/jobs/:path*", "/api/applications"]
};
