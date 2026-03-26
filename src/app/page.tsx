"use client";

import { useState, useEffect, useCallback } from "react";
import ProfileBar from "@/components/ProfileBar";
import CriteriaBar from "@/components/CriteriaBar";
import CategoryTabs from "@/components/CategoryTabs";
import ScoreCard from "@/components/ScoreCard";
import OnboardingForm from "@/components/OnboardingForm";
import ProfileSheet from "@/components/ProfileSheet";
import SettingsSheet from "@/components/SettingsSheet";
import ProductDetailSheet from "@/components/ProductDetailSheet";
import { loadProfile, createProfile, scoreProduct, fetchPrices, sendFeedback } from "@/lib/api";
import type { DogProfile, Criterion, ProductScore } from "@/types";

// Products to auto-score per category
const CATEGORY_PRODUCTS: Record<string, { name: string; brand: string }[]> = {
  사료: [
    { name: "지위픽 에어드라이 양고기 1kg", brand: "지위픽" },
    { name: "바이탈에센스 미니닙스 500g", brand: "바이탈에센스" },
    { name: "K9프레스티지 에어드라이 치킨 1kg", brand: "K9프레스티지" },
  ],
  "간식 1단계": [
    { name: "지위픽 굿독 양고기 트릿", brand: "지위픽" },
    { name: "오리젠 프리즈드라이 트릿 오리", brand: "오리젠" },
  ],
  "간식 2단계": [],
  "간식 3단계": [],
  패드: [],
  영양제: [],
};

export default function Dashboard() {
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [onboarded, setOnboarded] = useState<boolean | null>(null); // null = loading
  const VALID_CATEGORIES = ["사료", "간식 1단계", "간식 2단계", "간식 3단계", "패드", "영양제"];
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window !== "undefined") {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab && VALID_CATEGORIES.includes(tab)) return tab;
    }
    return "사료";
  });

  const [scores, setScores] = useState<Record<string, ProductScore[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedScore, setSelectedScore] = useState<ProductScore | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile()
      .then(({ profile: p, criteria: c }) => {
        if (p) {
          setProfile(p);
          setCriteria(c);
          setOnboarded(true);
        } else {
          setOnboarded(false);
        }
      })
      .catch(() => setOnboarded(false));
  }, []);

  // Score products for active category
  const loadScores = useCallback(
    async (category: string) => {
      if (!profile || scores[category]?.length) return;

      const products = CATEGORY_PRODUCTS[category];
      if (!products?.length) return;

      setLoading(true);
      const results: ProductScore[] = [];

      for (const prod of products) {
        try {
          const score = await scoreProduct(prod.name, profile.id, {
            brand: prod.brand,
            category,
          });

          // Fetch prices
          const { prices } = await fetchPrices(prod.name, score.productId);
          score.prices = prices;
          score.lowestPrice = prices.length
            ? prices.reduce((min, p) =>
                p.price > 0 && p.price < (min.price || Infinity) ? p : min
              )
            : { shopName: "", price: 0, shippingFee: 0, url: "", checkedAt: "" };

          results.push(score);
        } catch (err) {
          console.error(`Score failed for ${prod.name}:`, err);
        }
      }

      setScores((prev) => ({ ...prev, [category]: results }));
      setLoading(false);
    },
    [profile, scores]
  );

  useEffect(() => {
    if (profile && onboarded) {
      loadScores(activeCategory);
    }
  }, [activeCategory, profile, onboarded, loadScores]);

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    const url = category === "사료" ? "/" : `?tab=${encodeURIComponent(category)}`;
    window.history.replaceState(null, "", url);
  }

  const handleFeedback = async (id: string, rating: "up" | "down") => {
    if (!profile) return;
    await sendFeedback(id, profile.id, rating === "up" ? 1 : -1);
  };

  const handleOnboardingComplete = async (data: Omit<DogProfile, "id">) => {
    try {
      const { profile: newProfile, criteria: newCriteria } = await createProfile(data);
      setProfile(newProfile);
      setCriteria(newCriteria);
      setOnboarded(true);
    } catch (err) {
      console.error("Failed to create profile:", err);
    }
  };

  // Loading state
  if (onboarded === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">로딩 중...</p>
      </div>
    );
  }

  if (!onboarded || !profile) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  const currentScores = scores[activeCategory] ?? [];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[800px] mx-auto bg-surface min-h-screen shadow-sm">
        <ProfileBar
          profile={profile}
          onProfileClick={() => setShowProfile(true)}
          onSettingsClick={() => setShowSettings(true)}
        />

        <CriteriaBar criteria={criteria} onEdit={() => console.log("edit criteria")} />

        <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            <div className="text-center py-16 md:col-span-2">
              <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-text-muted">
                AI가 제품을 분석하고 있어요...
              </p>
            </div>
          ) : currentScores.length === 0 ? (
            <div className="text-center py-16 md:col-span-2">
              <p className="text-base text-text-muted mb-2">
                이 카테고리는 아직 추천이 없어요.
              </p>
              <p className="text-sm text-text-faint mb-4">
                기준을 넓히면 더 많은 상품을 찾을 수 있어요.
              </p>
              <button className="px-4 py-2 text-sm font-semibold text-accent border border-accent rounded-[4px] hover:bg-accent-light transition-colors">
                기준 수정
              </button>
            </div>
          ) : (
            currentScores.map((score) => (
              <ScoreCard
                key={score.id}
                score={score}
                onFeedback={handleFeedback}
                onDetail={setSelectedScore}
              />
            ))
          )}
        </div>

        <div className="px-5 py-3 text-2xs text-text-faint text-center border-t border-border-light">
          이 추천은 참고용이며, 건강 문제는 수의사와 상담하세요.
        </div>
      </div>

      <ProductDetailSheet
        score={selectedScore}
        onClose={() => setSelectedScore(null)}
      />

      <ProfileSheet
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
      />

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
