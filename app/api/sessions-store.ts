import { createHash, randomBytes } from "node:crypto";
import { createJsonStore } from "../json-store";

/**
 * Хранилище админ-сессий.
 *
 * Cookie клиента — это случайный идентификатор сессии.
 * На диске хранится SHA-256 от идентификатора + срок жизни.
 * Так даже при утечке файла сессий — токены не вытаскиваются.
 */

type Session = {
  hash: string;
  expiresAt: number;
};

type SessionsFile = {
  sessions: Session[];
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const store = createJsonStore<SessionsFile>("sessions.json", { sessions: [] });

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isAlive(session: Session, now: number): boolean {
  return session.expiresAt > now;
}

export async function createSession(): Promise<{ token: string; maxAgeSec: number }> {
  const token = randomBytes(32).toString("hex");
  const hash = hashToken(token);
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  await store.update((file) => ({
    sessions: [...file.sessions.filter((s) => isAlive(s, now)), { hash, expiresAt }],
  }));

  return { token, maxAgeSec: Math.floor(SESSION_TTL_MS / 1000) };
}

export async function isSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const hash = hashToken(token);
  const file = await store.read();
  const now = Date.now();
  return file.sessions.some((s) => s.hash === hash && isAlive(s, now));
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  const hash = hashToken(token);
  await store.update((file) => ({
    sessions: file.sessions.filter((s) => s.hash !== hash),
  }));
}
