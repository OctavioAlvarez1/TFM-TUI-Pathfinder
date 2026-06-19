# TUI Care Foundation Suite

A suite of 5 AI and data projects for the TUI Care Foundation Future Shapers Spain programme (UCM TFM, 2026). Together they address Spain's over-tourism problem: 85% of visitors concentrate in 10% of destinations.

## The 5 Projects

| Repo | Reto | Name | Role | Stack | Port |
|---|---|---|---|---|---|
| TUI-Smart-Destination-Recommender | 2 | **Horizon** | AI destination recommender (travellers) | FastAPI + React 19 + MUI v9 | 8000 / 5173 |
| TUI-Atlas | 3 | **Atlas** | Geospatial congestion & sustainability dashboard | Streamlit + Folium + Plotly | 8501 |
| TUI-Sentinel | 1 | **Sentinel** | Sentiment & reputation monitoring | Streamlit + Plotly | 8502 |
| TUI-Pathfinder | 4 | **Pathfinder** | Sustainable mobility & accessibility | Streamlit + Folium + Plotly | 8503 |
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

- `destinations.csv` — 20 Spanish destinations
- `sustainability_scores.csv` — ESG scores per destination
- `congestion_scores.csv` — monthly congestion (12 months × 20 destinations)
- `bookings_history.csv` — ~1,000 bookings
- `ine_eoh_monthly.csv` — INE hotel occupancy (open data)
- `frontur_ccaa.csv` — FRONTUR international arrivals (open data)

## Desktop Layout

```
Desktop/
├── TUI-Smart-Destination-Recommender/   ← Reto 2 (primary data + API + React UI)
├── TUI-Atlas/                            ← Reto 3 (port 8501)
├── TUI-Sentinel/                         ← Reto 1 (port 8502)
├── TUI-Pathfinder/                       ← Reto 4 (port 8503)
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
cd TUI-Pathfinder && streamlit run app.py --server.port 8503

# Terminal 6 — Sage (RAG AI advisor, requires ANTHROPIC_API_KEY)
cd TUI-Sage && streamlit run app.py --server.port 8504
```

## Required Environment Variables

| Variable | Project | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | TUI-Sage | Claude API for RAG responses |
| `AEMET_API_KEY` | Horizon, Atlas | AEMET climate data (optional) |

Never hardcode these values. Set as environment variables only — never commit to git.
