# Be My Traveller

A production-oriented travel booking and management platform built with Next.js, MongoDB, and Cloudinary.

## Project structure

- src/app — Route groups, pages, and API handlers
- src/components — reusable UI building blocks
- src/domains — Prisma-like domain models and data access patterns for business entities
- src/lib — auth, database, storage, and shared utilities
- src/scripts — one-off setup and seeding utilities
- public — static assets

## Prerequisites

- Node.js 20+
- npm or pnpm
- MongoDB Atlas connection string
- Cloudinary credentials

## Local setup

1. Install dependencies:
   npm install
2. Copy the environment template:
   cp .env.example .env.local
3. Fill in your values for MongoDB, Cloudinary, and admin bootstrap credentials.
4. Run the app:
   npm run dev
5. Open http://localhost:3000

## Useful scripts

- npm run dev — local development server
- npm run build — production build
- npm run start — production server
- npm run lint — ESLint checks
- npm run type-check — TypeScript validation

## Production checklist

- Keep all secrets in environment variables only
- Never commit .env files
- Use strong admin credentials in the deployment environment
- Configure SEED_SECRET for bootstrap endpoints in production
- Add a real domain, TLS, and CDN settings before live launch

## Security note

Do not keep API keys, admin passwords, or database URIs in source files. The repository now uses an environment template to make this easy and safe.
