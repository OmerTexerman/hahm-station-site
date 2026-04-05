# HAHM Station

HAHM Station is a Next 16 App Router site backed by Sanity. It ships a custom animated homepage, section indexes for the four content areas, and a Studio route for editing content in the same repository.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Sanity + `next-sanity`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from `.env.local.example` and fill in your Sanity values:

```bash
cp .env.local.example .env.local
```

3. Start the app:

```bash
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_SANITY_PROJECT_ID`: Sanity project id
- `NEXT_PUBLIC_SANITY_DATASET`: Sanity dataset name
- `NEXT_PUBLIC_SITE_URL`: Public site URL used for canonical metadata
- `SANITY_REVALIDATE_SECRET`: Shared secret for the Sanity publish webhook that refreshes cached pages in production

If Sanity is not configured, published pages fall back to empty states in production and development placeholder posts locally.

## Scripts

- `npm run dev`: Start the Next development server
- `npm run build`: Create a production build
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run the TypeScript checker
- `npm run cms:migrate-colors`: Convert any legacy string-based color fields in Sanity to the new color-picker format
- `npm run cms:migrate-colors:dry`: Preview the color migration without writing
- `npm run cms:seed`: Seed sample site settings, categories, posts, wall art, and sample assets into Sanity
- `npm run cms:seed:dry`: Preview the sample-content seed without writing

The seed script is intentionally simple and idempotent: it only upserts its own deterministic sample documents such as `seed-category-*`, `seed-post-*`, and `seed-wall-art-*`. It does not delete user-authored content.

## Production Revalidation

The site uses a hybrid content strategy:

- development fetches Sanity with `cache: "no-store"` so Studio edits show up without restarting Next or deleting `.next`
- production uses tagged ISR so pages stay mostly static until content changes
- Sanity should call [`/api/revalidate`](/var/home/omertexerman/Documents/Code/hahm-station-site/src/app/api/revalidate/route.ts) on publish so those cached pages refresh immediately

Recommended Sanity webhook setup:

- URL: `https://your-site.com/api/revalidate?secret=YOUR_SANITY_REVALIDATE_SECRET`
- Trigger on create, update, delete, publish, and unpublish
- Filter types: `siteSettings`, `homeScreenSettings`, `category`, `post`, `wallArt`
- Payload projection:

```groq
{
  "_type": _type,
  "slug": slug.current,
  "categorySlug": select(_type == "post" => category->slug.current, null)
}
```

The route will always invalidate the broad tag for the changed document type, and it will use `slug` / `categorySlug` when present for narrower refreshes.

## Content Model

- `music-review`
- `literature-review`
- `my-music`
- `life-updates`
- `wallArt`

## Notes

- The homepage intro stores small session-scoped UI state in `sessionStorage` so repeat visits skip the intro animation.
- The Studio route lives at `/studio`.
- The Studio route returns `404` until real Sanity env values are configured.
- Remote Sanity images are configured through `next.config.ts`.
- The site theme now supports preset palettes plus per-token overrides through Sanity color picker inputs.
- The sample seed uploads artwork from [`public/sanity-sample-assets`](/var/home/omertexerman/Documents/Code/hahm-station-site/public/sanity-sample-assets).
