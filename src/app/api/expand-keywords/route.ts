import { NextRequest, NextResponse } from "next/server";

const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-1f6262d6561649e582818b71f442eeb8";
const QWEN_API_URL = process.env.QWEN_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";

interface ExpandRequest {
  listingContext: {
    title: string;
    bullets: string;
    userNote: string;
  };
  seedKeywords?: string[];
}

interface ExpandedKeyword {
  keyword: string;
  category: string;
}

function generateMockKeywords(): ExpandedKeyword[] {
  return [
    { keyword: "ergonomic office chair for back pain", category: "痛点维度" },
    { keyword: "premium leather computer chair", category: "功能属性" },
    { keyword: "executive desk chair with lumbar support", category: "功能属性" },
    { keyword: "office chair for tall person", category: "目标人群" },
    { keyword: "comfortable gaming chair for work", category: "使用场景" },
    { keyword: "adjustable armrest office chair", category: "功能属性" },
    { keyword: "mesh back computer chair", category: "功能属性" },
    { keyword: "rolling office chair for home office", category: "使用场景" },
    { keyword: "big and tall executive chair", category: "目标人群" },
    { keyword: "desk chair with headrest", category: "功能属性" },
    { keyword: "modern leather office chair", category: "功能属性" },
    { keyword: "swivel chair for standing desk", category: "使用场景" },
    { keyword: "weight capacity office chair", category: "功能属性" },
    { keyword: "reclining office chair with footrest", category: "功能属性" },
    { keyword: "budget friendly office chair", category: "痛点维度" },
    { keyword: "vinyl office chair easy clean", category: "痛点维度" },
    { keyword: "conference room chair", category: "使用场景" },
    { keyword: "reception chair", category: "使用场景" },
    { keyword: "managerial chair", category: "目标人群" },
    { keyword: "professional office seating", category: "目标人群" },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExpandRequest = await request.json();
    const { listingContext, seedKeywords } = body;

    if (!listingContext?.bullets) {
      return NextResponse.json(
        { error: "No listing context provided" },
        { status: 400 }
      );
    }

    const seedPart = seedKeywords && seedKeywords.length > 0 
      ? `种子词：${seedKeywords.join(", ")}`
      : "";

    const prompt = `你是一位亚马逊关键词拓词专家。

产品描述：${listingContext.bullets}
${seedPart}

请生成20个亚马逊买家会搜索的长尾关键词，覆盖痛点、场景、人群、功能属性。

重要：请用中文输出关键词！

格式（每行一个）：类别 | 关键词
例如：功能属性 | 人体工学办公椅带腰部支撑
痛点维度 | 久坐不累的办公椅
使用场景 | 家庭书房办公椅
目标人群 | 大体重人士专用办公椅`;

    console.log("Calling Qwen API for keyword expansion...");

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
          temperature: 0.7,
          max_tokens: 2000
        }),
      });
    } catch (networkError) {
      console.error("Network error calling Qwen API:", networkError);
      return NextResponse.json({ 
        results: generateMockKeywords(),
        isMock: true,
        message: "API 连接失败，使用模拟数据"
      });
    }

    const responseText = await response.text();
    console.log("Qwen API response status:", response.status);
    
    if (!response.ok) {
      console.error("Qwen API error:", responseText);
      return NextResponse.json({ 
        results: generateMockKeywords(),
        isMock: true,
        message: "API 返回错误，使用模拟数据"
      });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "";
    
    console.log("Qwen API response:", text.substring(0, 300));

    const results: ExpandedKeyword[] = [];
    const lines = text.split('\n').filter((line: string) => line.trim() && line.includes('|'));
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\s*\|\s*(.+)$/);
      if (match) {
        const category = match[1].trim();
        const keyword = match[2].trim();
        if (keyword && category) {
          results.push({ keyword, category });
        }
      }
    }

    if (results.length < 20) {
      const allLines = text.split('\n').filter((line: string) => line.trim() && !line.includes('|'));
      for (const line of allLines.slice(0, 20 - results.length)) {
        results.push({ 
          keyword: line.trim().replace(/^[-*\d.]+\s*/, ''), 
          category: "功能属性" 
        });
      }
    }

    console.log(`Parsed ${results.length} expanded keywords`);
    return NextResponse.json({ results: results.slice(0, 20), rawResponse: text });
  } catch (error) {
    console.error("Keyword expansion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
