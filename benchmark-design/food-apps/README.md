# Food Ingredient Apps Benchmark

기준일: 2026-03-26

이 폴더는 사람 대상 음식 성분 평가 앱 벤치마크용 수집물이다. 이번 수집 대상은 `Yuka`와 `Olive`이며, 원본 HTML/JSON과 실제 브라우저 렌더링 스크린샷을 함께 저장했다.

## Snapshot

| App | Positioning | Current iOS version | Last release date | Rating / reviews | Personalization |
|---|---|---:|---|---|---|
| Yuka | 대중형 식품/화장품 스캐너, 100점 점수 중심 | 4.82 | 2026-03-23 | 4.82 / 89,334 | 낮음. 핵심은 공통 점수 체계 |
| Olive | Yuka 대안, 가족 건강/독성/알러지/대체품 강조 | 2.20.0 | 2026-03-24 | 4.82 / 23,483 | 높음. 식이 기준과 가족 관점 강조 |

## What Was Saved

- `sources/yuka-official.html`: Yuka 공식 사이트 스냅샷
- `sources/yuka-appstore.json`: Yuka App Store 메타데이터
- `sources/yuka-appstore.html`: Yuka App Store 페이지 HTML
- `sources/yuka-pageflows.html`: Yuka Page Flows HTML
- `sources/olive-official.html`: Olive 공식 사이트 스냅샷
- `sources/olive-appstore.json`: Olive App Store 메타데이터
- `sources/olive-appstore.html`: Olive App Store 페이지 HTML
- `screenshots/yuka-appstore-desktop.png`: 실제 브라우저 캡처
- `screenshots/yuka-pageflows-desktop.png`: 실제 브라우저 캡처
- `screenshots/yuka-official-mobile.png`: 실제 브라우저 캡처
- `screenshots/olive-appstore-desktop.png`: 실제 브라우저 캡처
- `screenshots/olive-official-mobile.png`: 실제 브라우저 캡처

## UX Notes

### Yuka

- 앱스토어 설명 기준으로 `scan -> score -> explanation -> healthier alternatives` 구조가 매우 명확하다.
- 공식 사이트와 앱스토어 모두 `100% independent`, `no ads`, `objective criteria`를 강하게 전면에 둔다.
- 식품 평가는 `nutritional quality`, `presence of additives`, `organic aspect` 3축이다.
- Page Flows에서 `Onboarding`과 `Scanning products` 플로우가 공개되어 있어, 실제 진입 흐름 분석이 쉽다.
- 벤치마크 포인트는 `점수 가독성`, `즉시 신뢰 형성`, `대체품 추천 전환`이다.

### Olive

- 앱스토어 설명과 공식 사이트 모두 `family safety`, `toxins`, `allergens`, `healthier alternatives`를 핵심 가치로 민다.
- 공개 문구상 개인화 강도가 Yuka보다 높다. `dietary needs`, `vegan`, `gluten-free`, `allergy-sensitive` 같은 기준을 전면에 둔다.
- 공식 사이트는 `200,000 users`, `1 million products`, `10,000 healthy-fats restaurants`를 주장한다.
- 평가 설명은 `additives`, `seed oils`, `processing level`, `detected toxins`, `lab-tested data` 같은 확장 프레임을 사용한다.
- 벤치마크 포인트는 `개인 기준 입력`, `가족 단위 안심`, `위험 성분을 서사적으로 설명하는 방식`이다.

## How To Capture Current Onboarding / UX

### Immediate sources

- `Page Flows`: Yuka는 공개 인덱스에서 `Onboarding`과 `Scanning products` 흐름이 확인된다.
- `App Store`: 둘 다 현재 스크린샷과 설명 텍스트를 확인할 수 있다.
- `Official site`: Olive는 공식 사이트가 현재 메시지와 핵심 화면을 잘 보여준다.

### Practical method

1. App Store HTML에서 스크린샷 URL을 추출한다.
2. Page Flows에서 흐름명을 확인하고 썸네일/비디오를 확보한다.
3. Playwright로 실제 페이지를 렌더링해 PNG로 보관한다.
4. 필요하면 실제 앱 설치 후 온보딩을 직접 녹화해 비교표를 만든다.

## Design Takeaways For This Project

- `Yuka`에서 가져올 것: 단일 숫자 점수의 즉시 이해성, 스캔 직후 결과 구조, 건강한 대안 추천 CTA.
- `Olive`에서 가져올 것: 사용자 기준 입력, 가족/민감성/회피성분에 맞춘 개인화 프레이밍.
- 두 앱 모두 참고하되, 우리 제품은 `내 기준으로 왜 좋은지`를 더 명확히 설명해야 차별화된다.
- 추천 방향은 `Yuka의 간결한 score UI + Olive의 개인화 onboarding` 조합이다.

## Source URLs

- https://yuka.io/en/
- https://apps.apple.com/us/app/yuka-food-cosmetic-scanner/id1092799236
- https://pageflows.com/ios/products/yuka/
- https://www.oliveapp.com/
- https://apps.apple.com/us/app/olive-holistic-food-scanner/id6739765789
- https://itunes.apple.com/lookup?id=1092799236&country=us
- https://itunes.apple.com/lookup?id=6739765789&country=us
