import { NextRequest, NextResponse } from "next/server";
import {
  searchCompanies,
  getCompanyFilings,
  downloadFiling,
} from "@/lib/edgar/client";
import { saveFile } from "@/lib/documents/storage";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { extractFilingType } from "@/lib/edgar/parser";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "search") {
    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json(
        { error: "Query required" },
        { status: 400 }
      );
    }
    const results = await searchCompanies(query);
    return NextResponse.json(results);
  }

  if (action === "filings") {
    const cik = searchParams.get("cik");
    const forms = searchParams.get("forms");
    if (!cik) {
      return NextResponse.json(
        { error: "CIK required" },
        { status: 400 }
      );
    }
    const formTypes = forms ? forms.split(",") : undefined;
    const filings = await getCompanyFilings(cik, formTypes);
    return NextResponse.json(filings);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { fileUrl, form, filingDate, title, companyId, folderId } =
    await request.json();

  if (!fileUrl) {
    return NextResponse.json(
      { error: "fileUrl required" },
      { status: 400 }
    );
  }

  const buffer = await downloadFiling(fileUrl);
  const ext = fileUrl.endsWith(".htm") || fileUrl.endsWith(".html") ? ".html" : ".pdf";
  const fileName = await saveFile(buffer, `filing${ext}`);

  const [doc] = await db
    .insert(documents)
    .values({
      title: title || `${form} Filing`,
      type: extractFilingType(form || "custom"),
      filePath: fileName,
      sourceUrl: fileUrl,
      filingDate: filingDate || null,
      companyId: companyId ? parseInt(companyId) : null,
      folderId: folderId ? parseInt(folderId) : null,
    })
    .returning();

  return NextResponse.json(doc);
}
