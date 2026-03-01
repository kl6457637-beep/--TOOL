import { SearchTermRow, ExportRow } from "@/types";

export async function exportToBulkCSV(
  terms: SearchTermRow[],
  matchType: "negative_exact" | "negative_phrase"
): Promise<void> {
  // Build export data according to Amazon Bulk Operations V3.0 format
  const exportData: ExportRow[] = terms.map((term) => ({
    Product: "Sponsored Products",
    Entity: "Negative Keyword",
    Operation: "Create",
    "Campaign Name": term.campaignName,
    "Ad Group Name": term.adGroupName,
    "Keyword Text": term.keywordText,
    "Match Type": matchType === "negative_exact" ? "exact" : "phrase",
    State: "Enabled",
  }));

  // Convert to CSV
  const headers = [
    "Product",
    "Entity",
    "Operation", 
    "Campaign Name",
    "Ad Group Name",
    "Keyword Text",
    "Match Type",
    "State",
  ];

  const csvContent = [
    headers.join(","),
    ...exportData.map((row) =>
      headers.map((header) => {
        const value = row[header as keyof ExportRow];
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value || "");
        if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(",")
    ),
  ].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `amazon-negative-keywords-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
