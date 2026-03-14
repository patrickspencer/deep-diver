import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatThreads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json({ error: "folderId required" }, { status: 400 });
  }

  const threads = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.folderId, parseInt(folderId)))
    .orderBy(chatThreads.createdAt);

  return NextResponse.json(threads);
}

export async function POST(request: NextRequest) {
  const { folderId, title, documentId } = await request.json();

  const [thread] = await db
    .insert(chatThreads)
    .values({
      folderId,
      title: title || "New Chat",
      documentId: documentId || null,
    })
    .returning();

  return NextResponse.json(thread);
}
