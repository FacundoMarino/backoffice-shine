# CleanConnect Backoffice

Admin panel for CleanConnect. Stack mirrors `sass/` (Next.js 16 App Router + Tailwind v4) and talks to `backend/` on port 3003.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at http://localhost:3004.

## Admin user

1. Create a user via Supabase Auth (or `/auth/sign-up`).
2. In Postgres: `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`

## Backend

Ensure `backend` is running (`npm run start:dev`) and migrations applied:

```bash
cd ../backend
npx prisma migrate deploy
npm run prisma:seed
```
