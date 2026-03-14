import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json(
      { error: "folderId required" },
      { status: 400 }
    );
  }

  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.folderId, parseInt(folderId)))
    .orderBy(notes.updatedAt);

  return NextResponse.json(allNotes);
}

export async function POST(request: NextRequest) {
  const { folderId, documentId, title, content } = await request.json();

  const [note] = await db
    .insert(notes)
    .values({
      folderId,
      documentId: documentId || null,
      title: title || "Untitled Note",
      content: content || "",
    })
    .returning();

  return NextResponse.json(note);
}

export async function PATCH(request: NextRequest) {
  const { id, title, content } = await request.json();

  const [note] = await db
    .update(notes)
    .set({
      title,
      content,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(notes.id, id))
    .returning();

  return NextResponse.json(note);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  await db.delete(notes).where(eq(notes.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
