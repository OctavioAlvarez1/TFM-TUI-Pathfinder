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

// ── In-memory caches — only populated on success with results ─────────────────
const _poiCache  = new Map<string, OverpassPOI[]>()
const _pathCache = new Map<string, CyclePath[]>()

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

// ── Fetch with manual timeout (AbortSignal.timeout not supported everywhere) ──
function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

// ── Overpass POST with endpoint fallback ──────────────────────────────────────
async function overpassPost(query: string): Promise<unknown> {
  const body = 'data=' + encodeURIComponent(query)
  const opts: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }
  let lastError: Error = new Error('No endpoints available')

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(url, opts, 35_000)
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} from ${url}`)
        continue
      }
      return await response.json()
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError
}

// ── POI fetcher — nodes + ways (beaches/hotels are often mapped as polygons) ──
export async function fetchPOIs(
  lat: number,
  lon: number,
  destinationId: string,
  bboxDelta = 0.05,
): Promise<OverpassPOI[]> {
  if (_poiCache.has(destinationId)) return _poiCache.get(destinationId)!

  const latD = bboxDelta
  const lonD = bboxDelta * 1.3
  const bbox = `${lat - latD},${lon - lonD},${lat + latD},${lon + lonD}`

  const query = `
[out:json][timeout:30];
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await overpassPost(query) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pois: OverpassPOI[] = (json.elements ?? []).reduce((acc: OverpassPOI[], el: any) => {
    const tags: Record<string, string> = el.tags ?? {}
    const poiType = classifyTags(tags)
    if (!poiType) return acc

    // Nodes have lat/lon directly; ways have center.lat/center.lon
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

  // Only cache when we have results — prevents empty-array lock-in on transient errors
  if (pois.length > 0) _poiCache.set(destinationId, pois)
  return pois
}

// ── Cycle path fetcher ────────────────────────────────────────────────────────
export async function fetchCyclePaths(
  lat: number,
  lon: number,
  destinationId: string,
  bboxDelta = 0.05,
): Promise<CyclePath[]> {
  if (_pathCache.has(destinationId)) return _pathCache.get(destinationId)!

  const latD = bboxDelta
  const lonD = bboxDelta * 1.3
  const bbox = `${lat - latD},${lon - lonD},${lat + latD},${lon + lonD}`

  const query = `
[out:json][timeout:25];
way["highway"="cycleway"](${bbox});
out geom 30;
`.trim()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await overpassPost(query) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paths: CyclePath[] = (json.elements ?? []).map((el: any) => ({
    id:     String(el.id),
    coords: (el.geometry ?? []).map((g: { lat: number; lon: number }) => [g.lat, g.lon] as [number, number]),
    color:  '#10B981',
  }))

  _pathCache.set(destinationId, paths)
  return paths
}
