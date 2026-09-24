# Replit.md - Maintenance Fault System

## Overview

This is a full-stack maintenance fault management system built with React, Express, and PostgreSQL. The application allows users to create, track, and manage maintenance fault records with role-based access control and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and build process
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Session-based authentication with role-based access control
- **API Design**: RESTful API with proper error handling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for database connectivity

## Key Components

### Authentication System
- Session-based authentication with httpOnly cookies
- Role-based access control (admin, editor, viewer)
- Protected routes with middleware
- Activity logging for audit trails

### Fault Management
- Create, read, update, delete fault records
- Auto-complete functionality for common fields
- Status tracking (open, in_progress, resolved, closed)
- Search and filtering capabilities
- Export functionality for reports

### User Management
- User creation and management (admin only)
- Role assignment and permissions
- User activity tracking
- Active/inactive user status

### Reporting System
- Statistical dashboard with fault metrics
- Export capabilities (Excel/PDF)
- Filtering by date, location, status
- Activity logs and audit trails

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **Authentication**: Express middleware validates session and permissions
3. **API Processing**: Routes handle business logic and data validation
4. **Database Operations**: Drizzle ORM executes type-safe database queries
5. **Response**: JSON responses sent back to client with proper error handling
6. **State Management**: TanStack Query manages cache and synchronization

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui
- **Form Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL)
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod schemas shared between client and server
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **Code Quality**: ESLint and Prettier (implied by structure)
- **Environment**: Replit-specific plugins for development

## Deployment Strategy

### Production Build
- Client: Vite builds static assets to `dist/public`
- Server: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session secret via `SESSION_SECRET` environment variable
- Node environment detection for production/development modes

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── dist/           # Production build output
```

### Key Architectural Decisions

1. **Shared Schema**: Zod schemas in `/shared` ensure type safety between client and server
2. **Session Authentication**: Chosen over JWT for simplicity and security
3. **Role-Based Access**: Three-tier permission system (viewer, editor, admin)
4. **Auto-complete System**: Database-driven suggestions with usage tracking
5. **Audit Logging**: Comprehensive activity tracking for compliance
6. **Export Functionality**: Client-side generation for better performance

This architecture provides a scalable, maintainable system for managing maintenance faults with proper security, validation, and user experience considerations.