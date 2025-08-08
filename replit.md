# WorkoutsWithJavier - Workout Tracking Application

## Overview

WorkoutsWithJavier is a workout tracker application designed for personal trainers to manage client workouts. The primary use case is to display clients' previous performance data (sets, reps, weights) during workout sessions to guide progression and maintain consistency. The application features a React frontend with a Node.js/Express backend, utilizing PostgreSQL with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication preferences: No login system needed - personal use only. Clients access workouts via shareable links without accounts.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route organization
- **Error Handling**: Centralized error handling middleware
- **Session Management**: Express sessions with PostgreSQL storage
- **Build Process**: esbuild for server bundling, separate from client build

### Authentication System
- **Status**: No authentication required (removed per user request)
- **Access**: Direct access to trainer dashboard without login
- **Client Access**: Public workout links for clients to input data without accounts
- **Fixed User**: System operates with fixed trainer ID "trainer-1" (Javier)

### Database Design
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Key Entities**: 
  - Users (trainers) with Replit Auth integration
  - Clients with contact information and notes
  - Exercises with categories and instructions
  - Workout templates linking clients to exercise routines
  - Workouts and sets for tracking performance history
  - Shared workout links for client access

### File Structure
- **Monorepo Layout**: Client, server, and shared code in separate directories
- **Shared Code**: Common schemas and types in `/shared` directory
- **Client**: React application in `/client` with component-based architecture
- **Server**: Express application in `/server` with modular route structure
- **Configuration**: TypeScript paths for clean imports and alias resolution

### Development Environment
- **Build System**: Vite for client development with HMR
- **Development Server**: Concurrent client and server development
- **Error Handling**: Runtime error overlay for development debugging
- **Replit Integration**: Cartographer plugin for Replit-specific features

## External Dependencies

### Core Framework Dependencies
- **Frontend**: React, React DOM, Vite for build tooling
- **Backend**: Express.js, Node.js with TypeScript support
- **Database**: Neon PostgreSQL serverless, Drizzle ORM and Drizzle Kit

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icons, Font Awesome for additional icons
- **Fonts**: Google Fonts (Roboto) integration



### Data Management
- **Client State**: TanStack React Query for server state management
- **Form Validation**: Zod for schema validation, integrated with Drizzle
- **Form Handling**: React Hook Form with Hookform resolvers

### Development and Build Tools
- **TypeScript**: Full TypeScript support across client and server
- **Build Tools**: esbuild for server bundling, Vite for client
- **Development**: tsx for TypeScript execution, concurrent development servers
- **Utilities**: clsx and tailwind-merge for conditional styling, date-fns for date manipulation

### Replit-Specific Integrations
- **Development**: Replit Vite plugins for enhanced development experience
- **Error Handling**: Runtime error modal for development debugging
- **Deployment**: Replit-optimized build and deployment configuration