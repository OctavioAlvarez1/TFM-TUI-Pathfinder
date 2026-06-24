# TUI Pathfinder — Mapas de Accesibilidad y Movilidad Sostenible

> **Reto 4** · TUI Care Foundation Future Shapers Spain · ODS 8.9 · UCM TFM 2026

Pathfinder es un dashboard React interactivo que analiza la **accesibilidad turística** y la **movilidad sostenible** en 20 destinos españoles. Genera mapas de calor inteligentes, índices de accesibilidad universal, rutas sostenibles comparadas y recomendaciones de IA para reducir la dependencia del vehículo privado.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI | Material UI (MUI) |
| Mapas | React-Leaflet + OpenStreetMap (CartoDB Voyager) |
| Gráficos | Recharts + CSS conic-gradient |
| Animaciones | Framer Motion |
| i18n | LanguageContext propio — ES / EN |
| Datos reales | API INE EOH (pernoctaciones) · Overpass API (carril bici) |
| Datos sintéticos | RNG determinista por `destination.id` — sin backend |

## Vistas

| Vista | Descripción |
|---|---|
| Mapa interactivo | Mapa de calor Leaflet — 4 modos: concentración, accesibilidad, movilidad, rutas |
| Accesibilidad | Índice por categorías (hoteles, monumentos, playas…) + análisis de barreras |
| Movilidad sostenible | Reparto modal donut, CO₂ por modo, calculadora de huella personal |
| Rutas turísticas | 6 rutas generadas con detalle expandible: waypoints, dificultad, highlights |
| Recomendaciones IA | 8 recomendaciones priorizadas con pasos de implementación y KPIs |
| Analítica | Evolución mensual de visitantes (real INE o sintético), comparativa de destinos |
| Informes | Listado de informes con descarga real CSV / HTML-a-PDF |

## Arrancar la aplicación

```bash
cd TUI-Pathfinder/frontend
npm install        # solo la primera vez
npm run dev        # http://localhost:5174
```

## Estructura del proyecto

```
TUI-Pathfinder/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── ine.ts              # Cliente API INE EOH (pernoctaciones)
│   │   │   └── overpass.ts         # Cliente Overpass (carriles bici)
│   │   ├── components/
│   │   │   ├── TopBar.tsx          # Barra superior — selector de idioma y periodo
│   │   │   ├── Sidebar.tsx         # Navegación lateral + selector de destino
│   │   │   ├── ModalDonut.tsx      # Donut de reparto modal (panel lateral home)
│   │   │   ├── InteractiveMapView.tsx
│   │   │   ├── AccessibilityView.tsx
│   │   │   ├── MobilityView.tsx
│   │   │   ├── TouristRoutesView.tsx
│   │   │   ├── AIRecsView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── ReportsView.tsx
│   │   ├── context/
│   │   │   ├── DestinationContext.tsx   # Destino activo global
│   │   │   └── LanguageContext.tsx      # i18n ES/EN + hook useLanguage()
│   │   ├── data/
│   │   │   ├── destinations.ts          # 20 destinos con coords y metadatos
│   │   │   └── mockData.ts              # Datos de reparto modal base
│   │   ├── hooks/
│   │   │   └── useDestinationPhoto.ts   # Foto de destino (Unsplash)
│   │   ├── i18n/
│   │   │   └── translations.ts          # ~300 claves por idioma (ES + EN)
│   │   └── App.tsx                      # Layout principal + router de vistas
│   ├── vite.config.ts                   # Puerto 5174
│   └── package.json
├── README.md
├── CLAUDE.md
├── SUITE.md
├── DESIGN_SYSTEM.md
└── docs/
    ├── index.md
    ├── architecture.md
    ├── setup.md
    ├── data-sources.md
    ├── metrics.md
    └── i18n.md
```

## Suite TUI Care Foundation

Pathfinder es el **Reto 4** del conjunto de 5 proyectos del programa Future Shapers Spain:

| Proyecto | Reto | Descripción | Stack | Puerto |
|---|---|---|---|---|
| TUI-Sentinel | 1 | Monitor de sentimiento y reputación | React + FastAPI | 5176 |
| TUI-Horizon | 2 | Motor de recomendaciones IA | React + FastAPI | 5173 |
| TUI-Atlas | 3 | Dashboard georreferenciado de congestión | React + Leaflet | 5175 |
| **TUI-Pathfinder** | **4** | **Mapas de accesibilidad y movilidad sostenible** | **React + Vite** | **5174** |
| TUI-Sage | 5 | Asesor IA con RAG + Claude API | React + FastAPI | 5177 |

---

*TUI Care Foundation · ODS 8.9 · Universidad Complutense de Madrid · 2026*
