# Feed Master PH — Free Ebook Landing Page

Risograph-style landing page for the Feed Master PH free ebook lead magnet. Collects name + email into a Google Sheet through a server-side API route (no secrets exposed to the browser), then unlocks the ebook download.

## Stack
- Next.js 15 (App Router)
- Google Sheets API (via a service account, called server-side only)
- No database required — the Sheet *is* the database

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev
```

Visit `http://localhost:3000`.

## One-time Google Cloud setup

1. In [Google Cloud Console](https://console.cloud.google.com), enable the **Google Sheets API** on a project.
2. Go to **IAM & Admin → Service Accounts → Create service account**.
3. Open the new service account → **Keys → Add key → Create new key → JSON**. Download it.
4. From that JSON file, grab `client_email` and `private_key` — these go into your env vars.
5. Open your Google Sheet → **Share** → add the `client_email` address as an **Editor**. This step is required or the API calls will fail with a permissions error.
6. In row 1 of the sheet, add headers: `Timestamp | Name | Email | Source`.

## Deploying (Vercel)

1. Push this repo to GitHub, then import it in [Vercel](https://vercel.com/new).
2. Under **Project → Settings → Environment Variables**, add everything from `.env.example` with your real values.
   - `GOOGLE_PRIVATE_KEY` — paste it exactly as it appears in the JSON key, including the `\n` sequences.
   - `LEAD_FORM_ALLOWED_ORIGIN` — set to your production domain so only your own site can call the API.
3. Deploy. The form on `/` will POST to `/api/subscribe` on the same domain — no extra config needed since frontend and backend ship together.
4. Before going live, open `app/page.tsx` and set `EBOOK_DOWNLOAD_URL` to the real hosted PDF link.

## How the API route protects you

`app/api/subscribe/route.ts`:
- Never exposes the Google service account credentials to the client — they're server-side env vars only.
- Restricts CORS to `LEAD_FORM_ALLOWED_ORIGIN`.
- Rate-limits to 5 submissions per IP per minute (in-memory — fine for low/medium traffic; swap for Upstash Redis if this ever needs to scale).
- Rejects a hidden honeypot field to filter out simple bots.
- Skips inserting a duplicate row if the email already exists in the sheet, but still returns success so the visitor gets the download either way.

## Project structure

```
app/
  layout.tsx          — fonts + metadata
  globals.css          — all Risograph design tokens and styles
  page.tsx             — the landing page + lead form (client component)
  api/
    subscribe/
      route.ts          — server-side Google Sheets write
.env.example
```
