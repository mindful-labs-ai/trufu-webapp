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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.