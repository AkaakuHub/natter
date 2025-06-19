# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## docs place
please save docs in the `docs/` directory.

## Project Overview

Natter is a full-stack social media application with a Next.js frontend and NestJS backend. The project uses a monorepo structure with pnpm workspaces.

## Architecture

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Twitter OAuth
- **UI**: Tailwind CSS with custom components using shadcn/ui patterns
- **State Management**: Zustand for layout navigation state
- **Mobile UX**: Swiper.js for mobile-first navigation patterns

### Backend (NestJS + TypeScript)
- **Framework**: NestJS 11.x with modular architecture
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom PASSKEY-based authentication system
- **API**: RESTful endpoints with DTO validation

### Key Architectural Patterns

**Frontend Navigation System**: The app uses a sophisticated mobile-first navigation built with Swiper.js and Zustand state management. The `useLayout.tsx` store manages navigation history as a stack, enabling complex back/forward behaviors across different views.

**Backend Module Structure**: Each feature area (auth, users, server) is encapsulated in its own NestJS module with controller/service/module pattern. The `PrismaService` is injected across modules for database access.

**Authentication Flow**: Frontend uses NextAuth.js for Twitter OAuth, while backend uses a separate PASSKEY system for API authentication via the `/check-server` endpoint.

## Common Commands

### Development
```bash
# Run both frontend and backend
pnpm run dev

# Run frontend only
pnpm run dev:frontend

# Run backend only  
cd backend && pnpm run start:dev
```

### Backend Commands
```bash
# From backend directory
pnpm run build                    # Build NestJS application
pnpm run start:dev               # Development server with hot reload
pnpm run test                    # Run unit tests
pnpm run test:e2e               # Run end-to-end tests
pnpm run test:cov               # Test coverage

# Database operations
pnpm prisma generate            # Generate Prisma client
pnpm prisma migrate deploy      # Apply migrations
pnpm prisma db seed            # Seed database
pnpm prisma studio             # Open database browser
```

### Frontend Commands  
```bash
# From frontend directory
pnpm run build                  # Build Next.js application
pnpm run dev                   # Development server
pnpm run lint                  # ESLint check
pnpm run knip                  # Find unused dependencies/exports
```

## Environment Setup

### Backend Environment (.env in backend/)
```env
PASSKEY=keyword string
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="file:./dev.db"
```

### Frontend Environment (NextAuth.js)
Requires Twitter OAuth credentials for authentication to work.

## Database Schema

The application uses a simple User/Post relationship:
- **User**: id, email, name, tel (optional)  
- **Post**: id, title, content, published, authorId

## Frontend Component Architecture

### Layout System
- `BaseLayout.tsx`: Main responsive layout with Swiper navigation
- `useLayout.tsx`: Zustand store for navigation state management
- `useNavigation.ts` & `useSwiper.ts`: Custom hooks for navigation logic

### Key Components
- `Profile/`: Tabbed profile view with posts/media/likes
- `TimeLine/`: Main feed component
- `DetailedPost/`: Single post view
- `layout/hooks/`: Navigation and Swiper management

### Data Flow
Frontend uses mock data from `src/data/mockData.ts` for development. The layout system maintains a navigation stack to enable iOS-like back navigation across different app sections.

## Backend API Structure

### Endpoints
- `POST /check-server`: PASSKEY authentication
- `GET /users`: Retrieve all users

### Module Organization
- **AuthModule**: PASSKEY authentication guard
- **UsersModule**: User management with Prisma integration  
- **ServerModule**: Server health/authentication checks
- **PrismaModule**: Database service provider

## Testing Strategy

Backend uses Jest for unit testing and Supertest for E2E API testing. Frontend testing setup is minimal - consider expanding test coverage for complex navigation logic and authentication flows.