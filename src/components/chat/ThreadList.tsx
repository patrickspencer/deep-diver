"use client";

import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatThread } from "@/types";

interface ThreadListProps {
  threads: ChatThread[];
  activeThreadId: number | null;
  onSelectThread: (id: number) => void;
  onCreateThread: () => void;
}

export function ThreadList({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: ThreadListProps) {
  return (
    <div className="flex items-center gap-1 border-b px-3 py-2 overflow-x-auto">
      <span className="text-xs font-medium text-muted-foreground mr-1 shrink-0">
        Threads:
      </span>
      {threads.map((thread) => (
        <Button
          key={thread.id}
          variant={activeThreadId === thread.id ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs shrink-0"
          onClick={() => onSelectThread(thread.id)}
        >
          <MessageSquare className="mr-1 h-3 w-3" />
          {thread.title}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs shrink-0"
        onClick={onCreateThread}
      >
        <Plus className="mr-1 h-3 w-3" />
        New
      </Button>
    </div>
  );
}
