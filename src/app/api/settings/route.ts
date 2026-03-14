import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const user = await getSession(cookieStore);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const settings = db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .all();

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  return NextResponse.json(settingsMap);
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const user = await getSession(cookieStore);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const updates: Record<string, string> = await request.json();

  for (const [key, value] of Object.entries(updates)) {
    const existing = db
      .select()
      .from(userSettings)
      .where(and(eq(userSettings.userId, user.id), eq(userSettings.key, key)))
      .get();

    if (existing) {
      db.update(userSettings)
        .set({ value })
        .where(eq(userSettings.id, existing.id))
        .run();
    } else {
      db.insert(userSettings)
        .values({ userId: user.id, key, value })
        .run();
    }
  }

  return NextResponse.json({ ok: true });
}
