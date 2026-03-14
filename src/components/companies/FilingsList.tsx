"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, FileText, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EdgarFiling } from "@/lib/edgar/types";
import type { Company } from "@/types";

interface FilingsListProps {
  company: Company;
  folderId?: number;
}

export function FilingsList({ company, folderId }: FilingsListProps) {
  const [filings, setFilings] = useState<EdgarFiling[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");

  const loadFilings = useCallback(
    async (formFilter: string) => {
      if (!company.cik) return;
      setLoading(true);
      try {
        const forms = formFilter === "all" ? "&forms=10-K,10-Q,8-K" : `&forms=${formFilter}`;
        const res = await fetch(
          `/api/edgar?action=filings&cik=${company.cik}${forms}`
        );
        if (res.ok) {
          setFilings(await res.json());
        }
      } finally {
        setLoading(false);
      }
    },
    [company.cik]
  );

  useEffect(() => {
    loadFilings(filter);
  }, [company.cik, filter, loadFilings]);

  function handleFilterClick(f: string) {
    setFilter(f);
  }

  async function downloadAndSave(filing: EdgarFiling) {
    setDownloading(filing.accessionNumber);
    try {
      const res = await fetch("/api/edgar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: filing.fileUrl,
          form: filing.form,
          filingDate: filing.filingDate,
          title: `${company.ticker || company.name} - ${filing.form} (${filing.filingDate})`,
          companyId: company.id,
          folderId: folderId || null,
        }),
      });
      if (res.ok) {
        setDownloaded((prev) => new Set(prev).add(filing.accessionNumber));
      }
    } finally {
      setDownloading(null);
    }
  }

  const formTypes = ["all", "10-K", "10-Q", "8-K"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter:</span>
        {formTypes.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "secondary" : "ghost"}
            className="h-7 text-xs"
            onClick={() => handleFilterClick(f)}
          >
            {f === "all" ? "All" : f}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadFilings(filter)}
          className="ml-auto"
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filings.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {company.cik
            ? "No filings found. Try a different filter."
            : "No CIK number available for this company."}
        </p>
      ) : (
        <div className="divide-y rounded-lg border">
          {filings.slice(0, 50).map((filing) => (
            <div
              key={filing.accessionNumber}
              className="flex items-center gap-3 p-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {filing.form}
                  </Badge>
                  <span className="text-sm">{filing.filingDate}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {filing.primaryDocDescription || filing.primaryDocument}
                </p>
              </div>
              {downloaded.has(filing.accessionNumber) ? (
                <Button size="sm" variant="outline" disabled className="text-green-600">
                  <Check className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAndSave(filing)}
                  disabled={downloading === filing.accessionNumber}
                >
                  {downloading === filing.accessionNumber ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
