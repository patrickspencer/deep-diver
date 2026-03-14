export interface EdgarCompanyResult {
  cik: string;
  name: string;
  ticker: string;
  exchange: string;
}

export interface EdgarFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  primaryDocDescription: string;
  fileUrl: string;
}

export interface EdgarSubmission {
  cik: string;
  entityType: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  sic: string;
  sicDescription: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

export interface EdgarSearchResult {
  hits: {
    hits: Array<{
      _source: {
        file_num: string;
        display_names: string[];
        entity_name: string;
        file_date: string;
        form_type: string;
        file_description: string;
      };
      _id: string;
    }>;
    total: { value: number };
  };
}
