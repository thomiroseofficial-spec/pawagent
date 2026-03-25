# Design System — PawAgent

## Product Context
- **What this is:** AI 강아지 맞춤 용품 스코어링 대시보드. 보호자의 기준으로 제품을 평가하고 최저가를 찾아주는 에이전트.
- **Who it's for:** 철학이 있는 프리미엄 강아지 보호자 (생식/동결건조/에어드라이, AI 도구 활용 가능, 월 10만원+ 지출)
- **Space/industry:** 펫테크 / AI 쇼핑 에이전트
- **Project type:** 싱글 스크린 웹앱 (스코어링 대시보드)

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian + Natural warmth
- **Decoration level:** Minimal — 스코어바와 태그가 유일한 시각적 장식. 일러스트/아이콘/패턴 없음.
- **Mood:** "강아지 영양학 전문가의 분석 리포트" — 데이터가 말하고, 디자인은 방해하지 않음. 신뢰감, 투명함, 전문성. 귀여운 펫앱이 아님.
- **Anti-patterns:** 파스텔 색상, 발바닥 아이콘, 카툰 일러스트, 둥근 카드 그리드, 보라색 그라디언트 — 전부 금지.

## Typography
- **Display/Hero:** Pretendard Variable ExtraBold (800) — 한국어 앱에서 가장 안정적인 선택. 깔끔하고 현대적.
- **Body:** Pretendard Variable Regular (400) — 뛰어난 가독성, 한국어+영어 모두 커버
- **UI/Labels:** Pretendard Variable SemiBold (600)
- **Data/Tables:** Pretendard Variable Bold (700) + font-variant-numeric: tabular-nums — 점수와 가격이 정렬됨
- **Code:** JetBrains Mono
- **Loading:** `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
- **Scale:**
  - 2xs: 11px / 0.6875rem (캡션, 메타데이터)
  - xs: 12px / 0.75rem (태그, 레이블)
  - sm: 13px / 0.8125rem (보조 텍스트, 기준일)
  - base: 15px / 0.9375rem (본문, 추천 이유)
  - lg: 18px / 1.125rem (제품명, 카드 헤더)
  - xl: 24px / 1.5rem (섹션 제목)
  - 2xl: 36px / 2.25rem (페이지 제목, 히어로)

## Color
- **Approach:** Restrained — 포레스트 그린 1색 + 뉴트럴. 색상은 의미가 있을 때만.
- **CSS Variables:**
  ```css
  --bg: #FAFAF8;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #525252;
  --text-muted: #737373;
  --text-faint: #A3A3A3;
  --accent: #2D6A4F;
  --accent-light: #E8F5EE;
  --accent-hover: #245A42;
  --border: #E5E5E3;
  --border-light: #F0F0EE;
  ```
- **Score System:**
  - High (80-100): #2D6A4F (포레스트 그린) / bg: #E8F5EE
  - Mid (50-79): #E9A23B (앰버) / bg: #FFF8E1
  - Low (0-49): #DC3545 (레드) / bg: #FFF5F5
- **Semantic:**
  - Success: #2D6A4F / bg: #E8F5EE
  - Warning: #E9A23B / bg: #FFF8E1
  - Error: #DC3545 / bg: #FFF5F5
  - Info: #2563EB / bg: #EFF6FF
- **Dark mode:**
  ```css
  --bg: #141413;
  --surface: #1C1C1A;
  --surface-raised: #242422;
  --text-primary: #EDEDEC;
  --text-secondary: #A3A3A1;
  --text-muted: #737371;
  --accent: #52B788;
  --accent-light: #1A2E24;
  --accent-hover: #6FCF97;
  --border: #2A2A28;
  --score-high: #52B788;
  --score-mid: #F0B429;
  --score-low: #EF6461;
  ```

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — 데이터 중심이지만 답답하지 않게
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined — 단일 컬럼 모바일, 데스크톱에서 2열
- **Grid:**
  - Mobile: 1 column, 20px padding
  - Tablet: 1 column, 32px padding, max-width 600px
  - Desktop: 2 column grid for score cards, max-width 800px
- **Max content width:** 800px
- **Border radius:** sm: 4px (버튼, 인풋), md: 8px (카드), lg: 12px (모달/시트), full: 9999px (태그, 뱃지)

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms)
- **Specific:**
  - 스코어바 채우기: 800ms ease-out (첫 로딩 시)
  - 버튼 호버: 150ms ease
  - 바텀시트 열기: 300ms ease-out
  - 피드백 반영 체크: 200ms ease

## Key UI Patterns

### Score Card (핵심 컴포넌트)
```
┌─────────────────────────────────────┐
│ 제품명                    [점수뱃지] │  ← lg/700 + xl/800
│ ████████████░░ (스코어바)            │  ← 6px height, radius 3px
│ ✅기준1 ✅기준2 ⚠️기준3 ❌기준4     │  ← 태그 한 줄
│ ────────────────────────────────── │
│ 28,500원 네이버A몰       [구매 →]   │  ← 가격 + 출처 + CTA
│ [👍 맞아요] [👎 아니에요]           │  ← 피드백 버튼
└─────────────────────────────────────┘
```

### Criteria Tag
- PASS: accent-light bg + accent text + ✅
- WARNING: warning-bg + amber text + ⚠️
- FAIL: error-bg + red text + ❌
- Shape: pill (border-radius: full), padding: 2px 8px

### Feedback Button
- Border: 1px solid border, pill shape
- Hover: border-color → accent, text → accent
- After feedback: "반영됐어요 ✓" 상태로 전환

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-25 | Initial design system created | /design-consultation + competitive research. 펫앱 파스텔 패턴을 의도적으로 거부하고 "전문가 리포트" 미학 채택. |
| 2026-03-25 | Pretendard 단일 폰트 | 한국어+영어 커버, 가중치로 계층 생성. 별도 디스플레이 폰트 불필요. |
| 2026-03-25 | 포레스트 그린 액센트 | 자연식 철학과 시각적 연결. 다른 펫앱(파스텔/보라)과 차별화. |
| 2026-03-25 | 싱글 스크린 앱 | /plan-design-review에서 결정. 대시보드 = 앱. 하단 탭 없음. |
