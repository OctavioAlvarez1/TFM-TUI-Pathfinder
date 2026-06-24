# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pathfinder** is a React + Vite single-page application for analysing sustainable mobility and transport accessibility across 20 Spanish tourism destinations. It is Reto 4 of the TUI Care Foundation Future Shapers Spain suite (UCM TFM, 2026).

- **Stack**: React 18 · TypeScript · Vite · Material UI · React-Leaflet · Recharts · Framer Motion
- **Data**: Deterministic synthetic data (RNG seeded by `destination.id`) + INE EOH API + Overpass API
- **i18n**: Bilingual ES/EN via `LanguageContext` — all user-visible strings must use `t('key')`
- **No backend**: Pure SPA — data is generated client-side, no server required

## Commands

```bash
# Start Pathfinder (from frontend/ directory)
cd frontend
npm run dev              # http://localhost:5174

# Install dependencies
npm install

# TypeScript check
npx tsc --noEmit

# Build for production
npm run build
```

## Architecture

```
frontend/src/
├── api/
│   ├── ine.ts               # INE EOH pernoctaciones API client
│   └── overpass.ts          # Overpass API — cycle paths
├── components/
│   ├── TopBar.tsx           # Header: language flags, date range, avatar
│   ├── Sidebar.tsx          # Navigation + destination selector
│   ├── ModalDonut.tsx       # Modal share donut (home sidebar)
│   ├── InteractiveMapView.tsx  # Leaflet map — 4 modes + route planner
│   ├── AccessibilityView.tsx   # Barrier analysis + category bars
│   ├── MobilityView.tsx        # Modal share + CO2 + carbon calculator
│   ├── TouristRoutesView.tsx   # 6 synthetic routes with detail panel
│   ├── AIRecsView.tsx          # 8 prioritised AI recommendations
│   ├── AnalyticsView.tsx       # Monthly charts + peer comparison + INE
│   └── ReportsView.tsx         # Report list + CSV/PDF download
├── context/
│   ├── DestinationContext.tsx  # Active destination global state
│   └── LanguageContext.tsx     # i18n — useLanguage() -> { lang, setLang, t }
├── data/
│   ├── destinations.ts         # 20 destinations with coords, zoom, bboxDelta
│   └── mockData.ts             # Modal share base data
├── hooks/
│   └── useDestinationPhoto.ts  # Destination hero photo (Unsplash)
├── i18n/
│   └── translations.ts         # All ES + EN strings — typed as const
└── App.tsx                     # Main layout + view router
```

## Key Patterns

### Deterministic synthetic data
All synthetic values use `mkRng(seed)` — a deterministic LCG seeded by `destination.id + suffix`:
```typescript
function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}
```
This guarantees the same numbers for the same destination on every render without a backend.

### i18n — useLanguage hook
```typescript
const { t, lang, setLang } = useLanguage()
// t() is typed — TypeScript enforces valid keys
t('mob.kpi.cycle')          // simple string
t('mob.months').split(',')  // comma/pipe-delimited arrays
```
Translation keys live in `src/i18n/translations.ts` under `es` and `en` objects. When adding new visible text, always add both language keys before using them.

### Adding a translation key
1. Add to `translations.ts` under **both** `es` and `en` objects
2. Use `t('your.key')` in the component — TypeScript will error if the key is missing

### Route name keys (TouristRoutesView)
Route names are stored as translation key strings (e.g. `'routes.name.hist'`) and used as RNG seeds. Treat them as stable identifiers — changing a key changes the generated waypoints.

### Pipe-delimited strings for arrays
Long arrays (steps, zone names, recommendations) are stored as a single `|`-delimited string and split at usage:
```typescript
t('ai.steps.access').split('|')  // -> string[]
```

### Dynamic key lookup TypeScript cast
When the key is a variable, cast to satisfy the type checker:
```typescript
t(someKey as Parameters<typeof t>[0])
```

## Mobility Score Thresholds (consistent across all views)
- >= 75 -> High (green `#10B981`)
- 50-74 -> Moderate (amber `#F59E0B`)
- < 50  -> Low (red `#EF4444`)

## Carbon by Mode (kg CO2 per 100 km)
- Train: 14 | Bus: 68 | Car: 170 | Flight: 255

## Suite Context

Pathfinder is Reto 4 of the 5-project TUI Care Foundation Suite. The 20 destinations are shared across all projects. See `SUITE.md` for the full picture and `docs/` for technical documentation.
