# Rapid Reels Website (Static)

Isolated Next.js + TypeScript marketing and product-flow demo for **Rapid Reels**.

- Sibling of `rapid_reels_app/` — **does not modify** the Flutter app.
- Static mock data only — no Firebase, Stripe, or OTP in this phase.
- Click through customer booking, provider portal, and admin console.

## Run locally

```bash
cd rapid_reels_website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main entry points

| Area | Path |
|------|------|
| Marketing home | `/` |
| Customer demo | `/login` → `/home` |
| Booking flow | `/event-type-selection` |
| Provider demo | `/provider/login` → `/provider-portal/demo/home` |
| Admin demo | `/admin/login` → `/admin-dashboard` |

## Later (dynamic)

Swap `src/lib/mock` for Firebase Auth / Firestore using the existing Next.js parity guide under the Flutter docs — keep page structure.
