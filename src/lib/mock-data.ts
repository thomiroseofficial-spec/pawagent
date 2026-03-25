import type { DogProfile, Criterion, ProductScore } from "@/types";

export const mockProfile: DogProfile = {
  id: "1",
  name: "보들이",
  breed: "보더콜리x빠삐용 믹스",
  birthDate: "2025-12-12",
  weight: 4.5,
  sex: "male",
  neutered: false,
  dietTypes: ["동결건조", "에어드라이"],
  grainFree: true,
  additivesLevel: "minimal",
};

export const mockCriteria: Criterion[] = [
  { id: "1", name: "육류 원료 1위", weight: 0.9, active: true },
  { id: "2", name: "그레인프리", weight: 0.85, active: true },
  { id: "3", name: "첨가물 최소", weight: 0.8, active: true },
  { id: "4", name: "알갱이 부서지지 않음", weight: 0.7, active: true },
];

export const mockScores: Record<string, ProductScore[]> = {
  사료: [
    {
      id: "1",
      productName: "지위픽 에어드라이 양고기 1kg",
      brand: "지위픽",
      category: "사료",
      totalScore: 92,
      criteriaResults: [
        { name: "육류 원료 1위", result: "pass", detail: "양고기 96%" },
        { name: "그레인프리", result: "pass", detail: "곡물 0%" },
        { name: "첨가물 최소", result: "pass", detail: "비타민/미네랄만" },
        { name: "알갱이 형태", result: "pass", detail: "에어드라이 유지" },
        { name: "가격 합리성", result: "warning", detail: "프리미엄 가격대" },
      ],
      reasoning:
        "보들이의 식사 철학(동결건조/에어드라이, 그레인프리)에 정확히 부합합니다. 양고기가 원재료 96%로 1순위이며, 에어드라이 방식으로 알갱이가 부서지지 않아 훈련 시 손으로 급여하기 적합합니다.",
      prices: [
        { shopName: "네이버 A몰", price: 28500, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
        { shopName: "쿠팡", price: 29800, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
        { shopName: "바잇미", price: 32000, shippingFee: 3000, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
      ],
      lowestPrice: { shopName: "네이버 A몰", price: 28500, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
    },
    {
      id: "2",
      productName: "바이탈에센스 미니닙스 500g",
      brand: "바이탈에센스",
      category: "사료",
      totalScore: 87,
      criteriaResults: [
        { name: "육류 원료 1위", result: "pass", detail: "닭고기 90%" },
        { name: "그레인프리", result: "pass", detail: "곡물 0%" },
        { name: "첨가물 최소", result: "warning", detail: "보존제 소량" },
        { name: "알갱이 형태", result: "pass", detail: "동결건조 유지" },
      ],
      reasoning:
        "동결건조 방식으로 보들이의 식사 철학에 부합하며, 닭고기가 주원료입니다. 첨가물이 약간 있으나 허용 범위 내입니다.",
      prices: [
        { shopName: "쿠팡", price: 24200, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
        { shopName: "네이버 B몰", price: 25800, shippingFee: 2500, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
      ],
      lowestPrice: { shopName: "쿠팡", price: 24200, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
    },
    {
      id: "3",
      productName: "K9프레스티지 에어드라이 치킨 1kg",
      brand: "K9프레스티지",
      category: "사료",
      totalScore: 78,
      criteriaResults: [
        { name: "육류 원료 1위", result: "pass", detail: "닭고기 85%" },
        { name: "그레인프리", result: "pass", detail: "곡물 0%" },
        { name: "첨가물 최소", result: "fail", detail: "첨가물 다수" },
        { name: "알갱이 형태", result: "pass", detail: "에어드라이 유지" },
      ],
      reasoning:
        "에어드라이 방식이지만 지위픽 대비 첨가물이 많습니다. 가격은 가장 저렴합니다.",
      prices: [
        { shopName: "11번가", price: 22800, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
        { shopName: "네이버 C몰", price: 23500, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
      ],
      lowestPrice: { shopName: "11번가", price: 22800, shippingFee: 0, url: "#", checkedAt: "2026-03-25T09:00:00Z" },
    },
  ],
  "간식 1단계": [],
  "간식 2단계": [],
  "간식 3단계": [],
  패드: [],
  영양제: [],
};
