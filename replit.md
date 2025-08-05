# Symera - Event Management Platform with AI

## Overview

Symera is an intelligent event management platform designed to streamline team collaboration through sophisticated task management and financial planning. The application features AI-assisted planning, real-time collaborative task management, budget tracking, vendor management, and a mobile-first responsive design. It supports multiple event types including weddings, birthdays, corporate events, conferences, and more.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **React SPA**: Built with React 18+ using functional components and hooks
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod schema validation
- **Animations**: Framer Motion for smooth transitions and micro-interactions

### Backend Architecture
- **Express.js**: RESTful API server with middleware-based architecture
- **Authentication**: Replit Auth integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL store
- **File Uploads**: Multer middleware for document and image handling
- **API Design**: Resource-based endpoints with consistent error handling

## Key Components

### Authentication System
- **Replit Auth Integration**: OAuth2-based authentication using Replit's identity provider
- **Session Management**: Persistent sessions stored in PostgreSQL
- **Authorization**: Role-based access control for events and teams
- **Development Mode**: Optional auto-login for development environments

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection Pooling**: Optimized Neon serverless connection management
- **Error Handling**: Retry mechanisms for rate-limited operations
- **Caching**: Memory-based caching layer for frequently accessed data

### Event Management
- **Multi-type Support**: Weddings, corporate events, workshops, conferences
- **AI-Generated Tasks**: OpenAI integration for intelligent task generation
- **Team Collaboration**: Multi-user event management with role permissions
- **Status Tracking**: Event lifecycle management (planning → confirmed → in-progress → completed)

### Task System
- **Multiple Assignees**: Support for multiple users per task
- **Priority Levels**: High, medium, low priority classification
- **Status Workflow**: Todo → In Progress → Completed
- **Due Date Management**: Automatic deadline calculation based on event dates

### Financial Management
- **Budget Planning**: Event budget allocation and tracking
- **Expense Tracking**: Real-time expense recording against budget items
- **Vendor Management**: Supplier contact and service tracking
- **Cost Analysis**: Budget vs actual spending reports

## Data Flow

### User Authentication
1. User initiates login through Replit Auth
2. OAuth callback validates user credentials
3. User session created and stored in PostgreSQL
4. Frontend receives authentication status via API

### Event Creation
1. User submits event form with validation
2. AI generates relevant task checklist based on event type
3. Database transaction creates event, tasks, and initial team member
4. Real-time updates notify other team members

### Task Management
1. Tasks displayed with filtering and sorting options
2. Status updates trigger database writes and cache invalidation
3. Activity logs record all task changes
4. Team members receive notifications for relevant updates

### File Management
1. Files uploaded to public/uploads directory
2. File metadata stored in database with event association
3. Public URLs generated for client access
4. Background cleanup for orphaned files

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless
- **@radix-ui/**: Headless UI components for accessibility
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **express**: Node.js web framework
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Optional Integrations
- **OpenAI API**: AI-powered task generation (requires API key)
- **Replit Infrastructure**: Hosting and database provisioning

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native support for Replit development environment
- **Hot Module Replacement**: Instant code updates during development
- **Database Provisioning**: Automatic PostgreSQL setup via Replit

### Production Build
- **Frontend**: Vite builds optimized bundle to dist/public
- **Backend**: ESBuild compiles server code to dist/index.js
- **Static Assets**: Served directly by Express in production
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key
- **OPENAI_API_KEY**: Optional for AI features
- **NODE_ENV**: Environment detection for optimizations

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 5, 2025 - Critical TypeScript Error Resolution
- **Server Stability Fix**: Eliminated all 81 TypeScript/LSP compilation errors
- **Authentication Patterns**: Standardized user access across all routes (`req.user!.claims?.sub || req.user!.id`)
- **Schema Corrections**: Fixed undefined schema references (`insertBudgetItemSchema` → `insertExpenseSchema`)
- **Variable Scope**: Resolved undefined variable references in upload and participant routes
- **Storage Interface**: Corrected method calls throughout application (`storage` → `dbStorage`)
- **Type Safety**: Enhanced error handling and validation in all API endpoints

### Previous Financial System Updates
- **Expense Synchronization**: Fixed calculation inconsistencies between interface sections
- **Auto-Recalculation**: Implemented automatic updates of events.expenses field
- **Database Integrity**: Added synchronization across all expense operations (POST, PUT, DELETE)
- **Cache Design**: Events.expenses field now serves as auto-updating financial cache

## Changelog

- August 5, 2025: Critical server stability and TypeScript error resolution
- June 13, 2025: Initial setup