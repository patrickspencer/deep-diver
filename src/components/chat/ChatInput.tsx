"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { TextSelectionContext } from "@/types";

interface ChatInputProps {
  onSend: (message: string, context?: TextSelectionContext) => void;
  selectedText: TextSelectionContext | null;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  selectedText,
  onClearSelection,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedText) {
      setInput(`Explain this section from "${selectedText.documentTitle}":`);
      textareaRef.current?.focus();
    }
  }, [selectedText]);

  function handleSubmit() {
    if (!input.trim() && !selectedText) return;
    onSend(input.trim(), selectedText || undefined);
    setInput("");
    onClearSelection();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t p-3">
      {selectedText && (
        <div className="mb-2 flex items-start gap-2 rounded border bg-muted/50 p-2 text-xs">
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="mb-1 text-[10px]">
              Context: {selectedText.documentTitle}
            </Badge>
            <p className="italic text-muted-foreground line-clamp-2">
              &ldquo;{selectedText.text}&rdquo;
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={onClearSelection}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this filing..."
          className="min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
          disabled={disabled}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={disabled || (!input.trim() && !selectedText)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
