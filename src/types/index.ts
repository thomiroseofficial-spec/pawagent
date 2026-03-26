export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
  sex: "male" | "female";
  neutered: boolean;
  dietTypes: string[];
  grainFree: boolean;
  additivesLevel: "none" | "minimal" | "moderate";
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  active: boolean;
}

export type CriterionResult = "pass" | "warning" | "fail";

export interface ScoreCriterion {
  name: string;
  result: CriterionResult;
  detail: string;
}

export interface Price {
  shopName: string;
  price: number;
  shippingFee: number;
  url: string;
  checkedAt: string;
}

export interface ProductScore {
  id: string;
  productId?: string;
  productName: string;
  brand: string;
  category: string;
  totalScore: number;
  criteriaResults: ScoreCriterion[];
  reasoning: string;
  prices: Price[];
  lowestPrice: Price;
}

export type FeedbackRating = "up" | "down";

export interface Feedback {
  scoreId: string;
  rating: FeedbackRating;
  reason?: string;
}
