# NextBoomCity.com

A comprehensive AI-powered real estate platform focusing on emerging Indian markets, with special emphasis on religious tourism hubs, smart cities, and infrastructure-led growth areas.

## Overview

This project is built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI. It uses PostgreSQL for primary data, MongoDB for flexible content, and Redis for caching.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL, MongoDB, Redis
- **Deployment**: Docker, Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.local` and fill in your API keys and database URLs.

3. Start databases (optional, using Docker):
   ```bash
   docker-compose up -d
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - Reusable UI components
- `lib/` - Utility functions
- `types/` - TypeScript type definitions
- `utils/` - Helper functions
- `database/` - Database connection files

## Contributing

See architecture_plan.md, database_schema.md, etc. for more details.

## License

This project is private.
