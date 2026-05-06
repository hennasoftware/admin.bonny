Server-side aggregation Cloud Functions

This folder contains Firebase Cloud Functions that keep the dashboard ready for realtime reads without scanning full collections in the frontend.

Behavior
- `dashboard_monthly/{YYYY-MM}` stores monthly totals for `animals`, `adopters`, and concluded `adoptions`.
- `dashboard_summary/current` stores quick counters for `animalsTotal`, `animalsAvailable`, `animalsInProcess`, `adoptersActive`, `adoptionsOpen`, and `adoptionsCompletedTotal`.
- The functions react to create, update, and delete events so the dashboard can subscribe only to compact aggregate documents plus a small recent-adoptions query.

Build and deploy
1. Run inside `functions`:

```powershell
cd functions
npm install
npm run build
```

2. Deploy:

```powershell
firebase deploy --only functions
```

Backfill
- `node .\functions\backfill.js` rebuilds the last 12 months in `dashboard_monthly/*` and rewrites `dashboard_summary/current`.
- For emulator use:

```powershell
firebase emulators:start --only firestore
$env:FIRESTORE_EMULATOR_HOST = "localhost:8080"; node .\functions\backfill.js
```
