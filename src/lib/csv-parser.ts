import Papa from 'papaparse';
import { SearchTermRow, CSVRawRow, CSVParseResult } from '@/types';
import { generateUUID, calculateACOS } from './utils';

const COLUMN_MAPPINGS: Record<string, string[]> = {
  campaignName: ['Campaign Name', 'campaign_name', 'Campaign', 'campaign'],
  adGroupName: ['Ad Group Name', 'ad_group_name', 'Ad Group', 'Ad-Group-Name'],
  keywordText: ['Customer Search Term', 'search_term', 'Keyword', 'Search Term'],
  clicks: ['Clicks', 'clicks', 'Impressions'],
  spend: ['Spend', 'spend', 'Cost', 'cost'],
  sales: ['7 Day Total Sales', 'total_sales', 'Sales', 'sales', '7-Day Total Sales'],
  acos: ['ACOS', 'acos', 'Total ACOS', 'total_acos', 'ROAS'],
};

function findColumnName(headers: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const found = headers.find(h => h.trim().toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  return null;
}

function mapRowToSearchTerm(row: CSVRawRow, headers: string[]): SearchTermRow | null {
  const campaignCol = findColumnName(headers, COLUMN_MAPPINGS.campaignName);
  const adGroupCol = findColumnName(headers, COLUMN_MAPPINGS.adGroupName);
  const keywordCol = findColumnName(headers, COLUMN_MAPPINGS.keywordText);
  const clicksCol = findColumnName(headers, COLUMN_MAPPINGS.clicks);
  const spendCol = findColumnName(headers, COLUMN_MAPPINGS.spend);
  const salesCol = findColumnName(headers, COLUMN_MAPPINGS.sales);

  if (!campaignCol || !adGroupCol || !keywordCol) {
    return null;
  }

  const clicksVal = row[clicksCol || ''];
  const spendVal = row[spendCol || ''];
  const salesVal = row[salesCol || ''];

  const clicks = clicksVal !== undefined ? (parseFloat(String(clicksVal)) || 0) : 0;
  const spend = spendVal !== undefined ? (parseFloat(String(spendVal)) || 0) : 0;
  const sales = salesVal !== undefined ? (parseFloat(String(salesVal)) || 0) : 0;

  return {
    id: generateUUID(),
    campaignName: String(row[campaignCol] || ''),
    adGroupName: String(row[adGroupCol] || ''),
    keywordText: String(row[keywordCol] || '').trim(),
    clicks,
    spend,
    sales,
    acos: calculateACOS(spend, sales),
    status: 'pending',
    rejectReason: '',
    isChecked: true,
  };
}

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      const headers = results.meta.fields || [];
      
      const requiredCols = ['campaignName', 'adGroupName', 'keywordText'];
      for (const col of requiredCols) {
        const found = findColumnName(headers, COLUMN_MAPPINGS[col as keyof typeof COLUMN_MAPPINGS]);
        if (!found) {
          resolve({ success: false, data: [], error: `Missing required column: ${col}` });
          return;
        }
      }

      const data: SearchTermRow[] = [];
      for (const row of results.data as Record<string, unknown>[]) {
        const mapped = mapRowToSearchTerm(row as CSVRawRow, headers);
        if (mapped && mapped.keywordText) {
          data.push(mapped);
        }
      }

      resolve({ success: true, data });
    };

    reader.onerror = () => resolve({ success: false, data: [], error: 'Failed to read file' });
    reader.readAsText(file, 'UTF-8');
  });
}

export function parseCSVFromString(csvString: string): CSVParseResult {
  const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  const headers = results.meta.fields || [];
  
  const requiredCols = ['campaignName', 'adGroupName', 'keywordText'];
  for (const col of requiredCols) {
    const found = findColumnName(headers, COLUMN_MAPPINGS[col as keyof typeof COLUMN_MAPPINGS]);
    if (!found) {
      return { success: false, data: [], error: `Missing required column: ${col}` };
    }
  }

  const data: SearchTermRow[] = [];
  for (const row of results.data as Record<string, unknown>[]) {
    const mapped = mapRowToSearchTerm(row as CSVRawRow, headers);
    if (mapped && mapped.keywordText) {
      data.push(mapped);
    }
  }

  return { success: true, data };
}
