import { NextRequest, NextResponse } from "next/server";

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

interface ScoreRequest {
  productName: string;
  productUrl?: string;
  dogProfile: {
    name: string;
    breed: string;
    weight: number;
    age: string;
    dietTypes: string[];
    grainFree: boolean;
    additivesLevel: string;
  };
  criteria: { name: string; weight: number }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreRequest = await request.json();

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `당신은 반려견 영양학 전문가입니다. 제품을 분석하고 보호자의 기준에 맞게 점수를 매겨주세요.

응답은 반드시 JSON 형식으로만 해주세요:
{
  "totalScore": 0-100,
  "criteriaResults": [
    { "name": "기준명", "result": "pass|warning|fail", "detail": "구체적 이유" }
  ],
  "reasoning": "보들이에게 이 제품이 적합한 이유를 2-3문장으로 설명"
}`;

    const userPrompt = `## 강아지 프로필
- 이름: ${body.dogProfile.name}
- 견종: ${body.dogProfile.breed}
- 체중: ${body.dogProfile.weight}kg
- 나이: ${body.dogProfile.age}
- 식사 타입: ${body.dogProfile.dietTypes.join(", ")}
- 그레인프리: ${body.dogProfile.grainFree ? "예" : "아니오"}
- 첨가물 허용: ${body.dogProfile.additivesLevel}

## 보호자 평가 기준
${body.criteria.map((c) => `- ${c.name} (중요도: ${c.weight})`).join("\n")}

## 평가할 제품
- 제품명: ${body.productName}
${body.productUrl ? `- 제품 페이지: ${body.productUrl}` : ""}

이 제품의 성분을 분석하고, 위 강아지와 기준에 맞게 100점 만점으로 점수를 매겨주세요.
제품 정보를 웹에서 찾아 원재료, 첨가물, 영양 성분을 확인한 후 평가해주세요.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Claude API error: ${response.status}`, details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse scoring response" },
        { status: 500 }
      );
    }

    const scoreResult = JSON.parse(jsonMatch[0]);

    // Validate and clamp score to 0-100 range
    const totalScore = Math.max(0, Math.min(100, Math.round(Number(scoreResult.totalScore) || 0)));
    const criteriaResults = Array.isArray(scoreResult.criteriaResults)
      ? scoreResult.criteriaResults.map((cr: { name?: string; result?: string; detail?: string }) => ({
          name: String(cr.name || "").slice(0, 100),
          result: ["pass", "warning", "fail"].includes(cr.result || "") ? cr.result : "warning",
          detail: String(cr.detail || "").slice(0, 200),
        }))
      : [];

    return NextResponse.json({
      productName: body.productName,
      totalScore,
      criteriaResults,
      reasoning: String(scoreResult.reasoning || "").slice(0, 500),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
