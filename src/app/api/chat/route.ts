import { NextRequest } from "next/server";
import { streamText } from "ai";
import { getModel } from "@/lib/ai/provider";
import {
  FINANCIAL_ANALYST_PROMPT,
  buildContextPrompt,
} from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import { chatMessages, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readFileContent } from "@/lib/documents/storage";
import { extractTextFromHtml, chunkText } from "@/lib/documents/chunker";

export async function POST(request: NextRequest) {
  const { threadId, message, highlightedText, documentId } =
    await request.json();

  // Save user message
  await db.insert(chatMessages).values({
    threadId,
    role: "user",
    content: message,
    highlightedText: highlightedText || null,
    documentId: documentId || null,
  });

  // Get document context if available
  let documentContext = "";
  if (documentId) {
    try {
      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));
      if (doc) {
        let content = readFileContent(doc.filePath);
        if (
          doc.filePath.endsWith(".html") ||
          doc.filePath.endsWith(".htm")
        ) {
          content = extractTextFromHtml(content);
        }
        // Take first ~8000 chars for context
        const chunks = chunkText(content, 8000, 0);
        documentContext = chunks[0] || "";
      }
    } catch {
      // Document might not be readable as text (e.g., PDF)
    }
  }

  // Get conversation history
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(chatMessages.createdAt);

  const contextPrompt = buildContextPrompt(highlightedText, documentContext);

  const messages = [
    {
      role: "system" as const,
      content:
        FINANCIAL_ANALYST_PROMPT +
        (contextPrompt ? "\n\n" + contextPrompt : ""),
    },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const model = getModel();

  const result = streamText({
    model,
    messages,
    onFinish: async ({ text }) => {
      // Save assistant message
      await db.insert(chatMessages).values({
        threadId,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toTextStreamResponse();
}
