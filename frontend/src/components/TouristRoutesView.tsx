import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useDestination } from '../context/DestinationContext'

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

const ROUTE_NAMES = [
  'Ruta del Casco Histórico',
  'Sendero de la Costa',
  'Ruta Gastronómica',
  'Paseo Cultural',
  'Itinerario Verde',
  'Ruta del Puerto',
]

const HIGHLIGHTS_POOL = [
  'Mercado central',
  'Jardín histórico',
  'Mirador panorámico',
  'Museo etnográfico',
  'Puerto deportivo',
  'Plaza mayor',
  'Iglesia barroca',
  'Barrio pesquero',
  'Palacio renacentista',
  'Torre medieval',
]

const MODES: TransportMode[] = ['walk', 'bike', 'transit']
const DIFFICULTIES: Difficulty[] = ['Fácil', 'Media', 'Difícil']
const ACCESSIBILITIES: Accessibility[] = ['Alta', 'Media', 'Baja']

const MODE_CONFIG: Record<TransportMode, { emoji: string; label: string; color: string; bg: string }> = {
  walk:    { emoji: '🚶', label: 'A pie',    color: '#2D6A4F', bg: '#2D6A4F20' },
  bike:    { emoji: '🚲', label: 'Bicicleta',color: '#2E7D98', bg: '#2E7D9820' },
  transit: { emoji: '🚌', label: 'Transporte',color: '#1A3C5E', bg: '#1A3C5E20' },
}

const ACCESSIBILITY_CONFIG: Record<Accessibility, { color: string; bg: string }> = {
  Alta:  { color: '#2D6A4F', bg: '#2D6A4F15' },
  Media: { color: '#F59E0B', bg: '#F59E0B15' },
  Baja:  { color: '#EF4444', bg: '#EF444415' },
}

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string }> = {
  Fácil:   { color: '#2D6A4F' },
  Media:   { color: '#F59E0B' },
  Difícil: { color: '#EF4444' },
}

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all',     label: 'Todas' },
  { value: 'walk',    label: '🚶 Pie' },
  { value: 'bike',    label: '🚲 Bici' },
  { value: 'transit', label: '🚌 Transporte' },
]

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr]
  const result: T[] = []
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(rng() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

function RouteCard({ route }: { route: Route }) {
  const modeCfg = MODE_CONFIG[route.mode]
  const accCfg = ACCESSIBILITY_CONFIG[route.accessibility]
  const diffCfg = DIFFICULTY_CONFIG[route.difficulty]

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
      <Box sx={{
        background: modeCfg.bg,
        px: 1.5, py: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Typography sx={{ fontSize: '0.85rem', lineHeight: 1 }}>{modeCfg.emoji}</Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: modeCfg.color }}>
            {modeCfg.label}
          </Typography>
        </Box>
        {/* Accessibility badge */}
        <Box sx={{
          px: 0.8, py: 0.2, borderRadius: '20px',
          background: accCfg.bg, border: `1px solid ${accCfg.color}40`,
        }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: accCfg.color, whiteSpace: 'nowrap' }}>
            ♿ {route.accessibility}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>

        {/* Route name */}
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A3C5E', lineHeight: 1.3 }}>
          {route.name}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>📍</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {route.distKm.toFixed(1)} km
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>⏱</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {route.timeMin} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>🗺</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {route.stops} paradas
            </Typography>
          </Box>
        </Box>

        {/* Difficulty + CO2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            px: 0.8, py: 0.2, borderRadius: '6px',
            background: `${diffCfg.color}15`, border: `1px solid ${diffCfg.color}40`,
          }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: diffCfg.color }}>
              {route.difficulty}
            </Typography>
          </Box>
          {route.co2Saved > 0 ? (
            <Typography sx={{ fontSize: '0.67rem', color: '#2D6A4F', fontWeight: 500 }}>
              🌿 {route.co2Saved}g CO₂ ahorrado
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.67rem', color: '#2D6A4F', fontWeight: 500 }}>
              🌿 0 emisiones
            </Typography>
          )}
        </Box>

        {/* Highlights */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {route.highlights.map((h) => (
            <Box key={h} sx={{
              px: 0.8, py: 0.25, borderRadius: '6px',
              background: '#F1EDE7', border: '1px solid #E0D8CF',
            }}>
              <Typography sx={{ fontSize: '0.62rem', color: '#64748B' }}>
                {h}
              </Typography>
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
        <Typography sx={{
          fontSize: '0.72rem', fontWeight: 600, color: '#C05928',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}>
          Ver ruta →
        </Typography>
      </Box>
    </Box>
  )
}

export default function TouristRoutesView() {
  const { destination } = useDestination()
  const [filter, setFilter] = useState<FilterMode>('all')

  const routes = useMemo<Route[]>(() => {
    const rng = mkRng(destination.id + 'routes')

    return ROUTE_NAMES.map((name, i) => {
      const mode = MODES[Math.floor(rng() * MODES.length)]
      const distKm = parseFloat((1.2 + rng() * 10.8).toFixed(1))
      const timeMin = Math.round(20 + rng() * 160)
      const difficulty = DIFFICULTIES[Math.floor(rng() * DIFFICULTIES.length)]
      const accessibility = ACCESSIBILITIES[Math.floor(rng() * ACCESSIBILITIES.length)]
      const co2Saved = (mode === 'walk' || mode === 'bike') ? 0 : Math.round(30 + rng() * 120)
      const stops = Math.round(3 + rng() * 4)

      // Pick 3 distinct highlights
      const highlights = pickN(HIGHLIGHTS_POOL, 3, rng)

      return { name, mode, distKm, timeMin, difficulty, accessibility, co2Saved, stops, highlights }
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
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: '#C05928', flexShrink: 0 }} />
          <Box>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', lineHeight: 1,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Rutas Turísticas
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        {/* Filter pills */}
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
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {filteredRoutes.length === 0 ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', py: 8, gap: 1,
          }}>
            <Typography sx={{ fontSize: '2rem' }}>🗺</Typography>
            <Typography sx={{ fontSize: '0.86rem', color: '#94A3B8' }}>
              No hay rutas disponibles para este modo de transporte
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
          }}>
            {filteredRoutes.map((route) => (
              <RouteCard key={route.name} route={route} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
