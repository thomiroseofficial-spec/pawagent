"use client";

import { useState } from "react";
import type { ProductScore, CriterionResult } from "@/types";

function scoreColor(score: number) {
  if (score >= 80) return { bar: "bg-score-high", badge: "bg-success-bg text-score-high" };
  if (score >= 50) return { bar: "bg-score-mid", badge: "bg-warning-bg text-score-mid" };
  return { bar: "bg-score-low", badge: "bg-error-bg text-score-low" };
}

function criterionTag(result: CriterionResult) {
  switch (result) {
    case "pass":
      return { icon: "✓", className: "bg-success-bg text-score-high" };
    case "warning":
      return { icon: "!", className: "bg-warning-bg text-[#92650A]" };
    case "fail":
      return { icon: "✕", className: "bg-error-bg text-score-low" };
  }
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

export default function ScoreCard({
  score,
  onFeedback,
  onDetail,
}: {
  score: ProductScore;
  onFeedback: (id: string, rating: "up" | "down") => void;
  onDetail: (score: ProductScore) => void;
}) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const colors = scoreColor(score.totalScore);

  const handleFeedback = (rating: "up" | "down") => {
    setFeedback(rating);
    onFeedback(score.id, rating);
  };

  return (
    <div
      className="p-4 border border-border-light rounded-[8px] bg-surface cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onDetail(score)}
      role="button"
      tabIndex={0}
      aria-label={`${score.productName}, ${score.totalScore}점, 최저가 ${formatPrice(score.lowestPrice.price)}원`}
      onKeyDown={(e) => e.key === "Enter" && onDetail(score)}
    >
      {/* Header: product name + score badge */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="text-[15px] font-bold text-text-primary leading-tight pr-3">
          {score.productName}
        </div>
        <div className={`text-xl font-extrabold tabular-nums px-2.5 py-0.5 rounded-[4px] shrink-0 ${colors.badge}`}>
          {score.totalScore}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-border-light rounded-full mb-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-800 ease-out ${colors.bar}`}
          style={{ width: `${score.totalScore}%` }}
        />
      </div>

      {/* Criteria tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {score.criteriaResults.map((cr) => {
          const tag = criterionTag(cr.result);
          return (
            <span
              key={cr.name}
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${tag.className}`}
            >
              {tag.icon} {cr.name}
            </span>
          );
        })}
      </div>

      {/* Price row */}
      <div
        className="flex items-center justify-between pt-2.5 border-t border-border-light"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold tabular-nums">
            {formatPrice(score.lowestPrice.price)}원
          </span>
          <span className="text-xs text-text-muted">
            {score.lowestPrice.shopName}
            {score.lowestPrice.shippingFee === 0 ? " · 무료배송" : ""}
          </span>
        </div>
        <a
          href={score.lowestPrice.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-accent text-white rounded-[4px] text-[13px] font-semibold hover:bg-accent-hover transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          구매 →
        </a>
      </div>

      {/* Feedback row */}
      <div className="flex gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
        {feedback ? (
          <span className="text-xs text-accent font-medium">반영됐어요 ✓</span>
        ) : (
          <>
            <button
              onClick={() => handleFeedback("up")}
              className="px-3 py-1 border border-border rounded-full text-xs text-text-muted hover:border-accent hover:text-accent transition-colors"
            >
              👍 맞아요
            </button>
            <button
              onClick={() => handleFeedback("down")}
              className="px-3 py-1 border border-border rounded-full text-xs text-text-muted hover:border-accent hover:text-accent transition-colors"
            >
              👎 아니에요
            </button>
          </>
        )}
      </div>
    </div>
  );
}
