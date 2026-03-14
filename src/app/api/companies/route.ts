import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allCompanies = await db
    .select()
    .from(companies)
    .orderBy(companies.name);
  return NextResponse.json(allCompanies);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, ticker, cik, sector, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [company] = await db
    .insert(companies)
    .values({
      name: name.trim(),
      ticker: ticker || null,
      cik: cik || null,
      sector: sector || null,
      description: description || null,
    })
    .returning();

  return NextResponse.json(company);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  await db.delete(companies).where(eq(companies.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
