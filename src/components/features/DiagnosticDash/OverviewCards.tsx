import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryMetrics } from "@/lib/rules-engine";
import { DollarSign, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OverviewCardsProps {
  metrics: SummaryMetrics;
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">分析词数</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTerms}</div>
          <p className="text-xs text-muted-foreground">
            去重后的搜索词总数
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">规则判定</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ruleRejectedCount}</div>
          <p className="text-xs text-muted-foreground">
            高点击无转化 / 高 ACOS
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI 语义建议</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.llmRejectedCount}</div>
          <p className="text-xs text-muted-foreground">
            语义不匹配待否定
          </p>
        </CardContent>
      </Card>
      
      <Card className={metrics.suggestedOptimizeSpend > 0 ? "border-primary" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">建议优化金额</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(metrics.suggestedOptimizeSpend)}
          </div>
          <p className="text-xs text-muted-foreground">
            勾选词预计可挽回花费
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
