import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allFolders = await db.select().from(folders).orderBy(folders.createdAt);
  return NextResponse.json(allFolders);
}

export async function POST(request: NextRequest) {
  const { name, description } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const [folder] = await db
    .insert(folders)
    .values({ name: name.trim(), description: description || null })
    .returning();
  return NextResponse.json(folder);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  await db.delete(folders).where(eq(folders.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
