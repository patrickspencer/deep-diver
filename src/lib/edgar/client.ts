import type {
  EdgarCompanyResult,
  EdgarFiling,
  EdgarSubmission,
} from "./types";

const USER_AGENT =
  process.env.SEC_USER_AGENT || "DeepDiver/1.0 (dev@example.com)";

const EDGAR_BASE = "https://data.sec.gov";
const EFTS_BASE = "https://efts.sec.gov/LATEST";

async function edgarFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });
}

// Cache the tickers file in memory since it's ~7MB
let tickersCache: Record<string, { cik_str: number; ticker: string; title: string }> | null = null;

async function getTickersData() {
  if (tickersCache) return tickersCache;

  const res = await fetch(
    "https://www.sec.gov/files/company_tickers.json",
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) return null;

  tickersCache = await res.json();
  return tickersCache;
}

export async function searchCompanies(
  query: string
): Promise<EdgarCompanyResult[]> {
  const data = await getTickersData();
  if (!data) return [];

  const results: EdgarCompanyResult[] = [];
  const queryLower = query.toLowerCase();

  for (const key of Object.keys(data)) {
    const entry = data[key];
    if (
      entry.title?.toLowerCase().includes(queryLower) ||
      entry.ticker?.toLowerCase() === queryLower ||
      entry.ticker?.toLowerCase().startsWith(queryLower)
    ) {
      results.push({
        cik: String(entry.cik_str).padStart(10, "0"),
        name: entry.title,
        ticker: entry.ticker,
        exchange: "",
      });
    }
    if (results.length >= 20) break;
  }

  return results;
}

export async function getCompanyFilings(
  cik: string,
  formTypes?: string[]
): Promise<EdgarFiling[]> {
  const paddedCik = cik.padStart(10, "0");
  const res = await edgarFetch(
    `${EDGAR_BASE}/submissions/CIK${paddedCik}.json`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch filings: ${res.status}`);
  }

  const data: EdgarSubmission = await res.json();
  const recent = data.filings.recent;
  const filings: EdgarFiling[] = [];

  for (let i = 0; i < recent.accessionNumber.length; i++) {
    const form = recent.form[i];
    if (formTypes && formTypes.length > 0 && !formTypes.includes(form)) {
      continue;
    }

    const accession = recent.accessionNumber[i].replace(/-/g, "");
    const primaryDoc = recent.primaryDocument[i];

    filings.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      form,
      primaryDocument: primaryDoc,
      primaryDocDescription: recent.primaryDocDescription[i],
      fileUrl: `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accession}/${primaryDoc}`,
    });
  }

  return filings;
}

export async function downloadFiling(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Failed to download filing: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
