import { useState, useEffect } from 'react'
import { Box, Typography, Checkbox, IconButton, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LayersIcon from '@mui/icons-material/Layers'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDestination } from '../context/DestinationContext'
import { fetchPOIs, fetchCyclePaths, fetchTransitRoutes } from '../api/overpass'
import type { OverpassPOI, CyclePath, TransitRoute } from '../api/overpass'
import 'leaflet/dist/leaflet.css'

// ── Layer config ──────────────────────────────────────────────────────────────
type LayerKey = 'alojamientos' | 'recursos' | 'restaurantes' | 'playas'
              | 'transporte' | 'ciclovias' | 'senderos' | 'estaciones_bici'
              | 'accesibilidad' | 'problematicas'

const LAYERS: { key: LayerKey; label: string; icon: string; color: string; defaultOn: boolean }[] = [
  { key: 'alojamientos',   label: 'Alojamientos',        icon: '🏨', color: '#3B82F6', defaultOn: false },
  { key: 'recursos',       label: 'Recursos turísticos',  icon: '🏛️', color: '#8B5CF6', defaultOn: true  },
  { key: 'restaurantes',   label: 'Restaurantes',         icon: '🍽️', color: '#EF4444', defaultOn: true  },
  { key: 'playas',         label: 'Playas',               icon: '🏖️', color: '#0DD3C5', defaultOn: false },
  { key: 'transporte',     label: 'Transporte público',   icon: '🚌', color: '#F97316', defaultOn: true  },
  { key: 'ciclovias',      label: 'Ciclovías',            icon: '〰️', color: '#10B981', defaultOn: true  },
  { key: 'senderos',       label: 'Senderos',             icon: '🥾', color: '#84CC16', defaultOn: false },
  { key: 'estaciones_bici',label: 'Estaciones Bici',      icon: '🚲', color: '#06B6D4', defaultOn: true  },
  { key: 'accesibilidad',  label: 'Accesibilidad',        icon: '♿', color: '#6366F1', defaultOn: true  },
  { key: 'problematicas',  label: 'Zonas problemáticas',  icon: '⚠️', color: '#F43F5E', defaultOn: false },
]

const TYPE_TO_LAYER: Record<string, LayerKey> = {
  hotel: 'alojamientos', monument: 'recursos', transport: 'transporte',
  restaurant: 'restaurantes', beach: 'playas', bike: 'estaciones_bici',
}

const TYPE_ICON: Record<string, string> = {
  hotel: '🏨', monument: '🏛️', transport: '🚌',
  restaurant: '🍽️', beach: '🏖️', bike: '🚲',
}

const TYPE_COLOR: Record<string, string> = {
  hotel: '#3B82F6', monument: '#8B5CF6', transport: '#F97316',
  restaurant: '#EF4444', beach: '#0DD3C5', bike: '#10B981',
}

const TYPE_PHOTO: Record<string, string> = {
  hotel:      'linear-gradient(135deg,#1E3A5F 0%,#2563EB 50%,#0EA5E9 100%)',
  monument:   'linear-gradient(135deg,#312E81 0%,#7C3AED 50%,#4F46E5 100%)',
  transport:  'linear-gradient(135deg,#7C2D12 0%,#EA580C 50%,#B45309 100%)',
  restaurant: 'linear-gradient(135deg,#7F1D1D 0%,#DC2626 50%,#C2410C 100%)',
  beach:      'linear-gradient(135deg,#0C4A6E 0%,#0EA5E9 50%,#06B6D4 100%)',
  bike:       'linear-gradient(135deg,#064E3B 0%,#059669 50%,#065F46 100%)',
}

function makePOIIcon(type: string) {
  const color = TYPE_COLOR[type] ?? '#818CF8'
  const icon  = TYPE_ICON[type]  ?? '📍'
  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:50%;background:white;
      border:3px solid ${color};display:flex;align-items:center;justify-content:center;
      font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,0.18);cursor:pointer;">${icon}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], className: '',
  })
}

// ── Representative transport routes (Valencia approximate) — kept as fallback examples ──
type Coord = [number, number]
const STATIC_ROUTES: { id: string; color: string; weight: number; coords: Coord[] }[] = [
  { id: 'metro3', color: '#F97316', weight: 4,
    coords: [[39.493,-0.415],[39.484,-0.405],[39.478,-0.396],[39.470,-0.376],[39.464,-0.358],[39.469,-0.340],[39.478,-0.330]] },
  { id: 'metro1', color: '#3B82F6', weight: 4,
    coords: [[39.498,-0.384],[39.488,-0.381],[39.479,-0.379],[39.470,-0.376],[39.462,-0.374],[39.454,-0.372]] },
  { id: 'bus35',  color: '#8B5CF6', weight: 3,
    coords: [[39.482,-0.397],[39.477,-0.388],[39.470,-0.376],[39.465,-0.362],[39.460,-0.351]] },
]

// ── POI info rows derived from OSM tags ──────────────────────────────────────
function poiInfoRows(poi: OverpassPOI): { label: string; val: string; highlight?: boolean }[] {
  const t = poi.tags

  // Accesibilidad — wheelchair tag
  const wc = t['wheelchair']
  const access = wc === 'yes' ? 'Accesible'
    : wc === 'limited'        ? 'Parcial'
    : wc === 'no'             ? 'No accesible'
    : 'N/D'

  // Transporte — POI type or public_transport tag
  const pt = t['public_transport'] ?? t['railway'] ?? t['highway']
  const transport = poi.type === 'transport' ? (pt ? `Sí · ${pt}` : 'Sí · parada')
    : t['public_transport']   ? `Cercano · ${t['public_transport']}`
    : 'N/D'

  // Movilidad sostenible — bicycle or bike station
  const bk = t['bicycle']
  const sustainable = poi.type === 'bike'                           ? 'Sí · estación bici'
    : (bk === 'yes' || bk === 'designated')                        ? 'Sí · acceso bici'
    : bk === 'no'                                                   ? 'No'
    : t['rental']                                                   ? 'Sí · alquiler'
    : 'N/D'

  return [
    { label: 'Accesibilidad',       val: access,     highlight: wc === 'yes' },
    { label: 'Transporte',          val: transport,  highlight: poi.type === 'transport' },
    { label: 'Movilidad Sostenible',val: sustainable,highlight: poi.type === 'bike' || bk === 'yes' },
  ]
}

// ── Map re-center controller ──────────────────────────────────────────────────
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  // Observe container size changes so tiles fill the panel on every layout pass
  useEffect(() => {
    const container = map.getContainer()
    const ro = new ResizeObserver(() => { map.invalidateSize() })
    ro.observe(container)
    return () => ro.disconnect()
  }, [map])

  useEffect(() => {
    map.invalidateSize()
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeatmapPanel() {
  const { destination } = useDestination()

  const [layerOn, setLayerOn] = useState<Record<LayerKey, boolean>>(
    Object.fromEntries(LAYERS.map(l => [l.key, l.defaultOn])) as Record<LayerKey, boolean>
  )
  const [panelOpen, setPanelOpen]   = useState(true)
  const [selected,  setSelected]    = useState<OverpassPOI | null>(null)
  const [resolvedPhoto, setResolvedPhoto] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading]   = useState(false)

  const [livePOIs,    setLivePOIs]    = useState<OverpassPOI[]>([])
  const [livePaths,   setLivePaths]   = useState<CyclePath[]>([])
  const [liveRoutes,  setLiveRoutes]  = useState<TransitRoute[]>([])
  const [loading,     setLoading]     = useState(false)
  const [fetchError,  setFetchError]  = useState<string | null>(null)

  // Fetch POIs + cycle paths whenever destination changes
  useEffect(() => {
    setLoading(true)
    setFetchError(null)
    setLivePOIs([])
    setLivePaths([])
    setLiveRoutes([])
    setSelected(null)

    Promise.allSettled([
      fetchPOIs(destination.lat, destination.lon, destination.id, destination.bboxDelta),
      fetchCyclePaths(destination.lat, destination.lon, destination.id, destination.bboxDelta),
      fetchTransitRoutes(destination.lat, destination.lon, destination.id, destination.bboxDelta),
    ])
      .then(([poisRes, pathsRes, routesRes]) => {
        const pois   = poisRes.status   === 'fulfilled' ? poisRes.value   : []
        const paths  = pathsRes.status  === 'fulfilled' ? pathsRes.value  : []
        const routes = routesRes.status === 'fulfilled' ? routesRes.value : []
        setLivePOIs(pois)
        setLivePaths(paths)
        setLiveRoutes(routes)
        if (pois.length === 0) setFetchError('Sin datos OSM para esta zona')
      })
      .finally(() => setLoading(false))
  }, [destination])

  // Resolve photo for selected POI — priority chain:
  // 1. tags['image'] direct URL
  // 2. Wikimedia Commons thumbnail
  // 3. Wikipedia thumbnail (EN then ES)
  useEffect(() => {
    setResolvedPhoto(null)
    setPhotoLoading(false)
    if (!selected) return

    if (selected.imageUrl) {
      setResolvedPhoto(selected.imageUrl)
      return
    }

    if (selected.wikimediaFile) {
      setResolvedPhoto(
        `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(selected.wikimediaFile)}?width=400`
      )
      return
    }

    if (selected.wikiPage) {
      setPhotoLoading(true)
      const page = encodeURIComponent(selected.wikiPage)
      ;(async () => {
        for (const lang of ['en', 'es']) {
          try {
            const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${page}`)
            if (!r.ok) continue
            const data = await r.json()
            if (data.thumbnail?.source) {
              setResolvedPhoto(data.thumbnail.source)
              setPhotoLoading(false)
              return
            }
          } catch { /* try next lang */ }
        }
        setPhotoLoading(false)
      })()
    }
  }, [selected])

  const visiblePOIs = livePOIs.filter(p => layerOn[TYPE_TO_LAYER[p.type]])

  const mapCenter: [number, number] = [destination.lat, destination.lon]

  return (
    <Box sx={{
      borderRadius: '16px',
      border: '1.5px solid rgba(26,60,94,0.18)',
      overflow: 'hidden', width: '100%', height: '100%', position: 'relative',
      boxShadow: '0 8px 32px rgba(26,60,94,0.16), 0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* ── Leaflet map ── */}
      <MapContainer
        center={mapCenter} zoom={destination.zoom}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        zoomControl={false} attributionControl={false}
      >
        <MapController center={mapCenter} zoom={destination.zoom} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Real cycle paths from Overpass */}
        {layerOn['ciclovias'] && livePaths.map(path => (
          <Polyline key={path.id} positions={path.coords}
            pathOptions={{ color: path.color, weight: 3, opacity: 0.8 }} />
        ))}

        {/* Transit routes: real Overpass data, fallback to static for Valencia */}
        {layerOn['transporte'] && (
          liveRoutes.length > 0
            ? liveRoutes.flatMap(route =>
                route.segments.map((seg, si) => (
                  <Polyline
                    key={`route-${route.id}-${si}`}
                    positions={seg}
                    pathOptions={{ color: route.color, weight: 4, opacity: 0.82 }}
                  />
                ))
              )
            : STATIC_ROUTES.map(r => (
                <Polyline key={r.id} positions={r.coords}
                  pathOptions={{ color: r.color, weight: r.weight, opacity: 0.75 }} />
              ))
        )}

        {visiblePOIs.map(poi => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lon]}
            icon={makePOIIcon(poi.type)}
            eventHandlers={{ click: () => setSelected(poi) }}
          />
        ))}
      </MapContainer>

      {/* ── Loading overlay ── */}
      {loading && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)',
        }}>
          <CircularProgress size={40} sx={{ color: '#0DD3C5' }} />
        </Box>
      )}

      {/* ── Status chip (bottom-right) ── */}
      {!loading && (
        <Box sx={{
          position: 'absolute', bottom: 10, right: 12, zIndex: 1000,
          background: fetchError ? 'rgba(239,68,68,0.92)' : 'rgba(15,23,42,0.82)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          px: 1.2, py: 0.4,
          border: `1px solid ${fetchError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', gap: 0.6,
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%',
            background: fetchError ? '#FCA5A5' : '#10B981',
            boxShadow: fetchError ? '0 0 4px #FCA5A5' : '0 0 6px #10B981',
          }} />
          <Typography style={{ fontSize: '0.64rem', color: '#fff', fontWeight: 500 }}>
            {fetchError
              ? fetchError
              : `${livePOIs.length} POIs · ${liveRoutes.length > 0 ? `${liveRoutes.length} líneas · ` : ''}OpenStreetMap`}
          </Typography>
        </Box>
      )}

      {/* ── Zoom controls (top-right) ── */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000,
                 display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {['+', '−', '⊞'].map((lbl, i) => (
          <Box key={i} sx={{
            width: 30, height: 30,
            background: 'rgba(15,28,46,0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: i < 2 ? '17px' : '13px',
            color: 'rgba(255,255,255,0.85)', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.22)', userSelect: 'none',
            transition: 'background 0.15s',
            '&:hover': { background: 'rgba(26,60,94,0.90)' },
          }}>{lbl}</Box>
        ))}
      </Box>

      {/* ── Layer panel (top-left) ── */}
      {panelOpen ? (
        <Box sx={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(14px)',
          borderRadius: '14px',
          border: '1px solid #E0D8CF',
          boxShadow: '0 6px 24px rgba(26,60,94,0.14)',
          width: 210,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100% - 24px)',
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.5, pt: 1, pb: 0.8, flexShrink: 0,
            borderBottom: '2px solid #C05928',
            background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF8F5 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LayersIcon sx={{ fontSize: 15, color: '#C05928' }} />
              <Typography style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A3C5E' }}>
                Capas del mapa
              </Typography>
            </Box>
            <CloseIcon
              sx={{ fontSize: 15, color: '#94A3B8', cursor: 'pointer', '&:hover': { color: '#475569' } }}
              onClick={() => setPanelOpen(false)}
            />
          </Box>

          {/* Layer rows — scrollable */}
          <Box sx={{ overflowY: 'auto', py: 0.4,
            '&::-webkit-scrollbar': { width: 3 },
            '&::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: 4 },
          }}>
            {LAYERS.map(l => (
              <Box
                key={l.key}
                onClick={() => setLayerOn(s => ({ ...s, [l.key]: !s[l.key] }))}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  pl: 1.2, pr: 1.4, py: 0.45, cursor: 'pointer',
                  borderLeft: `3px solid ${layerOn[l.key] ? l.color : 'transparent'}`,
                  background: layerOn[l.key] ? `${l.color}0E` : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { background: layerOn[l.key] ? `${l.color}18` : '#F8FAFC' },
                }}
              >
                <Box sx={{
                  width: 16, height: 16, borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${layerOn[l.key] ? l.color : '#CBD5E1'}`,
                  background: layerOn[l.key] ? l.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {layerOn[l.key] && (
                    <Typography style={{ fontSize: '10px', color: '#fff', fontWeight: 900, lineHeight: 1 }}>✓</Typography>
                  )}
                </Box>
                <Typography style={{ fontSize: '12px', lineHeight: 1 }}>{l.icon}</Typography>
                <Typography style={{
                  fontSize: '0.72rem',
                  color: layerOn[l.key] ? '#1A3C5E' : '#94A3B8',
                  fontWeight: layerOn[l.key] ? 600 : 400,
                  transition: 'color 0.15s',
                  flex: 1,
                }}>
                  {l.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box onClick={() => setPanelOpen(true)} sx={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
          borderRadius: '10px', border: '1px solid #E0D8CF', p: 0.8,
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(26,60,94,0.12)',
          '&:hover': { background: '#FDF6F0' },
        }}>
          <LayersIcon sx={{ fontSize: 18, color: '#C05928', display: 'block' }} />
        </Box>
      )}

      {/* ── POI popup (top-right, left of zoom controls) ── */}
      {selected && (
        <Box sx={{
          position: 'absolute', top: 12, right: 54, zIndex: 1000,
          background: '#fff', borderRadius: '14px',
          border: '1px solid rgba(26,60,94,0.12)',
          boxShadow: '0 8px 32px rgba(26,60,94,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          width: 232, overflow: 'hidden',
        }}>
          {/* Photo / gradient header */}
          <Box sx={{
            height: 100, position: 'relative', overflow: 'hidden',
            background: TYPE_PHOTO[selected.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {resolvedPhoto ? (
              <img src={resolvedPhoto} alt={selected.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setResolvedPhoto(null)} />
            ) : photoLoading ? (
              <Typography style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>Cargando…</Typography>
            ) : (
              <Typography style={{ fontSize: '2.4rem', opacity: 0.30 }}>{TYPE_ICON[selected.type]}</Typography>
            )}

            {/* Type badge */}
            <Box sx={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
              borderRadius: '20px', px: 1, py: 0.25,
            }}>
              <Typography style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600, letterSpacing: '0.04em' }}>
                {TYPE_ICON[selected.type]} {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
              </Typography>
            </Box>

            {/* Close button */}
            <Box
              onClick={() => setSelected(null)}
              sx={{
                position: 'absolute', top: 7, right: 7,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.15s',
                '&:hover': { background: '#fff' },
              }}
            >
              <CloseIcon style={{ fontSize: 13, color: '#475569', display: 'block' }} />
            </Box>
          </Box>

          {/* Info body */}
          <Box sx={{ px: 1.6, pt: 1.3, pb: 1.6 }}>
            <Typography style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1A3C5E', lineHeight: 1.3, marginBottom: 10 }}>
              {selected.name}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
              {poiInfoRows(selected).map(r => (
                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{r.label}</Typography>
                  <Typography style={{ fontSize: '0.68rem', color: r.highlight ? '#10B981' : '#64748B', fontWeight: 600 }}>
                    {r.val}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ my: 1.1, height: '1px', background: 'linear-gradient(90deg, #E2E8F0 0%, transparent 100%)' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.3 }}>
              <Typography style={{ fontSize: '0.62rem', color: '#CBD5E1', fontWeight: 500 }}>Fuente:</Typography>
              <Typography style={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 600 }}>OpenStreetMap</Typography>
            </Box>

            {/* CTA button */}
            <Box
              component="button"
              onClick={() => console.log('details', selected.name)}
              sx={{
                display: 'block', width: '100%',
                py: 0.85, borderRadius: '9px', cursor: 'pointer',
                border: 'none', outline: 'none',
                background: 'linear-gradient(135deg, #C05928 0%, #A04820 100%)',
                color: '#fff',
                fontSize: '0.74rem', fontWeight: 700,
                letterSpacing: '0.01em',
                boxShadow: '0 2px 8px rgba(192,89,40,0.35)',
                transition: 'all 0.15s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D06030 0%, #B05828 100%)',
                  boxShadow: '0 4px 14px rgba(192,89,40,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)', boxShadow: '0 1px 4px rgba(192,89,40,0.3)' },
              }}
            >
              Ver detalles
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
