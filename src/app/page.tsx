"use client";

import { useState } from "react";
import ProfileBar from "@/components/ProfileBar";
import CriteriaBar from "@/components/CriteriaBar";
import CategoryTabs from "@/components/CategoryTabs";
import ScoreCard from "@/components/ScoreCard";
import OnboardingForm from "@/components/OnboardingForm";
import ProfileSheet from "@/components/ProfileSheet";
import SettingsSheet from "@/components/SettingsSheet";
import ProductDetailSheet from "@/components/ProductDetailSheet";
import { mockProfile, mockCriteria, mockScores } from "@/lib/mock-data";
import type { DogProfile, ProductScore } from "@/types";

export default function Dashboard() {
  const [profile, setProfile] = useState<DogProfile | null>(mockProfile);
  const [onboarded, setOnboarded] = useState(true);
  const [activeCategory, setActiveCategory] = useState("사료");
  const [selectedScore, setSelectedScore] = useState<ProductScore | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scores = mockScores[activeCategory] ?? [];

  const handleFeedback = (id: string, rating: "up" | "down") => {
    console.log(`Feedback: ${id} → ${rating}`);
  };

  const handleOnboardingComplete = (data: Omit<DogProfile, "id">) => {
    const newProfile: DogProfile = { ...data, id: "new-profile" };
    setProfile(newProfile);
    setOnboarded(true);
  };

  if (!onboarded || !profile) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[800px] mx-auto bg-surface min-h-screen shadow-sm">
        <ProfileBar
          profile={profile}
          onProfileClick={() => setShowProfile(true)}
          onSettingsClick={() => setShowSettings(true)}
        />

        <CriteriaBar criteria={mockCriteria} onEdit={() => console.log("edit criteria")} />

        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {scores.length === 0 ? (
            <div className="text-center py-16 md:col-span-2">
              <p className="text-[15px] text-text-muted mb-2">
                이 카테고리는 아직 추천이 없어요.
              </p>
              <p className="text-[13px] text-text-faint mb-4">
                기준을 넓히면 더 많은 상품을 찾을 수 있어요.
              </p>
              <button className="px-4 py-2 text-[13px] font-semibold text-accent border border-accent rounded-[4px] hover:bg-accent-light transition-colors">
                기준 수정
              </button>
            </div>
          ) : (
            scores.map((score) => (
              <ScoreCard
                key={score.id}
                score={score}
                onFeedback={handleFeedback}
                onDetail={setSelectedScore}
              />
            ))
          )}
        </div>

        <div className="px-5 py-3 text-[11px] text-text-faint text-center border-t border-border-light">
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
