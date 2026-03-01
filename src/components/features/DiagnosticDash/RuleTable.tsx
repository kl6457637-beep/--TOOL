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
import { SearchTermRow } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface RuleTableProps {
  terms: SearchTermRow[];
  onToggle: (id: string) => void;
}

export function RuleTable({ terms, onToggle }: RuleTableProps) {
  if (terms.length === 0) {
    return null;
  }

  return (
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
            <TableHead>判定原因</TableHead>
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
              <TableCell>
                <Badge variant="destructive">{term.rejectReason}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
