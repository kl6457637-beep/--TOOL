"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchTermRow } from "@/types";
import { OverviewCards } from "./OverviewCards";
import { RuleTable } from "./RuleTable";
import { SemanticTable } from "./SemanticTable";
import { PotentialTable } from "./PotentialTable";
import { 
  calculateSummaryMetrics, 
  getRejectedTerms, 
  getPotentialTerms 
} from "@/lib/rules-engine";
import { ArrowLeft, Download, Sparkles, Lightbulb, Copy, Check } from "lucide-react";

interface DiagnosticDashProps {
  terms: SearchTermRow[];
  onToggleTerm: (id: string) => void;
  onAddToWhiteList: (campaignName: string, keywordText: string) => void;
  onExport: () => void;
  onBack: () => void;
  listingContext?: {
    title: string;
    bullets: string;
    userNote: string;
  };
}

export function DiagnosticDash({
  terms,
  onToggleTerm,
  onAddToWhiteList,
  onExport,
  onBack,
  listingContext,
}: DiagnosticDashProps) {
  // Calculate metrics
  const metrics = useMemo(() => calculateSummaryMetrics(terms), [terms]);
  
  // Keyword expansion state
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<{keyword: string; category: string}[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Filter terms by status
  const ruleRejectedTerms = useMemo(
    () => terms.filter(t => t.status === "rule_rejected"),
    [terms]
  );
  
  const llmRejectedTerms = useMemo(
    () => terms.filter(t => t.status === "llm_rejected"),
    [terms]
  );
  
  const potentialTerms = useMemo(
    () => terms.filter(t => t.status === "potential"),
    [terms]
  );

  const rejectedTerms = useMemo(
    () => [...ruleRejectedTerms, ...llmRejectedTerms],
    [ruleRejectedTerms, llmRejectedTerms]
  );

  const checkedCount = rejectedTerms.filter(t => t.isChecked).length;

  // Handle keyword expansion
  const handleExpandKeywords = async () => {
    if (!listingContext?.bullets) {
      alert("请先提供产品 Listing 信息");
      return;
    }

    setIsExpanding(true);
    try {
      const response = await fetch('/api/expand-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingContext,
          seedKeywords: terms.filter(t => t.status === 'kept').slice(0, 5).map(t => t.keywordText),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Expand API response:", data);

      if (data.results && data.results.length > 0) {
        setExpandedKeywords(data.results);
      } else {
        alert("未能生成有效的关键词，请重试");
      }
    } catch (error) {
      console.error("Keyword expansion error:", error);
      alert("关键词扩展失败，请重试");
    } finally {
      setIsExpanding(false);
    }
  };

  // Copy single keyword
  const handleCopyKeyword = async (keyword: string, index: number) => {
    await navigator.clipboard.writeText(keyword);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy all keywords
  const handleCopyAll = async () => {
    const text = expandedKeywords.map(k => k.keyword).join('\n');
    await navigator.clipboard.writeText(text);
    alert(`已复制 ${expandedKeywords.length} 个关键词到剪贴板`);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          重新上传
        </Button>
        <Button onClick={onExport} disabled={checkedCount === 0}>
          <Download className="mr-2 h-4 w-4" />
          一键导出优化包 ({checkedCount})
        </Button>
      </div>

      {/* Overview Cards */}
      <OverviewCards metrics={metrics} />

      {/* Keyword Expansion Section */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Lightbulb className="h-5 w-5" />
            场景化长尾拓词
          </CardTitle>
          <CardDescription className="text-yellow-700">
            基于产品描述 AI 生成高转化长尾关键词，覆盖痛点/场景/人群/属性维度
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={handleExpandKeywords} 
              disabled={isExpanding}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isExpanding ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  AI 拓词中...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  生成20个长尾词
                </>
              )}
            </Button>
            {expandedKeywords.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="mr-2 h-4 w-4" />
                复制全部
              </Button>
            )}
          </div>
          
          {/* Expanded Keywords Display */}
          {expandedKeywords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {expandedKeywords.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                      {item.category}
                    </span>
                    <span>{item.keyword}</span>
                  </div>
                  <button
                    onClick={() => handleCopyKeyword(item.keyword, index)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {expandedKeywords.length === 0 && !isExpanding && (
            <p className="text-sm text-muted-foreground text-center py-4">
              点击上方按钮，基于产品描述生成20个高转化长尾词
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rule-based Rejected Terms */}
      {ruleRejectedTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-destructive">●</span>
              规则判定脱水区
            </CardTitle>
            <CardDescription>
              根据硬规则（高点击无转化 / 高 ACOS）自动判定的无效词，默认全选
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RuleTable 
              terms={ruleRejectedTerms} 
              onToggle={onToggleTerm}
            />
          </CardContent>
        </Card>
      )}

      {/* LLM Semantic Rejected Terms */}
      {llmRejectedTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 语义建议区
            </CardTitle>
            <CardDescription>
              AI 分析判定为与产品不相关的搜索词，建议否定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SemanticTable 
              terms={llmRejectedTerms}
              onToggle={onToggleTerm}
              onAddToWhiteList={onAddToWhiteList}
            />
          </CardContent>
        </Card>
      )}

      {/* Potential Long-tail Keywords */}
      {potentialTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              高潜长尾词区
            </CardTitle>
            <CardDescription>
              AI 发现的高转化长尾词，建议单独建组投放（默认不勾选）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PotentialTable 
              terms={potentialTerms}
              onToggle={onToggleTerm}
            />
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {rejectedTerms.length === 0 && potentialTerms.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              未发现需要优化的搜索词 🎉
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
