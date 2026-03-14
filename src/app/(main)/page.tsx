"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Folder } from "@/types";

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then(setFolders)
      .catch(() => {});
  }, []);

  async function createFolder() {
    if (!newName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((prev) => [...prev, folder]);
      setNewName("");
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Deep Diver</h1>
        <p className="text-muted-foreground">Financial Research Workbench</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Research Folders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folders.length}</div>
          </CardContent>
        </Card>
        <Link href="/companies">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Search & manage companies</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setCreating(true)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Start a new research folder</CardDescription>
          </CardContent>
        </Card>
      </div>

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createFolder();
          }}
          className="flex gap-2 max-w-sm"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Research folder name..."
            className="flex-1 rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" size="sm">
            Create
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCreating(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Research Folders</h2>
        {folders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No research folders yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <Link key={folder.id} href={`/research/${folder.id}`}>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FolderOpen className="h-4 w-4" />
                      {folder.name}
                    </CardTitle>
                    {folder.description && (
                      <CardDescription>{folder.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
