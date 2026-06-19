# 🧭 Pathfinder — Sustainable Mobility & Accessibility

> Reto 4 · TUI Care Foundation Future Shapers Spain · UCM TFM 2026

Pathfinder maps the sustainable transport connectivity of 20 Spanish tourism destinations, helping redirect tourists toward destinations reachable by train or bus — minimising carbon footprint. Part of the [TUI Care Foundation Suite](#suite).

## Stack

| Layer | Technology |
|---|---|
| Dashboard | Streamlit 1.35+ |
| Maps | Folium + streamlit-folium |
| Charts | Plotly Express + Graph Objects |
| Data | pandas 2.2+ |
| Transport data | Synthetic dataset (auto-generated) |

## Pages

| Page | Description |
|---|---|
| 🏠 Home | KPI overview + overall mobility ranking |
| 🗺️ Connectivity Map | Folium map — circle size/colour = mobility score |
| 🚂 Transport Comparison | Train/bus/EV scores + carbon intensity by mode |
| 🌱 Carbon Footprint | CO₂ per visitor + personal carbon calculator |
| ♿ Accessibility Index | Composite index + investment priority analysis |

## Quick Start

```bash
pip install -r requirements.txt
streamlit run app.py
# or on suite port:
streamlit run app.py --server.port 8503
```

## Data Setup

Place Pathfinder next to Horizon on the Desktop — data is auto-detected:

```
Desktop/
├── TUI-Smart-Destination-Recommender/   ← primary data source
└── TUI-Pathfinder/                       ← auto-detects Horizon's data/raw/
```

Transport accessibility data is generated automatically on first run.

## Carbon Reference

| Mode | kg CO₂ / 100 km |
|---|---|
| 🚂 Train | 14 |
| 🚌 Bus | 68 |
| 🚗 Car | 170 |
| ✈️ Flight | 255 |

## Suite

| Project | Reto | Role | Port |
|---|---|---|---|
| TUI-Smart-Destination-Recommender | 2 | Horizon — AI recommender | 8000/5173 |
| TUI-Atlas | 3 | Atlas — Congestion dashboard | 8501 |
| TUI-Sentinel | 1 | Sentinel — Sentiment monitor | 8502 |
| **TUI-Pathfinder** | **4** | **Pathfinder — Mobility dashboard** | **8503** |
| TUI-Sage | 5 | Sage — RAG AI advisor | 8504 |
