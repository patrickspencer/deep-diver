export function parseFilingHtml(html: string): string {
  // Clean up EDGAR HTML for display
  // Remove XBRL inline tags but keep content
  let cleaned = html.replace(
    /<ix:[^>]*>([\s\S]*?)<\/ix:[^>]*>/gi,
    "$1"
  );

  // Remove XML declarations and processing instructions
  cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, "");

  // Fix relative URLs to point to SEC
  cleaned = cleaned.replace(
    /src="(?!https?:\/\/)/gi,
    'src="https://www.sec.gov/'
  );
  cleaned = cleaned.replace(
    /href="(?!https?:\/\/|#)/gi,
    'href="https://www.sec.gov/'
  );

  return cleaned;
}

export function extractFilingType(form: string): string {
  const mapping: Record<string, string> = {
    "10-K": "10-K",
    "10-K/A": "10-K",
    "10-Q": "10-Q",
    "10-Q/A": "10-Q",
    "8-K": "8-K",
    "8-K/A": "8-K",
  };
  return mapping[form] || "custom";
}
