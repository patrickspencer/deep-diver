"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DocumentList } from "@/components/document/DocumentList";
import type { Document, Folder, TextSelectionContext } from "@/types";

export default function ResearchWorkspace() {
  const params = useParams();
  const folderId = Number(params.folderId);

  const [folder, setFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openDocuments, setOpenDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<TextSelectionContext | null>(
    null
  );

  useEffect(() => {
    fetch(`/api/folders/${folderId}`)
      .then((r) => r.json())
      .then(setFolder)
      .catch(() => {});
    fetchDocuments();
  }, [folderId]);

  function fetchDocuments() {
    fetch(`/api/documents?folderId=${folderId}`)
      .then((r) => r.json())
      .then(setDocuments)
      .catch(() => {});
  }

  function openDocument(doc: Document) {
    if (!openDocuments.find((d) => d.id === doc.id)) {
      setOpenDocuments((prev) => [...prev, doc]);
    }
    setActiveDocumentId(doc.id);
  }

  function closeDocument(id: number) {
    setOpenDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocumentId === id) {
      const remaining = openDocuments.filter((d) => d.id !== id);
      setActiveDocumentId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  const handleTextSelection = useCallback(
    (text: string) => {
      const activeDoc = openDocuments.find((d) => d.id === activeDocumentId);
      if (activeDoc && text.trim()) {
        setSelectedText({
          text: text.trim(),
          documentId: activeDoc.id,
          documentTitle: activeDoc.title,
        });
      }
    },
    [activeDocumentId, openDocuments]
  );

  const activeDocument =
    openDocuments.find((d) => d.id === activeDocumentId) || null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        folderName={folder?.name}
        openDocuments={openDocuments}
        activeDocumentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        onCloseDocument={closeDocument}
      />
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={60} minSize={30}>
          {activeDocument ? (
            <DocumentViewer
              document={activeDocument}
              onTextSelection={handleTextSelection}
            />
          ) : (
            <DocumentList
              folderId={folderId}
              documents={documents}
              onOpenDocument={openDocument}
              onDocumentsChange={fetchDocuments}
            />
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <ChatPanel
            folderId={folderId}
            activeDocument={activeDocument}
            selectedText={selectedText}
            onClearSelection={() => setSelectedText(null)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
