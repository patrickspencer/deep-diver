"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/types";

interface NotesEditorProps {
  folderId: number;
}

export function NotesEditor({ folderId }: NotesEditorProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [folderId]);

  async function fetchNotes() {
    const res = await fetch(`/api/notes?folderId=${folderId}`);
    if (res.ok) setNotes(await res.json());
  }

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, title: "Untitled Note", content: "" }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [...prev, note]);
      selectNote(note);
    }
  }

  function selectNote(note: Note) {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDirty(false);
  }

  async function saveNote() {
    if (!activeNote) return;
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeNote.id, title, content }),
    });
    setDirty(false);
    fetchNotes();
  }

  async function deleteNote(id: number) {
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      setContent("");
    }
    fetchNotes();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Notes</span>
        <Button size="sm" variant="ghost" className="h-7" onClick={createNote}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-40 border-r overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                activeNote?.id === note.id ? "bg-muted" : "hover:bg-muted/50"
              }`}
              onClick={() => selectNote(note)}
            >
              <span className="truncate">{note.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {activeNote ? (
          <div className="flex flex-1 flex-col p-3 gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                className="font-medium"
                placeholder="Note title..."
              />
              <Button
                size="sm"
                onClick={saveNote}
                disabled={!dirty}
              >
                <Save className="mr-1 h-3.5 w-3.5" />
                Save
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
              }}
              placeholder="Write your notes here... (Markdown supported)"
              className="flex-1 resize-none text-sm font-mono"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  );
}
