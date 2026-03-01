"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchTermRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface SemanticTableProps {
  terms: SearchTermRow[];
  onToggle: (id: string) => void;
  onAddToWhiteList: (campaignName: string, keywordText: string) => void;
}

export function SemanticTable({ terms, onToggle, onAddToWhiteList }: SemanticTableProps) {
  if (terms.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">选择</TableHead>
              <TableHead>搜索词</TableHead>
              <TableHead>广告组</TableHead>
              <TableHead className="text-right">点击</TableHead>
              <TableHead className="text-right">花费</TableHead>
              <TableHead className="text-right">ACOS</TableHead>
              <TableHead>AI 诊断理由</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term.id}>
                <TableCell>
                  <Checkbox
                    checked={term.isChecked}
                    onCheckedChange={() => onToggle(term.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{term.keywordText}</TableCell>
                <TableCell className="text-muted-foreground">
                  {term.adGroupName}
                </TableCell>
                <TableCell className="text-right">{term.clicks}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(term.spend)}
                </TableCell>
                <TableCell className="text-right">
                  {term.acos > 0 ? `${term.acos.toFixed(1)}%` : "-"}
                </TableCell>
                <TableCell className="max-w-xs text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">AI</Badge>
                    <span className="text-muted-foreground">{term.rejectReason || '语义不相关'}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
