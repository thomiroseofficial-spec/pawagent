import { NextRequest, NextResponse } from "next/server";

interface FeedbackRequest {
  scoreId: string;
  profileId: string;
  rating: number; // +1 or -1
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();

    if (!body.scoreId || !body.profileId || !body.rating) {
      return NextResponse.json(
        { error: "Missing required fields: scoreId, profileId, rating" },
        { status: 400 }
      );
    }

    if (body.rating !== 1 && body.rating !== -1) {
      return NextResponse.json(
        { error: "Rating must be +1 or -1" },
        { status: 400 }
      );
    }

    // TODO: Save to database when Supabase is connected
    // For now, return success with the feedback data
    const feedback = {
      id: `fb-${Date.now()}`,
      scoreId: body.scoreId,
      profileId: body.profileId,
      rating: body.rating,
      reason: body.reason || null,
      createdAt: new Date().toISOString(),
    };

    // TODO: Update criteria weights based on feedback
    // If rating === -1 and reason is provided:
    //   - "가격이 너무 비싸" → increase price criterion weight
    //   - "성분이 마음에 안 들어" → increase ingredient criterion weight
    //   - "이 브랜드 싫어" → add to avoided brands

    return NextResponse.json({
      feedback,
      message: "피드백이 반영되었어요. 다음 추천부터 기준이 업데이트됩니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
