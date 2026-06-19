# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pathfinder** is a Streamlit multi-page dashboard for analysing sustainable mobility and transport accessibility across 20 Spanish tourism destinations. It is Reto 4 of the TUI Care Foundation Future Shapers Spain suite (UCM TFM, 2026).

- **Stack**: Python · Streamlit · Folium · Plotly · pandas
- **Data**: Synthetic transport accessibility data (auto-generated) + shared destination CSVs from Horizon
- **Map**: Folium Leaflet map with CartoDB positron tiles (mobility score as circle size/colour)

## Commands

```bash
# Start Pathfinder (from project root)
streamlit run app.py

# Start on suite port
streamlit run app.py --server.port 8503

# Install dependencies
pip install -r requirements.txt
```

## Architecture

```
src/
├── config/settings.py         # Paths + DESTINATION_COORDS + CARBON_BY_MODE + mobility_color
├── data/
│   ├── data_loader.py         # @st.cache_data loaders
│   └── transport_generator.py # Generates transport_accessibility.csv on first run
└── components/
    ├── map_builder.py         # build_mobility_map() — Folium map
    └── chart_builder.py       # build_mobility_bar, build_transport_breakdown, build_carbon_bar
```

### Pages

| File | Page | Purpose |
|---|---|---|
| app.py | Home | KPI overview + overall mobility ranking |
| pages/1_Connectivity_Map.py | Connectivity Map | Folium map — mobility score as circle size/colour |
| pages/2_Transport_Comparison.py | Transport Comparison | Train/bus/EV breakdown + mode carbon chart |
| pages/3_Carbon_Footprint.py | Carbon Footprint | Carbon per visitor + personal calculator |
| pages/4_Accessibility_Index.py | Accessibility Index | Composite index + investment priorities |

## Data Setup

Pathfinder auto-detects data when both folders are on the same Desktop:

```
Desktop/
├── TUI-Smart-Destination-Recommender/   ← has data/raw/*.csv
└── TUI-Pathfinder/                       ← auto-detects it
```

Transport data is generated automatically on first run and saved to `data/transport/transport_accessibility.csv` (gitignored).

## Key Patterns

### Mobility Score Formula
```
overall_mobility_score = 0.45 × train_score + 0.30 × bus_score + 0.25 × (100 - airport_distance_factor)
```

### Mobility Thresholds (consistent across all files)
- ≥ 75 → High (green `#10B981`)
- 50–74 → Moderate (yellow `#F59E0B`)
- < 50 → Low (red `#EF4444`)

### Carbon by Mode (kg CO₂ per 100 km)
- Train: 14 | Bus: 68 | Car: 170 | Flight: 255

## Suite Context

Pathfinder is part of the 5-project TUI Care Foundation Suite. See SUITE.md for the full picture.
Destinations with high mobility scores should receive boosted recommendations in Horizon and appear as sustainable alternatives in Atlas's redistribution scenarios.
