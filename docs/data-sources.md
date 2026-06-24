# Fuentes de datos — TUI Pathfinder

## Resumen

| Fuente | Tipo | Vistas que la usan | Requiere conexion |
|---|---|---|---|
| RNG determinista | Sintetico | Todas | No |
| INE EOH | Real — API publica | AnalyticsView | Si |
| Overpass API | Real — OSM | InteractiveMapView (movilidad) | Si |
| Unsplash | Real — fotos | TopBar, Sidebar | Si |
| FlagCDN | Real — imagenes | TopBar | Si |

---

## 1. Datos sinteticos — RNG determinista

### Descripcion

Pathfinder no tiene backend. Todos los datos de movilidad, accesibilidad, rutas, recomendaciones y estadisticas se generan en el navegador usando un **generador de numeros pseudoaleatorios lineal congruencial (LCG)** sembrado por el identificador del destino.

### Justificacion

La generacion determinista garantiza:
- Los mismos valores para el mismo destino en todas las sesiones
- No se necesita base de datos ni API propia
- Los datos cambian coherentemente al cambiar de destino
- El prototipo funciona offline (excepto APIs externas opcionales)

### Implementacion

```typescript
function mkRng(seed: string): () => number {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    return (s >>> 0) / 4294967296   // float en [0, 1)
  }
}
```

### Uso por vista

```
// AccesibilityView
const rng = mkRng(destination.id + 'acc')
const accessIndex = Math.round(33 + rng() * 60)   // 33–93

// MobilityView
const rng = mkRng(destination.id + 'mob')
const cycleNetwork = Math.round(12 + rng() * 73)  // 12–85 km

// AIRecsView
const rng = mkRng(destination.id + 'ai')
// 8 recomendaciones con categoria, impacto y coste variables

// TouristRoutesView
const rng = mkRng(destination.id)
// 6 rutas con distancia, duracion, emisiones y waypoints
```

### Rangos de valores sinteticos

| Metrica | Rango | Unidad |
|---|---|---|
| Indice de accesibilidad | 33 – 93 | / 100 |
| POIs accesibles | 40 – 180 | unidades |
| Barreras detectadas | 4 – 24 | unidades |
| Red ciclista | 12 – 85 | km |
| Estaciones de bici | 8 – 60 | unidades |
| Emisiones evitadas | 3 – 28 | t CO2 |
| Cobertura transporte | 40 – 94 | % |
| Reparto modal bici | 5 – 25 | % |
| Reparto modal coche | variable | % (complemento al 100) |
| Visitantes mes | 12 000 – 85 000 | visitantes |
| Emisiones coche | 1 800 – 3 200 | g CO2/viaje |

---

## 2. INE EOH — Pernoctaciones hoteleras

### Descripcion

La **Encuesta de Ocupacion Hotelera (EOH)** del Instituto Nacional de Estadistica proporciona datos reales de pernoctaciones mensuales por provincia. Pathfinder la usa en `AnalyticsView` cuando el destino tiene una serie disponible.

### API

```
GET https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{codigo_serie}?nult=36
```

La funcion `fetchPernoctaciones(destId)` en `src/api/ine.ts` mapea cada `destination.id` a un codigo de serie INE y obtiene los ultimos 36 meses.

### Estructura de respuesta

```typescript
interface INEObs {
  year:           number
  month:          number   // 1–12
  pernoctaciones: number   // pernoctaciones del mes
}
```

### Comportamiento de fallback

- Si la peticion falla o el destino no tiene codigo INE: se usan datos sinteticos
- El badge **"Datos reales"** aparece solo cuando la peticion devuelve datos validos
- El indicador **"cargando INE..."** se muestra durante la peticion

### Licencia

INE Open Data — [Licencia de reutilizacion de la informacion del sector publico](https://www.ine.es/ss/Satellite?L=es_ES&c=Page&cid=1259942408928&p=1259942408928&pagename=ProductosYServicios%2FPYSLayout)

---

## 3. Overpass API — Carriles bici

### Descripcion

La **Overpass API** es la API de consulta de OpenStreetMap. Pathfinder la usa en `InteractiveMapView` (modo Movilidad) para obtener los carriles bici reales del area del destino y representarlos como polilineas verdes sobre el mapa.

### Consulta

```
POST https://overpass-api.de/api/interpreter
Body: [out:json][timeout:10];
      way["highway"="cycleway"](bbox);
      (._;>;);
      out geom;
```

El `bbox` se calcula con `destination.bboxDelta`:

```typescript
const bbox = [
  lat - delta, lon - delta,
  lat + delta, lon + delta
].join(',')
```

### Estructura de resultado

```typescript
interface CyclePath {
  id:     number
  coords: [number, number][]   // pares [lat, lon]
}
```

### Comportamiento si falla

Si la peticion a Overpass falla o tarda mas de 10 segundos, `setLivePaths([])` y el mapa muestra las zonas de calor sin carriles bici. Esto no afecta a los demas modos del mapa.

### Licencia

OpenStreetMap contributors — [ODbL 1.0](https://www.openstreetmap.org/copyright)

---

## 4. Unsplash — Fotos de destino

### Descripcion

El hook `useDestinationPhoto(destId, destName)` obtiene una foto representativa de cada destino para usarla como imagen de fondo en la TopBar y en el sidebar.

### Uso

```typescript
const photo = useDestinationPhoto(destination.id, destination.name)
// -> string | null (URL de la imagen)
```

Si la peticion falla o no hay foto disponible, el fondo muestra el gradiente solido del tema.

---

## 5. FlagCDN — Imagenes de banderas

### Descripcion

Las banderas del selector de idioma se sirven desde `flagcdn.com`, un CDN publico especializado en imagenes de banderas nacionales.

```
https://flagcdn.com/w40/es.png   // Espana 40px de ancho
https://flagcdn.com/w40/us.png   // Estados Unidos 40px de ancho
```

Se usan en `TopBar.tsx` como elementos `<img>` dentro de los botones de idioma.

---

## Nota sobre transparencia de datos

Todos los valores sinteticos se generan algoritmicamente con el fin de **demostrar las capacidades del dashboard** y simular el tipo de datos que existirian en un entorno de produccion. Los rangos de los valores han sido calibrados para ser plausibles segun los datos reales conocidos de movilidad urbana en ciudades espanolas:

- Indices de carril bici: basados en planes de movilidad urbana de Barcelona, Sevilla y Valencia
- Factores de emision: basados en valores EEA 2023 (European Environment Agency)
- Reparto modal: calibrado segun encuestas de movilidad del Ministerio de Transportes espanol

En produccion, estos datos sinteticos se sustituirian por las fuentes reales citadas en cada metrica (ver [metrics.md](metrics.md)).
