"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";

interface TopBarProps {
  folderName?: string;
  openDocuments: Document[];
  activeDocumentId: number | null;
  onSelectDocument: (id: number) => void;
  onCloseDocument: (id: number) => void;
}

export function TopBar({
  folderName,
  openDocuments,
  activeDocumentId,
  onSelectDocument,
  onCloseDocument,
}: TopBarProps) {
  return (
    <div className="flex h-10 items-center border-b bg-background px-4">
      {folderName && (
        <span className="mr-4 text-sm font-medium text-muted-foreground">
          {folderName}
        </span>
      )}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {openDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`group flex items-center gap-1 rounded-t px-3 py-1 text-sm cursor-pointer transition-colors ${
              activeDocumentId === doc.id
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
            onClick={() => onSelectDocument(doc.id)}
          >
            <span className="max-w-[150px] truncate">{doc.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onCloseDocument(doc.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
