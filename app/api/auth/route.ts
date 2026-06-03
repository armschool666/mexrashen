import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession, revokeSession } from "../sessions-store";
import { SESSION_COOKIE } from "../auth-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory rate limiter — resets on server restart
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// POST — login
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { login, token } = (await request.json()) as {
    login?: string;
    token?: string;
  };

  const adminLogin = process.env.ADMIN_LOGIN;
  const adminToken = process.env.ADMIN_TOKEN;

  const valid =
    !!adminLogin &&
    !!adminToken &&
    !!login &&
    !!token &&
    safeCompare(login, adminLogin) &&
    safeCompare(token, adminToken);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);

  const session = await createSession();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: session.maxAgeSec,
  });
  return response;
}

// DELETE — logout
export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  await revokeSession(sessionToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
