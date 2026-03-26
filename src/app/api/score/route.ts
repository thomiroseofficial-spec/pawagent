import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const SCORE_TTL_HOURS = 24;

interface ScoreRequest {
  productName: string;
  brand?: string;
  category?: string;
  productUrl?: string;
  profileId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreRequest = await request.json();

    if (!body.productName || !body.profileId) {
      return NextResponse.json(
        { error: "Missing required fields: productName, profileId" },
        { status: 400 }
      );
    }

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Load profile + criteria
    const { data: profile } = await supabase
      .from("dog_profiles")
      .select("*")
      .eq("id", body.profileId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: criteria } = await supabase
      .from("criteria")
      .select("*")
      .eq("profileId", body.profileId)
      .eq("active", true);

    // Check for existing product + cached score
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id")
      .eq("name", body.productName)
      .limit(1);

    let productId: string;

    if (existingProducts?.length) {
      productId = existingProducts[0].id;

      // Check cached score
      const { data: cachedScore } = await supabase
        .from("scores")
        .select("*")
        .eq("productId", productId)
        .eq("profileId", body.profileId)
        .gt("expiresAt", new Date().toISOString())
        .single();

      if (cachedScore) {
        // Load prices
        const { data: prices } = await supabase
          .from("prices")
          .select("*")
          .eq("productId", productId)
          .order("price", { ascending: true });

        return NextResponse.json({
          id: cachedScore.id,
          productId,
          productName: body.productName,
          brand: body.brand || "",
          category: body.category || "사료",
          totalScore: cachedScore.totalScore,
          criteriaResults: cachedScore.criteriaResults,
          reasoning: cachedScore.reasoning,
          prices: prices || [],
          lowestPrice: prices?.[0] || null,
          cached: true,
        });
      }
    } else {
      // Create product
      const { data: newProduct, error: prodErr } = await supabase
        .from("products")
        .insert({
          name: body.productName.slice(0, 200),
          brand: (body.brand || "").slice(0, 100),
          category: body.category || "사료",
          sourceUrl: body.productUrl || null,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (prodErr || !newProduct) {
        return NextResponse.json(
          { error: "Failed to create product", details: prodErr?.message },
          { status: 500 }
        );
      }
      productId = newProduct.id;
    }

    // Call Claude API for scoring
    const birthDate = new Date(profile.birthDate);
    const ageMonths = Math.floor(
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const ageStr =
      ageMonths < 12 ? `${ageMonths}개월` : `${Math.floor(ageMonths / 12)}세 ${ageMonths % 12}개월`;

    const criteriaList = (criteria || [])
      .map((c: { name: string; weight: number }) => `- ${c.name} (중요도: ${c.weight})`)
      .join("\n");

    const systemPrompt = `당신은 반려견 영양학 전문가입니다. 제품을 분석하고 보호자의 기준에 맞게 점수를 매겨주세요.

응답은 반드시 JSON 형식으로만 해주세요:
{
  "totalScore": 0-100,
  "criteriaResults": [
    { "name": "기준명", "result": "pass|warning|fail", "detail": "구체적 이유" }
  ],
  "reasoning": "이 강아지에게 이 제품이 적합한 이유를 2-3문장으로 설명",
  "ingredientsSummary": "주요 원재료 요약 (선택)"
}`;

    const userPrompt = `## 강아지 프로필
- 이름: ${profile.name}
- 견종: ${profile.breed}
- 체중: ${profile.weight}kg
- 나이: ${ageStr}
- 식사 타입: ${profile.dietTypes.join(", ")}
- 그레인프리: ${profile.grainFree ? "예" : "아니오"}
- 첨가물 허용: ${profile.additivesLevel}

## 보호자 평가 기준
${criteriaList}

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

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse scoring response" },
        { status: 500 }
      );
    }

    const scoreResult = JSON.parse(jsonMatch[0]);

    const totalScore = Math.max(0, Math.min(100, Math.round(Number(scoreResult.totalScore) || 0)));
    const criteriaResults = Array.isArray(scoreResult.criteriaResults)
      ? scoreResult.criteriaResults.map(
          (cr: { name?: string; result?: string; detail?: string }) => ({
            name: String(cr.name || "").slice(0, 100),
            result: ["pass", "warning", "fail"].includes(cr.result || "")
              ? cr.result
              : "warning",
            detail: String(cr.detail || "").slice(0, 200),
          })
        )
      : [];
    const reasoning = String(scoreResult.reasoning || "").slice(0, 500);

    // Update product analysis
    await supabase
      .from("products")
      .update({
        analysisJson: scoreResult,
        ingredientsRaw: scoreResult.ingredientsSummary || null,
        lastAnalyzed: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", productId);

    // Upsert score
    const expiresAt = new Date(Date.now() + SCORE_TTL_HOURS * 60 * 60 * 1000).toISOString();

    const { data: savedScore, error: scoreErr } = await supabase
      .from("scores")
      .upsert(
        {
          productId,
          profileId: body.profileId,
          totalScore,
          criteriaResults,
          reasoning,
          expiresAt,
        },
        { onConflict: "productId,profileId" }
      )
      .select()
      .single();

    if (scoreErr) {
      return NextResponse.json(
        { error: "Failed to save score", details: scoreErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: savedScore.id,
      productId,
      productName: body.productName,
      brand: body.brand || "",
      category: body.category || "사료",
      totalScore,
      criteriaResults,
      reasoning,
      prices: [],
      lowestPrice: null,
      cached: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
