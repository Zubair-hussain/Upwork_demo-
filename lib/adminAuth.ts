import crypto from "node:crypto";

const adminEmail = "thezubairh@gmail.com";
const adminPassword = "imam786123";
const jwtSecret = process.env.ADMIN_JWT_SECRET ?? "upwork-expert-test-local-secret";

type JwtPayload = {
  email: string;
  role: "admin";
  exp: number;
};

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function verifyAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === adminEmail && password === adminPassword;
}

export function createAdminJwt(email = adminEmail) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      email,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    } satisfies JwtPayload)
  );
  const signature = crypto.createHmac("sha256", jwtSecret).update(`${header}.${payload}`).digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminJwt(token?: string) {
  if (!token) {
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", jwtSecret).update(`${header}.${payload}`).digest("base64url");
  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
  if (decoded.exp < Math.floor(Date.now() / 1000) || decoded.role !== "admin") {
    return null;
  }

  return decoded;
}

export const liteSqlAdminSeed = {
  table: "admins",
  rows: [{ email: adminEmail, passwordHash: "demo-only-password:imam786123", auth: "JWT cookie" }]
};
