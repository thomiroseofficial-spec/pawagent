"use client";

import type { DogProfile } from "@/types";
import BottomSheet from "./BottomSheet";

function getAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years}년 ${remaining}개월` : `${years}년`;
}

export default function ProfileSheet({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: DogProfile;
}) {
  const rows = [
    { label: "이름", value: profile.name },
    { label: "견종", value: profile.breed },
    { label: "나이", value: getAge(profile.birthDate) },
    { label: "체중", value: `${profile.weight}kg` },
    { label: "성별", value: profile.sex === "male" ? "남아" : "여아" },
    { label: "중성화", value: profile.neutered ? "완료" : "안함" },
    { label: "식사 타입", value: profile.dietTypes.join(", ") },
    { label: "그레인프리", value: profile.grainFree ? "예" : "아니오" },
    { label: "첨가물 허용", value: profile.additivesLevel === "none" ? "무첨가" : profile.additivesLevel === "minimal" ? "최소" : "보통" },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title="내 강아지 프로필">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b border-border-light">
            <span className="text-[13px] text-text-muted">{row.label}</span>
            <span className="text-[14px] font-medium text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2.5 border border-accent text-accent rounded-[4px] text-sm font-semibold hover:bg-accent-light transition-colors">
        프로필 수정
      </button>
    </BottomSheet>
  );
}
