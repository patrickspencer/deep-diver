"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EdgarCompanyResult } from "@/lib/edgar/types";

interface CompanySearchProps {
  onCompanyAdded: () => void;
}

export function CompanySearch({ onCompanyAdded }: CompanySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EdgarCompanyResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/edgar?action=search&q=${encodeURIComponent(query)}`
      );
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setSearching(false);
    }
  }

  async function addCompany(result: EdgarCompanyResult) {
    setAdding(result.cik);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          ticker: result.ticker,
          cik: result.cik,
        }),
      });
      if (res.ok) {
        onCompanyAdded();
        setResults((prev) => prev.filter((r) => r.cik !== result.cik));
      }
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company name or ticker..."
          className="flex-1"
        />
        <Button type="submit" disabled={searching}>
          <Search className="mr-2 h-4 w-4" />
          {searching ? "Searching..." : "Search"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-3 border-b bg-muted/50">
            <span className="text-sm font-medium">
              SEC EDGAR Results ({results.length})
            </span>
          </div>
          <div className="divide-y">
            {results.map((result) => (
              <div
                key={result.cik}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <p className="text-sm font-medium">{result.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.ticker} | CIK: {result.cik}
                    {result.exchange && ` | ${result.exchange}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addCompany(result)}
                  disabled={adding === result.cik}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
