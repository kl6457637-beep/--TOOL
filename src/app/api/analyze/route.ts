import { NextRequest, NextResponse } from "next/server";

const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-1f6262d6561649e582818b71f442eeb8";
const QWEN_API_URL = process.env.QWEN_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";

interface AnalyzeRequest {
  keywords: string[];
  listingContext: {
    title: string;
    bullets: string;
    userNote: string;
  };
}

interface LLMResult {
  keyword: string;
  action: "negative" | "positive" | "potential";
  reason: string;
}

// Helper function to generate mock results
function generateMockResults(keywords: string[]): LLMResult[] {
  return keywords.slice(0, 15).map((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    
    const isNegative = 
      lowerKeyword.includes('gaming') || 
      lowerKeyword.includes('children') || 
      lowerKeyword.includes('kids') ||
      lowerKeyword.includes('baby') ||
      lowerKeyword.includes('cosmetics') ||
      lowerKeyword.includes('beauty') ||
      lowerKeyword.includes('vanity') ||
      lowerKeyword.includes('drafting') ||
      lowerKeyword.includes('stool') ||
      lowerKeyword.includes('bamboo') ||
      lowerKeyword.includes('竹') ||
      lowerKeyword.includes('wooden') ||
      lowerKeyword.includes('plastic');
      
    const isPotential = 
      lowerKeyword.includes('executive') || 
      lowerKeyword.includes('premium') ||
      lowerKeyword.includes('leather') ||
      lowerKeyword.includes('ergonomic') ||
      lowerKeyword.includes('office') ||
      lowerKeyword.includes('computer');
    
    let action: 'negative' | 'positive' | 'potential' = 'positive';
    let reason = '';
    
    if (isNegative) {
      action = 'negative';
      reason = `与产品完全不相关（品类错误）`;
    } else if (isPotential) {
      action = 'potential';
      reason = `关键词与产品高度相关，有转化潜力`;
    } else {
      const rand = Math.random();
      if (rand > 0.6) {
        action = 'potential';
        reason = `关键词与产品相关，可能有转化潜力`;
      } else if (rand > 0.3) {
        action = 'negative';
        reason = `与产品属性不完全匹配`;
      }
    }
    
    return { keyword, action, reason };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { keywords, listingContext } = body;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: "No keywords provided" },
        { status: 400 }
      );
    }

    // 构建产品信息描述
    const productInfo = listingContext.bullets || '';
    const userNote = listingContext.userNote || '';

    // 使用千问 API - 语义建议（去除不相关词）
    const prompt = `你是一位亚马逊广告优化专家。

产品描述：${productInfo}
${userNote ? '备注：' + userNote : ''}

请分析以下搜索词，找出与产品完全不相关的词（品类错误、属性冲突）。

搜索词：${keywords.join(', ')}

输出格式（每行一个）：搜索词 | 原因`;

    console.log("Calling Qwen API for semantic analysis...");

    // Call 千问 API
    let response;
    try {
      response = await fetch(`${QWEN_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${QWEN_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      });
    } catch (networkError) {
      console.error("Network error calling Qwen API:", networkError);
      return NextResponse.json({ 
        results: generateMockResults(keywords),
        isMock: true,
        message: "API 连接失败，使用模拟数据"
      });
    }

    const responseText = await response.text();
    console.log("Qwen API response status:", response.status);
    
    if (!response.ok) {
      console.error("Qwen API error:", responseText);
      return NextResponse.json({ 
        results: generateMockResults(keywords),
        isMock: true,
        message: "API 返回错误，使用模拟数据"
      });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "";
    
    console.log("Qwen API response:", text.substring(0, 300));

    // 解析 "搜索词 | 原因" 格式的响应
    const results: LLMResult[] = [];
    const lines = text.split('\n').filter((line: string) => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\s*\|\s*(.+)$/);
      if (match) {
        const keyword = match[1].trim();
        const reason = match[2].trim();
        results.push({ keyword, action: 'negative', reason });
      }
    }

    if (results.length === 0) {
      console.log("No structured response, returning empty results");
    }

    return NextResponse.json({ results, rawResponse: text });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
