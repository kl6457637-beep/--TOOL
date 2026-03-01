"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ListingContext } from "@/types";

interface ContextInputProps {
  onSubmit: (context: ListingContext) => void;
}

export function ContextInput({ onSubmit }: ContextInputProps) {
  const [listingText, setListingText] = useState("");
  const [userNote, setUserNote] = useState("");
  const [asin, setAsin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    console.log("handleSubmit clicked, listingText:", listingText);
    if (!listingText.trim()) {
      setError("请输入产品 Listing 内容");
      return;
    }
    setError("");
    const context: ListingContext = {
      asin: asin.trim() || undefined,
      title: "",
      bullets: listingText,
      userNote: userNote,
    };
    console.log("Calling onSubmit:", context);
    onSubmit(context);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>第一步：上下文对齐</CardTitle>
        <CardDescription>
          输入您的产品 Listing 信息，帮助 AI 理解您的产品定位
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asin">ASIN（选填）</Label>
          <Input
            id="asin"
            placeholder="例如：B08N5WRWNW"
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing">
            产品 Listing <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="listing"
            placeholder="请粘贴您的产品标题 + 五点描述 + 核心参数..."
            className="min-h-[150px]"
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            建议粘贴 Title + 5 Bullets，帮助 AI 精准识别产品功能边界
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">业务补充说明（选填）</Label>
          <Textarea
            id="note"
            placeholder="例如：虽然是办公椅，但也适合孕妇久坐；这是真皮材质，不是人造革..."
            className="min-h-[80px]"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleSubmit} className="w-full">
          确认上下文，继续下一步
        </Button>
      </CardContent>
    </Card>
  );
}
