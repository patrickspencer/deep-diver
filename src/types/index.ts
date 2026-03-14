export type DocumentType = "10-K" | "10-Q" | "8-K" | "transcript" | "custom";
export type MessageRole = "user" | "assistant" | "system";

export interface Company {
  id: number;
  name: string;
  ticker: string | null;
  cik: string | null;
  sector: string | null;
  description: string | null;
  createdAt: string;
}

export interface Folder {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  companyId: number | null;
  folderId: number | null;
  type: DocumentType;
  title: string;
  filePath: string;
  sourceUrl: string | null;
  filingDate: string | null;
  createdAt: string;
}

export interface ChatThread {
  id: number;
  documentId: number | null;
  folderId: number;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  threadId: number;
  role: MessageRole;
  content: string;
  highlightedText: string | null;
  documentId: number | null;
  createdAt: string;
}

export interface Note {
  id: number;
  folderId: number;
  documentId: number | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextSelectionContext {
  text: string;
  documentId: number;
  documentTitle: string;
}
