"use client";

import BottomSheet from "./BottomSheet";

export default function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="설정">
      <div className="space-y-4">
        {/* 멤버십 */}
        <div className="p-4 border border-border-light rounded-[8px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">멤버십</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-accent font-medium">
              Basic (무료)
            </span>
          </div>
          <p className="text-sm text-text-muted mb-3">
            Premium으로 업그레이드하면 주간 맞춤 추천, 실시간 가격 추적, 자동 구매를 이용할 수 있어요.
          </p>
          <button className="w-full py-2 bg-accent text-white rounded-[4px] text-sm font-semibold hover:bg-accent-hover transition-colors">
            Premium 시작하기 (월 9,900원~)
          </button>
        </div>

        {/* 자동승인 */}
        <div className="p-4 border border-border-light rounded-[8px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">자동승인</span>
            <span className="text-xs text-text-faint">Premium 전용</span>
          </div>
          <p className="text-sm text-text-muted">
            카테고리별로 자동승인을 설정하면 추천 즉시 최저가로 주문됩니다.
          </p>
        </div>

        {/* 알림 */}
        <div className="p-4 border border-border-light rounded-[8px]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">주간 추천 알림</span>
            <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer">
              <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <p className="text-sm text-text-muted mt-1">매주 월요일 오전 9시 카카오톡으로 발송</p>
        </div>

        {/* 주문 히스토리 */}
        <div className="p-4 border border-border-light rounded-[8px]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">주문 히스토리</span>
            <span className="text-xs text-text-faint">0건</span>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
