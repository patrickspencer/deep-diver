import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");
  const format = searchParams.get("format");

  if (!filePath) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "data", "documents", filePath);

  // Prevent directory traversal
  const resolvedPath = path.resolve(fullPath);
  const allowedDir = path.resolve(path.join(process.cwd(), "data", "documents"));
  if (!resolvedPath.startsWith(allowedDir)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  if (!fs.existsSync(resolvedPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(resolvedPath);
  const ext = path.extname(filePath).toLowerCase();

  // For HTML filings, strip broken images and inject theme styles
  if (ext === ".html" || ext === ".htm" || format === "text") {
    let html = buffer.toString("utf-8");
    html = html.replace(/<img\b[^>]*\bsrc\s*=\s*["'](?!https?:\/\/|data:)[^"']*["'][^>]*\/?>/gi, "");

    const theme = searchParams.get("theme");
    if (theme === "dark") {
      const darkStyles = `<style>
        html, body { background: #1a1a1a !important; color: #e5e5e5 !important; }
        * { color: inherit !important; background-color: transparent !important; border-color: #333 !important; }
        html, body { background-color: #1a1a1a !important; }
        table, th, td { border-color: #444 !important; }
        a { color: #6baaff !important; }
      </style>`;
      if (html.includes("</head>")) {
        html = html.replace("</head>", darkStyles + "</head>");
      } else {
        html = darkStyles + html;
      }
    }

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".txt": "text/plain",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
    },
  });
}
