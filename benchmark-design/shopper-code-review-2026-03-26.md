# Shopper Code Review

기준일: 2026-03-26

전제:
- `PawAgent = Yuka / Olive의 반려견 버전`
- 즉, `강아지 맞춤 기준`으로 사료/간식/용품을 평가하고 점수화하며, 대체품/최저가/피드백 학습까지 이어지는 서비스로 본다.

리뷰 범위:
- 전체 코드베이스
- 로컬 검증: `npm run build`, `npm run lint`, `npx tsc --noEmit`, 브라우저 캡처
- 기준 문서: [DESIGN.md](/Users/slave2/ai/ainative/shopper/DESIGN.md)

## Executive Summary

방향 자체는 맞다. 현재 구조는 분명히 `Yuka/Olive for dog`를 향하고 있다.

- `온보딩 기반 개인화`
- `기준 태그 + 점수 카드`
- `상세 이유 설명`
- `가격 비교`
- `피드백 반영`이라는 틀은 맞다

문제는 `제품 방향`이 아니라 `제품 완성도`다.

- 지금은 `컨셉 데모` 수준이고
- 핵심 데이터 흐름이 mock에 멈춰 있으며
- 현재 상태로는 빌드도 깨진다

즉, `무엇을 만들고 있는지`는 맞는데 `실제로 동작하는 Yuka/Olive형 제품`은 아직 아니다.

## Verification

- `npm run build` 실패
  - Tailwind/CSS 빌드 과정에서 프로젝트 내부 raw HTML 수집물까지 읽어 `./&` 해석 오류 발생
- `npm run lint` 실패
  - ESLint 설정 부재로 interactive prompt 발생
- `npx tsc --noEmit` 불안정
  - `.next/types/**/*.ts` 포함 구조 때문에 생성물 상태에 의존
- 브라우저 캡처
  - `http://127.0.0.1:3000` 접속 결과 `Internal Server Error`

## What Matches The Product Vision

### 1. 정보 구조는 Yuka/Olive형과 맞다

- 프로필 기반 진입
- 내 기준 노출
- 카테고리 선택
- 점수 카드 목록
- 상세 판정표
- 가격 비교

이 흐름은 `scan/result/explanation/alternatives` 류 제품을 반려견 도메인으로 옮긴 기본 골격으로 적절하다.

관련 파일:
- [page.tsx](/Users/slave2/ai/ainative/shopper/src/app/page.tsx)
- [ScoreCard.tsx](/Users/slave2/ai/ainative/shopper/src/components/ScoreCard.tsx)
- [ProductDetailSheet.tsx](/Users/slave2/ai/ainative/shopper/src/components/ProductDetailSheet.tsx)

### 2. 개인화 관점도 맞다

- 프로필 필드가 단순 취향이 아니라 평가 기준과 연결되는 방향이다
- 식사 타입, 그레인프리, 첨가물 허용 수준 같은 요소를 앞에 둔 건 Olive형 개인화와 잘 맞는다

관련 파일:
- [OnboardingForm.tsx](/Users/slave2/ai/ainative/shopper/src/components/OnboardingForm.tsx)
- [types/index.ts](/Users/slave2/ai/ainative/shopper/src/types/index.ts)
- [prisma/schema.prisma](/Users/slave2/ai/ainative/shopper/prisma/schema.prisma)

### 3. 디자인 톤도 대체로 맞다

- 파스텔 펫앱이 아니라 분석 리포트형으로 가려는 방향은 맞다
- 점수, 태그, 표, 시트 중심 UI는 Yuka형 해석에 적합하다

다만 실행 디테일은 아직 덜 정리되어 있다.

## Findings

### 1. 현재 상태에서는 제품이 동작하지 않는다

심각도: 높음

- 빌드 실패
- 로컬 화면도 `Internal Server Error`

현재 직접 원인:
- 이번에 저장한 raw benchmark HTML이 앱 루트 안에 들어오면서 Tailwind가 그것까지 스캔해 CSS 빌드를 망친다

영향:
- 실제 제품 검증 자체가 막힌다
- 지금 단계에서 가장 먼저 해결해야 할 blocker다

가이드:
- `benchmark-design` 아래 raw HTML은 앱 빌드 범위 밖으로 빼거나
- Tailwind source 범위를 `src/**/*` 위주로 명시 제한해야 한다
- 연구 자료와 앱 소스는 분리하는 게 맞다

### 2. 온보딩이 개인화 제품의 “진짜 시작점” 역할을 못 한다

심각도: 높음

- 기본 진입값이 `mockProfile` + `onboarded=true`다
  - [page.tsx](/Users/slave2/ai/ainative/shopper/src/app/page.tsx#L16)
- 즉, 개인화 평가 제품인데 첫 진입에서 기준 수집이 우회된다

왜 문제인가:
- Yuka/Olive형 제품에서 가장 중요한 건 “내 기준을 어떻게 수집하고 바로 결과에 연결하느냐”다
- 지금은 온보딩이 기능 핵심이 아니라 데모용 보조 화면처럼 취급된다

가이드:
- 기본 진입은 미온보딩 상태여야 한다
- 데모 모드는 별도 플래그로 분리
- 온보딩 완료 후 바로 첫 추천 결과가 보이는 서사를 설계해야 한다

### 3. 개인화 강도가 Olive 수준까지는 안 올라와 있다

심각도: 높음

현재 온보딩 필드:
- 이름
- 견종
- 생년월일
- 체중
- 성별
- 중성화
- 식사 타입
- 그레인프리
- 첨가물 허용

빠진 것:
- 알러지/민감성
- 피해야 할 원재료
- 선호/회피 브랜드
- 건강 목표
- 예산 범위
- 현재 급여 중인 제품
- 보호자 철학 우선순위

DB에는 일부 필드가 이미 더 있다.
- [schema.prisma](/Users/slave2/ai/ainative/shopper/prisma/schema.prisma)

문제:
- UI 수집값보다 스키마가 더 풍부하다
- 실제 개인화 제품으로 보이려면 온보딩과 평가모델이 같은 언어를 써야 한다

가이드:
- 온보딩 질문을 `기준 추출용`으로 다시 설계해야 한다
- “강아지 정보 입력”에서 끝나면 안 되고 “무엇을 싫어하고 무엇을 우선하는지”까지 받아야 한다

### 4. 점수 카드 UX는 맞지만 Yuka 수준의 즉시성은 아직 부족하다

심각도: 중간

좋은 점:
- 숫자 점수
- 스코어바
- 기준 태그
- 가격 CTA

부족한 점:
- 왜 높은 점수인지 한눈에 안 들어온다
- 위험/주의 기준이 충분히 전면에 뜨지 않는다
- `good / caution / avoid` 판단력이 카드 첫 화면에서 약하다

관련 파일:
- [ScoreCard.tsx](/Users/slave2/ai/ainative/shopper/src/components/ScoreCard.tsx#L44)

가이드:
- 카드 첫 화면에서 `합격 이유 2개 + 경고 1개`를 더 분명히 보여주는 편이 좋다
- 지금은 태그가 많은데 우선순위가 약하다
- Yuka처럼 첫 1초에 판정이 박혀야 한다

### 5. 상세 시트는 정보는 많지만 “행동 유도”가 약하다

심각도: 중간

- 기준별 표와 가격 표는 좋다
- 하지만 Olive형 제품처럼 “이 제품이 왜 우리 강아지에게 애매한지/좋은지”가 서사적으로 더 강해야 한다

현재:
- 이유 설명 1문단
- 표
- 최저가 CTA

부족한 점:
- 대체품 추천 없음
- “이 기준 때문에 감점” 요약 없음
- 재구매/보관/급여 팁 같은 도메인 문맥 없음

관련 파일:
- [ProductDetailSheet.tsx](/Users/slave2/ai/ainative/shopper/src/components/ProductDetailSheet.tsx#L36)

가이드:
- 상세 시트는 단순 테이블보다 `핵심 요약 > 감점 사유 > 대안 > 가격` 순서가 더 제품답다

### 6. 피드백 루프가 제품 핵심인데 아직 실제로는 비어 있다

심각도: 높음

- 카드에 `👍 맞아요 / 👎 아니에요`는 있다
- 하지만 실제 저장도, 기준 업데이트도 안 된다
  - [page.tsx](/Users/slave2/ai/ainative/shopper/src/app/page.tsx#L36)
  - [feedback route](/Users/slave2/ai/ainative/shopper/src/app/api/feedback/route.ts)

왜 문제인가:
- “내 기준으로 점점 더 잘 맞아지는 Yuka/Olive for dog”가 되려면 피드백이 핵심 자산이다
- 지금은 UI 장식에 가깝다

가이드:
- 피드백은 반드시 저장되어야 한다
- `왜 아닌지`를 구조화해서 받아야 한다
- 그 값이 프로필/기준/회피 브랜드/가중치에 반영되는 루프를 설계해야 한다

### 7. 가격 비교 기능은 있지만 신뢰도가 낮다

심각도: 중간

- 현재 가격 API는 네이버 쇼핑 HTML 파싱 기반이다
  - [prices route](/Users/slave2/ai/ainative/shopper/src/app/api/prices/route.ts#L10)
- 구조 변경에 취약하고 fallback도 약하다

추가 문제:
- 상세 시트는 `prices[0]`에 별 표시
  - [ProductDetailSheet.tsx](/Users/slave2/ai/ainative/shopper/src/components/ProductDetailSheet.tsx#L86)
- 하지만 최저가 기준은 `lowestPrice`

가이드:
- 가격 데이터는 ingestion 계층으로 분리하는 게 좋다
- UI에서는 “최저가 확인됨 / 미확인” 상태를 명확히 분리해야 한다

### 8. AI 점수 API는 제품 컨셉엔 맞지만 운영 방식은 불안하다

심각도: 중간

좋은 점:
- 제품명 + 강아지 프로필 + 기준으로 점수화한다는 발상은 정확히 맞다

문제:
- 실제 성분 수집과 점수 생성을 한 번에 프롬프트에 맡기고 있다
- 구조화 출력 보장이 약하다
- 근거 provenance가 없다

관련 파일:
- [score route](/Users/slave2/ai/ainative/shopper/src/app/api/score/route.ts#L42)

가이드:
- `제품 데이터 수집 -> 정규화 -> 점수 생성 -> 저장`으로 단계를 분리해야 한다
- 반려견 도메인은 성분/원재료/첨가물 오판 위험이 있어 근거 저장이 중요하다

### 9. 설정 시트는 제품 환상은 주지만 실제 운영 설정은 아니다

심각도: 중간

- 멤버십, 자동승인, 알림, 주문 히스토리 카드가 있다
  - [SettingsSheet.tsx](/Users/slave2/ai/ainative/shopper/src/components/SettingsSheet.tsx#L13)

문제:
- 제품의 코어가 안정되기 전에 너무 이른 운영 메뉴다
- 실제 값도, 상태도, 행동도 없다

가이드:
- MVP 단계에서는 설정 시트보다
  - 기준 편집
  - 회피 원재료
  - 예산
  - 선호 쇼핑몰
  - 알림 빈도
  정도의 핵심 항목부터 살아 있어야 한다

### 10. 디자인 톤은 대체로 맞지만 일부 표현은 아직 가볍다

심각도: 낮음

- 전문 리포트형을 지향하면서 일부 이모지 버튼이 남아 있다
  - [ProfileBar.tsx](/Users/slave2/ai/ainative/shopper/src/components/ProfileBar.tsx#L27)
  - [ScoreCard.tsx](/Users/slave2/ai/ainative/shopper/src/components/ScoreCard.tsx#L121)

치명적이진 않지만:
- 지금 서비스 포지셔닝이 `강아지용 영양학 리포트`라면 이모지는 줄이는 편이 낫다

## Strategic Assessment

이 프로젝트는 잘못된 방향이 아니다.

오히려 구조만 보면 꽤 정확하게 이걸 만들고 있다:
- `Yuka의 점수화`
- `Olive의 개인화`
- `dog domain adaptation`

문제는 세 가지다:

1. 빌드가 안 된다
2. 데이터가 안 이어진다
3. 개인화 깊이가 아직 얕다

즉, 지금 필요한 건 전면 피벗이 아니라 `제품 골격을 실제 서비스로 만드는 작업`이다.

## Recommended Fix Order

### Phase 1. 앱을 다시 띄우기

1. Tailwind가 raw HTML benchmark 파일을 읽지 않게 분리
2. `build`, `typecheck`, `lint`를 clean 상태에서 통과시키기
3. 홈 화면이 실제로 렌더링되게 복구

### Phase 2. 진짜 온보딩 만들기

1. 기본 진입을 온보딩으로 전환
2. 알러지, 회피 성분, 브랜드 선호, 예산, 건강 목표 추가
3. 온보딩 결과가 실제 criteria로 이어지게 연결

### Phase 3. 점수 시스템 실제화

1. 제품 정보 수집 분리
2. 점수 API 구조화
3. 근거 저장
4. 대체품 추천 추가

### Phase 4. 피드백 루프 완성

1. 피드백 저장
2. dislike reason 구조화
3. 기준 가중치/회피 브랜드 갱신
4. 다음 추천에 반영

### Phase 5. 가격/구매 계층 안정화

1. 가격 데이터 정렬/강조 로직 정리
2. fallback 상태 UI 추가
3. 추후 공식 API 또는 안정적 수집 계층으로 교체

## Bottom Line

`PawAgent = Yuka/Olive for dog`라는 전제로 보면, 현재 코드는 방향이 맞다.

하지만 지금 평가는 이렇게 내릴 수 있다:

- 제품 컨셉 정합성: 좋음
- UX 골격: 좋음
- 개인화 깊이: 보통 이하
- 데이터 연결: 낮음
- 운영 안정성: 낮음
- 현재 실행 가능성: 낮음

가장 좋은 다음 단계는 `기획 재정의`가 아니라 `제품화 1차 정리`다.
