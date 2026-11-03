# Ridoy Solutions Portfolio

Next.js App Router portfolio with a Supabase-backed admin dashboard.

## Local development

1. Install Node.js (LTS).
2. Copy `.env.example` to `.env.local` and fill in your own Supabase credentials and site URL.
3. Run `npm install`, then `npm run dev`.
4. Open `http://localhost:3000`.

## Key routes

- Public portfolio: `/`
- Blog: `/blog`
- Certificates: `/certificates`
- Case studies: `/case-studies`
- Reviews: `/reviews`
- Admin: `/admin`

## Where to maintain the project

- `PROJECT-MAINTENANCE.md` — architecture, Supabase setup, security, deployment, and technical notes.
- `PORTFOLIO-GUIDE-BN.md` — Bangla guide for content updates and admin workflows.
- `src/lib/content.ts` — data-access layer and fallback behavior.
- `src/app/globals.css`, `src/components/scroll-animation.tsx`, and `src/components/whatsapp-chat.tsx` — global styling and motion behavior.

## Safe cleanup note

Fallback constants in `src/constant/` are still used when Supabase is not configured or returns no rows. They are intentionally retained to avoid breaking local previews and resilience. Do not delete them merely because live content is managed from the admin panel.

## Checks

Run `npm run lint` and `npm run build` before deploying. Respect `prefers-reduced-motion`; do not remove the Supabase auth, middleware, cache invalidation, or admin action code as 'unused' without tracing its callers.
