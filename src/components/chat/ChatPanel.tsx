"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ThreadList } from "./ThreadList";
import type {
  ChatThread,
  ChatMessage as ChatMessageType,
  Document,
  TextSelectionContext,
} from "@/types";

interface ChatPanelProps {
  folderId: number;
  activeDocument: Document | null;
  selectedText: TextSelectionContext | null;
  onClearSelection: () => void;
}

export function ChatPanel({
  folderId,
  activeDocument,
  selectedText,
  onClearSelection,
}: ChatPanelProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreads();
  }, [folderId]);

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function fetchThreads() {
    const res = await fetch(`/api/chat/threads?folderId=${folderId}`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data);
      if (data.length > 0 && !activeThreadId) {
        setActiveThreadId(data[0].id);
      }
    }
  }

  async function fetchMessages(threadId: number) {
    const res = await fetch(`/api/chat/messages?threadId=${threadId}`);
    if (res.ok) {
      setMessages(await res.json());
    }
  }

  async function createThread() {
    const res = await fetch("/api/chat/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderId,
        title: `Chat ${threads.length + 1}`,
        documentId: activeDocument?.id || null,
      }),
    });
    if (res.ok) {
      const thread = await res.json();
      setThreads((prev) => [...prev, thread]);
      setActiveThreadId(thread.id);
      setMessages([]);
    }
  }

  async function handleSend(
    message: string,
    context?: TextSelectionContext
  ) {
    let threadId = activeThreadId;

    // Auto-create thread if none exists
    if (!threadId) {
      const res = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId,
          title: message.slice(0, 50) || "New Chat",
          documentId: activeDocument?.id || null,
        }),
      });
      if (res.ok) {
        const thread = await res.json();
        setThreads((prev) => [...prev, thread]);
        threadId = thread.id;
        setActiveThreadId(thread.id);
      } else {
        return;
      }
    }

    // Add user message optimistically
    const userMessage: ChatMessageType = {
      id: Date.now(),
      threadId: threadId!,
      role: "user",
      content: message,
      highlightedText: context?.text || null,
      documentId: context?.documentId || null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          message,
          highlightedText: context?.text || null,
          documentId: context?.documentId || activeDocument?.id || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Chat request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      }

      if (!fullContent.trim()) {
        throw new Error("No response received. Check your API key and billing in Settings.");
      }

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: Date.now() + 1,
        threadId: threadId!,
        role: "assistant",
        content: fullContent,
        highlightedText: null,
        documentId: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessageType = {
        id: Date.now() + 1,
        threadId: threadId!,
        role: "assistant",
        content: `**Error:** ${error instanceof Error ? error.message : "Something went wrong."}`,
        highlightedText: null,
        documentId: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setStreaming(false);
      setStreamingContent("");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ThreadList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => {
          setActiveThreadId(id);
        }}
        onCreateThread={createThread}
      />
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && !streaming && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              {activeThreadId
                ? "Start a conversation about this filing..."
                : "Send a message to start a new chat thread."}
            </p>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {streaming && streamingContent && (
            <ChatMessage
              message={{
                id: -1,
                threadId: activeThreadId!,
                role: "assistant",
                content: streamingContent,
                highlightedText: null,
                documentId: null,
                createdAt: new Date().toISOString(),
              }}
            />
          )}
        </div>
      </div>
      <ChatInput
        onSend={handleSend}
        selectedText={selectedText}
        onClearSelection={onClearSelection}
        disabled={streaming}
      />
    </div>
  );
}
