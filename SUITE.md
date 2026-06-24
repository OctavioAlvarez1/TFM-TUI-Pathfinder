# TUI Care Foundation Suite

A suite of 5 AI and data projects for the TUI Care Foundation Future Shapers Spain programme (UCM TFM, 2026). Together they address Spain's over-tourism problem: 85% of visitors concentrate in 10% of destinations.

## The 5 Projects

| Repo | Reto | Name | Role | Stack | Port |
|---|---|---|---|---|---|
| TUI-Smart-Destination-Recommender | 2 | **Horizon** | AI destination recommender (travellers) | FastAPI + React 19 + MUI v9 | 8000 / 5173 |
| TUI-Atlas | 3 | **Atlas** | Geospatial congestion & sustainability dashboard | Streamlit + Folium + Plotly | 8501 |
| TUI-Sentinel | 1 | **Sentinel** | Sentiment & reputation monitoring | Streamlit + Plotly | 8502 |
| TUI-Pathfinder | 4 | **Pathfinder** | Sustainable mobility & accessibility | React + Vite + TypeScript | 5174 |
| TUI-Sage | 5 | **Sage** | RAG-powered destination AI advisor | Streamlit + Claude API + ChromaDB | 8504 |

## How They Connect

All 5 projects share the same 20 Spanish destinations and dataset. Horizon is the primary data source — the others auto-detect its `data/` folder when placed on the same Desktop.

- **Horizon** redistributes tourist demand via personalised AI recommendations
- **Atlas** visualises geographic pressure across Spain in real time
- **Sentinel** monitors reputation and sentiment impact of over-tourism
- **Pathfinder** maps sustainable transport connections to alternative destinations
- **Sage** answers natural-language questions about the suite using RAG + Claude AI

```
                        ┌──────────────┐
              Data  →   │   Horizon    │  ← Travellers ask for recommendations
                        │  (Reto 2)    │
                        └──────┬───────┘
                               │  Shared: 20 destinations, CSVs, INE, FRONTUR
           ┌───────────────────┼──────────────────────┐
           ▼                   ▼                      ▼
    ┌─────────────┐    ┌──────────────┐     ┌──────────────┐
    │   Atlas     │    │   Sentinel   │     │  Pathfinder  │
    │  (Reto 3)   │    │  (Reto 1)    │     │  (Reto 4)    │
    │  Pressure   │    │  Sentiment   │     │  Mobility    │
    └─────────────┘    └──────────────┘     └──────────────┘
           │                   │                      │
           └───────────────────┴──────────────────────┘
                               │  All data feeds into
                               ▼
                        ┌──────────────┐
                        │    Sage      │
                        │  (Reto 5)    │
                        │  RAG + AI    │
                        └──────────────┘
```

## Shared Data

Primary source: `TUI-Smart-Destination-Recommender/data/`

### Synthetic files (stable, no refresh needed)
| File | Content |
|---|---|
| `data/raw/destinations.csv` | 20 Spanish destinations with attribute scores |
| `data/raw/bookings_history.csv` | ~1,000 synthetic bookings |
| `data/raw/users.csv` | 100 GDPR-compliant traveler profiles |

### Real open data files (refresh with `fetch_open_data.py`)
| File | Source | Status |
|---|---|---|
| `data/raw/congestion_scores.csv` | INE EOH Table 49371 | ✅ Real — 13/13 provinces, 240 rows |
| `data/raw/sustainability_scores.csv` | FRONTUR Table 23988 | ✅ Real — enriched with international fractions |
| `data/enriched/ine_eoh_monthly.csv` | INE EOH — raw monthly travelers | ✅ Real — 156 rows |
| `data/enriched/frontur_ccaa.csv` | FRONTUR — raw CCAA arrivals | ✅ Real — 8 CCAA |
| `data/enriched/aemet_climate.csv` | AEMET climate normals | ⚠️ Optional — requires `AEMET_API_KEY` |

### Refresh open data
```bash
# INE + FRONTUR (no auth required)
python data/scripts/fetch_open_data.py

# Full refresh including AEMET climate normals
$env:AEMET_API_KEY = "your_key"   # PowerShell
python data/scripts/fetch_open_data.py
```
AEMET free keys have per-hour rate limits. If you see 429 errors, wait ~1 hour and retry.

---

## Shared Design Language

All projects use the same congestion/status color scale and semantic palette. Keep these consistent across Streamlit (Plotly) and React projects.

### Congestion Color Scale

| Score | Level | Hex | Meaning |
|---|---|---|---|
| 0–30 | Low | `#16A34A` | Under-visited — Horizon actively promotes |
| 31–60 | Moderate | `#CA8A04` | Acceptable |
| 61–80 | High | `#EA580C` | Expect crowds |
| 81–100 | Very High | `#DC2626` | Redistribution penalty active (−10%) |

### Destination Status Categories

| Status | Condition | Color |
|---|---|---|
| Opportunity | congestion < 55 AND peak ≥ 80 | `#10B981` green |
| Moderate | default | `#F59E0B` amber |
| High Pressure | congestion ≥ 80 | `#EA580C` orange |
| Overloaded | congestion ≥ 92 | `#DC2626` red |

### Semantic Palette (shared across all 5 projects)

```
Primary green  #10B981   — sustainability, positive, low congestion
Amber          #F59E0B   — moderate, neutral, caution
Orange         #EA580C   — high pressure
Red            #EF4444   — critical, overloaded, negative sentiment
Blue           #2563EB   — informational, section headers
Indigo         #6366F1   — preference / AI features
```

### Destination Type Colors

| Type | Color |
|---|---|
| Beach | `#38BDF8` sky blue |
| City | `#818CF8` indigo |
| Nature | `#34D399` emerald |
| Mixed | `#FBBF24` amber |

## Desktop Layout

```
Desktop/
├── TUI-Smart-Destination-Recommender/   ← Reto 2 (primary data + API + React UI)
├── TUI-Atlas/                            ← Reto 3 (port 8501)
├── TUI-Sentinel/                         ← Reto 1 (port 8502)
├── TUI-Pathfinder/                       ← Reto 4 (port 5174)
└── TUI-Sage/                             ← Reto 5 (port 8504)
```

## Quick Start — Full Suite

```bash
# Terminal 1 — Horizon backend
cd TUI-Smart-Destination-Recommender
python -m uvicorn src.api.app:app --reload --port 8000

# Terminal 2 — Horizon frontend
cd TUI-Smart-Destination-Recommender/frontend
npm run dev

# Terminal 3 — Atlas (geospatial dashboard)
cd TUI-Atlas && streamlit run app.py --server.port 8501

# Terminal 4 — Sentinel (sentiment monitor)
cd TUI-Sentinel && streamlit run app.py --server.port 8502

# Terminal 5 — Pathfinder (mobility dashboard)
cd TUI-Pathfinder/frontend && npm run dev    # http://localhost:5174

# Terminal 6 — Sage (RAG AI advisor, requires ANTHROPIC_API_KEY)
cd TUI-Sage && streamlit run app.py --server.port 8504
```

## Design System

Visual patterns, component recipes, and Streamlit equivalents are documented in:

**`TUI-Smart-Destination-Recommender/DESIGN_SYSTEM.md`**

Covers: MUI v9 dark mode rules, glassmorphism cards, SVG area charts, interactive bar charts, heat tile grid, Framer Motion re-animation, Leaflet tile layers, congestion color helpers, and Streamlit/Plotly equivalents for Atlas/Sentinel/Pathfinder.

---

## Required Environment Variables

| Variable | Project | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | TUI-Sage | Claude API for RAG responses |
| `AEMET_API_KEY` | Horizon, Atlas | AEMET climate data (optional) |

Never hardcode these values. Set as environment variables only — never commit to git.
