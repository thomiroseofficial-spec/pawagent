"use client";

const CATEGORIES = ["사료", "간식 1단계", "간식 2단계", "간식 3단계", "패드", "영양제"];

export default function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex gap-0 border-b border-border-light px-5 overflow-x-auto">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === cat
              ? "text-accent border-accent"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
