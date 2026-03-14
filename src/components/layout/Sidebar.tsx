"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  FolderOpen,
  Plus,
  Trash2,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Folder } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    const res = await fetch("/api/folders");
    if (res.ok) {
      setFolders(await res.json());
    }
  }

  async function createFolder() {
    if (!newName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setCreating(false);
      fetchFolders();
    }
  }

  async function deleteFolder(id: number) {
    if (!confirm("Delete this research folder?")) return;
    await fetch(`/api/folders?id=${id}`, { method: "DELETE" });
    fetchFolders();
  }

  return (
    <div
      className={`flex flex-col border-r bg-muted/40 transition-all duration-200 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between p-3">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">
            Deep Diver
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Separator />
      <nav className="flex flex-col gap-1 p-2">
        <Link href="/">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            size="sm"
          >
            <Home className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Dashboard</span>}
          </Button>
        </Link>
        <Link href="/companies">
          <Button
            variant={pathname === "/companies" ? "secondary" : "ghost"}
            className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            size="sm"
          >
            <Building2 className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Companies</span>}
          </Button>
        </Link>
      </nav>
      <Separator />
      {!collapsed && (
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Research
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCreating(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 px-2">
          {creating && !collapsed && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createFolder();
              }}
              className="px-1 py-1"
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => {
                  if (!newName.trim()) setCreating(false);
                }}
                placeholder="Folder name..."
                className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </form>
          )}
          {folders.map((folder) => (
            <div key={folder.id} className="group flex items-center">
              <Link href={`/research/${folder.id}`} className="flex-1">
                <Button
                  variant={
                    pathname === `/research/${folder.id}`
                      ? "secondary"
                      : "ghost"
                  }
                  className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
                  size="sm"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="ml-2 truncate">{folder.name}</span>
                  )}
                </Button>
              </Link>
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteFolder(folder.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <nav className="flex flex-col gap-1 p-2">
        <Link href="/settings">
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            size="sm"
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Settings</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
          size="sm"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </nav>
    </div>
  );
}
