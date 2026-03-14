import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".html" && ext !== ".htm") {
    return NextResponse.json([]);
  }

  const fullPath = path.join(process.cwd(), "data", "documents", filePath);
  const resolvedPath = path.resolve(fullPath);
  const allowedDir = path.resolve(path.join(process.cwd(), "data", "documents"));
  if (!resolvedPath.startsWith(allowedDir)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  if (!fs.existsSync(resolvedPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const html = fs.readFileSync(resolvedPath, "utf-8");

  // Collect all internal anchor links grouped by their target ID
  const linksByTarget = new Map<string, string[]>();
  const linkRegex = /<a\s[^>]*href\s*=\s*["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const id = match[1];
    const text = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    if (!linksByTarget.has(id)) linksByTarget.set(id, []);
    linksByTarget.get(id)!.push(text);
  }

  // Build sections from groups that contain an "Item" or "Part" link
  const sections: { id: string; title: string }[] = [];
  const seen = new Set<string>();

  for (const [id, texts] of linksByTarget) {
    const itemText = texts.find((t) => /^(Item\s+\d|Part\s+[IVX])/i.test(t));
    if (!itemText || seen.has(id)) continue;
    seen.add(id);

    // The description is typically a sibling link with the same href
    // e.g. "Item 1." in one <td>, "Business" in the next <td>
    const descText = texts.find((t) => t !== itemText && !/^(Item\s+\d|Part\s+[IVX])/i.test(t));
    const title = descText ? `${itemText} ${descText}` : itemText;
    sections.push({ id, title });
  }

  return NextResponse.json(sections);
}
