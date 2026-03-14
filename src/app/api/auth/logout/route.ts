import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const session = clearSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(session.name, session.value, session.options as Parameters<typeof cookieStore.set>[2]);

  return NextResponse.json({ ok: true });
}
