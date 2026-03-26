import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

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

    // Save feedback
    const { data: feedback, error: fbErr } = await supabase
      .from("feedback")
      .insert({
        scoreId: body.scoreId,
        profileId: body.profileId,
        rating: body.rating,
        reason: body.reason?.slice(0, 300) || null,
      })
      .select()
      .single();

    if (fbErr) {
      return NextResponse.json(
        { error: "Failed to save feedback", details: fbErr.message },
        { status: 500 }
      );
    }

    // Adjust criteria weights based on negative feedback reason
    if (body.rating === -1 && body.reason) {
      const reason = body.reason.toLowerCase();
      const adjustments: { match: string[]; criteriaName: string; delta: number }[] = [
        { match: ["비싸", "가격", "비용"], criteriaName: "가격 합리성", delta: 0.05 },
        { match: ["성분", "원재료", "첨가물"], criteriaName: "첨가물 최소", delta: 0.05 },
        { match: ["곡물", "그레인"], criteriaName: "그레인프리", delta: 0.05 },
        { match: ["고기", "육류", "단백질"], criteriaName: "육류 원료 1위", delta: 0.05 },
      ];

      for (const adj of adjustments) {
        if (adj.match.some((keyword) => reason.includes(keyword))) {
          // Find the criterion
          const { data: criterion } = await supabase
            .from("criteria")
            .select("id, weight")
            .eq("profileId", body.profileId)
            .eq("name", adj.criteriaName)
            .single();

          if (criterion) {
            const newWeight = Math.min(1, criterion.weight + adj.delta);
            await supabase
              .from("criteria")
              .update({ weight: newWeight })
              .eq("id", criterion.id);
          } else {
            // Create the criterion if it doesn't exist
            await supabase.from("criteria").insert({
              profileId: body.profileId,
              name: adj.criteriaName,
              weight: 0.7 + adj.delta,
              active: true,
            });
          }
        }
      }
    }

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
