import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

interface ProfilePayload {
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
  sex: string;
  neutered: boolean;
  dietTypes: string[];
  grainFree: boolean;
  additivesLevel: string;
  criteria?: { name: string; weight: number }[];
}

// GET /api/profile?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("dog_profiles")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !profile) {
      return NextResponse.json({ profile: null });
    }

    const { data: criteria } = await supabase
      .from("criteria")
      .select("*")
      .eq("profileId", profile.id)
      .eq("active", true)
      .order("weight", { ascending: false });

    return NextResponse.json({ profile, criteria: criteria || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/profile — create profile + default criteria
export async function POST(request: NextRequest) {
  try {
    const body: ProfilePayload & { userId: string } = await request.json();

    if (!body.userId || !body.name || !body.breed) {
      return NextResponse.json(
        { error: "Missing required fields: userId, name, breed" },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("dog_profiles")
      .insert({
        userId: body.userId.slice(0, 100),
        name: body.name.slice(0, 50),
        breed: body.breed.slice(0, 100),
        birthDate: new Date(body.birthDate).toISOString(),
        weight: Math.max(0.5, Math.min(80, body.weight)),
        sex: body.sex === "female" ? "female" : "male",
        neutered: body.neutered ?? false,
        dietTypes: body.dietTypes || [],
        grainFree: body.grainFree ?? true,
        additivesLevel: body.additivesLevel || "minimal",
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Failed to create profile", details: String(profileError?.message) },
        { status: 500 }
      );
    }

    // Insert criteria
    const criteriaToInsert = body.criteria?.length
      ? body.criteria.map((c) => ({
          profileId: profile.id,
          name: c.name.slice(0, 100),
          weight: Math.max(0, Math.min(1, c.weight)),
          active: true,
        }))
      : [
          { profileId: profile.id, name: "육류 원료 1위", weight: 0.9, active: true },
          { profileId: profile.id, name: "그레인프리", weight: 0.85, active: true },
          { profileId: profile.id, name: "첨가물 최소", weight: 0.8, active: true },
          { profileId: profile.id, name: "가격 합리성", weight: 0.7, active: true },
        ];

    const { data: criteria } = await supabase
      .from("criteria")
      .insert(criteriaToInsert)
      .select();

    return NextResponse.json({ profile, criteria: criteria || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
