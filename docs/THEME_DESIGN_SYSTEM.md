# Trufu Webapp 디자인 시스템 스냅샷

이 문서는 **현재 Tailwind v4 토큰 체계**가 UI에 어떻게 연결되어 있는지를 정리한 것입니다.  
**`src/app/globals.css` 한 파일만 수정**하면, 앱 전체 색상을 손쉽게 바꿀 수 있어요.

---

## 1. 팔레트 토큰(기본 색상)

모든 색상 유틸리티는 `src/app/globals.css`에 선언된 **CSS 변수**를 따릅니다.  
**라이트/다크 테마 블록의 `*-base` 값을 바꾸면** 앱 분위기가 통째로 바뀝니다.

| 토큰                                    | 라이트 기본값 | 다크 기본값  | 용도 / 설명                                      |
| --------------------------------------- | ------------- | ------------ | ------------------------------------------------ |
| `--bg-base` → `bg-background`           | `#f9fafb`     | `#0f172a`    | 앱 바탕, 채팅 화면 기본 배경                     |
| `--fg-base` → `text-foreground`         | `#111827`     | `#e5e7eb`    | 앱 전반의 본문 텍스트                            |
| `--card-base` → `bg-card`               | `#ffffff`     | `#111827`    | 헤더, 카드, 모달 배경                            |
| `--muted-base` → `bg-muted`             | `#f3f4f6`     | `#1f2937`    | 서브 배경, 호버, 보조 면                         |
| `--primary-base` → `bg-primary`         | `#2563eb`     | `#60a5fa`    | 전송 버튼, 링크/CTA, 내 말풍선                   |
| `--primary-soft` / `--primary-strong`   | 파생          | 파생         | `soft`: 배경/칩, `strong`: 호버/활성 톤          |
| `--secondary-base` → `bg-secondary`     | `#8b5cf6`     | `#a78bfa`    | 보조 강조(그라디언트, 배지)                      |
| `--accent-base` → `bg-accent`           | `#06b6d4`     | `#22d3ee`    | 보조 버튼 호버, 추가 포인트                      |
| `--tertiary-base` → `bg-tertiary`       | `#10b981`     | `#34d399`    | 선택/토글 강조, 사이드바 선택                    |
| `--tertiary-soft` / `--tertiary-strong` | 파생          | 파생         | `soft`: 선택 카드 배경, `strong`: 다크 토글 트랙 |
| `--destructive-base` → `bg-destructive` | `#dc2626`     | `#ef4444`    | 위험/에러 배너, 삭제 등                          |
| `--border-base` → `border-border`       | `#e5e7eb`     | `color-mix`  | 카드 외곽, 구분선                                |
| `--input-base` → `border-input`         | `#d1d5db`     | `color-mix`  | 입력창 테두리                                    |
| `--ring-base` → `ring-primary`          | `#3b82f6`     | `#60a5fa`    | 포커스 링(초점 표시)                             |
| 사이드바(`--sidebar-*`)                 | `#ffffff` 등  | `#111827` 등 | 사이드바 배경/텍스트/테두리                      |

> **참고:** `*-soft`, `*-strong` 같은 보조 색은 `@theme inline`에서 자동으로 섞어서 만들어 줍니다.  
> 기본값(예: `--primary-base`)만 바꿔도 나머지가 알아서 맞춰져요.

---

## 2. 컴포넌트별 색상 사용

### 전역 표면

- `<body>`: `bg-background text-foreground`
- 다크 모드는 레이아웃의 `ThemeProvider`로 자동 전환됩니다.

### 사이드바

- 껍데기: `bg-sidebar`, `border-sidebar-border`, `text-sidebar-foreground`
- 선택된 행: `bg-tertiary-soft`, `border-tertiary-border`, `ring-tertiary`
- 아이템 호버: `hover:bg-muted`

### 헤더 바

- 배경/테두리: `bg-card border-border`
- 사용자 아바타: 그라디언트 `from-primary to-secondary`
- 토글: 트랙 `bg-accent-soft`(라이트) / `bg-tertiary-strong`(다크)

### 채팅 화면

- 캔버스: `bg-background`
- 말풍선: 내 메시지 `bg-primary text-primary-foreground`, 상대 메시지 `bg-muted text-foreground`
- 타임스탬프: 보조 톤(`text-muted-foreground` 등)

### 입력창 & 버튼

- 채팅 입력: `border-input bg-background`, 포커스 `ring-primary`
- 주요 버튼: `bg-primary` + `hover:bg-primary-strong`

### 인증/설정 페이지

- 배경 그라디언트: `from-primary-soft to-secondary-soft`
- 카드: `bg-card`

### 상태/피드백

- 로딩 스피너: 상단 보더에 `border-t-primary`
- 날짜 구분칩: `bg-muted` + `border-border`

### 공유 그라디언트

- 아바타/빈 상태/강조 바: `from-primary to-secondary`

---

## 3. 자주 재사용하는 토큰 묶음

| 토큰 / 변형                              | 같이 쓰는 곳                        |
| ---------------------------------------- | ----------------------------------- |
| `bg-primary` + `hover:bg-primary-strong` | 전송/제출 버튼, 주요 CTA            |
| `bg-primary-soft`                        | 배경 칩, 그라디언트 출발점          |
| `bg-tertiary-soft`                       | 사이드바 선택, 배지                 |
| `bg-muted`                               | 보조 면, 상대 메시지, 스켈레톤 로딩 |
| `text-muted-foreground`                  | 설명/부가 텍스트                    |
| `border-border` / `border-input`         | 카드 외곽, 구분선, 입력창           |
| `ring-primary`                           | 포커스 표시(버튼/입력 공통)         |
| `from-primary to-secondary`              | 아바타/히어로/최대 레벨 강조        |

---

## 4. 팔레트 바꾸기(실전 6단계)

1. **`src/app/globals.css`** 파일을 엽니다.
2. **`:root` 블록**에서 라이트 테마의 `--primary-base`, `--secondary-base`, `--accent-base`, `--tertiary-base` 등 **헥스값을 원하는 색으로 변경**합니다.
3. **`.dark` 블록**에서 다크 테마용 같은 항목들을 **짝으로 변경**합니다.
4. 필요하면 `--muted-base`, `--border-base`, `--sidebar-*`도 조정해 전체 톤을 더 바꿔도 됩니다.
5. `@theme inline`이 `*-soft`/`*-strong` 같은 파생 색을 **자동 생성**하므로, 기본값만 바꿔도 됩니다.
6. 저장 후 새로고침하면, Tailwind 클래스(`bg-primary`, `text-muted-foreground` 등)를 쓰는 **모든 컴포넌트가 즉시 새로운 팔레트**를 반영합니다.

> **팁(가독성/접근성):**
>
> - 본문 대비: `--bg-base` ↔ `--fg-base`가 **최소 4.5:1** 대비가 되면 좋아요.
> - 버튼도 배경 ↔ 글자색(`--color-*-foreground`) 대비가 충분해야 합니다.

---

## 5. 어드민 부분

- 통계/차트 화면이 아직 Tailwind 기본 색(`bg-blue-50` 같은 값)을 직접 사용하는 곳도 있습니다.

---

대부분의 UI 컴포넌트가 이미 이 **공통 색상어휘**를 공유하고 있어 손쉽게 전체 분위기를 바꿀 수 있습니다.
