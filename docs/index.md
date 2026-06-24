# Documentacion — TUI Pathfinder

> Reto 4 · TUI Care Foundation Future Shapers Spain · UCM TFM 2026

## Indice

| Documento | Descripcion |
|---|---|
| [architecture.md](architecture.md) | Arquitectura tecnica, estructura de componentes y flujo de datos |
| [setup.md](setup.md) | Instalacion, requisitos y comandos de desarrollo |
| [data-sources.md](data-sources.md) | Fuentes de datos — sinteticos, INE EOH y Overpass API |
| [metrics.md](metrics.md) | Definicion y logica de calculo de todas las metricas |
| [i18n.md](i18n.md) | Sistema de internacionalizacion ES/EN — como anadir traducciones |

## Inicio rapido

```bash
cd TUI-Pathfinder/frontend
npm install
npm run dev        # http://localhost:5174
```

## Descripcion del proyecto

Pathfinder analiza la accesibilidad turistica y la movilidad sostenible en **20 destinos espanoles**. Es una SPA React que genera datos sinteticos de forma determinista (sin backend) e integra datos reales de la API del INE y de Overpass.

Las siete vistas del dashboard cubren:

- **Mapa interactivo** — concentracion turistica, accesibilidad, movilidad y planificador de rutas
- **Accesibilidad** — indices por categoria de POI y analisis de barreras
- **Movilidad sostenible** — reparto modal, emisiones CO2 y calculadora personal
- **Rutas turisticas** — 6 rutas generadas con detalle de waypoints y highlights
- **Recomendaciones IA** — 8 recomendaciones priorizadas con pasos e impacto
- **Analitica** — evolucion mensual de visitantes y comparativa entre destinos
- **Informes** — listado de informes con descarga real en CSV y HTML-a-PDF

## Tecnologias principales

| Tecnologia | Version | Uso |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 5 | Bundler y dev server |
| TypeScript | 5 | Tipado estatico |
| Material UI | 5/6 | Componentes UI |
| React-Leaflet | 4 | Mapa interactivo |
| Recharts | 2 | Graficos (ModalDonut) |
| Framer Motion | 11 | Animaciones |

## Puerto de desarrollo

```
http://localhost:5174
```
