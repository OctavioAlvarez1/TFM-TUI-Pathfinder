import { useMemo, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDestination } from '../context/DestinationContext'
import { useLanguage } from '../context/LanguageContext'
import 'leaflet/dist/leaflet.css'

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

type TransportMode = 'walk' | 'bike' | 'transit'
type Difficulty = 'Fácil' | 'Media' | 'Difícil'
type Accessibility = 'Alta' | 'Media' | 'Baja'
type FilterMode = 'all' | TransportMode

interface Route {
  name: string
  mode: TransportMode
  distKm: number
  timeMin: number
  difficulty: Difficulty
  accessibility: Accessibility
  co2Saved: number
  stops: number
  highlights: string[]
}

const ROUTE_NAME_KEYS = [
  'routes.name.hist',
  'routes.name.coast',
  'routes.name.gastro',
  'routes.name.cult',
  'routes.name.green',
  'routes.name.port',
] as const

const HIGHLIGHT_KEYS = [
  'routes.hl.market',
  'routes.hl.garden',
  'routes.hl.viewpoint',
  'routes.hl.museum',
  'routes.hl.port',
  'routes.hl.square',
  'routes.hl.church',
  'routes.hl.fishing',
  'routes.hl.palace',
  'routes.hl.tower',
] as const

const MODES: TransportMode[] = ['walk', 'bike', 'transit']
const DIFFICULTIES: Difficulty[] = ['Fácil', 'Media', 'Difícil']
const ACCESSIBILITIES: Accessibility[] = ['Alta', 'Media', 'Baja']

const MODE_COLORS: Record<TransportMode, { color: string; bg: string }> = {
  walk:    { color: '#2D6A4F', bg: '#2D6A4F20' },
  bike:    { color: '#2E7D98', bg: '#2E7D9820' },
  transit: { color: '#1A3C5E', bg: '#1A3C5E20' },
}

const MODE_EMOJIS: Record<TransportMode, string> = {
  walk: '🚶', bike: '🚲', transit: '🚌',
}

const ACCESSIBILITY_CONFIG: Record<Accessibility, { color: string; bg: string }> = {
  Alta:  { color: '#2D6A4F', bg: '#2D6A4F15' },
  Media: { color: '#F59E0B', bg: '#F59E0B15' },
  Baja:  { color: '#EF4444', bg: '#EF444415' },
}

const DIFFICULTY_COLORS: Record<Difficulty, { color: string }> = {
  Fácil:   { color: '#2D6A4F' },
  Media:   { color: '#F59E0B' },
  Difícil: { color: '#EF4444' },
}

const GMAPS_MODE: Record<TransportMode, string> = {
  walk: 'walking', bike: 'bicycling', transit: 'transit',
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr]
  const result: T[] = []
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(rng() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

// Generate deterministic loop waypoints around a center point
function generateWaypoints(lat: number, lon: number, stops: number, seed: string): [number, number][] {
  const rng = mkRng(seed + '_wp')
  const pts: [number, number][] = [[lat, lon]]
  for (let i = 0; i < stops; i++) {
    const angle = (i / stops) * 2 * Math.PI + (rng() - 0.5) * 0.6
    const r = 0.007 + rng() * 0.016
    pts.push([lat + Math.cos(angle) * r, lon + Math.sin(angle) * r * 1.25])
  }
  pts.push([lat, lon])
  return pts
}

function makeStopIcon(idx: number, color: string, isStart: boolean) {
  return L.divIcon({
    html: isStart
      ? `<div style="width:28px;height:28px;border-radius:50%;background:${color};
           border:3px solid #fff;display:flex;align-items:center;justify-content:center;
           font-size:11px;font-weight:700;color:#fff;
           box-shadow:0 2px 8px rgba(0,0,0,0.25);">S</div>`
      : `<div style="width:24px;height:24px;border-radius:50%;background:#fff;
           border:3px solid ${color};display:flex;align-items:center;justify-content:center;
           font-size:10px;font-weight:700;color:${color};
           box-shadow:0 2px 6px rgba(0,0,0,0.18);">${idx}</div>`,
    iconSize: isStart ? [28, 28] : [24, 24],
    iconAnchor: isStart ? [14, 14] : [12, 12],
    className: '',
  })
}

function MapFit({ coords }: { coords: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [32, 32] })
    }
  }, [map, coords])
  return null
}

// ── Route detail panel ────────────────────────────────────────────────────────
function RouteDetailPanel({
  route, lat, lon, onBack,
}: {
  route: Route
  lat: number
  lon: number
  onBack: () => void
}) {
  const { t } = useLanguage()

  const modeLabelMap: Record<TransportMode, string> = {
    walk: t('routes.mode.walk'), bike: t('routes.mode.bike'), transit: t('routes.mode.transit'),
  }
  const diffLabelMap: Record<Difficulty, string> = {
    'Fácil': t('routes.diff.easy'), 'Media': t('routes.diff.med'), 'Difícil': t('routes.diff.hard'),
  }
  const accLabelMap: Record<Accessibility, string> = {
    'Alta': t('routes.acc.high'), 'Media': t('routes.acc.med'), 'Baja': t('routes.acc.low'),
  }

  const modeCfg = { ...MODE_COLORS[route.mode], emoji: MODE_EMOJIS[route.mode], label: modeLabelMap[route.mode] }
  const accCfg  = ACCESSIBILITY_CONFIG[route.accessibility]
  const diffCfg = DIFFICULTY_COLORS[route.difficulty]

  const waypoints = useMemo(
    () => generateWaypoints(lat, lon, route.stops, route.name),
    [lat, lon, route.stops, route.name],
  )

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${GMAPS_MODE[route.mode]}`

  return (
    <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── Mini map ── */}
      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer
          center={[lat, lon]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <MapFit coords={waypoints} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          {/* Route polyline */}
          <Polyline
            positions={waypoints}
            pathOptions={{ color: modeCfg.color, weight: 5, opacity: 0.9, dashArray: route.mode === 'transit' ? '10 4' : undefined }}
          />
          {/* Stop markers (skip last — it's the same as start) */}
          {waypoints.slice(0, -1).map((pt, i) => (
            <Marker
              key={i}
              position={pt}
              icon={makeStopIcon(i, modeCfg.color, i === 0)}
            />
          ))}
        </MapContainer>

        {/* Map legend */}
        <Box sx={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)',
          borderRadius: '10px', border: '1px solid #E0D8CF',
          px: 1.4, py: 0.8,
          boxShadow: '0 2px 8px rgba(26,60,94,0.12)',
        }}>
          <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 600, mb: 0.4 }}>
            {route.stops} {t('routes.detail.stops')} · {route.distKm.toFixed(1)} km
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 20, height: 3, background: modeCfg.color, borderRadius: 2 }} />
            <Typography sx={{ fontSize: '0.6rem', color: '#64748B' }}>{modeCfg.emoji} {modeCfg.label}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Info panel ── */}
      <Box sx={{
        width: 270, flexShrink: 0,
        borderLeft: '1px solid #E0D8CF',
        background: '#FAFAF8',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Route title block */}
        <Box sx={{
          px: 2, pt: 2, pb: 1.5,
          borderBottom: '1px solid #EDE8E3',
          background: modeCfg.bg,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.5 }}>
            <Typography sx={{ fontSize: '1rem' }}>{modeCfg.emoji}</Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: modeCfg.color }}>
              {modeCfg.label}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A3C5E', lineHeight: 1.3 }}>
            {t(route.name as Parameters<typeof t>[0])}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { label: t('routes.detail.dist'),  val: `${route.distKm.toFixed(1)} km` },
            { label: t('routes.detail.dur'),   val: `${route.timeMin} min` },
            { label: t('routes.detail.stops'), val: String(route.stops) },
          ].map(({ label, val }) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{label}</Typography>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#1A3C5E' }}>{val}</Typography>
            </Box>
          ))}

          {/* Difficulty */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t('routes.detail.diff')}</Typography>
            <Box sx={{
              px: 0.8, py: 0.2, borderRadius: '6px',
              background: `${diffCfg.color}15`, border: `1px solid ${diffCfg.color}40`,
            }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: diffCfg.color }}>
                {diffLabelMap[route.difficulty]}
              </Typography>
            </Box>
          </Box>

          {/* Accessibility */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t('routes.detail.acc')}</Typography>
            <Box sx={{
              px: 0.8, py: 0.2, borderRadius: '6px',
              background: accCfg.bg, border: `1px solid ${accCfg.color}40`,
            }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: accCfg.color }}>
                ♿ {accLabelMap[route.accessibility]}
              </Typography>
            </Box>
          </Box>

          {/* CO2 */}
          <Box sx={{
            px: 1, py: 0.8, borderRadius: '8px',
            background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.2)',
          }}>
            <Typography sx={{ fontSize: '0.71rem', color: '#2D6A4F', fontWeight: 600 }}>
              🌿 {route.co2Saved > 0 ? `${route.co2Saved}g ${t('routes.detail.co2_saved')}` : t('routes.detail.zero_emiss')}
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ mx: 2, height: '1px', background: '#EDE8E3' }} />

        {/* Highlights / stops */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <Typography sx={{
            fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 600, mb: 1,
          }}>
            {t('routes.detail.highlights')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {route.highlights.map((h, i) => (
              <Box key={h} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${modeCfg.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: modeCfg.color }}>
                    {i + 1}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: '#475569' }}>{t(h as Parameters<typeof t>[0])}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Box
            component="a"
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'block', width: '100%', textAlign: 'center',
              py: 0.9, borderRadius: '10px',
              background: 'linear-gradient(135deg, #C05928 0%, #A04820 100%)',
              color: '#fff', fontSize: '0.76rem', fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(192,89,40,0.3)',
              transition: 'all 0.15s',
              '&:hover': {
                background: 'linear-gradient(135deg, #D06030 0%, #B05828 100%)',
                boxShadow: '0 4px 14px rgba(192,89,40,0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {t('routes.detail.gmaps')}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// ── Route card ────────────────────────────────────────────────────────────────
function RouteCard({ route, onSelect }: { route: Route; onSelect: () => void }) {
  const { t } = useLanguage()

  const modeLabelMap: Record<TransportMode, string> = {
    walk: t('routes.mode.walk'), bike: t('routes.mode.bike'), transit: t('routes.mode.transit'),
  }
  const diffLabelMap: Record<Difficulty, string> = {
    'Fácil': t('routes.diff.easy'), 'Media': t('routes.diff.med'), 'Difícil': t('routes.diff.hard'),
  }
  const accLabelMap: Record<Accessibility, string> = {
    'Alta': t('routes.acc.high'), 'Media': t('routes.acc.med'), 'Baja': t('routes.acc.low'),
  }

  const modeCfg = { ...MODE_COLORS[route.mode], emoji: MODE_EMOJIS[route.mode], label: modeLabelMap[route.mode] }
  const accCfg  = ACCESSIBILITY_CONFIG[route.accessibility]
  const diffCfg = DIFFICULTY_COLORS[route.difficulty]

  return (
    <Box sx={{
      background: '#fff',
      border: '1px solid #E0D8CF',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s, transform 0.15s',
      '&:hover': {
        boxShadow: '0 6px 20px rgba(26,60,94,0.13)',
        transform: 'translateY(-2px)',
      },
    }}>

      {/* Top band */}
      <Box sx={{ background: modeCfg.bg, px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Typography sx={{ fontSize: '0.85rem', lineHeight: 1 }}>{modeCfg.emoji}</Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: modeCfg.color }}>
            {modeCfg.label}
          </Typography>
        </Box>
        <Box sx={{ px: 0.8, py: 0.2, borderRadius: '20px', background: accCfg.bg, border: `1px solid ${accCfg.color}40` }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: accCfg.color, whiteSpace: 'nowrap' }}>
            ♿ {accLabelMap[route.accessibility]}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A3C5E', lineHeight: 1.3 }}>
          {t(route.name as Parameters<typeof t>[0])}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {[
            { icon: '📍', val: `${route.distKm.toFixed(1)} km` },
            { icon: '⏱',  val: `${route.timeMin} min` },
            { icon: '🗺',  val: `${route.stops} ${t('routes.card.stops')}` },
          ].map(({ icon, val }) => (
            <Box key={val} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>{icon}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{val}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ px: 0.8, py: 0.2, borderRadius: '6px', background: `${diffCfg.color}15`, border: `1px solid ${diffCfg.color}40` }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: diffCfg.color }}>
              {diffLabelMap[route.difficulty]}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.67rem', color: '#2D6A4F', fontWeight: 500 }}>
            🌿 {route.co2Saved > 0 ? `${route.co2Saved}g ${t('routes.card.co2')}` : t('routes.card.zero_emiss')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {route.highlights.map((h) => (
            <Box key={h} sx={{ px: 0.8, py: 0.25, borderRadius: '6px', background: '#F1EDE7', border: '1px solid #E0D8CF' }}>
              <Typography sx={{ fontSize: '0.62rem', color: '#64748B' }}>{t(h as Parameters<typeof t>[0])}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 1.5, py: 1,
        borderTop: '1px solid #F1EDE7',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      }}>
        <Box
          onClick={onSelect}
          sx={{
            fontSize: '0.72rem', fontWeight: 600, color: '#C05928',
            cursor: 'pointer',
            px: 1.2, py: 0.4, borderRadius: '8px',
            border: '1px solid rgba(192,89,40,0.3)',
            transition: 'all 0.15s',
            '&:hover': {
              background: 'rgba(192,89,40,0.07)',
              borderColor: '#C05928',
            },
          }}
        >
          {t('routes.card.view')}
        </Box>
      </Box>
    </Box>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TouristRoutesView() {
  const { destination } = useDestination()
  const { t } = useLanguage()
  const [filter, setFilter]             = useState<FilterMode>('all')
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
    { value: 'all',     label: t('routes.filter.all') },
    { value: 'walk',    label: t('routes.filter.walk') },
    { value: 'bike',    label: t('routes.filter.bike') },
    { value: 'transit', label: t('routes.filter.transit') },
  ]

  // Reset selection on destination change
  useEffect(() => { setSelectedRoute(null) }, [destination.id])

  const routes = useMemo<Route[]>(() => {
    const rng = mkRng(destination.id + 'routes')

    return ROUTE_NAME_KEYS.map((nameKey) => {
      const mode         = MODES[Math.floor(rng() * MODES.length)]
      const distKm       = parseFloat((1.2 + rng() * 10.8).toFixed(1))
      const timeMin      = Math.round(20 + rng() * 160)
      const difficulty   = DIFFICULTIES[Math.floor(rng() * DIFFICULTIES.length)]
      const accessibility = ACCESSIBILITIES[Math.floor(rng() * ACCESSIBILITIES.length)]
      const co2Saved     = (mode === 'walk' || mode === 'bike') ? 0 : Math.round(30 + rng() * 120)
      const stops        = Math.round(3 + rng() * 4)
      const highlights   = pickN(HIGHLIGHT_KEYS as unknown as string[], 3, rng)

      return { name: nameKey, mode, distKm, timeMin, difficulty, accessibility, co2Saved, stops, highlights }
    })
  }, [destination.id])

  const filteredRoutes = useMemo(
    () => filter === 'all' ? routes : routes.filter(r => r.mode === filter),
    [routes, filter],
  )

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAF8' }}>

      {/* Header */}
      <Box sx={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5, background: '#fff', borderBottom: '1px solid #E0D8CF',
        boxShadow: '0 1px 8px rgba(26,60,94,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {selectedRoute && (
            <Box
              onClick={() => setSelectedRoute(null)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                cursor: 'pointer', color: '#C05928',
                fontSize: '0.76rem', fontWeight: 600,
                px: 1, py: 0.4, borderRadius: '8px',
                border: '1px solid rgba(192,89,40,0.25)',
                transition: 'background 0.15s',
                '&:hover': { background: 'rgba(192,89,40,0.07)' },
                mr: 0.5,
              }}
            >
              {t('routes.back')}
            </Box>
          )}
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: '#C05928', flexShrink: 0 }} />
          <Box>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', lineHeight: 1,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {selectedRoute ? t(selectedRoute.name as Parameters<typeof t>[0]) : t('routes.header')}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        {/* Filter pills — only in list view */}
        {!selectedRoute && (
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.value
              return (
                <Box
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  sx={{
                    px: 1.4, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                    background: active ? '#1A3C5E' : 'transparent',
                    border: `1px solid ${active ? '#1A3C5E' : '#E0D8CF'}`,
                    transition: 'all 0.15s',
                    '&:hover': { background: active ? '#1A3C5E' : '#F8F4F0' },
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.72rem', fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : '#64748B',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                    {opt.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Content */}
      {selectedRoute ? (
        <RouteDetailPanel
          route={selectedRoute}
          lat={destination.lat}
          lon={destination.lon}
          onBack={() => setSelectedRoute(null)}
        />
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {filteredRoutes.length === 0 ? (
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', py: 8, gap: 1,
            }}>
              <Typography sx={{ fontSize: '2rem' }}>🗺</Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#94A3B8' }}>
                {t('routes.empty')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.name}
                  route={route}
                  onSelect={() => setSelectedRoute(route)}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
