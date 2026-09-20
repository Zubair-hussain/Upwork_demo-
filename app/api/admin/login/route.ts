import { NextResponse } from "next/server";
import { createAdminJwt, verifyAdminCredentials } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!verifyAdminCredentials(body.email ?? "", body.password ?? "")) {
    return NextResponse.json({ error: "Invalid admin email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("uet_admin_jwt", createAdminJwt(body.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
