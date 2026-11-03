# Ridoy Solutions Portfolio — Production Maintenance Guide

This project keeps the existing dark/premium frontend design but moves editable portfolio content into Supabase. The public site reads published content from the database, while `/admin` provides the management UI.

## 1. What you need to create

### Required
1. A Supabase account.
2. One Supabase project for this portfolio.
3. One Supabase Auth user for your admin login.

### Only credential you need in the Next.js app
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

You do **not** need to put a Supabase service-role/private key into this frontend project. Keep privileged keys out of `.env.local` unless a future server-only feature explicitly needs one.

## 2. First-time Supabase setup

1. Open Supabase and create a new project.
2. Choose a strong database password and save it somewhere safe.
3. In **Authentication → Users**, create an email/password user using the email you want to use as the portfolio administrator.
4. Open **SQL Editor**.
5. Open `supabase-schema.sql` from this project.
6. Replace the text `YOUR_ADMIN_EMAIL` with the exact email you used for the Auth user.
7. Run the complete SQL file once.
8. In **Project Settings → API**, copy:
   - Project URL
   - Publishable key (use the current publishable/anon-style public key shown by your Supabase project)
9. Copy `.env.example` to `.env.local`.
10. Paste your values into `.env.local`.
11. Restart the Next.js development server after changing `.env.local`.

### Important
Never commit `.env.local` to GitHub. The public publishable key is intentionally usable in the browser; the database is protected by Row Level Security. Never expose a service-role key in client code.

## 3. Database structure

The SQL creates these content tables:

- `profiles` — name, designation, contact links, profile/about image, resume, bio, stats.
- `site_settings` — site title, description, hero labels and footer labels.
- `services` — all service cards.
- `certificates` — certificate information and images.
- `case_studies` — complete case-study content, metrics and before/after media.
- `reviews` — written client testimonials.
- `video_reviews` — video testimonials and thumbnails.
- `process_steps` — the working process section.
- `contact_messages` — messages submitted through the portfolio contact form.
- `admin_users` — accounts allowed to modify portfolio content.

## 4. Admin panel

Open:

`/admin/login`

Sign in with the Supabase Auth user you created.

The dashboard contains:

- Dashboard
- Profile
- Services
- Certificates
- Case Studies
- Reviews
- Video Reviews
- Process
- Messages
- Settings

### Content editing rule
Business/content changes should be done from `/admin`.
Design, layout, animation and component behavior should remain in the codebase.

## 5. Images and files

The project creates a public Supabase Storage bucket named:

`portfolio-media`

When you upload a profile photo, certificate, review photo, case-study image or video thumbnail from the admin panel:

1. The file is uploaded to Supabase Storage.
2. Supabase returns a public URL.
3. The URL is saved in the relevant database record.
4. The frontend reads that URL automatically.

You do not need to manually copy image URLs into TypeScript files anymore.

## 6. Existing local assets

The current design still keeps existing local assets such as:

- `/public/images/profile/`
- `/public/images/certificates/`
- `/public/images/case-studies/`
- `/public/documents/resume.pdf`

The seeded database starts with those local paths so the current website remains visually compatible. New uploads can use Supabase Storage.

## 7. Adding a service later

Admin → Services → Add new item.

Fill:

- Service name
- Description
- Icon key
- Accent color
- Display order
- Published

Available icon keys currently include:

`users`, `facebook`, `google`, `youtube`, `location`, `video`, `code`, `pen`

If you want a completely new icon system later, update the icon map in `src/lib/content.ts` and the admin options in `src/components/admin/content-manager.tsx`.

## 8. Adding a certificate

Admin → Certificates → Add new item.

Upload the certificate image directly from the admin panel. The public certificate page will use the stored URL.

## 9. Adding a review

Admin → Reviews → Add new item.

Client photo is optional. If you publish a real client's name, photo or testimonial, get the client's permission first.

## 10. Adding a video review

Admin → Video Reviews → Add new item.

For YouTube, use the embed URL:

`https://www.youtube.com/embed/VIDEO_ID`

Do not paste the normal watch URL if the iframe is expected to load directly.

## 11. Adding a case study

Admin → Case Studies.

The structured fields are stored as JSON where multiple items are needed.

Example metrics:
```json
[
  { "label": "Sales", "value": "+245%" },
  { "label": "ROAS", "value": "3.8x" }
]
```

Example strategy:
```json
[
  "Search intent mapping",
  "Campaign restructuring",
  "Landing page optimization"
]
```

## 12. Contact messages

The contact form now attempts to save the inquiry into `contact_messages`.

Admin → Messages lets you:

- read the inquiry
- mark it read
- archive it
- delete it

If Supabase is not configured yet, the form falls back to the previous Gmail/mail flow.

## 13. What files are important for developers

### Supabase connection
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `middleware.ts`

### Database-driven content
- `src/lib/content.ts`

### Admin UI
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-ui.tsx`
- `src/components/admin/content-manager.tsx`
- `src/app/admin/`

### Database/security
- `supabase-schema.sql`

### Environment variables
- `.env.example`
- `.env.local` (local only; never commit)

## 14. How future developers should add a new editable section

1. Add a table or structured content model in `supabase-schema.sql`.
2. Add public read mapping in `src/lib/content.ts`.
3. Add the admin form/page under `src/app/admin/`.
4. Add or reuse a reusable UI component under `src/components/admin/`.
5. Pass the data from the server page to the public component.
6. Keep visual styling in the existing component/Tailwind/CSS system.
7. Add only the important comments explaining security, data mapping or non-obvious behavior.

## 15. Security checklist before production

- [ ] Supabase Auth admin user created.
- [ ] `YOUR_ADMIN_EMAIL` replaced in the SQL before running it.
- [ ] Row Level Security is enabled (the schema does this automatically).
- [ ] `.env.local` is not committed.
- [ ] No service-role/private key appears in browser code.
- [ ] Public signup is disabled after the administrator account is created if you do not need public accounts.
- [ ] Real client testimonials are published only with permission.
- [ ] Production domain is configured in Supabase Auth URL settings when password reset/email flows are enabled.

## 16. Deployment environment variables

If deploying on Netlify/Vercel/etc., add the same two variables in the hosting provider's environment-variable settings:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then redeploy.

## 17. Normal maintenance

For everyday work, use this rule:

**Content update → Admin Panel**

**Design/animation/component change → Code**

**Database/security change → `supabase-schema.sql` + Supabase SQL Editor**

This separation keeps the portfolio easy to maintain without turning the frontend into an unstructured CMS.

## Historical implementation notes (consolidated)

# Fixes applied to this build

## 1. Services icon serialization error
`src/constant/services.ts` no longer stores React icon functions. It stores serializable icon keys such as `google`, `youtube`, and `users`.

`src/app/(root)/components/services/service-icon.tsx` maps those keys to the actual `react-icons` components on the UI side.

This prevents the Next.js error:

`Functions cannot be passed directly to Client Components`

It also makes the service data safe to store in Supabase and edit from the future Admin Panel.

## 2. Supabase URL
`.env.local` previously contained `/rest/v1/` in the project URL. Supabase SSR/browser clients expect the project root URL, so it is now:

`https://YOUR_PROJECT_REF.supabase.co`

## 3. Fallback content cleanup
Duplicate fallback review records and duplicate video-review IDs were removed.

## 4. Admin image upload IDs
Admin image upload controls now use unique IDs. This prevents multiple upload fields on the same page from targeting the wrong file input.

## 5. Resume management
The About section now uses `profile.resume_url` from the database instead of the static `info.ts` value, so the Admin Panel can control the resume link.

# Realtime, loading and media fixes

## What was fixed

### 1. Home sections invisible
The home page had `.reveal-section { opacity: 0 }`, but the `ScrollAnimation` client component was not mounted anywhere. The sections therefore kept their layout height while remaining transparent.

`src/app/layout.tsx` now mounts the realtime client and the reveal observer is mounted through the root page flow. If you add more `[data-reveal]` sections, make sure the scroll observer remains mounted.

### 2. Image upload `crypto.randomUUID is not a function`
The uploader now uses `crypto.randomUUID()` when available and falls back to a safe unique browser filename when that API is unavailable.

File: `src/components/admin/admin-ui.tsx`

### 3. Skeleton loading
The public home route now has a page-level loading skeleton in:

`src/app/(root)/loading.tsx`

Admin content managers show skeletons while Supabase data is loading. Dashboard, Profile, Settings and Messages also have loading states.

### 4. Realtime updates
The public site subscribes to Supabase Realtime changes for profile, settings, services, certificates, case studies, reviews, video reviews and process steps. When an admin changes content, the open public page refreshes its server data automatically.

Admin list pages also subscribe to their table, so changes from another admin tab are reflected without a manual refresh.

The schema includes a Realtime publication block. If your Supabase project was created earlier and the block did not enable the tables, go to:

`Supabase Dashboard → Database → Replication`

and enable Realtime for the listed public tables, or rerun the final Realtime block from `supabase-schema.sql` in SQL Editor.

### 5. Supabase Storage images
Database-backed images can come from Supabase Storage. Relevant public `<Image>` components use `unoptimized` so a Supabase Storage URL does not need to be added to Next Image's remote host allowlist.

### 6. Process admin route
The Process admin page now correctly uses `process_steps` instead of the non-existent `process` table.

## Recommended workflow

1. Open Admin Panel.
2. Add/edit content.
3. Save/Publish.
4. Keep the public portfolio open in another tab.
5. With Supabase Realtime enabled, the public content refreshes automatically.

# Blog Design & Admin Feedback Update

## Changes
- Blog details page now uses a clean white editorial layout with navy text and the site's lime accent, author information, cover image, article body, sticky table of contents generated from Markdown headings, and contact CTA.
- Article headings now receive anchor IDs so the table of contents links jump to the correct section.
- Blog listing cards and cover placeholders use the same navy/lime palette.
- Admin blog create/update forms show a spinner and a pending label while saving.
- After a successful create, update, or delete, the admin page displays a clear success notice. Database, missing-field, invalid image, oversized image, and storage upload errors redirect back with a visible error notice.

## Article formatting
Write content in the Article Content field with blank lines between paragraphs. Use `# Heading`, `## Subheading`, `### Small heading`, and lines starting with `- ` for bullet points. These headings also populate the Table of Contents automatically.

## Verification note
The source files and ZIP archive were checked. A full TypeScript/Next.js production build could not be completed because dependency installation timed out and the local `node_modules` directory remained incomplete. Run `npm ci` and `npm run build` in a network-enabled environment before production deployment.

## Supabase blog schema repair

# Blog fixes — বাংলা নির্দেশনা

## কেন cover_image error হচ্ছিল
আগের ডাটাবেসে `blog_posts` টেবিল আগে থেকেই থাকলে `CREATE TABLE IF NOT EXISTS` নতুন `cover_image` কলাম যোগ করে না। Migration-এ এখন আলাদা `ALTER TABLE ... ADD COLUMN IF NOT EXISTS cover_image` আছে এবং PostgREST schema cache reload করা হয়।

## একবার যা করতে হবে
1. Supabase Dashboard → SQL Editor খুলুন।
2. এই প্রজেক্টের `MIGRATION-BLOG-SERVICES.sql` ফাইলের সম্পূর্ণ SQL রান করুন।
3. Deploy করা সাইটে নতুন কোড আপলোড/ডিপ্লয় করুন।
4. Admin → Blogs থেকে JPG/PNG/WebP cover image আপনার কম্পিউটার থেকে নির্বাচন করুন (সর্বোচ্চ 8 MB)। এটি `blog-images` Storage bucket-এ আপলোড হবে।

## URL slug কী?
Slug হলো ব্লগের URL-এর শেষ অংশ। যেমন শিরোনাম `How to Improve Local SEO` হলে slug `improve-local-seo` দিতে পারেন; URL হবে `/blog/improve-local-seo`। ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও hyphen ব্যবহার করুন। একই slug দুইটি পোস্টে ব্যবহার করা যাবে না।

## বিস্তারিত কনটেন্ট সুন্দরভাবে সাজানো
Paragraph আলাদা করতে একটি ফাঁকা লাইন দিন। Heading-এর জন্য লাইনের শুরুতে `## ` বা `### ` দিন। Bullet list-এর প্রতিটি লাইনের শুরুতে `- ` দিন। উদাহরণ:

`## What is SEO?`

`SEO helps people find your website through search engines.`

`### Key benefits`

`- More relevant traffic`
`- Better visibility`

## Contact email
Contact form Gmail compose window খুলবে; To-তে admin profile-এ থাকা email, Subject ও formatted message পূরণ থাকবে। ব্যবহারকারী Gmail-এ নিজের account থেকে Send চাপবেন। ওয়েবসাইটে আর কোনো message insert action নেই।

## Certificates

# Certificates Section

The portfolio now includes a `Certificates` section.

Edit `src/constant/certificates.ts` and replace the example entries with your real certificates.
Each certificate supports:
- title
- issuer
- year
- description
- optional credentialUrl

No certificate is presented as genuine until you replace the example data with your real credentials.


## Consolidated changelog


## Consolidated historical update notes

### General updates

# Portfolio Update Notes

Implemented:
- Subtle always-on active status pulse in the hero eyebrow.
- Two restrained floating hero accents for a more polished visual hierarchy.
- Service cards now use each service's own color for a soft hover glow.
- Homepage shows 3 featured case studies with View All Projects navigation.
- Added /case-studies listing page with category filtering.
- Added /case-studies/[id] detail pages with campaign visual, challenge, strategy, outcome, and before/after sections.
- Added back/next navigation and cross-page navbar links.

Important:
The original project contained demo case-study metrics and no dedicated case-study screenshots. The detail hero therefore uses a polished CSS campaign snapshot based on the existing data rather than inventing image assets. Replace the demo data with real client figures/screenshots before publishing them as verified results.

Validation:
Dependency installation/build could not be completed in this environment because npm registry access timed out and the local cache was incomplete. The source changes were checked for structure and import/path consistency.

### Bangla implementation notes

# Portfolio Update Notes

এই আপডেটে নিচের পরিবর্তনগুলো করা হয়েছে।

## 1. Admin authentication
- `middleware.ts`-এ Supabase `auth.getUser()` দিয়ে verified session যাচাই করা হয়।
- Protected `/admin/*` dashboard routes-এ লগইন এবং `is_admin` RPC—দুটিই বাধ্যতামূলক।
- Session না থাকলে `/admin/login`-এ redirect করা হয়; অননুমোদিত user-কে dashboard-এ ঢুকতে দেওয়া হয় না।
- Dashboard layout-এ server-side দ্বিতীয়বার authorization check যোগ করা হয়েছে, যাতে middleware configuration ভুল হলেও dashboard page render না হয়।
- `next` redirect ব্যবহার করে লগইন শেষে অনুমোদিত admin requested dashboard route-এ ফিরতে পারে।

## 2. Delete confirmation modal
- Content Manager-এর service, case study, certificate, review, process step এবং অন্যান্য managed item delete করার আগে custom confirmation modal দেখানো হয়।
- Contact message delete করার ক্ষেত্রেও একই ধরনের confirmation modal যোগ করা হয়েছে।
- Cancel করলে delete request পাঠানো হয় না; delete চলাকালে buttons disable থাকে।

## 3. Case study back navigation
- Case study details page-এর Back link এখন browser/Next navigation history-তে আগের পেজে ফেরে।
- All Case Studies থেকে details খুলে Back করলে All Case Studies-এ ফেরার কথা; browser history restore হলে আগের scroll position-ও বজায় থাকবে।
- সরাসরি details URL খুললে history না থাকায় fallback URL ব্যবহার হবে।

## Validation
- ZIP-এ dependency install/build সম্পূর্ণ করা সম্ভব হয়নি, তাই production build সফল হয়েছে বলে দাবি করা হচ্ছে না।
- Deploy করার আগে `npm ci`, `npm run lint`, এবং `npm run build` চালিয়ে যাচাই করুন।
- Supabase-এ `is_admin` RPC এবং সংশ্লিষ্ট table/storage-এর Row Level Security policies অবশ্যই সক্রিয় ও সঠিক হতে হবে। Middleware/UI checks database RLS-এর বিকল্প নয়।

### Portfolio V8 notes

# Portfolio V8 Update Notes

## Updated in this version
- Hero trust strip now uses two continuously pulsing blue status dots instead of sparkle icons.
- Services updated to: Social Media Management, Meta Ads, Google Ads, YouTube Marketing, Local SEO, Video Editing & Thumbnails, Web Design & Development, Content Marketing.
- Service icons rotate subtly on hover for a premium interaction.
- My Impact counters now start from zero and animate when the section enters the viewport.
- Certificate cards redesigned to a simple, equal-size real-certificate image layout on both Home and All Certificates.
- Certificate carousel now animates horizontally when using previous/next arrows.
- Reviews page now uses the same client-card design as the homepage, including client photo support when a real photo path is provided.
- Review action buttons remain side-by-side on mobile.
- Existing case-study structure and visual design were kept unchanged because the current five categories already match the services and campaign work represented in the portfolio.

### Admin security and account management

# Update Notes V9 — Admin Security & Account Management

Implemented:
- Forgot Password flow with Supabase password recovery.
- `/auth/callback` PKCE exchange route.
- `/admin/reset-password` recovery page.
- `/admin/setup-password` invited-admin onboarding page.
- Account Settings: Change Email, Change Password, Sign Out All Sessions.
- Multi-admin management: list, add/invite, and remove admin access.
- Admin route protection now checks `public.is_admin()` instead of allowing any authenticated Supabase user.
- Server-only Supabase secret-key client for trusted admin actions.
- `admin_users.email` is synchronized with the signed-in user's confirmed email when Settings opens.
- `.env.example` documents the required server-only `SUPABASE_SECRET_KEY`.

### Portfolio V10 notes

# Portfolio Update V10

## Included
- Central `.wrapper` sizing now uses `--site-container-max` in `src/app/globals.css`; change `72rem` once to adjust shared wrapper width.
- Service cards open `/services/[slug]` detail pages with an overview, workflow, benefits, and contact CTA.
- Hero/about count-up default duration increased to 3.2 seconds.
- Contact form now opens the visitor's email client using `mailto:`; it no longer inserts contact messages into the admin inbox.
- Added `/blog`, `/blog/[slug]`, and admin blog management at `/admin/blogs` (create, publish/draft, delete).
- Added WhatsApp chat launcher using the profile image, name, and WhatsApp number configured in the admin profile.
- Improved transition timing and reduced-motion accessibility.

## Required Supabase migration
Run `MIGRATION-BLOG-SERVICES.sql` in Supabase SQL Editor before using blog management. Blog create/delete uses the existing server-side service-role client and checks `is_admin()`.

## Notes
- Blog cover images should use a publicly accessible HTTPS URL.
- The email form opens the visitor's configured mail application; the visitor must press Send in that application.
- Service detail copy has tailored layouts for Social Media Management, Meta Ads, Google Ads, and YouTube Marketing, with a helpful generic workflow for the remaining services.

### Scroll animation and video review fixes

# Update notes — scroll animation, mobile hero glow, video reviews

## Changes made
- Fixed the scroll reveal observer so homepage sections stay ready for their entrance animation until they enter the viewport. Sections fade in and move upward slightly, only once; the animation respects reduced-motion preferences.
- Kept the implementation lightweight by using the existing IntersectionObserver and CSS transitions rather than adding another dependency.
- Changed the hero dashboard's animated gradient ring to rotate with a transform-based pseudo-element. This avoids relying on animating a registered CSS custom property, which can fail on some mobile browsers.
- Improved the Client Video Reviews admin form: the video URL field now accepts a normal YouTube watch/share link, YouTube Shorts URL, or embed URL. Common YouTube links are converted to an embed URL when saving; Vimeo links are also converted.
- Clarified the thumbnail upload instructions. Use the Thumbnail image upload control to select a JPG, PNG, or WebP file; it uploads to the configured Supabase Storage bucket and fills the URL automatically.

## How to add a client video review
1. Open **Admin → Video Reviews → Add new item**.
2. Enter **Client name**. Role, company, quote, and display order are optional depending on how you want the card to appear.
3. In **Video URL**, paste a complete link such as `https://www.youtube.com/watch?v=VIDEO_ID`, `https://youtu.be/VIDEO_ID`, or a YouTube Shorts URL. Do not paste only the video title or a channel URL. The form converts common YouTube links into an embed URL when saving.
4. For **Thumbnail image**, click **Upload file** and select the thumbnail image from your computer. The uploaded image URL is filled automatically. This field is optional if the video provider's own preview is enough.
5. Leave **Published** enabled and click **Save Changes**.

The `portfolio-media` Supabase Storage bucket must exist and be public, with the admin upload policy configured. The project's `supabase-schema.sql` contains the intended bucket and policies.

## Notes
- No new animation package was added; Framer Motion was already present and existing hero animations remain unchanged.
- The project dependencies could not be installed within the available command time, so a full production build could not be run in this environment. Please run `npm ci` and `npm run build` locally before deployment.
