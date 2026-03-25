"use client";

import type { ProductScore } from "@/types";
import BottomSheet from "./BottomSheet";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

export default function ProductDetailSheet({
  score,
  onClose,
}: {
  score: ProductScore | null;
  onClose: () => void;
}) {
  if (!score) return null;

  const badgeClass =
    score.totalScore >= 80
      ? "bg-success-bg text-score-high"
      : score.totalScore >= 50
        ? "bg-warning-bg text-score-mid"
        : "bg-error-bg text-score-low";

  return (
    <BottomSheet open={!!score} onClose={onClose} title="">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 -mt-2">
        <h2 className="text-lg font-bold pr-3">{score.productName}</h2>
        <span className={`text-xl font-extrabold tabular-nums px-2.5 py-0.5 rounded-[4px] shrink-0 ${badgeClass}`}>
          {score.totalScore}
        </span>
      </div>

      {/* Reasoning */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">추천 이유</h3>
        <p className="text-base text-text-secondary leading-relaxed">
          {score.reasoning}
        </p>
      </div>

      {/* Criteria detail table */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">기준별 점수</h3>
        <div className="border border-border-light rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-3 py-2 font-semibold text-text-muted">기준</th>
                <th className="text-center px-3 py-2 font-semibold text-text-muted w-16">판정</th>
                <th className="text-left px-3 py-2 font-semibold text-text-muted">상세</th>
              </tr>
            </thead>
            <tbody>
              {score.criteriaResults.map((cr) => (
                <tr key={cr.name} className="border-t border-border-light">
                  <td className="px-3 py-2 text-text-primary">{cr.name}</td>
                  <td className="px-3 py-2 text-center">
                    {cr.result === "pass" && <span className="text-score-high font-bold">✓</span>}
                    {cr.result === "warning" && <span className="text-score-mid font-bold">!</span>}
                    {cr.result === "fail" && <span className="text-score-low font-bold">✕</span>}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{cr.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price comparison */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">가격 비교</h3>
        <div className="border border-border-light rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-3 py-2 font-semibold text-text-muted">쇼핑몰</th>
                <th className="text-right px-3 py-2 font-semibold text-text-muted">가격</th>
                <th className="text-right px-3 py-2 font-semibold text-text-muted">배송비</th>
              </tr>
            </thead>
            <tbody>
              {score.prices.map((p, i) => (
                <tr key={p.shopName} className="border-t border-border-light">
                  <td className="px-3 py-2 text-text-primary">
                    {i === 0 && <span className="text-accent mr-1">★</span>}
                    {p.shopName}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">
                    {formatPrice(p.price)}원
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">
                    {p.shippingFee === 0 ? "무료" : p.shippingFee < 0 ? "확인필요" : `${formatPrice(p.shippingFee)}원`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-2xs text-text-faint mt-1.5">
          가격 기준일: {new Date(score.lowestPrice.checkedAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* CTA */}
      <a
        href={score.lowestPrice.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-accent text-white text-center rounded-[4px] text-base font-semibold hover:bg-accent-hover transition-colors"
      >
        최저가로 주문하러가기 →
      </a>
    </BottomSheet>
  );
}
