import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET || "deep-diver-default-secret-change-me";
const COOKIE_NAME = "dd_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const check = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(check));
  } catch {
    return false;
  }
}

function signToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = createHash("sha256")
    .update(payload + SESSION_SECRET)
    .digest("hex");
  return `${payload}:${sig}`;
}

function verifyToken(token: string): number | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [userIdStr, timestamp, sig] = parts;
  const expected = createHash("sha256")
    .update(`${userIdStr}:${timestamp}` + SESSION_SECRET)
    .digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return parseInt(userIdStr, 10);
}

export async function getSession(cookieStore: { get: (name: string) => { value: string } | undefined }): Promise<{ id: number; email: string; name: string } | null> {
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  const userId = verifyToken(cookie.value);
  if (!userId) return null;
  const user = db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).get();
  return user || null;
}

export function createSessionCookie(userId: number): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: signToken(userId),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    },
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
