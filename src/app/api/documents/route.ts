import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { saveFile, deleteFile } from "@/lib/documents/storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");
  const companyId = searchParams.get("companyId");

  let query = db.select().from(documents);
  if (folderId) {
    query = query.where(eq(documents.folderId, parseInt(folderId))) as typeof query;
  }
  if (companyId) {
    query = query.where(eq(documents.companyId, parseInt(companyId))) as typeof query;
  }

  const docs = await query.orderBy(documents.createdAt);
  return NextResponse.json(docs);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const type = (formData.get("type") as string) || "custom";
  const folderId = formData.get("folderId") as string | null;
  const companyId = formData.get("companyId") as string | null;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const filingDate = formData.get("filingDate") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = await saveFile(buffer, file.name);

  const [doc] = await db
    .insert(documents)
    .values({
      title: title || file.name,
      type,
      filePath: fileName,
      folderId: folderId ? parseInt(folderId) : null,
      companyId: companyId ? parseInt(companyId) : null,
      sourceUrl,
      filingDate,
    })
    .returning();

  return NextResponse.json(doc);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, parseInt(id)));

  if (doc) {
    deleteFile(doc.filePath);
    await db.delete(documents).where(eq(documents.id, parseInt(id)));
  }

  return NextResponse.json({ ok: true });
}
