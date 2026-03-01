"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { parseCSV } from "@/lib/csv-parser";
import { SearchTermRow } from "@/types";

interface ReportUploaderProps {
  onUpload: (terms: SearchTermRow[]) => void;
  onBack: () => void;
}

export function ReportUploader({ onUpload, onBack }: ReportUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ["text/csv", "application/vnd.ms-excel"];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      setError("请上传 CSV 或 Excel 文件");
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError("文件大小不能超过 20MB");
      return;
    }

    setError("");
    setFileName(file.name);
    setIsProcessing(true);

    try {
      const result = await parseCSV(file);
      
      if (!result.success) {
        setError(result.error || "解析文件失败");
        return;
      }

      if (result.data.length === 0) {
        setError("文件中没有有效数据");
        return;
      }

      if (result.data.length > 50000) {
        setError("数据量超过 5 万行限制，请分批处理");
        return;
      }

      onUpload(result.data);
    } catch (err) {
      setError("解析文件时发生错误");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>第二步：上传报表</CardTitle>
        <CardDescription>
          上传亚马逊后台导出的 Search Term Report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">正在解析文件...</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">
                点击或拖拽其他文件以重新选择
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                点击或拖拽文件到此处上传
              </p>
              <p className="text-xs text-muted-foreground">
                支持 CSV、Excel，最大 20MB
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isProcessing}>
            上一步
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            选择文件
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
