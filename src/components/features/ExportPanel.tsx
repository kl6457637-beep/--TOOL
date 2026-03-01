"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, CheckCircle } from "lucide-react";
import { SearchTermRow } from "@/types";
import { exportToBulkCSV } from "@/lib/csv-exporter";

interface ExportPanelProps {
  terms: SearchTermRow[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportPanel({ terms, isOpen, onOpenChange }: ExportPanelProps) {
  const [matchType, setMatchType] = useState<"negative_exact" | "negative_phrase">("negative_exact");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const checkedTerms = terms.filter(t => t.isChecked && 
    (t.status === "rule_rejected" || t.status === "llm_rejected")
  );

  const totalSpend = checkedTerms.reduce((sum, t) => sum + t.spend, 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToBulkCSV(checkedTerms, matchType);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导出优化包</DialogTitle>
          <DialogDescription>
            已选中 {checkedTerms.length} 个否定词，预计挽回无效花费 ${totalSpend.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>匹配类型</Label>
            <Select 
              value={matchType} 
              onValueChange={(v) => setMatchType(v as "negative_exact" | "negative_phrase")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negative_exact">
                  精准否定 (Negative Exact)
                </SelectItem>
                <SelectItem value="negative_phrase">
                  词组否定 (Negative Phrase)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={isExporting || checkedTerms.length === 0}>
            {exportSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                导出成功
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "导出中..." : "下载 CSV"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
