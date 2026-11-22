# Ambara frontend

Server-rendered website and admin for Ambara (React Router 7 + Redux Toolkit), deployed on Vercel.

## Run locally

```
npm install
npm run dev
```

## Settings

Set these in `.env` locally and in the Vercel project (Production) when deployed:

| Name | What it is |
|---|---|
| `API_URL` | Backend address used by the website server (e.g. `https://ambara-backend.onrender.com`) |
| `PUBLIC_API_URL` | Backend address used by browsers (results, place search, admin) |
| `SITE_URL` | Public site address (e.g. `https://www.ambara.io`) |
| `ALLOW_INDEXING` | Whether search engines may index the site (`true` in production) |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification code (from the verification meta tag) |

Without `API_URL` the site calls `http://localhost:5100` and every page shows "Our servers are not responding".
