"use client";

import { useState } from "react";
import type { DogProfile } from "@/types";

const DIET_OPTIONS = ["생식", "동결건조", "에어드라이", "건사료", "혼합"];

interface OnboardingFormProps {
  onComplete: (profile: Omit<DogProfile, "id">) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [neutered, setNeutered] = useState(false);
  const [dietTypes, setDietTypes] = useState<string[]>([]);
  const [grainFree, setGrainFree] = useState(true);

  const toggleDiet = (diet: string) => {
    setDietTypes((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const canSubmit = name && breed && birthDate && weight && dietTypes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onComplete({
      name,
      breed,
      birthDate,
      weight: parseFloat(weight),
      sex,
      neutered,
      dietTypes,
      grainFree,
      additivesLevel: "minimal",
    });
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[440px] bg-surface rounded-[12px] p-6 shadow-sm"
      >
        <h1 className="text-2xl font-extrabold text-text-primary mb-1">PawAgent</h1>
        <p className="text-sm text-text-muted mb-6">
          강아지 정보를 입력하면 맞춤 추천을 시작합니다.
        </p>

        {/* 이름 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            강아지 이름 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="보들이"
            className="w-full px-3 py-2.5 border border-border rounded-[4px] text-sm bg-surface text-text-primary placeholder:text-text-faint focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* 견종 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            견종 *
          </label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="보더콜리x빠삐용 믹스"
            className="w-full px-3 py-2.5 border border-border rounded-[4px] text-sm bg-surface text-text-primary placeholder:text-text-faint focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">
              생년월일 *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-[4px] text-sm bg-surface text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          {/* 체중 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">
              체중 (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="80"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="4.5"
              className="w-full px-3 py-2.5 border border-border rounded-[4px] text-sm bg-surface text-text-primary placeholder:text-text-faint focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 성별 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">성별</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSex("male")}
                className={`flex-1 py-2 rounded-[4px] text-sm font-medium border transition-colors ${
                  sex === "male"
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-text-muted"
                }`}
              >
                남아
              </button>
              <button
                type="button"
                onClick={() => setSex("female")}
                className={`flex-1 py-2 rounded-[4px] text-sm font-medium border transition-colors ${
                  sex === "female"
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-text-muted"
                }`}
              >
                여아
              </button>
            </div>
          </div>
          {/* 중성화 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">중성화</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNeutered(false)}
                className={`flex-1 py-2 rounded-[4px] text-sm font-medium border transition-colors ${
                  !neutered
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-text-muted"
                }`}
              >
                안함
              </button>
              <button
                type="button"
                onClick={() => setNeutered(true)}
                className={`flex-1 py-2 rounded-[4px] text-sm font-medium border transition-colors ${
                  neutered
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-text-muted"
                }`}
              >
                완료
              </button>
            </div>
          </div>
        </div>

        {/* 식사 타입 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            식사 타입 * (복수 선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => toggleDiet(diet)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  dietTypes.includes(diet)
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-text-muted hover:border-accent"
                }`}
              >
                {dietTypes.includes(diet) ? "✓ " : ""}
                {diet}
              </button>
            ))}
          </div>
        </div>

        {/* 그레인프리 */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={grainFree}
              onChange={(e) => setGrainFree(e.target.checked)}
              className="w-4 h-4 accent-[#2D6A4F]"
            />
            <span className="text-sm text-text-primary">그레인프리 (곡물 없는 제품만)</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3 rounded-[4px] text-base font-semibold transition-colors ${
            canSubmit
              ? "bg-accent text-white hover:bg-accent-hover"
              : "bg-border-light text-text-faint cursor-not-allowed"
          }`}
        >
          맞춤 추천 시작하기
        </button>
      </form>
    </div>
  );
}
