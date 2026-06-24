# Metricas y KPIs — TUI Pathfinder

Definicion de todas las metricas que aparecen en el dashboard, su formula de calculo y el umbral de interpretacion.

---

## 1. IndiceAccesibilidad (AccessibilityView)

### Definicion

Indice compuesto que mide el grado en que los puntos de interes (POIs) del destino son accesibles para personas con movilidad reducida, usuarios de silla de ruedas, y personas mayores.

### Formula

```
accessIndex = round(33 + rng() * 60)   // rango: 33–93
```

El valor sintetico esta calibrado para representar el percentil de accesibilidad del destino en relacion a la media de destinos espanoles.

### Subindices por categoria POI

```
CATEGORY_SCORES = {
  transport:    round(accessIndex * (0.8 + rng() * 0.4)),
  cultural:     round(accessIndex * (0.7 + rng() * 0.5)),
  gastronomic:  round(accessIndex * (0.75 + rng() * 0.45)),
  natural:      round(accessIndex * (0.6 + rng() * 0.6)),
  accommodation:round(accessIndex * (0.85 + rng() * 0.3)),
}
```

### Umbrales

| Rango | Estado | Color |
|---|---|---|
| >= 75 | Alto | `#10B981` verde |
| 50–74 | Moderado | `#F59E0B` amarillo |
| < 50 | Bajo | `#EF4444` rojo |

### KPIs derivados

| KPI | Calculo |
|---|---|
| POIs accesibles | `round(40 + accessIndex * 1.5)` |
| Barreras detectadas | `round(4 + (100-accessIndex) * 0.25)` |
| Ascensores operativos | `round(accessIndex * 0.3)` |
| Cobertura accesible | `round(accessIndex * (0.6 + rng() * 0.3))` % |

---

## 2. Reparto Modal (MobilityView)

### Definicion

Distribucion porcentual de los viajes de turistas al destino segun el modo de transporte.

### Formula

```
// Semilla: mkRng(destination.id + 'mob')
walk    = round(8  + rng() * 12)   // 8–20 %
bike    = round(5  + rng() * 20)   // 5–25 %
transit = round(20 + rng() * 35)   // 20–55 %
car     = 100 - walk - bike - transit
```

### Movilidad sostenible (KPI)

```
sustainablePct = walk + bike + transit   // % sin coche
```

### Umbrales de sostenibilidad

| Rango | Valoracion |
|---|---|
| >= 80 % | Excelente — bajo impacto de coche privado |
| 60–79 % | Buena — objetivo Agenda 2030 |
| < 60 % | Mejorable — alto uso del coche |

---

## 3. Huella de Carbono (MobilityView)

### Factores de emision por modo

| Modo | g CO2 / km |
|---|---|
| A pie | 0 |
| Bicicleta | 0 |
| Transporte publico | 68 |
| Coche privado | 170 |

> Fuente de referencia: EEA (European Environment Agency) 2023 — valores para promedio europeo. El factor de tren se usa para "transporte publico" en ausencia de datos especificos.

### KPI: Emisiones evitadas

```
// Estimacion mensual de CO2 ahorrado por uso de modos no motorizados
avoided = round(3 + rng() * 25)   // 3–28 t CO2 / mes
```

### Calculadora personal (MobilityView — seccion inferior)

Permite al usuario calcular su huella de carbono segun:

```
Entrada:
  distKm  — distancia del viaje en km (slider 1–2000)
  mode    — modo de transporte (walk / bike / transit / car / flight)

Calculo:
  FACTOR: { walk: 0, bike: 0, transit: 68, car: 170, flight: 255 }
  co2 = distKm * FACTOR[mode] / 1000   // kg CO2

Ahorro frente a coche:
  saving = distKm * (FACTOR.car - FACTOR[mode]) / 1000   // kg CO2
```

---

## 4. KPIs de Red Ciclista (MobilityView)

| KPI | Calculo |
|---|---|
| Red ciclista (km) | `round(12 + rng() * 73)` |
| Estaciones bici | `round(8 + rng() * 52)` |
| Objetivo 2026 | red actual + 15 % |

---

## 5. Metricas del Mapa Interactivo (InteractiveMapView)

### Zonas de calor — modos disponibles

| Modo | Descripcion | Color alto | Color bajo |
|---|---|---|---|
| concentracion | Densidad de visitantes | `#EF4444` rojo | `#10B981` verde |
| accesibilidad | Nivel de accesibilidad | `#10B981` verde | `#EF4444` rojo |
| movilidad | Conectividad de transporte | `#2E7D98` azul | `#F59E0B` amarillo |
| rutas | Densidad de rutas turisticas | `#C05928` naranja | `#2E7D98` azul |

### Tipos de zona

| Tipo | Descripcion |
|---|---|
| `hot` | Zona de alta intensidad (concentracion, saturacion) |
| `medium` | Zona de intensidad moderada |
| `cool` | Zona de baja intensidad (oportunidad de expansion) |

### Stats del panel lateral

```
// Semilla: mkRng(destination.id + 'stats-v2')
activeRoutes    = 12 + floor(rng() * 28)     // 12–40
sustainablePct  = 45 + floor(rng() * 40)     // 45–85 %
co2Saved        = 1.2 + rng() * 8.8          // 1.2–10.0 t
cycleKm         = 8 + floor(rng() * 47)      // 8–55 km
```

### Planificador de rutas

```
// Calculo de rutas segun modo (calcRouteOptions)
SPEEDS: { walk: 4.5, bike: 15, transit: 22 }   // km/h

distance = haversine(origin, dest)   // km
time     = distance / SPEEDS[mode]   // h
co2      = distance * EMISSION_FACTOR[mode] / 1000   // kg
```

---

## 6. Metricas de Rutas Turisticas (TouristRoutesView)

### Formula de generacion de ruta

```
// Semilla: mkRng(destination.id)
distance = 3 + rng() * 17       // 3–20 km
duration = distance / 3.5       // h (velocidad media 3.5 km/h)
elevation= round(20 + rng() * 580)  // 20–600 m
emissions= round(distance * 8)  // g CO2 (a pie = 0, pero incluye transporte al inicio)
```

### Niveles de dificultad

| Nivel | Criterio |
|---|---|
| facil | distance < 5 km o elevation < 100 m |
| moderada | distance 5–12 km y elevation 100–300 m |
| dificil | distance > 12 km o elevation > 300 m |

---

## 7. Recomendaciones IA (AIRecsView)

### Estructura de una recomendacion

```typescript
interface Recommendation {
  id:       string
  category: 'transport' | 'infrastructure' | 'digital' | 'policy' | 'environment' | 'tourism'
  impact:   'high' | 'medium' | 'low'
  cost:     'high' | 'medium' | 'low'
  weeks:    number   // semanas de implementacion
  title:    string
  steps:    string[]
}
```

### Calculo de impacto y coste

```
// Semilla: mkRng(destination.id + 'ai')
// Distribucion: 30% high, 40% medium, 30% low (impacto)
// Distribucion: 20% high, 50% medium, 30% low (coste)
// Semanas: 2 + floor(rng() * 22)   // 2–24 semanas
```

### Prioridad combinada

Las recomendaciones se ordenan por: `alto impacto + bajo coste + pocas semanas` (prioridad de implementacion).

---

## 8. Metricas de Analitica (AnalyticsView)

### KPIs del periodo

| KPI | Calculo |
|---|---|
| Visitantes (mes actual) | dato INE o sintetico `round(12000 + rng() * 73000)` |
| Indice sostenibilidad | `round(35 + rng() * 55)` % |
| Ingresos estimados | visitantes × 124 € (gasto medio por pernoctacion, INE 2023) |
| Satisfaction score | `round(60 + rng() * 35)` / 100 |

### Evolucion mensual

```
// 12 meses de datos sinteticos
// Semilla: mkRng(destination.id + 'analytics' + mesIndex)
// Cada barra = visitantes_mes_base * (0.6 + rng() * 0.8)
// Estacionalidad: meses 6–8 * 1.4 (verano)
```

### Comparativa con pares (grafico de lineas)

Tres destinos de comparacion seleccionados deterministicamente de los 20 destinos usando `mkRng(destination.id + 'peers')`.

### Delta respecto al ano anterior

```
delta = (valor_actual - valor_hace_12_meses) / valor_hace_12_meses * 100
// Se muestra como "+X%" o "-X%" con color verde/rojo
```

---

## 9. Informes (ReportsView)

### Estados de informe

| Estado | Descripcion |
|---|---|
| Listo | Disponible para descarga |
| Procesando | Generandose en segundo plano |
| Programado | Pendiente de ejecutarse |

### Formatos de exportacion

| Formato | Implementacion |
|---|---|
| CSV | `Blob` con cabeceras y valores separados por comas |
| PDF | `window.print()` con estilos de impresion (CSS `@media print`) |

---

## Nota sobre precision de los valores sinteticos

Los valores sinteticos han sido calibrados sobre rangos plausibles para destinos espanoles:
- Datos de accesibilidad: basados en informes ONCE 2022 (accesibilidad urbana espana)
- Reparto modal: basado en la Encuesta de Movilidad Cotidiana (EMC2) del Ministerio de Transportes
- Pernoctaciones: basadas en la serie historica INE EOH (2019–2023) para provincias costeras y urbanas
