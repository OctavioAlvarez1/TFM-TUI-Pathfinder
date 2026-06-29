# Pathfinder: Dashboard de Movilidad Sostenible y Accesibilidad Turística

> **Reto 4 — TUI Care Foundation Future Shapers Spain**
> Máster Data Science, Big Data & Business Analytics · UCM · 2026
>
> Álvarez García, Octavio

---

## Resumen

El turismo en España representa un pilar fundamental de la economía nacional, habiendo alcanzado en 2024 los 248.700 millones de euros (15,6 % del PIB) con 93,8 millones de turistas internacionales (WTTC, 2024; INE, 2025). Este crecimiento impone retos estructurales sobre la movilidad urbana y la accesibilidad en los principales destinos turísticos, donde la saturación de infraestructuras y el alto uso del vehículo privado generan impactos ambientales y sociales crecientes.

Este trabajo presenta **Pathfinder**, un dashboard analítico interactivo desarrollado como Single Page Application (SPA) en React y TypeScript, orientado al análisis de la movilidad sostenible y la accesibilidad turística en 20 destinos españoles. La solución integra datos reales de la API del INE (Encuesta de Ocupación Hotelera) y de OpenStreetMap vía Overpass API, junto con generación determinista de datos sintéticos para aquellas métricas sin fuente pública disponible. La arquitectura es totalmente cliente, sin backend propio, garantizando portabilidad y despliegue inmediato mediante contenedores Docker.

**Palabras clave:** movilidad sostenible, accesibilidad turística, dashboard analítico, React, TypeScript, datos sintéticos deterministas, OpenData, Docker.

---

**Abstract**

Tourism in Spain, a major contributor to the national economy, faces structural challenges in urban mobility and accessibility at key destinations. This work presents Pathfinder, an interactive analytics dashboard built as a React/TypeScript SPA for analysing sustainable mobility and tourist accessibility across 20 Spanish destinations. The system integrates real data from the INE Hotel Occupancy Survey (EOH) and OpenStreetMap via Overpass API, alongside deterministic synthetic data generation for metrics without a public source. The architecture is fully client-side and deployable via Docker containers.

**Key words:** sustainable mobility, tourist accessibility, analytics dashboard, React, TypeScript, deterministic synthetic data, OpenData, Docker.

---

## Índice

1. Introducción
2. Marco conceptual
3. Descripción de datos y transformaciones
4. Arquitectura técnica
5. Funcionalidades del dashboard
6. Despliegue y productivización
7. Conclusiones
8. Bibliografía

---

## 1. Introducción

### 1.1 Contexto y motivación

España se ha consolidado como uno de los principales destinos turísticos del mundo. En 2024 el sector turístico alcanzó los 248.700 millones de euros, representando el 15,6 % del PIB nacional y generando aproximadamente 3 millones de empleos directos (WTTC, 2024). Con 93,8 millones de turistas internacionales en 2024, la demanda sobre las infraestructuras de movilidad y los servicios de accesibilidad se encuentra en máximos históricos.

Sin embargo, este crecimiento genera desequilibrios notables. La concentración de visitantes en un número reducido de destinos provoca saturación de infraestructuras, deterioro de la calidad de vida de los residentes, elevadas emisiones de CO2 asociadas al transporte turístico y deficiencias en la accesibilidad universal que limitan la inclusión de turistas con movilidad reducida.

En este contexto, el uso de datos se convierte en una herramienta estratégica para que los gestores de destinos turísticos puedan tomar decisiones informadas sobre inversión en infraestructuras ciclistas, planificación de rutas accesibles, distribución de la demanda turística y reducción de la huella de carbono del sector.

### 1.2 Objetivos del trabajo

El objetivo principal de Pathfinder es ofrecer a los gestores de destinos turísticos un cuadro de mando interactivo que centralice los indicadores clave de movilidad sostenible y accesibilidad en los 20 destinos del ecosistema TUI Care Foundation Future Shapers Spain. Los objetivos específicos son:

- **O1**: Visualizar la distribución espacial de la concentración turística, los niveles de accesibilidad y la conectividad de transporte mediante un mapa interactivo con cuatro modos de análisis.
- **O2**: Calcular y presentar el índice de accesibilidad por categoría de punto de interés (transporte, cultural, gastronómico, natural, alojamiento).
- **O3**: Analizar el reparto modal de los visitantes y cuantificar las emisiones de CO2 asociadas a cada modo de transporte.
- **O4**: Generar y mostrar rutas turísticas con información detallada de distancia, elevación, dificultad y emisiones.
- **O5**: Priorizar recomendaciones de mejora basadas en impacto, coste y tiempo de implementación.
- **O6**: Proporcionar análisis histórico de pernoctaciones con datos reales del INE y comparativa entre destinos pares.
- **O7**: Garantizar la accesibilidad lingüística del dashboard mediante soporte bilingüe español/inglés.
- **O8**: Asegurar la portabilidad y reproducibilidad del sistema mediante contenerización Docker.

---

## 2. Marco conceptual

### 2.1 Dashboards de movilidad sostenible

Los dashboards analíticos de movilidad urbana han experimentado una expansión notable en la última década, impulsados por la disponibilidad de datos abiertos y el auge de las Smart Cities. Estos sistemas integran indicadores de diferentes dimensiones —ambiental, social e infraestructural— para proporcionar una visión holística del estado de la movilidad en un territorio.

En el ámbito turístico, la movilidad sostenible comprende el análisis del reparto modal (proporción de desplazamientos en cada modo de transporte), la infraestructura ciclista disponible, la cobertura del transporte público y la huella de carbono generada por los visitantes. Un dashboard efectivo debe permitir la comparación entre destinos, el seguimiento temporal de indicadores y la identificación de palancas de mejora accionables.

### 2.2 Accesibilidad turística

La accesibilidad turística se refiere a la capacidad de los destinos para ser disfrutados por todas las personas, independientemente de sus capacidades físicas, sensoriales o cognitivas. La Organización Mundial del Turismo (OMT) estima que más del 15 % de la población mundial vive con algún tipo de discapacidad, lo que representa un segmento turístico de elevado potencial económico no atendido.

En el contexto de Pathfinder, el análisis de accesibilidad abarca la evaluación de puntos de interés (POIs) por categoría, la cuantificación de barreras arquitectónicas y la disponibilidad de infraestructuras adaptadas (ascensores, rampas, señalización accesible).

### 2.3 Datos sintéticos deterministas

En contextos donde los datos reales no están disponibles o son de acceso restringido, la generación de datos sintéticos deterministas permite construir prototipos funcionales con valores estadísticamente plausibles y reproducibles. La clave de esta aproximación es la vinculación de la semilla del generador al identificador del destino, garantizando que los mismos datos se generen en cada sesión sin necesidad de almacenamiento externo.

Pathfinder implementa un Generador Lineal Congruencial (LCG) —un algoritmo clásico de generación pseudoaleatoria— como función de hashing determinista:

```
s(0) = hash(seed)
s(n+1) = (1664525 × s(n) + 1013904223) mod 2^32
rng() = s(n+1) / 2^32  →  [0, 1)
```

### 2.4 Internacionalización en aplicaciones web

La internacionalización (i18n) en aplicaciones de análisis de datos turísticos es un factor crítico para la adopción internacional. Las soluciones modernas de i18n en React utilizan contextos para propagar el idioma activo y funciones de traducción tipadas que garantizan la coherencia de la interfaz en tiempo de compilación (TypeScript).

Pathfinder implementa un sistema i18n personalizado basado en un objeto de traducciones `as const` con más de 300 claves en español e inglés, accesible mediante el hook `useLanguage()`. El idioma se persiste en `localStorage` para mantener la preferencia del usuario entre sesiones.

---

## 3. Descripción de datos y transformaciones

### 3.1 Datos sintéticos deterministas

La totalidad de los indicadores de movilidad, accesibilidad, rutas turísticas y recomendaciones se genera en el navegador del usuario mediante el algoritmo LCG descrito en la sección 2.3. Este enfoque garantiza:

- **Reproducibilidad**: los mismos valores para el mismo destino en cualquier sesión y dispositivo.
- **Coherencia**: los indicadores de un destino cambian de forma coherente al seleccionar otro destino.
- **Portabilidad**: el sistema funciona sin conexión a internet (excepto APIs externas opcionales).
- **Privacidad**: no se transmiten datos de usuario a ningún servidor.

La semilla de generación combina el identificador del destino con un sufijo específico por vista, garantizando secuencias independientes para cada tipo de métrica.

**Tabla 3.1.** Sufijos de semilla por vista

| Sufijo | Vista | Ejemplo de métrica generada |
|---|---|---|
| `'acc'` | Accesibilidad | Índice de accesibilidad (33–93) |
| `'mob'` | Movilidad | Red ciclista en km (12–85) |
| `'analytics'` | Analítica | Visitantes mensuales (12.000–85.000) |
| `'ai'` | Recomendaciones IA | Impacto y coste de recomendaciones |
| `mode` | Mapa interactivo | Intensidad de zonas de calor |
| `'stats-v2'` | Mapa interactivo | KPIs del panel lateral |

### 3.2 INE EOH — Pernoctaciones hoteleras

La Encuesta de Ocupación Hotelera (EOH) del Instituto Nacional de Estadística proporciona datos reales de pernoctaciones mensuales por provincia. Pathfinder consulta esta API directamente desde el navegador para enriquecer el módulo de analítica.

- **Endpoint**: `https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{serie}?nult=36`
- **Frecuencia**: mensual; los últimos 36 meses disponibles
- **Fallback**: si la petición falla, se usan datos sintéticos transparentemente indicados en la interfaz

El uso de datos reales del INE aporta credibilidad al análisis y permite identificar patrones estacionales reales frente a los valores sintéticos calibrados.

### 3.3 Overpass API — Red ciclista OpenStreetMap

La Overpass API permite consultar los datos geográficos de OpenStreetMap con alta granularidad. Pathfinder la utiliza para obtener los carriles bici reales del área de cada destino y representarlos sobre el mapa interactivo.

- **Consulta**: `way["highway"="cycleway"](bbox)` en el bounding box del destino
- **Timeout**: 10 segundos; si supera este límite, el mapa continúa funcionando sin carriles bici
- **Licencia**: OpenStreetMap contributors — ODbL 1.0

### 3.4 Enriquecimiento visual — FlagCDN y Unsplash

El selector de idioma utiliza imágenes de banderas nacionales servidas desde `flagcdn.com`, un CDN especializado que garantiza disponibilidad y resolución óptima en todos los navegadores y sistemas operativos. Esta decisión técnica resuelve el problema de los emojis de banderas regionales, que no se renderizan correctamente en Windows.

Las fotografías de destino se obtienen de Unsplash mediante el hook `useDestinationPhoto()`, aportando contexto visual al selector de destino.

### 3.5 Calibración de rangos sintéticos

Los valores sintéticos se han calibrado para ser estadísticamente plausibles en el contexto de los destinos turísticos españoles:

**Tabla 3.2.** Rangos de valores sintéticos y fuentes de calibración

| Métrica | Rango generado | Fuente de calibración |
|---|---|---|
| Índice de accesibilidad | 33–93 / 100 | Informes ONCE 2022 |
| Red ciclista | 12–85 km | Planes de Movilidad Urbana (Barcelona, Sevilla, Valencia) |
| Reparto modal sostenible | 20–80 % | EMC2 — Ministerio de Transportes, 2023 |
| Visitantes mensuales | 12.000–85.000 | Serie histórica INE EOH 2019–2023 |
| Emisiones CO2 (coche) | 1.800–3.200 g/viaje | EEA Transport Emissions, 2023 |
| Estaciones de bicicleta | 8–60 unidades | Inventario BiciMAD / Bicing 2023 |

---

## 4. Arquitectura técnica

### 4.1 Visión general

Pathfinder es una Single Page Application sin backend propio. Toda la lógica de negocio, generación de datos y renderizado ocurre en el navegador del cliente. Las únicas dependencias externas son tres APIs públicas (INE, Overpass, Unsplash/FlagCDN) consultadas opcionalmente.

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (React SPA)                     │
│                                                             │
│  ┌────────────┐   ┌─────────────────────────────────────┐  │
│  │  TopBar    │   │         Vista activa                  │  │
│  │  Sidebar   │   │  (Map / Accessibility / Mobility /   │  │
│  └────────────┘   │   Routes / AI / Analytics / Reports) │  │
│                   └──────────────────┬──────────────────┘  │
│                                      │                      │
│  ┌───────────────────────────────────▼──────────────────┐  │
│  │             DestinationContext + LanguageContext      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ mkRng(seed)  │  │  INE EOH API   │  │ Overpass API  │  │
│  │ datos sinté. │  │  pernoctac.    │  │ carril bici   │  │
│  └──────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Stack tecnológico

**Tabla 4.1.** Stack tecnológico de Pathfinder

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | Framework UI — componentes y estado |
| TypeScript | 6 | Tipado estático — seguridad en tiempo de compilación |
| Vite | 8 | Bundler y servidor de desarrollo |
| Material UI | 9 | Sistema de diseño — componentes y tokens |
| React-Leaflet | 5 | Mapa interactivo — visualización geoespacial |
| Recharts | 3 | Gráficos — donut de reparto modal |
| Framer Motion | 12 | Animaciones de transición |
| nginx | 1.27 | Servidor HTTP en producción (contenedor Docker) |
| Docker | 27+ | Contenerización y despliegue |

### 4.3 Estructura de componentes

```
frontend/src/
├── api/
│   ├── ine.ts               # fetchPernoctaciones(destId) → INEObs[]
│   └── overpass.ts          # fetchCyclePaths(lat, lon, id, delta) → CyclePath[]
├── components/              # 10 componentes de vista
├── context/
│   ├── DestinationContext.tsx   # Destino activo global
│   └── LanguageContext.tsx      # i18n ES/EN + t()
├── data/
│   ├── destinations.ts          # 20 destinos tipados
│   └── mockData.ts              # Datos base reparto modal
├── hooks/
│   └── useDestinationPhoto.ts   # Foto Unsplash por destino
├── i18n/
│   └── translations.ts          # ~300 claves × 2 idiomas
└── App.tsx                      # Layout principal + router
```

### 4.4 Patrones de diseño clave

**Datos deterministas por destino**

Cada vista instancia su propio generador con semilla distinta:
```typescript
const rng = mkRng(destination.id + 'acc')
const index = Math.round(33 + rng() * 60)
```

**i18n tipada**

El tipo `TranslationKey` se deriva directamente de las claves del objeto `translations.es`, lo que hace que TypeScript emita error en tiempo de compilación si se usa una clave inexistente o si faltan claves en algún idioma.

**Reactividad al cambio de destino**

Todos los `useMemo` que generan datos sintéticos incluyen `destination.id` en su array de dependencias, garantizando regeneración inmediata al cambiar de destino sin rerenderizados innecesarios.

---

## 5. Funcionalidades del dashboard

### 5.1 Mapa interactivo

El mapa interactivo es la vista principal de Pathfinder. Implementado con React-Leaflet sobre tiles CartoDB Voyager, ofrece cuatro modos de análisis y un planificador de rutas integrado.

**Tabla 5.1.** Modos de análisis del mapa interactivo

| Modo | Descripción | Colores |
|---|---|---|
| Concentración | Densidad de visitantes por zona | Alto: rojo `#EF4444` · Bajo: verde `#10B981` |
| Accesibilidad | Nivel de accesibilidad por zona | Alto: verde `#10B981` · Bajo: rojo `#EF4444` |
| Movilidad | Conectividad de transporte sostenible | Alto: azul `#2E7D98` · Bajo: amarillo `#F59E0B` |
| Rutas | Densidad de rutas turísticas | Alto: naranja `#C05928` · Bajo: azul `#2E7D98` |

El planificador de rutas calcula opciones de desplazamiento entre puntos de interés del destino considerando tres modos de transporte (a pie, bicicleta, transporte público), con estimación de distancia, tiempo y emisiones de CO2.

Los carriles bici reales obtenidos de OpenStreetMap se superponen como polilíneas verdes en el modo Movilidad, diferenciando visualmente la infraestructura real de la sintética.

### 5.2 Accesibilidad

La vista de accesibilidad presenta el índice compuesto del destino y su desglose por cinco categorías de POI: transporte, cultural, gastronómico, natural y alojamiento. Un análisis de barreras detectadas completa la información con el número de obstáculos identificados y los ascensores operativos.

### 5.3 Movilidad sostenible

Esta vista integra tres análisis complementarios:

- **Reparto modal**: donut CSS con `conic-gradient` mostrando la distribución porcentual entre los cuatro modos de transporte.
- **Emisiones por modo**: tabla comparativa de huella de carbono (g CO2/km) para tren, bus, coche y avión.
- **Calculadora personal**: permite al usuario calcular su huella de carbono para un viaje específico y el ahorro frente al coche privado.

**Tabla 5.2.** Factores de emisión por modo de transporte

| Modo | kg CO2 / 100 km | Fuente |
|---|---|---|
| A pie | 0 | — |
| Bicicleta | 0 | — |
| Tren | 14 | EEA 2023 |
| Bus | 68 | EEA 2023 |
| Coche | 170 | EEA 2023 |
| Avión | 255 | EEA 2023 |

### 5.4 Rutas turísticas

Seis rutas turísticas por destino, generadas deterministamente con waypoints interpolados sobre la posición real del destino. Cada ruta incluye distancia, duración estimada, elevación acumulada, nivel de dificultad y puntos destacados.

### 5.5 Recomendaciones IA

Ocho recomendaciones priorizadas por destino, organizadas por categoría (transporte, infraestructura, digital, política, medio ambiente, turismo) e indicadores de impacto, coste y tiempo de implementación. Cada recomendación incluye un panel expandible con pasos de implementación detallados.

### 5.6 Analítica

La vista de analítica combina datos reales del INE con datos sintéticos calibrados para ofrecer:

- KPIs del periodo (visitantes, índice de sostenibilidad, ingresos estimados)
- Gráfico de barras mensual con selector de periodo (6/12/24 meses)
- Comparativa con tres destinos pares seleccionados deterministamente
- Indicador diferencial respecto al año anterior

### 5.7 Informes

Listado de informes con descarga real implementada: CSV generado dinámicamente con `Blob` y PDF mediante `window.print()` con estilos de impresión CSS `@media print`.

---

## 6. Despliegue y productivización

### 6.1 Estrategia de despliegue

Siguiendo la misma filosofía de portabilidad y reproducibilidad que se aplica a los datos sintéticos del sistema, Pathfinder se conteneriza con Docker para garantizar que el entorno de ejecución sea idéntico en desarrollo, pruebas y producción.

La estrategia de despliegue contempla dos fases:

1. **Despliegue local** (alcance de este trabajo): contenedor Docker ejecutable en cualquier máquina con Docker instalado.
2. **Despliegue en la nube** (línea futura): migración a proveedores cloud (Google Cloud Run, AWS ECS, Azure Container Apps) aprovechando la imagen ya contenerizada.

### 6.2 Contenerización Docker

El proceso de build utiliza una estrategia **multi-stage** para minimizar el tamaño de la imagen final:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build          # genera /app/dist (assets estáticos)

# Stage 2: Serve
FROM nginx:1.27-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

El resultado es una imagen de aproximadamente 25–35 MB que contiene únicamente nginx y los assets estáticos compilados, sin Node.js ni dependencias de desarrollo.

**Tabla 6.1.** Comparativa de tamaños de imagen Docker

| Estrategia | Imagen base | Tamaño estimado |
|---|---|---|
| Single-stage (Node) | `node:20` | ~1.1 GB |
| Single-stage (Alpine) | `node:20-alpine` | ~180 MB |
| **Multi-stage** (producción) | `nginx:1.27-alpine` | **~30 MB** |

### 6.3 Configuración nginx para SPA

Las Single Page Applications requieren que cualquier ruta no encontrada como archivo estático sea servida por `index.html`, permitiendo que React Router gestione la navegación. La configuración nginx incluye esta regla de fallback junto con cabeceras de caché para assets estáticos:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 6.4 Comandos de despliegue

```bash
# Construir imagen
docker build -t tui-pathfinder:latest .

# Ejecutar contenedor (puerto 5174 → nginx 80)
docker run -p 5174:80 tui-pathfinder:latest

# Con docker-compose (recomendado)
docker compose up --build

# Verificar despliegue
# Abrir http://localhost:5174 en el navegador
```

### 6.5 Integración en la suite TUI

Pathfinder se despliega en el puerto 5174, alineado con el conjunto de proyectos de la suite:

**Tabla 6.2.** Puertos de la suite TUI Care Foundation

| Proyecto | Puerto | Tecnología |
|---|---|---|
| TUI-Horizon (API) | 8000 | Python FastAPI |
| TUI-Horizon (frontend) | 5173 | React/Vite |
| **TUI-Pathfinder** | **5174** | **React/Vite** |
| TUI-Atlas | 5175 | React/Vite |
| TUI-Sentinel | 5176 | React/Vite |

---

## 7. Conclusiones

Pathfinder presenta un dashboard analítico funcional para el análisis de movilidad sostenible y accesibilidad turística en 20 destinos españoles. Los principales logros del trabajo son:

- **Integración de datos heterogéneos**: combinación coherente de datos reales (INE EOH, OpenStreetMap) con datos sintéticos deterministas calibrados sobre fuentes oficiales, ofreciendo una experiencia de usuario continua independientemente de la disponibilidad de APIs externas.

- **Arquitectura sin backend**: la decisión de implementar toda la lógica en el cliente elimina los costes operativos de servidor, simplifica el despliegue y garantiza la privacidad del usuario al no transmitir datos a terceros.

- **Internacionalización completa**: las más de 300 claves de traducción en español e inglés, implementadas con tipado estático TypeScript, garantizan la corrección lingüística en tiempo de compilación y facilitan la extensión a nuevos idiomas.

- **Portabilidad Docker**: la imagen multi-stage de ~30 MB permite desplegar Pathfinder en cualquier entorno con Docker en menos de dos minutos.

### 7.1 Próximos pasos y líneas futuras

- **Datos reales de accesibilidad**: integrar el API de accesibilidad de Google Maps o los datos de Turismo Accesible España para sustituir los valores sintéticos de accesibilidad por datos verificados.
- **Integración con datos en tiempo real**: incorporar flujos de tráfico, ocupación de transporte público y calidad del aire para recomendaciones dinámicas.
- **Módulo de predicción**: aplicar modelos de series temporales sobre los datos históricos del INE para proyectar la evolución de pernoctaciones y anticipar saturaciones.
- **Despliegue cloud**: migrar la imagen Docker a Google Cloud Run o similar para hacer el dashboard accesible de forma pública sin infraestructura propia.
- **Validación con gestores de destino**: realizar pruebas piloto con técnicos de turismo de los 20 destinos para validar la utilidad de los indicadores y la usabilidad del dashboard.

---

## 8. Bibliografía

1. WTTC (World Travel & Tourism Council). *Economic Impact Report: Spain 2024*. 2024. Disponible en: https://wttc.org/Research/Economic-Impact

2. INE (Instituto Nacional de Estadística). *Estadística de Movimientos Turísticos en Fronteras (FRONTUR): Diciembre 2024 y año 2024*. 2025. Disponible en: https://www.ine.es/dyngs/Prensa/FRONTUR1224.htm

3. INE (Instituto Nacional de Estadística). *Encuesta de Ocupación Hotelera (EOH)*. Disponible en: https://www.ine.es/jaxiT3/Tabla.htm?t=2076

4. OpenStreetMap contributors. *OpenStreetMap*. Licencia ODbL 1.0. Disponible en: https://www.openstreetmap.org/copyright

5. European Environment Agency (EEA). *Transport and Environment Report 2023: Decarbonising Road Transport*. EEA Report No 02/2023. Copenhagen: EEA, 2023.

6. Organización Mundial del Turismo (OMT). *Manual sobre Turismo Accesible para Todos: Principios, herramientas y buenas prácticas*. Madrid: OMT, 2015.

7. ONCE (Organización Nacional de Ciegos Españoles). *Informe sobre accesibilidad en destinos turísticos españoles*. Madrid: ONCE, 2022.

8. Ministerio de Transportes, Movilidad y Agenda Urbana. *Encuesta de Movilidad Cotidiana (EMC2)*. Madrid: Ministerio de Transportes, 2023.

9. Meta Platforms. *React — A JavaScript library for building user interfaces* (v19). 2024. Disponible en: https://react.dev

10. Leaflet.js / React-Leaflet. *React components for Leaflet maps* (v5). 2024. Disponible en: https://react-leaflet.js.org

11. Docker Inc. *Docker Engine Documentation*. 2024. Disponible en: https://docs.docker.com/engine

12. nginx. *nginx documentation — Serving Static Content*. 2024. Disponible en: https://nginx.org/en/docs
