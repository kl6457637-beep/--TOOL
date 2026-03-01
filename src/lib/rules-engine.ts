import { SearchTermRow, WhiteListItem, Settings } from '@/types';

export interface RuleEngineResult {
  id: string;
  status: SearchTermRow['status'];
  reason: string;
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  maxClicksNoSale: 15,
  maxAcos: 80,
  defaultMatchType: 'negative_exact',
};

// Run rule engine on search terms
export function runRuleEngine(
  terms: SearchTermRow[],
  whiteList: WhiteListItem[],
  settings: Settings = DEFAULT_SETTINGS
): SearchTermRow[] {
  // Create a set of whitelist keys for fast lookup
  const whiteListKeys = new Set(
    whiteList.map(item => `${item.campaignName}:${item.keywordText}`.toLowerCase())
  );

  return terms.map(term => {
    // Check whitelist first
    const whiteListKey = `${term.campaignName}:${term.keywordText}`.toLowerCase();
    if (whiteListKeys.has(whiteListKey)) {
      return {
        ...term,
        status: 'kept' as const,
        rejectReason: 'User whitelisted',
      };
    }

    // Rule A: High clicks with no sales (pure waste)
    if (term.clicks >= settings.maxClicksNoSale && term.sales === 0) {
      return {
        ...term,
        status: 'rule_rejected' as const,
        rejectReason: `High clicks (${term.clicks}) with zero sales - pure waste`,
      };
    }

    // Rule B: High ACOS (severe loss)
    if (term.clicks >= 5 && term.acos > settings.maxAcos) {
      return {
        ...term,
        status: 'rule_rejected' as const,
        rejectReason: `ACOS (${term.acos.toFixed(1)}%) exceeds threshold (${settings.maxAcos}%)`,
      };
    }

    // Otherwise, keep as pending for LLM analysis
    return {
      ...term,
      status: 'pending' as const,
      rejectReason: '',
    };
  });
}

// Get terms that need LLM analysis
export function getTermsForLLMAnalysis(terms: SearchTermRow[]): SearchTermRow[] {
  return terms.filter(term => term.status === 'pending');
}

// Get rejected terms (rule-based + LLM)
export function getRejectedTerms(terms: SearchTermRow[]): SearchTermRow[] {
  return terms.filter(
    term => term.status === 'rule_rejected' || term.status === 'llm_rejected'
  );
}

// Get potential terms
export function getPotentialTerms(terms: SearchTermRow[]): SearchTermRow[] {
  return terms.filter(term => term.status === 'potential');
}

// Calculate summary metrics
export interface SummaryMetrics {
  totalTerms: number;
  ruleRejectedCount: number;
  llmRejectedCount: number;
  potentialCount: number;
  keptCount: number;
  pendingCount: number;
  totalSpend: number;
  suggestedOptimizeSpend: number;
}

export function calculateSummaryMetrics(terms: SearchTermRow[]): SummaryMetrics {
  const rejected = getRejectedTerms(terms);
  const potential = getPotentialTerms(terms);
  
  return {
    totalTerms: terms.length,
    ruleRejectedCount: terms.filter(t => t.status === 'rule_rejected').length,
    llmRejectedCount: terms.filter(t => t.status === 'llm_rejected').length,
    potentialCount: potential.length,
    keptCount: terms.filter(t => t.status === 'kept').length,
    pendingCount: terms.filter(t => t.status === 'pending').length,
    totalSpend: terms.reduce((sum, t) => sum + t.spend, 0),
    suggestedOptimizeSpend: rejected
      .filter(t => t.isChecked)
      .reduce((sum, t) => sum + t.spend, 0),
  };
}
