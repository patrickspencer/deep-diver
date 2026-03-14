"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types";

interface DocumentListProps {
  folderId: number;
  documents: Document[];
  onOpenDocument: (doc: Document) => void;
  onDocumentsChange: () => void;
}

export function DocumentList({
  folderId,
  documents,
  onOpenDocument,
  onDocumentsChange,
}: DocumentListProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", String(folderId));
      formData.append("title", file.name);
      formData.append("type", "custom");

      await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
    }
    setUploading(false);
    onDocumentsChange();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deleteDocument(id: number) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    onDocumentsChange();
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.html,.htm,.txt"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p className="text-sm">No documents yet</p>
          <p className="text-xs">Upload PDFs or HTML filings to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onOpenDocument(doc)}
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {doc.type}
                  </Badge>
                  {doc.filingDate && (
                    <span className="text-xs text-muted-foreground">
                      {doc.filingDate}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDocument(doc.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
