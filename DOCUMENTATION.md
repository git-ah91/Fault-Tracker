# Maintenance Fault Tracker — Documentation & Deployment Manual

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation & Local Setup](#installation--local-setup)
6. [Deployment Manual](#deployment-manual)
   - [Local Production](#local-production)
   - [Replit (Cloud)](#replit-cloud)
   - [Render.com](#rendercom)
   - [Railway.app](#railwayapp)
   - [VPS / Self-Hosted](#vps--self-hosted)
7. [Configuration](#configuration)
8. [Default Credentials](#default-credentials)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Troubleshooting](#troubleshooting)

---

## Overview

**Maintenance Fault Tracker** is a full-stack web application for managing, tracking, and reporting maintenance faults in industrial or facility environments. It supports role-based access control, activity auditing, auto-complete suggestions, and exportable reports (Excel/PDF).

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** In-memory storage by default (zero-config); PostgreSQL available via Drizzle ORM
- **Auth:** Session-based with httpOnly cookies, three roles (admin / editor / viewer)

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│         React SPA  (client/ → dist/)            │
│   Routing: Wouter   State: TanStack Query       │
└──────────────┬──────────────────────────────────┘
               │ HTTP (port 5000)
┌──────────────▼──────────────────────────────────┐
│              Express Server                      │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  API Routes  │  │ Static Files │             │
│  │  (routes.ts) │  │  (Vite dist)  │             │
│  └──────┬───────┘  └──────────────┘             │
│         │                                        │
│  ┌──────▼──────────────────────────────────┐   │
│  │          Storage Layer                   │   │
│  │  IStorage interface                      │   │
│  │  ├─ MemStorage (default, in-memory)     │   │
│  │  └─ PgStorage (optional, PostgreSQL)    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Frontend Architecture

| Concern | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Server state | TanStack Query (React Query) v5 |
| Client routing | Wouter v3 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Charts | Recharts |
| PDF export | jsPDF + jsPDF-AutoTable |
| Excel export | SheetJS (xlsx) |

### Backend Architecture

| Concern | Technology |
|---|---|
| Runtime | Node.js 20 (Express) |
| Language | TypeScript (tsx for dev, esbuild for prod) |
| ORM | Drizzle ORM (type-safe, PostgreSQL-ready) |
| Sessions | express-session + connect-pg-simple (or memorystore) |
| Auth | Passport.js with passport-local strategy |
| Validation | Zod (shared schemas between client/server) |

---

## Features

### Authentication & Authorization
- Session-based login with httpOnly cookies
- Three roles with granular permissions:
  - **Admin** — full access: user management, all CRUD, reports, settings
  - **Editor** — create/edit/delete fault records, view reports
  - **Viewer** — read-only access to fault records and dashboard

### Fault Management
- Create fault records with fields: equipment type, location, classification, status, description, reporter, repair time, etc.
- Status workflow: `open` → `in_progress` → `resolved` → `closed`
- Search across description, equipment, location, reporter
- Filter by status and location
- Auto-incrementing fault IDs

### Auto-Complete System
- Categories: `equipmentType`, `location`, `equipmentClassification`, `relevantState`
- Usage-count tracking — most-used values rise to the top
- New values auto-added on first use

### Activity Logging & Audit Trail
- Every create/update/delete action is logged with timestamp and user
- Activity log viewable by admins
- Per-user activity history

### Reporting & Export
- Dashboard with fault statistics: total, open, resolved, average repair time
- Export to **PDF** (via jsPDF) and **Excel** (via SheetJS)
- Filter by date range, location, status

### User Management (Admin Only)
- Create, edit, deactivate users
- Assign roles
- View all users and their activity

---

## Project Structure

```
MaintenanceFaultTracker/
├── client/                  # React frontend
│   ├── index.html
│   └── src/                 # React components, pages, hooks
├── server/                  # Express backend
│   ├── index.ts             # Entry point — boots Express + routes
│   ├── routes.ts            # All API route definitions
│   ├── storage.ts           # IStorage interface + MemStorage impl
│   └── vite.ts              # Vite dev-server integration
├── shared/                  # Shared types & Zod schemas
│   └── schema.ts            # TypeScript types + Zod validation schemas
├── dist/                    # Production build output (generated)
├── drizzle.config.ts        # Drizzle Kit migration config
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite + esbuild configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # shadcn/ui component manifest
└── .replit                  # Replit deployment configuration
```

---

## Installation & Local Setup

### Prerequisites

- **Node.js** v20 or higher ([nodejs.org](https://nodejs.org))
- **npm** (bundled with Node.js)

### Step 1 — Install Dependencies

```bash
cd "C:/Users/pc/Desktop/MaintenanceFaultTracker"
npm install
```

This installs all dependencies from `package.json` including React, Express, Drizzle ORM, Radix UI, and dev tools.

### Step 2 — Run in Development Mode

```bash
npm run dev
```

The server starts on **http://localhost:5000**. Vite handles hot module replacement for the frontend; the Express server proxies API calls and serves static files in production mode.

### Step 3 — Access the Application

Open your browser to:

```
http://localhost:5000
```

Use the default credentials below to log in.

### Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Vite HMR (default) |
| `npm run build` | Build client (Vite) + bundle server (esbuild) into `dist/` |
| `npm start` | Run production build from `dist/index.js` |
| `npm run check` | Run TypeScript type checker |
| `npm run db:push` | Push Drizzle migrations to PostgreSQL (if configured) |

---

## Deployment Manual

### Local Production

Build and run the production bundle on your local machine.

```bash
cd "C:/Users/pc/Desktop/MaintenanceFaultTracker"

# 1. Install dependencies (if not already done)
npm install

# 2. Build the project
npm run build

# 3. Start the production server
npm start
```

The production server listens on **http://localhost:5000**. The `dist/` folder contains:
- `dist/index.js` — bundled Express server
- `dist/public/` — built React static assets (JS, CSS, index.html)

> **Data persistence:** In-memory storage resets on every restart. For persistent data, configure a PostgreSQL database (see Configuration below).

---

### Replit (Cloud)

The project was originally created on Replit and includes a pre-configured `.replit` deployment file. This is the easiest path if you want to go back to Replit.

#### Option 1 — Import Existing Replit Project
1. Log in at [replit.com](https://replit.com)
2. If the project still exists in your account, open it and click **Deploy** in the top toolbar
3. Choose deployment type:
   - **Autoscale** — scales automatically (paid, recommended for production)
   - **Static** — single always-on instance (paid)
4. Configure environment variables (see Configuration section)
5. Click **Deploy**

#### Option 2 — Deploy from GitHub
1. Push your code to a GitHub repository:
   ```bash
   cd "C:/Users/pc/Desktop/MaintenanceFaultTracker"
   git init
   git add .
   git commit -m "Initial commit"
   # Add your GitHub remote and push
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. On Replit, click **+** → **Import from GitHub**
3. Select your repository
4. Replit will detect the Node.js project and apply the `.replit` config
5. Go to **Deployments** → **Create Deployment**
6. Set environment variables and deploy

#### Replit Deployment Config (Already Present)

Your `.replit` file specifies:
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80
```

Replit handles HTTPS, custom domain (if added), and process management automatically.

---

### Render.com

Render offers a free tier for web services with automatic HTTPS.

#### Steps

1. **Push to GitHub** (if not already done — see Replit Option 2 above)

2. **Create a Web Service on Render**
   - Go to [render.com](https://render.com) → **New** → **Web Service**
   - Connect your GitHub account and select the repository
   - Fill in:
     - **Name:** `maintenance-fault-tracker`
     - **Region:** choose closest to your users
     - **Branch:** `main`
     - **Root Directory:** leave blank (project root)
     - **Runtime:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Instance Type:** Free (or Standard for production)

3. **Add Environment Variables**
   - In the **Environment** section, add:
     - `NODE_ENV` = `production`
     - `SESSION_SECRET` = a random 32+ character string
   - If using PostgreSQL, also add `DATABASE_URL`

4. **Deploy**
   - Click **Create Web Service**
   - Render builds and deploys; a `*.onrender.com` URL is assigned
   - First deploy may take 2-3 minutes

5. **Custom Domain (Optional)**
   - In Render dashboard → Settings → Custom Domain
   - Add your domain and follow DNS instructions

---

### Railway.app

Railway provides a simple deploy flow with a free trial.

#### Steps

1. **Push to GitHub** (see above)

2. **Create a Project on Railway**
   - Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
   - Select your repository
   - Railway auto-detects Node.js

3. **Configure Environment Variables**
   - In the project dashboard, go to **Variables**
   - Add:
     - `NODE_ENV` = `production`
     - `SESSION_SECRET` = random string

4. **Deploy**
   - Railway automatically builds and deploys on every push to `main`
   - Your app gets a `*.railway.app` URL

5. **Database (Optional)**
   - If using PostgreSQL, add a PostgreSQL service in Railway
   - Copy the connection URL and set it as `DATABASE_URL`

---

### VPS / Self-Hosted

Deploy to any Linux VPS (DigitalOcean, Hetzner, Linode, AWS EC2, etc.).

#### Prerequisites
- A VPS with Ubuntu/Debian (or similar)
- Node.js v20+ installed
- A domain name pointed to your server IP (optional, for custom URLs)
- Open port 5000 (or reverse-proxy port 80/443)

#### Deployment Steps

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Node.js (if not present)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone or upload your project
git clone <your-repo-url> maintenance-fault-tracker
cd maintenance-fault-tracker

# 4. Install dependencies and build
npm install
npm run build

# 5. Set environment variables (create a .env file or export them)
export NODE_ENV=production
export SESSION_SECRET="your-random-secret-here"
# export DATABASE_URL="postgresql://..."  # if using PostgreSQL

# 6. Start with PM2 (process manager)
npm install -g pm2
pm2 start dist/index.js --name maintenance-tracker
pm2 save
pm2 startup   # generates a systemd command to restore on reboot
```

#### Reverse Proxy with Nginx (Recommended)

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/maintenance-tracker

# Content:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable and reload
sudo ln -s /etc/nginx/sites-available/maintenance-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### HTTPS with Caddy (Simplest)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Caddyfile
echo "your-domain.com {
    reverse_proxy localhost:5000
}" | sudo tee /etc/caddy/Caddyfile

sudo systemctl reload caddy
```

Caddy auto-obtains and renews Let's Encrypt certificates.

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Set to `production` for production mode |
| `SESSION_SECRET` | **Yes (production)** | (none) | Secret key for session cookie signing. Generate with: `openssl rand -hex 32` |
| `DATABASE_URL` | No | (none) | PostgreSQL connection string. If unset, in-memory storage is used |
| `PORT` | No | `5000` | Server port (hardcoded to 5000 in `server/index.ts`) |

### Generating a Session Secret

```bash
# Linux/macOS/WSL
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Configuration

#### In-Memory (Default — No Configuration Needed)
The app ships with `MemStorage` as the default. All data is stored in RAM and lost on restart. No database setup required.

#### PostgreSQL (Optional — For Production Persistence)

1. Set up a PostgreSQL database (Neon, Render Postgres, Railway Postgres, or self-hosted)
2. Copy the connection string
3. Set `DATABASE_URL` environment variable
4. The `drizzle-orm` and `@neondatabase/serverless` packages are already installed
5. Update `server/storage.ts` to use the PostgreSQL storage implementation instead of `MemStorage`
6. Run `npm run db:push` to apply schema migrations

### Customizing Seed Data

Edit `server/storage.ts` → `MemStorage.seedData()` to change default users, auto-complete categories, and initial values.

---

## Default Credentials

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full access — user management, all CRUD, reports, settings |
| **Editor** | `editor` | `editor123` | Create/edit/delete fault records, view reports |
| **Viewer** | `viewer` | `viewer123` | Read-only — view fault records and dashboard |

> **Change these immediately** in production by editing `MemStorage.seedData()` or creating new users through the admin panel.

---

## API Reference

All API endpoints are under `/api`. The Express server on port 5000 serves both the API and the static frontend.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Log in with username + password. Sets httpOnly session cookie |
| `POST` | `/api/auth/logout` | Destroy session, redirect to login |
| `GET` | `/api/auth/me` | Get current user info (session-validated) |

**Login Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Fault Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/faults` | List all fault records (sorted newest first) |
| `GET` | `/api/faults/:id` | Get a single fault record by ID |
| `POST` | `/api/faults` | Create a new fault record |
| `PUT` | `/api/faults/:id` | Update a fault record |
| `DELETE` | `/api/faults/:id` | Delete a fault record |
| `DELETE` | `/api/faults` | Delete all fault records (admin only) |
| `GET` | `/api/faults/search?q=<query>` | Search fault records |
| `GET` | `/api/faults/status/:status` | Filter by status |
| `GET` | `/api/faults/location/:location` | Filter by location |
| `GET` | `/api/faults/next-id` | Get next available fault ID |

### Auto-Complete

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/autocomplete/:category` | Get auto-complete items for a category |
| `POST` | `/api/autocomplete` | Add a new auto-complete item |
| `PUT` | `/api/autocomplete/usage` | Update usage count for a value |
| `DELETE` | `/api/autocomplete/:id` | Delete an auto-complete item |

### Activity Log

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activity` | Get full activity log |
| `GET` | `/api/activity/user/:userId` | Get activity for a specific user |

### Users (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/:id` | Update a user (role, status, name) |
| `DELETE` | `/api/users/:id` | Delete a user |

### Statistics & Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/statistics` | Get fault statistics (total, open, resolved, avg repair time) |

---

## Database Schema

### Users Table

| Field | Type | Description |
|---|---|---|
| `id` | integer | Primary key, auto-increment |
| `username` | string | Unique login name |
| `password` | string | Hashed password (currently plaintext in MemStorage) |
| `fullName` | string | Display name |
| `role` | enum | `admin` | `editor` | `viewer` |
| `isActive` | boolean | Whether the user can log in |
| `createdAt` | datetime | Account creation timestamp |
| `lastLogin` | datetime | Last login timestamp (nullable) |

### Fault Records Table

| Field | Type | Description |
|---|---|---|
| `id` | integer | Primary key, auto-increment |
| `faultDescription` | string | Description of the fault |
| `equipmentType` | string | Type of equipment (e.g., Pump, Motor) |
| `location` | string | Where the fault occurred |
| `equipmentClassification` | string | Critical / Important / Standard / Non-critical |
| `relevantState` | string | Running / Stopped / Maintenance / Standby |
| `faultReporter` | string | Name of person reporting |
| `status` | enum | `open` | `in_progress` | `resolved` | `closed` |
| `timeToRepair` | number | Repair time in hours (nullable) |
| `createdAt` | datetime | Record creation timestamp |
| `updatedAt` | datetime | Last update timestamp |

### Auto-Complete Items Table

| Field | Type | Description |
|---|---|---|
| `id` | integer | Primary key |
| `category` | string | Category name (equipmentType, location, etc.) |
| `value` | string | The suggested value |
| `usage_count` | integer | Number of times used (for ranking) |

### Activity Log Table

| Field | Type | Description |
|---|---|---|
| `id` | integer | Primary key |
| `userId` | integer | User who performed the action |
| `action` | string | Description of the action |
| `details` | string | Additional details (JSON) |
| `timestamp` | datetime | When the action occurred |

---

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000        # macOS
netstat -ano | findstr 5000   # Windows
ss -tlnp | grep 5000  # Linux

# Kill the process or use a different port (edit server/index.ts)
```

### npm install Fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Fails
```bash
# Check TypeScript errors
npm run check

# Verify Node.js version (need v20+)
node --version
```

### Login Fails in Production
- Ensure `SESSION_SECRET` is set and is the same across restarts
- Check that cookies are not being blocked by browser settings
- Verify `NODE_ENV=production` is set

### Data Resets on Restart
- This is expected with in-memory storage (`MemStorage`)
- To persist data, configure PostgreSQL and switch the storage implementation in `server/storage.ts`

### CORS Errors (When Deploying)
- The app serves API and frontend from the same origin on port 5000, so CORS is not needed for normal deployment
- If separating frontend/backend, add CORS middleware to Express

### White Screen / 404 on Refresh (SPA Routing)
- Ensure `serveStatic` is correctly serving `dist/public` in production mode
- All routes should fall through to `index.html` for client-side routing

### Deployment-Specific Issues

**Render.com:** Free tier spins down after 15 minutes of inactivity — first request after idle takes 30-50 seconds to wake up.

**Railway.app:** Requires a payment method after trial period.

**VPS:** Ensure your firewall allows inbound traffic on port 5000 (or 80/443 if using a reverse proxy).

---

## Quick Reference — Deploy in 5 Minutes

### Zero-Config Local
```bash
cd MaintenanceFaultTracker
npm install
npm run dev
# Open http://localhost:5000
```

### Zero-Config Online (Render)
```bash
# 1. Push to GitHub
git push origin main

# 2. On Render: New Web Service → connect repo
#    Build: npm install && npm run build
#    Start: npm start
#    Env: SESSION_SECRET=<random-string>
#    Deploy
```

### With PostgreSQL (Production)
```bash
# Set DATABASE_URL environment variable
# Update server/storage.ts to use PgStorage
# Run: npm run db:push
```

---

*Document version: 1.0: September 2026*
