// Core data types for Amazon Ad Flow

export interface ListingContext {
  asin?: string;
  title: string;
  bullets: string;
  userNote: string;
}

export interface SearchTermRow {
  id: string;
  campaignName: string;
  adGroupName: string;
  keywordText: string;
  clicks: number;
  spend: number;
  sales: number;
  acos: number;
  status: 'pending' | 'rule_rejected' | 'llm_rejected' | 'potential' | 'kept';
  rejectReason: string;
  isChecked: boolean;
}

export interface WhiteListItem {
  id: string;
  campaignName: string;
  keywordText: string;
  timestamp: number;
}

export interface Settings {
  maxClicksNoSale: number;
  maxAcos: number;
  defaultMatchType: 'negative_exact' | 'negative_phrase';
}

export type WorkflowStep = 'input' | 'upload' | 'analyzing' | 'dashboard';

export interface AppState {
  // Workflow state
  currentStep: WorkflowStep;
  isProcessing: boolean;
  
  // Data
  listingContext: ListingContext | null;
  searchTerms: SearchTermRow[];
  whiteList: WhiteListItem[];
  
  // Settings
  settings: Settings;
  
  // Actions
  setListingContext: (context: ListingContext) => void;
  setSearchTerms: (terms: SearchTermRow[]) => void;
  updateSearchTermStatus: (id: string, status: SearchTermRow['status'], reason?: string) => void;
  toggleSearchTermCheck: (id: string) => void;
  addToWhiteList: (campaignName: string, keywordText: string) => void;
  removeFromWhiteList: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setStep: (step: WorkflowStep) => void;
  setProcessing: (processing: boolean) => void;
  updateAllSearchTerms: (terms: SearchTermRow[]) => void;
  reset: () => void;
}

// CSV Column mapping types
export interface CSVRawRow {
  [key: string]: string | number | undefined;
}

export interface CSVParseResult {
  success: boolean;
  data: SearchTermRow[];
  error?: string;
}

// LLM Analysis types
export interface LLMAnalysisResult {
  keyword: string;
  action: 'negative' | 'positive' | 'potential';
  reason: string;
}

// Export types
export interface ExportRow {
  Product: string;
  Entity: string;
  Operation: string;
  'Campaign Name': string;
  'Ad Group Name': string;
  'Keyword Text': string;
  'Match Type': string;
  State: string;
}
