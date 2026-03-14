"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanySearch } from "@/components/companies/CompanySearch";
import { FilingsList } from "@/components/companies/FilingsList";
import type { Company, Folder } from "@/types";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>();

  useEffect(() => {
    fetchCompanies();
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: Folder[]) => {
        setFolders(data);
        if (data.length > 0) setSelectedFolderId(data[0].id);
      })
      .catch(() => {});
  }, []);

  async function fetchCompanies() {
    const res = await fetch("/api/companies");
    if (res.ok) {
      setCompanies(await res.json());
    }
  }

  async function deleteCompany(id: number) {
    if (!confirm("Delete this company?")) return;
    await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
    if (selectedCompany?.id === id) setSelectedCompany(null);
    fetchCompanies();
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Companies
        </h1>
        <p className="text-muted-foreground">
          Search SEC EDGAR and manage companies
        </p>
      </div>

      <CompanySearch onCompanyAdded={fetchCompanies} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Saved Companies</h2>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No companies saved. Search above to add companies.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCompany?.id === company.id
                      ? "border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {company.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCompany(company.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {company.ticker && (
                        <Badge variant="secondary">{company.ticker}</Badge>
                      )}
                      {company.cik && (
                        <Badge variant="outline" className="text-xs">
                          CIK: {company.cik}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedCompany ? (
            <div>
              <h2 className="mb-3 text-lg font-semibold">
                {selectedCompany.ticker || selectedCompany.name} Filings
              </h2>

              <div className="mb-3 flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground shrink-0">Download to:</span>
                {folders.length > 0 ? (
                  <>
                    <select
                      value={selectedFolderId ?? ""}
                      onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                      className="flex-1 rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    {selectedFolderId && (
                      <Link href={`/research/${selectedFolderId}`}>
                        <Button size="sm" variant="outline" className="text-xs shrink-0">
                          Open folder
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Link href="/">
                    <Button size="sm" variant="outline" className="text-xs">
                      Create a folder first
                    </Button>
                  </Link>
                )}
              </div>

              <FilingsList company={selectedCompany} folderId={selectedFolderId} />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Select a company to view filings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
