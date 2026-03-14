import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [folder] = await db
    .select()
    .from(folders)
    .where(eq(folders.id, parseInt(id)));

  if (!folder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(folder);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const [folder] = await db
    .update(folders)
    .set({
      ...body,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(folders.id, parseInt(id)))
    .returning();

  return NextResponse.json(folder);
}
