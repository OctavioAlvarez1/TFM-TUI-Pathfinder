# 🧭 TUI Pathfinder — Generador de Mapas de Accesibilidad & Movilidad Sostenible

> **Reto 4** · TUI Care Foundation Future Shapers Spain · SDG Target 8.9 · UCM TFM 2026

Pathfinder es una plataforma interactiva que analiza la **accesibilidad turística** y las **opciones de movilidad sostenible** en 20 destinos españoles. Genera mapas inteligentes que identifican cómo se mueve un visitante dentro y hacia cada destino, dónde existen brechas de infraestructura, y qué oportunidades existen para reducir la dependencia del vehículo privado.

## Stack

| Capa | Tecnología |
|---|---|
| Dashboard | Streamlit 1.35+ |
| Mapas interactivos | Folium + streamlit-folium |
| Gráficos | Plotly Express + Graph Objects |
| Datos | pandas 2.2+ · numpy |
| Transporte interurbano | Dataset sintético auto-generado |
| Movilidad local | Dataset de accesibilidad intra-ciudad |

## Páginas

| Página | Descripción |
|---|---|
| 🏠 Inicio | Visión general — KPIs, mapa de España, contexto del reto |
| 🔗 Conectividad Nacional | Transporte interurbano: tren, bus, emisiones por destino |
| 📍 Accesibilidad Local | Mapa de POIs turísticos con scores de accesibilidad a pie / bici / bus |
| 🚴 Rutas Sostenibles | Calculadora de rutas entre POIs: tiempo, CO₂ y recomendación de modo |
| 🌱 Huella de Carbono | CO₂ por destino, calculadora personal, análisis ESG |
| 📊 Brechas de Infraestructura | Ranking de ciudades con mayor necesidad de inversión en movilidad |

## Arrancar la aplicación

```bash
cd TUI-Pathfinder
pip install -r requirements.txt
streamlit run app.py
```

Disponible en `http://localhost:8503`

## Métricas implementadas

Del brief de Reto 4 (Target 8.9):

| Métrica | Descripción | Fuente |
|---|---|---|
| Índice de accesibilidad local | Score compuesto (pie + bici + bus + acc. universal) | Calculado |
| km de carril bici urbano | Infraestructura ciclista disponible en zona turística | OSM / planes municipales |
| Score bus / tram local | Cobertura y frecuencia del transporte público urbano | GTFS / datos municipales |
| Accesibilidad universal | Score de PMR para monumentos y alojamientos | Datos municipales |
| Dependencia del vehículo privado | % viajes en coche vs modos sostenibles | Calculado |
| CO₂ evitado | kg CO₂ ahorrados vs coche privado | Factores EEA 2023 |
| Sentimiento sobre movilidad | Score de reseñas relativas a transporte | OD-TripM / sintético |
| Brecha de infraestructura | Gap entre accesibilidad actual y objetivo | Calculado |
| Tiempo de acceso entre POIs | Minutos a pie / bici / bus entre puntos de interés | Calculado |

## Datos

| Dataset | Contenido | Método |
|---|---|---|
| `data/transport/transport_accessibility.csv` | Conectividad interurbana 20 destinos | Sintético (auto-generado) |
| `data/raw/destinations.csv` | Catálogo de los 20 destinos con región y tipo | Estático |
| `data/raw/sustainability_scores.csv` | Puntuaciones ESG por destino | Sintético + referencia externa |
| `src/data/local_mobility.py` | Métricas de movilidad urbana + 260 POIs | Sintético inspirado en OSM |

### Fuentes de inspiración
- **OpenStreetMap** — red de carril bici, puntos de interés, red peatonal
- **GTFS Spain** — feeds de transporte público de ciudades españolas
- **Planes directores de movilidad** — Sevilla, Barcelona, Valencia, Madrid (datos públicos)
- **European Environment Agency** — factores de emisión por modo de transporte

## Arquitectura

```
TUI-Pathfinder/
├── app.py                    # Página de inicio (Streamlit)
├── pages/
│   ├── 1_Conectividad_Nacional.py
│   ├── 2_Accesibilidad_Local.py
│   ├── 3_Rutas_Sostenibles.py
│   ├── 4_Huella_Carbono.py
│   └── 5_Brechas_Infraestructura.py
├── src/
│   ├── data/
│   │   ├── data_loader.py         # Funciones de carga (con st.cache_data)
│   │   ├── transport_generator.py # Genera transport_accessibility.csv
│   │   └── local_mobility.py      # Métricas locales + generador de POIs
│   ├── components/
│   │   ├── map_builder.py         # Mapas Folium
│   │   └── chart_builder.py       # Gráficos Plotly
│   └── config/
│       └── settings.py            # Rutas, colores, configuración
├── data/
│   ├── raw/                       # destinations.csv, sustainability_scores.csv
│   └── transport/                 # CSV auto-generado al arrancar
├── .streamlit/
│   └── config.toml                # Tema dark, puerto 8503
└── requirements.txt
```

## Suite TUI Care Foundation

Pathfinder es el **Reto 4** del conjunto de 5 proyectos del programa Future Shapers Spain:

| Proyecto | Reto | Puerto | Stack |
|---|---|---|---|
| TUI-Sentinel | 1 — Monitor de Sentimiento | 5176 | React + FastAPI |
| TUI-Horizon | 2 — Motor de Recomendaciones | 5175 | React + FastAPI |
| TUI-Atlas | 3 — Dashboard Georreferenciado | 5175 | React (landing) |
| **TUI-Pathfinder** | **4 — Mapas de Accesibilidad** | **8503** | **Streamlit + Folium** |

Los 20 destinos son compartidos entre todos los proyectos del suite.

---

*TUI Care Foundation · Target 8.9 · Universidad Complutense de Madrid · 2026*
