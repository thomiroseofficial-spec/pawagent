import type { DogProfile, Criterion, ProductScore, Price } from "@/types";

const TEMP_USER_ID = "demo-user-001";

export async function loadProfile(): Promise<{
  profile: DogProfile | null;
  criteria: Criterion[];
}> {
  const res = await fetch(`/api/profile?userId=${TEMP_USER_ID}`);
  const data = await res.json();
  if (!data.profile) return { profile: null, criteria: [] };

  return {
    profile: {
      id: data.profile.id,
      name: data.profile.name,
      breed: data.profile.breed,
      birthDate: data.profile.birthDate,
      weight: data.profile.weight,
      sex: data.profile.sex,
      neutered: data.profile.neutered,
      dietTypes: data.profile.dietTypes,
      grainFree: data.profile.grainFree,
      additivesLevel: data.profile.additivesLevel,
    },
    criteria: (data.criteria || []).map(
      (c: { id: string; name: string; weight: number; active: boolean }) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        active: c.active,
      })
    ),
  };
}

export async function createProfile(
  profileData: Omit<DogProfile, "id">,
  criteria?: { name: string; weight: number }[]
): Promise<{ profile: DogProfile; criteria: Criterion[] }> {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...profileData, userId: TEMP_USER_ID, criteria }),
  });
  const data = await res.json();
  return {
    profile: {
      id: data.profile.id,
      name: data.profile.name,
      breed: data.profile.breed,
      birthDate: data.profile.birthDate,
      weight: data.profile.weight,
      sex: data.profile.sex,
      neutered: data.profile.neutered,
      dietTypes: data.profile.dietTypes,
      grainFree: data.profile.grainFree,
      additivesLevel: data.profile.additivesLevel,
    },
    criteria: data.criteria.map(
      (c: { id: string; name: string; weight: number; active: boolean }) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        active: c.active,
      })
    ),
  };
}

export async function scoreProduct(
  productName: string,
  profileId: string,
  opts?: { brand?: string; category?: string; productUrl?: string }
): Promise<ProductScore> {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName,
      profileId,
      brand: opts?.brand,
      category: opts?.category,
      productUrl: opts?.productUrl,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchPrices(
  query: string,
  productId?: string
): Promise<{ prices: Price[]; fallback?: boolean }> {
  const params = new URLSearchParams({ q: query });
  if (productId) params.set("productId", productId);

  const res = await fetch(`/api/prices?${params}`);
  return res.json();
}

export async function sendFeedback(
  scoreId: string,
  profileId: string,
  rating: 1 | -1,
  reason?: string
): Promise<void> {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scoreId, profileId, rating, reason }),
  });
}
