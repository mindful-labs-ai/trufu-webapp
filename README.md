# Trufu AI Chatbot Web Application

A modern, responsive AI chatbot interface built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🚀 **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 💬 **Clean Chat Interface**: Intuitive chatbot UI with message history
- 🎨 **Modern UI/UX**: Beautiful gradients and smooth animations
- 📁 **Clean Architecture**: Well-organized codebase following best practices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Next.js built-in (Turbopack in dev)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd trufu-webapp
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable components
│   ├── chat/           # Chat-related components
│   └── ui/             # Basic UI components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Features Overview

### Chat Interface

- Real-time message rendering
- User and AI message differentiation
- Typing indicators
- Responsive design for all screen sizes

### Sidebar Navigation

- Chat history
- New chat functionality
- Collapsible on mobile
- User profile section

### Clean Architecture

- Separation of concerns
- Reusable components
- Type-safe with TypeScript
- Scalable folder structure

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### AI Integration

Replace the simulated responses in `ChatContainer.tsx` with your AI service integration.

## 🚀 배포 가이드

### 🎯 한 번에 배포하기

프로젝트 루트에서 배포 스크립트를 실행하세요:

```bash
./deploy.sh
```

### 📋 배포 전 체크리스트

- [ ] `.env.local` 파일에 모든 환경 변수 설정
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] OpenAI API 키 발급
- [ ] 코드 빌드 테스트 (`pnpm build`)

### 🟢 Vercel 배포 (추천)

**무료 플랜**: 100GB 대역폭/월, 자동 HTTPS, 글로벌 CDN

1. **자동 배포** (GitHub 연동):
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mindful-labs-ai/Trufu)

2. **수동 배포**:

   ```bash
   # Vercel CLI 설치
   npm i -g vercel

   # 로그인
   vercel login

   # 배포
   vercel --prod
   ```

3. **환경 변수 설정**:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - `.env.local`의 모든 변수를 Production 환경에 추가

### 🔵 Netlify 배포

**무료 플랜**: 100GB 대역폭/월, 폼 처리, 서버리스 함수

1. [netlify.com](https://netlify.com)에서 계정 생성
2. "New site from Git" 클릭
3. GitHub 저장소 연결
4. **빌드 설정**:
   ```
   Build command: pnpm build
   Publish directory: out
   ```
5. **환경 변수**: Site settings → Environment variables에서 설정

### 🟣 Railway 배포

**무료 플랜**: $5 크레딧/월

1. [railway.app](https://railway.app)에서 계정 생성
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. **환경 변수**: Variables 탭에서 설정
5. 자동 배포 완료

### 🐳 Docker 배포

로컬 또는 클라우드 서버에서 Docker 컨테이너로 실행:

```bash
# 이미지 빌드
docker build -t trufu-webapp .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local trufu-webapp

# 접속
open http://localhost:3000
```

### ☁️ 클라우드 서비스별 가이드

| 서비스      | 무료 한도         | 장점                      | 추천도     |
| ----------- | ----------------- | ------------------------- | ---------- |
| **Vercel**  | 100GB/월          | Next.js 최적화, 자동 배포 | ⭐⭐⭐⭐⭐ |
| **Netlify** | 100GB/월          | 간편함, 폼 처리           | ⭐⭐⭐⭐   |
| **Railway** | $5 크레딧/월      | 데이터베이스 포함         | ⭐⭐⭐     |
| **Heroku**  | 1000 dyno 시간/월 | 다양한 애드온             | ⭐⭐       |

### 🔧 배포 후 설정

1. **커스텀 도메인** 연결 (각 플랫폼에서 지원)
2. **HTTPS** 자동 설정됨
3. **모니터링** 설정:
   - Vercel Analytics
   - Sentry (에러 추적)
   - LogRocket (사용자 세션 녹화)

### 🔍 배포 트러블슈팅

**빌드 에러**:

```bash
# 로컬에서 빌드 테스트
pnpm build

# 타입 에러 확인
pnpm type-check

# 린트 에러 확인
pnpm lint
```

**환경 변수 에러**:

- 모든 `NEXT_PUBLIC_` 변수가 설정되었는지 확인
- 민감한 정보는 서버 사이드 변수로 설정

**Supabase 연결 에러**:

- URL과 ANON KEY가 정확한지 확인
- RLS 정책이 올바르게 설정되었는지 확인

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_SCRIPT_API_KEY=your_openai_script_api_key
OPENAI_IMAGE_API_KEY=your_openai_image_api_key

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key

# Other APIs
KLING_ACCESS_KEY=your_kling_access_key
KLING_SECRET_KEY=your_kling_secret_key
KLING_BASE_URL=https://api-singapore.klingai.com
SEEDANCE_API_KEY=your_seedance_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Production Considerations

- **Environment Variables**: Never commit API keys to version control
- **Build Optimization**: Next.js automatically optimizes for production
- **Domain**: Configure custom domain in your hosting provider
- **Analytics**: Consider adding analytics (Vercel Analytics, Google Analytics)
- **Monitoring**: Set up error monitoring (Sentry, LogRocket)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.
