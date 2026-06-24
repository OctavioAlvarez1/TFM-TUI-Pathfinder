const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export type POIType = 'hotel' | 'monument' | 'transport' | 'restaurant' | 'beach' | 'bike'

export interface OverpassPOI {
  id: number
  type: POIType
  lat: number
  lon: number
  name: string
  tags: Record<string, string>
  wikiPage?: string
  imageUrl?: string
  wikimediaFile?: string
}

export interface CyclePath {
  id: string
  coords: [number, number][]
  color: string
}

// ── In-memory caches ──────────────────────────────────────────────────────────
const _poiCache     = new Map<string, OverpassPOI[]>()
const _pathCache    = new Map<string, CyclePath[]>()
const _transitCache = new Map<string, TransitRoute[]>()

// ── localStorage persistence ──────────────────────────────────────────────────
const LS = (k: string) => `pathfinder_osm_${k}`

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

function lsSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}

// ── Tag classification ────────────────────────────────────────────────────────
export function classifyTags(tags: Record<string, string>): POIType | null {
  const tourism  = tags['tourism']  ?? ''
  const historic = tags['historic'] ?? ''
  const amenity  = tags['amenity']  ?? ''
  const natural  = tags['natural']  ?? ''
  const leisure  = tags['leisure']  ?? ''
  const highway  = tags['highway']  ?? ''
  const railway  = tags['railway']  ?? ''

  if (['hotel', 'hostel', 'motel', 'guest_house', 'apartment'].includes(tourism)) return 'hotel'

  if (['museum', 'attraction', 'gallery', 'viewpoint', 'theme_park', 'zoo', 'aquarium'].includes(tourism)) return 'monument'
  if (['monument', 'castle', 'ruins', 'memorial', 'archaeological_site', 'church', 'cathedral'].includes(historic)) return 'monument'

  if (['restaurant', 'cafe', 'bar', 'fast_food', 'ice_cream'].includes(amenity)) return 'restaurant'

  if (natural === 'beach' || leisure === 'beach_resort' || tourism === 'beach_resort') return 'beach'

  if (
    highway === 'bus_stop' ||
    ['station', 'subway_station', 'tram_stop'].includes(railway) ||
    amenity === 'bus_station' || amenity === 'ferry_terminal'
  ) return 'transport'

  if (amenity === 'bicycle_rental') return 'bike'
  if (amenity === 'bicycle_parking' && parseInt(tags['capacity'] ?? '0', 10) > 5) return 'bike'

  return null
}

// ── Wikipedia page extraction ─────────────────────────────────────────────────
export function extractWikiPage(tags: Record<string, string>): string | undefined {
  const wp = tags['wikipedia']
  if (wp) {
    const colonIdx = wp.indexOf(':')
    return (colonIdx !== -1 ? wp.slice(colonIdx + 1) : wp).replace(/ /g, '_')
  }
  if (tags['name:en']) return tags['name:en'].replace(/ /g, '_')
  if (tags['name'])    return tags['name'].replace(/ /g, '_')
  return undefined
}

// ── Mock POI fallback — deterministic per destination ─────────────────────────
function seededRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function generateMockPOIs(destinationId: string, lat: number, lon: number): OverpassPOI[] {
  let seed = 0
  for (const c of destinationId) seed = (seed * 31 + c.charCodeAt(0)) & 0xffffff
  const rng = seededRng(seed)

  const templates: { type: POIType; names: string[] }[] = [
    { type: 'hotel',     names: ['Hotel Central', 'Hotel Plaza', 'Hotel Palacio', 'Hotel Jardín', 'Hotel Sol', 'Hotel Marina'] },
    { type: 'monument',  names: ['Catedral', 'Palacio Municipal', 'Museo de Arte', 'Plaza Mayor', 'Basílica', 'Museo de Historia'] },
    { type: 'restaurant',names: ['Restaurante El Rincón', 'Café del Mar', 'La Taberna', 'Restaurante Plaza', 'Bar El Puerto', 'La Bodega'] },
    { type: 'transport', names: ['Estación Central', 'Parada Bus Centro', 'Metro Plaza', 'Terminal Bus', 'Estación Norte'] },
    { type: 'bike',      names: ['Estación Bici Centro', 'Bici Plaza Mayor', 'Alquiler Bicicletas', 'Cicloestación Sur', 'Bici Norte'] },
  ]

  const pois: OverpassPOI[] = []
  let mockId = -1

  for (const tmpl of templates) {
    for (const name of tmpl.names) {
      const dlat = (rng() - 0.5) * 0.06
      const dlon = (rng() - 0.5) * 0.08
      pois.push({
        id: mockId--,
        type: tmpl.type,
        lat: lat + dlat,
        lon: lon + dlon,
        name,
        tags: {},
      })
    }
  }

  return pois
}

// ── Fetch with timeout ────────────────────────────────────────────────────────
function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

// ── Overpass POST — both endpoints in parallel, first response wins ───────────
async function overpassPost(query: string): Promise<unknown> {
  const body = 'data=' + encodeURIComponent(query)
  const opts: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }

  const attempts = OVERPASS_ENDPOINTS.map(async url => {
    const response = await fetchWithTimeout(url, opts, 10_000)
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`)
    return response.json()
  })

  return Promise.any(attempts)
}

// ── POI fetcher ───────────────────────────────────────────────────────────────
export async function fetchPOIs(
  lat: number,
  lon: number,
  destinationId: string,
  bboxDelta = 0.05,
): Promise<OverpassPOI[]> {
  // 1. In-memory cache
  if (_poiCache.has(destinationId)) return _poiCache.get(destinationId)!

  // 2. localStorage cache
  const stored = lsGet<OverpassPOI[]>(LS(`pois_${destinationId}`))
  if (stored && stored.length > 0) {
    _poiCache.set(destinationId, stored)
    return stored
  }

  const latD = bboxDelta
  const lonD = bboxDelta * 1.3
  const bbox = `${lat - latD},${lon - lonD},${lat + latD},${lon + lonD}`

  const query = `
[out:json][timeout:25];
(
  node["tourism"~"^(hotel|hostel|motel|guest_house|apartment)$"](${bbox});
  node["tourism"~"^(museum|attraction|gallery|viewpoint|theme_park|zoo|aquarium)$"](${bbox});
  node["historic"~"^(monument|castle|ruins|memorial|archaeological_site|church|cathedral)$"](${bbox});
  node["amenity"~"^(restaurant|cafe|bar|fast_food|ice_cream)$"](${bbox});
  node["natural"="beach"](${bbox});
  node["leisure"="beach_resort"](${bbox});
  node["tourism"="beach_resort"](${bbox});
  node["highway"="bus_stop"](${bbox});
  node["railway"~"^(station|subway_station|tram_stop)$"](${bbox});
  node["amenity"~"^(ferry_terminal|bus_station)$"](${bbox});
  node["amenity"="bicycle_rental"](${bbox});
  way["natural"="beach"](${bbox});
  way["leisure"="beach_resort"](${bbox});
  way["tourism"="beach_resort"](${bbox});
  way["tourism"~"^(hotel|hostel|motel|museum|attraction|theme_park)$"](${bbox});
  way["historic"~"^(castle|cathedral|ruins|archaeological_site)$"](${bbox});
);
out center 200;
`.trim()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await overpassPost(query) as any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pois: OverpassPOI[] = (json.elements ?? []).reduce((acc: OverpassPOI[], el: any) => {
      const tags: Record<string, string> = el.tags ?? {}
      const poiType = classifyTags(tags)
      if (!poiType) return acc

      const elLat: number | undefined = el.type === 'node' ? el.lat : el.center?.lat
      const elLon: number | undefined = el.type === 'node' ? el.lon : el.center?.lon
      if (!elLat || !elLon) return acc

      const name = tags['name'] ?? tags['name:en'] ?? tags['name:es'] ?? `POI ${el.id}`
      const wmc = tags['wikimedia_commons']
      const wikimediaFile = wmc ? wmc.replace(/^File:/i, '').replace(/ /g, '_') : undefined

      acc.push({
        id:            el.id,
        type:          poiType,
        lat:           elLat,
        lon:           elLon,
        name,
        tags,
        wikiPage:      extractWikiPage(tags),
        imageUrl:      tags['image'] || undefined,
        wikimediaFile,
      })
      return acc
    }, [])

    if (pois.length > 0) {
      _poiCache.set(destinationId, pois)
      lsSet(LS(`pois_${destinationId}`), pois)
      return pois
    }
  } catch { /* fall through to mock */ }

  // 3. Fallback: mock POIs
  const mock = generateMockPOIs(destinationId, lat, lon)
  return mock
}

// ── Transit route fetcher ─────────────────────────────────────────────────────
export interface TransitRoute {
  id: number
  name: string
  ref: string
  routeType: string
  color: string
  segments: [number, number][][]
}

function transitDefaultColor(routeType: string): string {
  if (routeType === 'subway' || routeType === 'metro') return '#1A3C5E'
  if (routeType === 'tram' || routeType === 'light_rail') return '#2E7D98'
  return '#F97316'
}

export async function fetchTransitRoutes(
  lat: number,
  lon: number,
  destinationId: string,
  bboxDelta = 0.05,
): Promise<TransitRoute[]> {
  if (_transitCache.has(destinationId)) return _transitCache.get(destinationId)!

  const stored = lsGet<TransitRoute[]>(LS(`transit_${destinationId}`))
  if (stored && stored.length > 0) {
    _transitCache.set(destinationId, stored)
    return stored
  }

  const latD = bboxDelta
  const lonD = bboxDelta * 1.3
  const bbox = `${lat - latD},${lon - lonD},${lat + latD},${lon + lonD}`

  const query = `
[out:json][timeout:25];
(
  relation["type"="route"]["route"~"^(subway|metro|tram|light_rail)$"](${bbox});
);
out geom;
`.trim()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await overpassPost(query) as any
    const routes: TransitRoute[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const el of (json.elements ?? []) as any[]) {
      if (el.type !== 'relation') continue
      const tags: Record<string, string> = el.tags ?? {}

      const segments: [number, number][][] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const member of (el.members ?? []) as any[]) {
        if (member.type !== 'way' || !member.geometry?.length) continue
        segments.push(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (member.geometry as any[]).map((g: { lat: number; lon: number }) => [g.lat, g.lon] as [number, number])
        )
      }
      if (segments.length === 0) continue

      const rawColor = tags['colour'] ?? tags['color'] ?? ''
      const color = /^#[0-9A-Fa-f]{3,6}$/.test(rawColor) ? rawColor : transitDefaultColor(tags['route'] ?? '')

      routes.push({
        id:        el.id,
        name:      tags['name'] ?? tags['ref'] ?? `Línea ${el.id}`,
        ref:       tags['ref'] ?? '',
        routeType: tags['route'] ?? 'transit',
        color,
        segments,
      })
    }

    if (routes.length > 0) {
      _transitCache.set(destinationId, routes)
      lsSet(LS(`transit_${destinationId}`), routes)
    }
    return routes
  } catch {
    return []
  }
}

// ── Cycle path fetcher ────────────────────────────────────────────────────────
export async function fetchCyclePaths(
  lat: number,
  lon: number,
  destinationId: string,
  bboxDelta = 0.05,
): Promise<CyclePath[]> {
  if (_pathCache.has(destinationId)) return _pathCache.get(destinationId)!

  const stored = lsGet<CyclePath[]>(LS(`paths_${destinationId}`))
  if (stored && stored.length > 0) {
    _pathCache.set(destinationId, stored)
    return stored
  }

  const latD = bboxDelta
  const lonD = bboxDelta * 1.3
  const bbox = `${lat - latD},${lon - lonD},${lat + latD},${lon + lonD}`

  const query = `
[out:json][timeout:20];
way["highway"="cycleway"](${bbox});
out geom 30;
`.trim()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await overpassPost(query) as any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths: CyclePath[] = (json.elements ?? []).map((el: any) => ({
      id:     String(el.id),
      coords: (el.geometry ?? []).map((g: { lat: number; lon: number }) => [g.lat, g.lon] as [number, number]),
      color:  '#10B981',
    }))

    _pathCache.set(destinationId, paths)
    lsSet(LS(`paths_${destinationId}`), paths)
    return paths
  } catch {
    return []
  }
}
