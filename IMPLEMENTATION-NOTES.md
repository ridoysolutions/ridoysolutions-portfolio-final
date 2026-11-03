# Implementation notes

## Supabase migration

1. Open the Supabase project used by this portfolio.
2. Open **SQL Editor** and create a new query.
3. Run `SUPABASE-REVIEW-SUBMISSIONS.sql` after the existing portfolio schema has been installed.
4. The migration adds `reviews.title` and `reviews.status`, preserves existing rows, maps currently published reviews to `approved` and unpublished rows to `pending`, creates indexes, replaces the review RLS policies, and creates the `review-avatars` public bucket.
5. Confirm that the public key in `.env.local` is the existing Supabase publishable/anon key and that the project URL is correct. No new environment variables are required.

Public review submissions can insert only pending records. They cannot update, approve, or delete reviews. Only users recognized by the existing `public.is_admin()` function can manage review records. Public review reads are restricted to approved and published rows.

## Review moderation

Open **Admin → Reviews**. Pending submissions are labeled `Pending`; use **Approve** to publish, or **Edit** to assign the project/service title and adjust the submitted content. Admin-created reviews default to pending until explicitly approved.

## Verification

The modified TS/TSX files passed TypeScript transpilation/syntax validation. A full Next.js build and ESLint run could not be completed in this environment because the ZIP did not include `node_modules` and package installation could not complete (network/package registry access timed out). Run `npm ci`, `npm run lint`, and `npm run build` locally before deployment. Apply the SQL migration before testing review submission and moderation against Supabase.
