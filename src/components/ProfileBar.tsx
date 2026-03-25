"use client";

import type { DogProfile } from "@/types";

function getAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years}년 ${remaining}개월` : `${years}년`;
}

export default function ProfileBar({
  profile,
  onProfileClick,
  onSettingsClick,
}: {
  profile: DogProfile;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
      <button onClick={onProfileClick} className="flex items-center gap-3 text-left min-w-0 flex-1 mr-2">
        <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center text-lg shrink-0">
          🐕
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-text-primary truncate">
            {profile.name} · {profile.breed} · {getAge(profile.birthDate)}
          </div>
          <div className="text-xs text-text-muted truncate">
            {profile.dietTypes.join(" · ")} · {profile.grainFree ? "그레인프리" : ""} · 첨가물{profile.additivesLevel === "none" ? "무" : profile.additivesLevel === "minimal" ? "최소" : "보통"}
          </div>
        </div>
      </button>
      <div className="flex gap-2">
        <button
          onClick={onProfileClick}
          className="w-11 h-11 rounded-[4px] border border-border flex items-center justify-center text-sm text-text-muted hover:border-accent hover:text-accent transition-colors"
          aria-label="프로필 수정"
        >
          ✎
        </button>
        <button
          onClick={onSettingsClick}
          className="w-11 h-11 rounded-[4px] border border-border flex items-center justify-center text-sm text-text-muted hover:border-accent hover:text-accent transition-colors"
          aria-label="설정"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
