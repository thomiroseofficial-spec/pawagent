"use client";

import type { Criterion } from "@/types";

export default function CriteriaBar({
  criteria,
  onEdit,
}: {
  criteria: Criterion[];
  onEdit: () => void;
}) {
  const active = criteria.filter((c) => c.active);

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-bg border-b border-border-light">
      <div>
        <h2 className="text-xs font-semibold text-text-muted mb-1.5">내 기준</h2>
        <div className="flex flex-wrap gap-1.5">
          {active.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent"
            >
              ✓ {c.name}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors min-h-[44px] flex items-center"
      >
        기준수정
      </button>
    </div>
  );
}
