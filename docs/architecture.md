# Arquitectura tecnica — TUI Pathfinder

## Vision general

Pathfinder es una **Single Page Application (SPA)** React sin backend propio. Todo el procesamiento ocurre en el navegador: los datos sinteticos se generan en tiempo de ejecucion mediante un generador de numeros pseudoaleatorios (RNG) determinista, y los datos reales se obtienen directamente desde APIs publicas (INE, Overpass).

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                            │
│                                                             │
│  ┌───────────┐   ┌──────────────────────────────────────┐  │
│  │  Sidebar  │   │           Vista activa                │  │
│  │  + Dest.  │   │  (InteractiveMap / Accessibility /   │  │
│  │  Selector │   │   Mobility / Routes / AI / Analytics │  │
│  └─────┬─────┘   │   / Reports)                         │  │
│        │         └──────────────────┬───────────────────┘  │
│        │                            │                       │
│  ┌─────▼─────────────────────────────────────────────────┐  │
│  │              App.tsx — Layout principal               │  │
│  │  TopBar | Sidebar | <ActiveView />                    │  │
│  └─────────────────────────────┬─────────────────────────┘  │
│                                │                            │
│  ┌─────────────────────────────▼─────────────────────────┐  │
│  │                   Context / Estado global             │  │
│  │  DestinationContext (destino activo)                  │  │
│  │  LanguageContext    (idioma ES/EN + t())              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  RNG sintet. │  │   INE EOH API  │  │  Overpass API  │  │
│  │  mkRng(seed) │  │  pernoctac.    │  │  carril bici   │  │
│  └──────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de archivos

```
frontend/src/
├── api/
│   ├── ine.ts               # fetchPernoctaciones(destId) -> INEObs[]
│   └── overpass.ts          # fetchCyclePaths(lat, lon, id, delta) -> CyclePath[]
├── components/
│   ├── TopBar.tsx           # Cabecera: idioma, periodo, avatar
│   ├── Sidebar.tsx          # Navegacion lateral + selector de destino
│   ├── ModalDonut.tsx       # Donut de reparto modal (panel lateral)
│   ├── InteractiveMapView.tsx
│   ├── AccessibilityView.tsx
│   ├── MobilityView.tsx
│   ├── TouristRoutesView.tsx
│   ├── AIRecsView.tsx
│   ├── AnalyticsView.tsx
│   └── ReportsView.tsx
├── context/
│   ├── DestinationContext.tsx   # Proveedor de destino activo
│   └── LanguageContext.tsx      # Proveedor i18n + getT(lang)
├── data/
│   ├── destinations.ts          # Array de 20 destinos tipados
│   └── mockData.ts              # Datos base de reparto modal
├── hooks/
│   └── useDestinationPhoto.ts   # Foto de destino via Unsplash
├── i18n/
│   └── translations.ts          # Objeto typed as const con ~300 claves x idioma
└── App.tsx                      # Layout principal + router de vistas
```

---

## Vistas y componentes

| Componente | Vista | Contenido principal |
|---|---|---|
| `InteractiveMapView` | Mapa interactivo | Leaflet + capas de calor + planificador de rutas |
| `AccessibilityView` | Accesibilidad | Barras por categoria POI + analisis de barreras |
| `MobilityView` | Movilidad sostenible | Donut modal, CO2 por modo, calculadora huella |
| `TouristRoutesView` | Rutas turisticas | 6 rutas con waypoints, dificultad, highlights |
| `AIRecsView` | Recomendaciones IA | 8 recomendaciones expandibles con pasos e impacto |
| `AnalyticsView` | Analitica | Grafico barras mensual + comparativa de destinos |
| `ReportsView` | Informes | Tabla de informes + descarga CSV/PDF |
| `ModalDonut` | (panel lateral home) | Donut de reparto modal con Recharts |

---

## Estado global

### DestinationContext

Almacena el destino activo seleccionado por el usuario. Todos los componentes consumen este contexto para generar datos con el mismo `destination.id` como semilla.

```typescript
interface Destination {
  id: string          // semilla para RNG y APIs
  name: string
  label: string       // "Ciudad, Region"
  region: string
  lat: number
  lon: number
  zoom: number
  bboxDelta: number   // radio para Overpass bbox
}
```

### LanguageContext

Gestiona el idioma activo (ES/EN) y expone la funcion `t(key)` tipada. El idioma se persiste en `localStorage('pathfinder_lang')`.

```typescript
const { lang, setLang, t } = useLanguage()
// t() devuelve string; TypeScript valida que la clave exista
```

---

## Generacion de datos sinteticos

Cada vista usa `mkRng(destination.id + sufijo)` para generar valores distintos por destino pero reproducibles. El sufijo garantiza que cada vista use una secuencia independiente:

| Sufijo | Vista |
|---|---|
| `'acc'` | AccessibilityView |
| `'mob'` | MobilityView |
| `'analytics'` | AnalyticsView |
| `'ai'` | AIRecsView |
| `'routes'` | TouristRoutesView |
| `'stats-v2'` | InteractiveMapView (stats) |
| `mode` (string) | InteractiveMapView (zonas de calor) |

```typescript
function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}
```

---

## Integraciones con APIs externas

### INE EOH (AnalyticsView)

- **Endpoint**: `https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{serie}?nult=36`
- **Datos**: pernoctaciones hoteleras mensuales por provincia
- **Uso**: se muestra en AnalyticsView cuando hay datos reales disponibles; si la peticion falla, se usa el fallback sintetico
- **Logica**: `src/api/ine.ts` — `fetchPernoctaciones(destId)`

### Overpass API (InteractiveMapView — modo movilidad)

- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Consulta**: ways con `highway=cycleway` en bbox del destino
- **Uso**: traza carriles bici reales como `<Polyline>` verde en el mapa
- **Logica**: `src/api/overpass.ts` — `fetchCyclePaths(lat, lon, id, delta)`

### Unsplash (useDestinationPhoto)

- **Hook**: `useDestinationPhoto(destId, destName)` -> `string | null`
- **Uso**: foto de fondo en la TopBar y en el sidebar

### FlagCDN (TopBar)

- **URL**: `https://flagcdn.com/w40/{cc}.png` (cc = 'es' o 'us')
- **Uso**: imagenes de banderas para el selector de idioma

---

## Flujo de datos por vista

```
Usuario selecciona destino
        |
        v
DestinationContext.destination actualizado
        |
        |--- InteractiveMapView: mkRng(id+'mode') -> zonas de calor
        |                        fetchCyclePaths()  -> carriles reales
        |
        |--- AccessibilityView: mkRng(id+'acc') -> categorias y barreras
        |
        |--- MobilityView:      mkRng(id+'mob') -> modal share y emisiones
        |
        |--- TouristRoutesView: mkRng(id) -> 6 rutas con waypoints
        |
        |--- AIRecsView:        mkRng(id+'ai') -> 8 recomendaciones
        |
        |--- AnalyticsView:     mkRng(id+'analytics') -> datos mensuales
        |                       fetchPernoctaciones() -> datos reales INE
        |
        +--- ReportsView:       lista estatica + descarga CSV/HTML
```

---

## Convenciones de codigo

- Todos los textos visibles al usuario deben usar `t('clave')` — nunca strings literales en JSX
- Las metricas calculadas van dentro de `useMemo([destination.id])` para evitar recalculos
- Los componentes de vista son `export default function NombreView()` — sin props, consumen contextos directamente
- Sub-componentes internos (ej: `RecDetail`, `RouteCard`) se definen en el mismo archivo si solo se usan ahi
