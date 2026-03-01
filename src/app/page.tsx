"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ContextInput } from "@/components/features/ContextInput";
import { ReportUploader } from "@/components/features/ReportUploader";
import { DiagnosticDash } from "@/components/features/DiagnosticDash";
import { ExportPanel } from "@/components/features/ExportPanel";
import { useAppStore } from "@/store/useAppStore";
import { runRuleEngine } from "@/lib/rules-engine";
import { SearchTermRow } from "@/types";

export default function Home() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isRunningLLM, setIsRunningLLM] = useState(false);
  const [llmProgress, setLlmProgress] = useState("");
  const [finalTerms, setFinalTerms] = useState<SearchTermRow[]>([]);
  const llmCompletedRef = useRef(false);
  const analysisStartedRef = useRef(false);
  
  const {
    currentStep,
    listingContext,
    searchTerms,
    whiteList,
    settings,
    setListingContext,
    setSearchTerms,
    setStep,
    toggleSearchTermCheck,
    addToWhiteList,
    reset,
  } = useAppStore();

  console.log("Current step:", currentStep, "searchTerms:", searchTerms.length);

  // Run rule engine on search terms
  const processedTerms = useMemo(() => {
    if (searchTerms.length === 0) return [];
    const result = runRuleEngine(searchTerms, whiteList, settings);
    return result;
  }, [searchTerms, whiteList, settings]);

  // Get terms that need LLM analysis
  const pendingTerms = useMemo(() => {
    return processedTerms.filter(t => t.status === 'pending');
  }, [processedTerms]);

  // Call LLM API to analyze pending terms
  const analyzeWithLLM = async (terms: SearchTermRow[], ruleEngineResults: SearchTermRow[]) => {
    if (!listingContext || terms.length === 0) {
      console.log("No pending terms for LLM analysis");
      return ruleEngineResults;
    }

    setIsRunningLLM(true);
    setLlmProgress(`准备分析 ${terms.length} 个待定关键词...`);

    try {
      const keywords = terms.map(t => t.keywordText);
      console.log("Calling LLM API with keywords:", keywords);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          listingContext: {
            title: listingContext.title || '',
            bullets: listingContext.bullets || '',
            userNote: listingContext.userNote || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("LLM API response:", data);

      setLlmProgress("AI 语义分析中...");

      const results: { keyword: string; action: string; reason: string }[] = data.results || [];
      const resultMap = new Map(results.map((r) => 
        [r.keyword.toLowerCase(), r]
      ));

      // Update each term based on LLM response


      // Update each term based on LLM response
      const updatedTerms = ruleEngineResults.map(term => {
        if (term.status !== 'pending') return term;

        const llmResult = resultMap.get(term.keywordText.toLowerCase());
        
        if (llmResult) {
          if (llmResult.action === 'negative') {
            return {
              ...term,
              status: 'llm_rejected' as const,
              rejectReason: llmResult.reason || 'AI 判定为语义不相关',
              isChecked: true,
            };
          } else if (llmResult.action === 'potential') {
            return {
              ...term,
              status: 'potential' as const,
              rejectReason: llmResult.reason || 'AI 判定为高潜长尾词',
              isChecked: false,
            };
          }
        }
        
        return { ...term, status: 'kept' as const, rejectReason: '' };
      });

      console.log("Updated terms with LLM results:", updatedTerms.filter(t => t.status !== 'pending').length);
      return updatedTerms;

    } catch (error) {
      console.error("LLM analysis error:", error);
      setLlmProgress("LLM 分析出错，使用规则分析结果");
      return ruleEngineResults;
    } finally {
      setIsRunningLLM(false);
    }
  };

  // Handle analyzing phase
  useEffect(() => {
    if (currentStep !== 'analyzing' || analysisStartedRef.current) return;
    
    analysisStartedRef.current = true;
    console.log("Starting analysis, pending terms:", pendingTerms.length);

    const runAnalysis = async () => {
      // First run rule engine results
      let results = processedTerms;

      // If there are pending terms and we have listing context, run LLM
      if (pendingTerms.length > 0 && listingContext) {
        results = await analyzeWithLLM(pendingTerms, processedTerms);
      }

      // Set final terms and transition to dashboard
      setFinalTerms(results);
      llmCompletedRef.current = true;
      setStep("dashboard");
    };

    runAnalysis();
  }, [currentStep]);

  // Handle dashboard transition
  useEffect(() => {
    if (currentStep === 'dashboard' && finalTerms.length > 0) {
      analysisStartedRef.current = false;
    }
  }, [currentStep, finalTerms]);

  const handleContextSubmit = (context: typeof listingContext) => {
    if (context) {
      console.log("handleContextSubmit:", context);
      setListingContext(context);
    }
  };

  const handleFileUpload = (terms: typeof searchTerms) => {
    analysisStartedRef.current = false;
    llmCompletedRef.current = false;
    setFinalTerms([]);
    setSearchTerms(terms);
  };

  const handleToggleTerm = (id: string) => {
    // Toggle in store
    toggleSearchTermCheck(id);
    // Also toggle in local finalTerms state
    setFinalTerms(prev => prev.map(term => 
      term.id === id ? { ...term, isChecked: !term.isChecked } : term
    ));
};

  const handleAddToWhiteList = (campaignName: string, keywordText: string) => {
    addToWhiteList(campaignName, keywordText);
  };

  const handleBack = () => {
    analysisStartedRef.current = false;
    llmCompletedRef.current = false;
    setFinalTerms([]);
    reset();
  };

  // Use finalTerms in dashboard, otherwise processedTerms
  const displayTerms = currentStep === 'dashboard' ? finalTerms : processedTerms;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { key: "input", label: "1. 上下文" },
              { key: "upload", label: "2. 上传报表" },
              { key: "analyzing", label: "3. 分析中" },
              { key: "dashboard", label: "4. 诊断结果" },
            ].map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = ["input", "upload", "analyzing"].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      isActive ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className="mx-4 h-0.5 w-8 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          {currentStep === "input" && (
            <ContextInput onSubmit={handleContextSubmit} />
          )}

          {currentStep === "upload" && (
            <ReportUploader
              onUpload={handleFileUpload}
              onBack={handleBack}
            />
          )}

          {currentStep === "analyzing" && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-lg font-medium">正在分析数据...</p>
                <p className="text-sm text-muted-foreground">
                  {isRunningLLM ? llmProgress : "运行硬规则过滤中"}
                </p>
                {pendingTerms.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    等待 AI 语义分析: {pendingTerms.length} 个关键词
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === "dashboard" && (
            <DiagnosticDash
              terms={displayTerms}
              onToggleTerm={handleToggleTerm}
              onAddToWhiteList={handleAddToWhiteList}
              onExport={() => setIsExportDialogOpen(true)}
              onBack={handleBack}
              listingContext={listingContext || undefined}
            />
          )}
        </div>
      </main>

      <ExportPanel
        terms={displayTerms}
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </div>
  );
}
