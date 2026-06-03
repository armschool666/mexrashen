import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSessionValid } from "./sessions-store";

export const SESSION_COOKIE = "admin_session";

/**
 * Returns a 401 response if the request is not authenticated,
 * or null if auth is valid.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!(await isSessionValid(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
