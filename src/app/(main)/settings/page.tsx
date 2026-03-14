"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [aiProvider, setAiProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser({ email: data.email, name: data.name });
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.ai_provider) setAiProvider(data.ai_provider);
          if (data.ai_api_key) setApiKey(data.ai_api_key);
        }
      })
      .catch(() => {});
  }, []);

  const saveAiSettings = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ai_provider: aiProvider,
        ai_api_key: apiKey,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-lg space-y-6">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Account
          </h2>
          {user && (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Name:</span>{" "}
                {user.name}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Email:</span>{" "}
                {user.email}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            AI Provider
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant={aiProvider === "anthropic" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAiProvider("anthropic");
                setApiKey("");
                setSaved(false);
              }}
            >
              Anthropic (Claude)
            </Button>
            <Button
              variant={aiProvider === "openai" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAiProvider("openai");
                setApiKey("");
                setSaved(false);
              }}
            >
              OpenAI (GPT-4o)
            </Button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">
              {aiProvider === "openai" ? "OpenAI" : "Anthropic"} API Key
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setSaved(false);
                  }}
                  placeholder={
                    aiProvider === "openai"
                      ? "sk-..."
                      : "sk-ant-..."
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your key is stored in the database and used server-side only.
              {!apiKey && " Falls back to the server environment variable if left blank."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={saveAiSettings} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Appearance
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
