import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, useMap } from 'react-leaflet'
import CloseIcon from '@mui/icons-material/Close'
import { useDestination } from '../context/DestinationContext'
import { fetchCyclePaths } from '../api/overpass'
import type { CyclePath } from '../api/overpass'
import 'leaflet/dist/leaflet.css'

type Mode = 'concentracion' | 'accesibilidad' | 'movilidad' | 'rutas'
type ZoneType = 'hot' | 'medium' | 'cool'

interface HeatZone {
  lat: number; lon: number; intensity: number; radius: number; type: ZoneType
}

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

// ── Route planning ─────────────────────────────────────────────────────────────
interface RoutePOI { id: string; label: string; icon: string; dlat: number; dlon: number }
interface RouteResult {
  mode: 'walk' | 'bike' | 'transit'; label: string; icon: string
  color: string; distKm: number; timeMin: number; co2gKm: number; co2SavedG: number
}

const ROUTE_POIS: RoutePOI[] = [
  { id: 'station', label: 'Estación central', icon: '🚉', dlat:  0.012, dlon: -0.008 },
  { id: 'airport', label: 'Aeropuerto',        icon: '✈️', dlat: -0.055, dlon: -0.045 },
  { id: 'hotel',   label: 'Hotel centro',      icon: '🏨', dlat:  0.003, dlon:  0.005 },
  { id: 'beach',   label: 'Playa principal',   icon: '🏖️', dlat: -0.018, dlon:  0.032 },
  { id: 'museum',  label: 'Museo principal',   icon: '🏛️', dlat:  0.007, dlon: -0.004 },
  { id: 'market',  label: 'Mercado central',   icon: '🛒', dlat:  0.001, dlon:  0.002 },
  { id: 'park',    label: 'Área natural',      icon: '🌿', dlat:  0.042, dlon: -0.028 },
  { id: 'port',    label: 'Puerto deportivo',  icon: '⚓', dlat: -0.012, dlon:  0.038 },
]

function calcRouteOptions(origin: RoutePOI, dest: RoutePOI, baseLat: number): RouteResult[] {
  const cosLat   = Math.cos(baseLat * Math.PI / 180)
  const dLat     = (dest.dlat - origin.dlat) * 111
  const dLon     = (dest.dlon - origin.dlon) * 111 * cosLat
  const directKm = Math.sqrt(dLat * dLat + dLon * dLon)
  const MODES = [
    { mode: 'walk'    as const, label: 'A pie',      icon: '🚶', color: '#2D6A4F', kmFactor: 1.30, kmhSpeed: 4.8,  co2gKm: 0,  waitMin: 0 },
    { mode: 'bike'    as const, label: 'Bicicleta',  icon: '🚲', color: '#2E7D98', kmFactor: 1.20, kmhSpeed: 14.0, co2gKm: 0,  waitMin: 2 },
    { mode: 'transit' as const, label: 'Transporte', icon: '🚌', color: '#1A3C5E', kmFactor: 1.55, kmhSpeed: 18.0, co2gKm: 28, waitMin: 5 },
  ]
  return MODES.map(m => {
    const distKm    = Math.round(directKm * m.kmFactor * 10) / 10
    const timeMin   = Math.round((distKm / m.kmhSpeed) * 60 + m.waitMin)
    const co2SavedG = Math.round(distKm * (120 - m.co2gKm))
    return { mode: m.mode, label: m.label, icon: m.icon, color: m.color,
             distKm, timeMin, co2gKm: m.co2gKm, co2SavedG }
  })
}

function routeWaypoints(oLat: number, oLon: number, dLat: number, dLon: number, seed: string): [number, number][] {
  const rng    = mkRng(seed)
  const spread = 0.006
  const mLat   = (oLat + dLat) / 2
  const mLon   = (oLon + dLon) / 2
  return [
    [oLat, oLon],
    [mLat + (rng() - 0.5) * spread, mLon + (rng() - 0.5) * spread],
    [mLat + (rng() - 0.5) * spread * 0.5, mLon + (rng() - 0.5) * spread * 0.5],
    [dLat, dLon],
  ]
}

function POISelect({ value, onChange, options, placeholder }: {
  value: string | null; onChange: (v: string) => void
  options: RoutePOI[]; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const sel = options.find(o => o.id === value)
  return (
    <Box sx={{ position: 'relative' }}>
      <Box onClick={() => setOpen(o => !o)} sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.2, py: 0.85, borderRadius: '8px', cursor: 'pointer',
        border: `1.5px solid ${open ? '#C05928' : '#E0D8CF'}`,
        background: '#fff', transition: 'border 0.15s',
        '&:hover': { borderColor: '#C05928' },
      }}>
        <Typography sx={{ flex: 1, fontSize: '0.74rem', color: sel ? '#1A3C5E' : '#94A3B8' }}>
          {sel ? `${sel.icon} ${sel.label}` : placeholder}
        </Typography>
        <Typography sx={{ fontSize: '9px', color: '#94A3B8', lineHeight: 1 }}>▼</Typography>
      </Box>
      {open && (
        <Box sx={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 2000,
          background: '#fff', border: '1px solid #E0D8CF', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(26,60,94,0.14)', overflow: 'hidden',
        }}>
          {options.map(o => (
            <Box key={o.id} onClick={() => { onChange(o.id); setOpen(false) }} sx={{
              px: 1.2, py: 0.7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.8,
              background: value === o.id ? 'rgba(26,60,94,0.06)' : 'transparent',
              '&:hover': { background: 'rgba(26,60,94,0.04)' },
            }}>
              <Typography sx={{ fontSize: '13px' }}>{o.icon}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#1A3C5E' }}>{o.label}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ── Heat map helpers ────────────────────────────────────────────────────────────
function classifyZone(intensity: number): ZoneType {
  if (intensity >= 0.6) return 'hot'
  if (intensity >= 0.33) return 'medium'
  return 'cool'
}

function generateZones(lat: number, lon: number, destId: string, mode: Mode): HeatZone[] {
  if (mode === 'rutas') return []
  const rng = mkRng(destId + mode)
  const zones: HeatZone[] = []
  for (let i = 0; i < 4; i++) {
    const angle = rng() * Math.PI * 2; const dist = 0.007 + rng() * 0.014
    const intensity = 0.65 + rng() * 0.35
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity, radius: 700 + rng() * 400, type: classifyZone(intensity) })
  }
  for (let i = 0; i < 3; i++) {
    const angle = rng() * Math.PI * 2; const dist = 0.022 + rng() * 0.018
    const intensity = 0.35 + rng() * 0.28
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity, radius: 550 + rng() * 250, type: classifyZone(intensity) })
  }
  for (let i = 0; i < 5; i++) {
    const angle = rng() * Math.PI * 2; const dist = 0.038 + rng() * 0.038
    const intensity = rng() * 0.28
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity, radius: 500 + rng() * 300, type: classifyZone(intensity) })
  }
  return zones
}

const MODE_META: Record<Exclude<Mode, 'rutas'>, {
  label: string; highLabel: string; lowLabel: string
  highColor: string; midColor: string; lowColor: string
}> = {
  concentracion: {
    label: 'Concentración turística',
    highLabel: 'Saturado', lowLabel: 'Infrautilizado',
    highColor: '#EF4444', midColor: '#F59E0B', lowColor: '#10B981',
  },
  accesibilidad: {
    label: 'Índice de accesibilidad',
    highLabel: 'Alta accesibilidad', lowLabel: 'Baja accesibilidad',
    highColor: '#2D6A4F', midColor: '#2E7D98', lowColor: '#EF4444',
  },
  movilidad: {
    label: 'Cobertura movilidad sostenible',
    highLabel: 'Bien conectado', lowLabel: 'Sin cobertura',
    highColor: '#1A3C5E', midColor: '#2E7D98', lowColor: '#C05928',
  },
}

function zoneColor(mode: Exclude<Mode, 'rutas'>, type: ZoneType): string {
  const m = MODE_META[mode]
  if (type === 'hot')    return m.highColor
  if (type === 'medium') return m.midColor
  return m.lowColor
}

function generateStats(destId: string) {
  const rng = mkRng(destId + 'stats-v2')
  return {
    saturacion:  Math.round(42 + rng() * 52),
    zonasCrit:   Math.round(2  + rng() * 6),
    zonasVacias: Math.round(4  + rng() * 8),
    capacidad:   Math.round(28 + rng() * 48),
    transporte:  Math.round(38 + rng() * 55),
    ciclismo:    Math.round(12 + rng() * 62),
    accesib:     Math.round(33 + rng() * 60),
    movilidad:   Math.round(22 + rng() * 65),
    emisiones:   Math.round(4  + rng() * 18),
    paradast:    Math.round(18 + rng() * 45),
  }
}

const ZONE_NAME_HOT    = ['Centro histórico', 'Zona litoral', 'Paseo marítimo', 'Casco antiguo']
const ZONE_NAME_MEDIUM = ['Barrio Ruzafa', 'Área pericentral', 'Ensanche norte']
const ZONE_NAME_COOL   = ['Zona rural', 'Interior comarca', 'Área agrícola', 'Periferia sur', 'Hinterland']

function zoneName(zone: HeatZone, idx: number): string {
  if (zone.type === 'hot')    return ZONE_NAME_HOT[idx % ZONE_NAME_HOT.length]
  if (zone.type === 'medium') return ZONE_NAME_MEDIUM[idx % ZONE_NAME_MEDIUM.length]
  return ZONE_NAME_COOL[idx % ZONE_NAME_COOL.length]
}

const RECOMMENDATIONS: Record<ZoneType, string[]> = {
  hot:    ['Redistribuir flujo hacia zonas alternativas', 'Aplicar límite de capacidad temporal', 'Promocionar destinos próximos infrautilizados'],
  medium: ['Monitorizar evolución de demanda', 'Reforzar señalización turística', 'Desarrollar oferta complementaria'],
  cool:   ['Crear rutas de descubrimiento', 'Impulsar visibilidad digital', 'Incluir en paquetes turísticos integrados'],
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center, zoom, map])
  return null
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <Box sx={{
      p: 1.2, borderRadius: '10px', border: '1px solid #E8E3DC',
      background: `linear-gradient(135deg, ${color}10 0%, #FAFAF8 100%)`,
      boxShadow: '0 1px 4px rgba(26,60,94,0.07)',
    }}>
      <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', lineHeight: 1, mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: '0.6rem', fontWeight: 400, color: '#94A3B8', marginLeft: 2 }}>{unit}</span>
      </Typography>
    </Box>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function InteractiveMapView() {
  const { destination } = useDestination()
  const [mode,          setMode]          = useState<Mode>('concentracion')
  const [livePaths,     setLivePaths]     = useState<CyclePath[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<ZoneType>>(new Set(['hot', 'medium', 'cool']))
  const [selectedZone,  setSelectedZone]  = useState<number | null>(null)

  // Route planner state
  const [routeOriginId,   setRouteOriginId]   = useState<string | null>(null)
  const [routeDestId,     setRouteDestId]     = useState<string | null>(null)
  const [routeResults,    setRouteResults]    = useState<RouteResult[] | null>(null)
  const [routeTransport,  setRouteTransport]  = useState<'walk' | 'bike' | 'transit'>('bike')

  const zones = useMemo(
    () => generateZones(destination.lat, destination.lon, destination.id, mode),
    [destination.id, destination.lat, destination.lon, mode],
  )
  const stats = useMemo(() => generateStats(destination.id), [destination.id])

  useEffect(() => {
    setSelectedZone(null)
    setRouteResults(null); setRouteOriginId(null); setRouteDestId(null)
    fetchCyclePaths(destination.lat, destination.lon, destination.id, destination.bboxDelta)
      .then(setLivePaths)
      .catch(() => setLivePaths([]))
  }, [destination])

  useEffect(() => { setSelectedZone(null) }, [mode])

  function toggleFilter(type: ZoneType) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) { if (next.size > 1) next.delete(type) } else { next.add(type) }
      return next
    })
    setSelectedZone(null)
  }

  function handleCalcRoute() {
    if (!routeOriginId || !routeDestId || routeOriginId === routeDestId) return
    const origin = ROUTE_POIS.find(p => p.id === routeOriginId)!
    const dest   = ROUTE_POIS.find(p => p.id === routeDestId)!
    setRouteResults(calcRouteOptions(origin, dest, destination.lat))
    setRouteTransport('bike')
  }

  const mapCenter: [number, number] = [destination.lat, destination.lon]

  const heatMode = mode !== 'rutas' ? mode : 'concentracion'
  const cfg      = MODE_META[heatMode]

  const TYPES: Record<ZoneType, { label: string; color: string }> = {
    hot:    { label: cfg.highLabel, color: cfg.highColor },
    medium: { label: 'Moderado',    color: cfg.midColor  },
    cool:   { label: cfg.lowLabel,  color: cfg.lowColor  },
  }

  const primaryValue    = mode === 'concentracion' ? stats.saturacion : mode === 'accesibilidad' ? stats.accesib : stats.movilidad
  const primaryLabel    = mode === 'concentracion' ? 'Índice de saturación' : mode === 'accesibilidad' ? 'Índice de accesibilidad' : 'Cobertura movilidad'
  const primaryGradient = mode === 'concentracion'
    ? 'linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%)'
    : mode === 'accesibilidad'
    ? 'linear-gradient(90deg, #EF4444 0%, #2E7D98 50%, #2D6A4F 100%)'
    : 'linear-gradient(90deg, #C05928 0%, #2E7D98 50%, #1A3C5E 100%)'

  const modeMetrics = mode === 'concentracion'
    ? [
        { label: 'Zonas críticas',  value: stats.zonasCrit,  unit: '',  color: '#EF4444' },
        { label: 'Capacidad libre', value: stats.capacidad,  unit: '%', color: '#10B981' },
        { label: 'Zonas vacías',    value: stats.zonasVacias,unit: '',  color: '#2D6A4F' },
        { label: 'Sat. litoral',    value: Math.min(100, stats.saturacion + 11), unit: '%', color: '#C05928' },
      ]
    : mode === 'accesibilidad'
    ? [
        { label: 'Cobertura transp.', value: stats.transporte, unit: '%', color: '#2E7D98' },
        { label: 'Nodos accesibles',  value: Math.round(28 + stats.accesib * 0.9), unit: '', color: '#2D6A4F' },
        { label: 'Barreras',          value: Math.max(2, Math.round(14 - stats.accesib * 0.11)), unit: '', color: '#EF4444' },
        { label: 'Cobertura peat.',   value: Math.min(98, stats.accesib + 9), unit: '%', color: '#1A3C5E' },
      ]
    : [
        { label: 'Red ciclista',    value: stats.ciclismo,  unit: 'km', color: '#2D6A4F' },
        { label: 'Paradas transp.', value: stats.paradast,  unit: '',   color: '#2E7D98' },
        { label: 'Cobertura EV',    value: Math.round(stats.movilidad * 0.38), unit: '%', color: '#1A3C5E' },
        { label: 'Emisiones evit.', value: stats.emisiones, unit: 't',  color: '#10B981' },
      ]

  const selZone = selectedZone !== null ? zones[selectedZone] : null
  const selColor = selZone ? zoneColor(heatMode, selZone.type) : null
  const selRec   = selZone ? RECOMMENDATIONS[selZone.type] : []

  // Route overlay geometry
  const routeOrigin = ROUTE_POIS.find(p => p.id === routeOriginId)
  const routeDest   = ROUTE_POIS.find(p => p.id === routeDestId)
  const oLat = routeOrigin ? destination.lat + routeOrigin.dlat : 0
  const oLon = routeOrigin ? destination.lon + routeOrigin.dlon : 0
  const dLat = routeDest   ? destination.lat + routeDest.dlat   : 0
  const dLon = routeDest   ? destination.lon + routeDest.dlon   : 0
  const activeResult = routeResults?.find(r => r.mode === routeTransport)
  const waypoints = (routeResults && routeOrigin && routeDest)
    ? routeWaypoints(oLat, oLon, dLat, dLon, routeOriginId! + routeDestId!)
    : []

  const MODE_LABELS: Record<Mode, string> = {
    concentracion: 'Concentración', accesibilidad: 'Accesibilidad', movilidad: 'Movilidad', rutas: 'Rutas',
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, flexShrink: 0, height: 52,
        background: '#fff', borderBottom: '1px solid #E0D8CF',
        boxShadow: '0 1px 8px rgba(26,60,94,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: '#C05928', flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.63rem', color: '#94A3B8', lineHeight: 1,
                               textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Mapa interactivo
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {(['concentracion', 'accesibilidad', 'movilidad', 'rutas'] as Mode[]).map(m => (
            <Box key={m} onClick={() => setMode(m)} sx={{
              px: 1.4, py: 0.5, borderRadius: '8px', cursor: 'pointer',
              background: mode === m ? '#1A3C5E' : 'transparent',
              border: `1px solid ${mode === m ? '#1A3C5E' : '#E0D8CF'}`,
              transition: 'all 0.15s',
              '&:hover': { background: mode === m ? '#1A3C5E' : '#F8F4F0' },
            }}>
              <Typography sx={{
                fontSize: '0.72rem', fontWeight: mode === m ? 600 : 400,
                color: mode === m ? '#fff' : '#64748B', userSelect: 'none',
              }}>
                {MODE_LABELS[m]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Map + Stats */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Map */}
        <Box sx={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapContainer
            center={mapCenter} zoom={destination.zoom}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false} attributionControl={false}
          >
            <MapController center={mapCenter} zoom={destination.zoom} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />

            {/* Heat circles — hidden in rutas mode */}
            {mode !== 'rutas' && zones.map((zone, i) => {
              const color = zoneColor(mode, zone.type)
              const isFiltered = activeFilters.has(zone.type)
              const isSelected = selectedZone === i
              return (
                <Circle key={`${mode}-${i}-a`} center={[zone.lat, zone.lon]} radius={zone.radius}
                  pathOptions={{ fillColor: color, fillOpacity: isSelected ? 0.16 : isFiltered ? 0.09 : 0.02, stroke: false }} />
              )
            })}
            {mode !== 'rutas' && zones.map((zone, i) => {
              const color = zoneColor(mode, zone.type)
              const isFiltered = activeFilters.has(zone.type)
              const isSelected = selectedZone === i
              return (
                <Circle key={`${mode}-${i}-b`} center={[zone.lat, zone.lon]} radius={zone.radius * 0.58}
                  pathOptions={{ fillColor: color, fillOpacity: isSelected ? 0.26 : isFiltered ? 0.16 : 0.03, stroke: false }} />
              )
            })}
            {mode !== 'rutas' && zones.map((zone, i) => {
              const color = zoneColor(mode, zone.type)
              const isFiltered = activeFilters.has(zone.type)
              const isSelected = selectedZone === i
              return (
                <Circle key={`${mode}-${i}-c`}
                  center={[zone.lat, zone.lon]} radius={zone.radius * 0.28}
                  pathOptions={{
                    fillColor: color, fillOpacity: isSelected ? 0.55 : isFiltered ? 0.28 : 0.05,
                    stroke: isSelected, color, weight: 2, opacity: 0.8,
                  }}
                  eventHandlers={{ click: () => setSelectedZone(prev => prev === i ? null : i) }}
                />
              )
            })}

            {/* Ciclovías */}
            {mode === 'movilidad' && livePaths.map(path => (
              <Polyline key={path.id} positions={path.coords}
                pathOptions={{ color: '#2D6A4F', weight: 2.5, opacity: 0.75 }} />
            ))}

            {/* Route overlay */}
            {mode === 'rutas' && routeResults !== null && activeResult && waypoints.length > 0 && (
              <>
                <Polyline
                  positions={waypoints}
                  pathOptions={{
                    color: activeResult.color, weight: 4.5, opacity: 0.88,
                    dashArray: routeTransport === 'walk' ? '8,5' : undefined,
                  }}
                />
                <CircleMarker center={[oLat, oLon]} radius={11}
                  pathOptions={{ fillColor: '#2D6A4F', fillOpacity: 0.92, color: '#fff', weight: 2 }} />
                <CircleMarker center={[dLat, dLon]} radius={11}
                  pathOptions={{ fillColor: '#EF4444', fillOpacity: 0.92, color: '#fff', weight: 2 }} />
              </>
            )}
          </MapContainer>

          {/* Route planner floating panel */}
          {mode === 'rutas' && (
            <Box sx={{
              position: 'absolute', top: 12, left: 12, zIndex: 1000,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
              border: '1px solid #E0D8CF', borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(26,60,94,0.16)',
              width: 228, overflow: 'hidden',
            }}>
              {/* Panel header */}
              <Box sx={{
                px: 1.8, py: 1.2,
                background: 'linear-gradient(135deg, #0C2135 0%, #1A3C5E 100%)',
                borderBottom: '2px solid #C05928',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                  🗺️ Planificador de rutas
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', textTransform: 'uppercase',
                                     letterSpacing: '0.07em', fontWeight: 600, mb: 0.5 }}>
                    📍 Origen
                  </Typography>
                  <POISelect
                    value={routeOriginId}
                    onChange={id => { setRouteOriginId(id); setRouteResults(null) }}
                    options={ROUTE_POIS}
                    placeholder="Seleccionar origen..."
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', textTransform: 'uppercase',
                                     letterSpacing: '0.07em', fontWeight: 600, mb: 0.5 }}>
                    🎯 Destino
                  </Typography>
                  <POISelect
                    value={routeDestId}
                    onChange={id => { setRouteDestId(id); setRouteResults(null) }}
                    options={ROUTE_POIS.filter(p => p.id !== routeOriginId)}
                    placeholder="Seleccionar destino..."
                  />
                </Box>
                <Box
                  onClick={handleCalcRoute}
                  sx={{
                    py: 0.9, borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                    background: routeOriginId && routeDestId && routeOriginId !== routeDestId
                      ? 'linear-gradient(135deg, #C05928, #A04820)'
                      : '#E0D8CF',
                    transition: 'all 0.15s',
                    '&:hover': { opacity: routeOriginId && routeDestId ? 0.88 : 1 },
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.75rem', fontWeight: 700,
                    color: routeOriginId && routeDestId ? '#fff' : '#94A3B8',
                  }}>
                    Calcular ruta
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Zoom controls */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000,
                     display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {['+', '−'].map((lbl, i) => (
              <Box key={i} sx={{
                width: 30, height: 30,
                background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
                border: '1px solid #E0D8CF', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '17px', color: '#1A3C5E', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(26,60,94,0.10)', userSelect: 'none',
                transition: 'background 0.15s', '&:hover': { background: '#FDF6F0' },
              }}>{lbl}</Box>
            ))}
          </Box>

          {/* Legend — clickable filters (hidden in rutas mode) */}
          {mode !== 'rutas' && (
            <Box sx={{
              position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)',
              border: '1px solid #E0D8CF', borderRadius: '12px',
              px: 1.5, py: 1.1, boxShadow: '0 4px 16px rgba(26,60,94,0.12)',
            }}>
              <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8', mb: 0.8,
                                 textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {cfg.label}
              </Typography>
              {(['hot', 'medium', 'cool'] as ZoneType[]).map(type => {
                const { label, color } = TYPES[type]
                const isOn = activeFilters.has(type)
                return (
                  <Box key={type} onClick={() => toggleFilter(type)} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.45,
                    cursor: 'pointer', userSelect: 'none',
                    opacity: isOn ? 1 : 0.38, transition: 'opacity 0.2s',
                    '&:hover': { opacity: isOn ? 0.8 : 0.6 },
                  }}>
                    <Box sx={{
                      width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                      background: isOn ? color : '#C8C0B8',
                      boxShadow: isOn ? `0 0 0 2px ${color}30` : 'none', transition: 'all 0.2s',
                    }} />
                    <Typography sx={{
                      fontSize: '0.65rem', color: isOn ? '#374151' : '#94A3B8',
                      fontWeight: isOn ? 500 : 400, textDecoration: isOn ? 'none' : 'line-through',
                      transition: 'all 0.2s',
                    }}>{label}</Typography>
                  </Box>
                )
              })}
              {activeFilters.size < 3 && (
                <Box onClick={() => setActiveFilters(new Set(['hot', 'medium', 'cool']))}
                  sx={{ mt: 0.8, pt: 0.8, borderTop: '1px solid #F0EBE5', cursor: 'pointer',
                        '&:hover': { opacity: 0.7 } }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#C05928', fontWeight: 600 }}>
                    Mostrar todos
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Attribution */}
          <Box sx={{ position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
                     background: 'rgba(255,255,255,0.82)', borderRadius: '6px', px: 0.8, py: 0.3 }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#94A3B8' }}>
              © OpenStreetMap · CARTO
            </Typography>
          </Box>
        </Box>

        {/* Stats / Route Panel */}
        <Box sx={{
          width: 260, flexShrink: 0,
          background: '#FAFAF8', borderLeft: '1px solid #E0D8CF',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-thumb': { background: '#E0D8CF', borderRadius: 4 },
        }}>
          {/* Panel header — navy */}
          <Box sx={{
            px: 2, pt: 2, pb: 1.8, flexShrink: 0,
            background: 'linear-gradient(135deg, #0C2135 0%, #1A3C5E 100%)',
            borderBottom: '3px solid #C05928',
          }}>
            <Typography sx={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)',
                               textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
              {mode === 'rutas' ? 'Planificador de rutas' : 'Análisis del destino'}
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {destination.name}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>
              {destination.region}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, p: 1.8, display: 'flex', flexDirection: 'column', gap: 1.6 }}>

            {/* ── RUTAS panel ── */}
            {mode === 'rutas' && (
              <>
                {routeResults === null ? (
                  <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', flex: 1, gap: 1.5, py: 4, textAlign: 'center',
                  }}>
                    <Typography sx={{ fontSize: '2.2rem', lineHeight: 1 }}>🗺️</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.6, maxWidth: 180 }}>
                      Selecciona origen y destino en el panel del mapa para comparar rutas accesibles
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7, width: '100%', mt: 1 }}>
                      {[
                        { icon: '🚶', label: 'A pie', desc: 'Rutas peatonales accesibles', color: '#2D6A4F' },
                        { icon: '🚲', label: 'Bicicleta', desc: 'Carriles bici y zonas ciclables', color: '#2E7D98' },
                        { icon: '🚌', label: 'Transporte', desc: 'Autobús y metro accesibles', color: '#1A3C5E' },
                      ].map(m => (
                        <Box key={m.label} sx={{
                          display: 'flex', alignItems: 'center', gap: 1, px: 1.2, py: 0.8,
                          borderRadius: '8px', background: '#fff', border: '1px solid #E0D8CF',
                        }}>
                          <Typography sx={{ fontSize: '1rem' }}>{m.icon}</Typography>
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: m.color }}>{m.label}</Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8' }}>{m.desc}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <>
                    {/* Route summary */}
                    <Box sx={{ p: 1.5, borderRadius: '10px', background: '#fff', border: '1px solid #E0D8CF' }}>
                      <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ruta calculada</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#2D6A4F', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A3C5E' }}>
                          {routeOrigin?.icon} {routeOrigin?.label}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '1px', height: 14, background: '#E0D8CF', ml: '4px', my: 0.3 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A3C5E' }}>
                          {routeDest?.icon} {routeDest?.label}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Transport mode selector */}
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      {routeResults.map(r => (
                        <Box key={r.mode} onClick={() => setRouteTransport(r.mode)} sx={{
                          flex: 1, py: 0.7, borderRadius: '9px', cursor: 'pointer', textAlign: 'center',
                          background: routeTransport === r.mode ? r.color : 'transparent',
                          border: `1.5px solid ${routeTransport === r.mode ? r.color : '#E0D8CF'}`,
                          transition: 'all 0.15s',
                        }}>
                          <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{r.icon}</Typography>
                          <Typography sx={{
                            fontSize: '0.6rem', fontWeight: 600, mt: 0.2,
                            color: routeTransport === r.mode ? '#fff' : '#64748B',
                          }}>{r.label}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Active mode detail */}
                    {activeResult && (
                      <Box sx={{
                        p: 1.5, borderRadius: '12px', background: '#fff',
                        border: `1.5px solid ${activeResult.color}40`,
                        borderTop: `3px solid ${activeResult.color}`,
                        boxShadow: `0 2px 12px ${activeResult.color}15`,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: activeResult.color, lineHeight: 1 }}>
                            {activeResult.timeMin}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>min</Typography>
                        </Box>
                        {[
                          { label: 'Distancia', value: `${activeResult.distKm} km`, color: '#1A3C5E' },
                          { label: 'CO₂', value: activeResult.co2gKm === 0 ? '0 g — sostenible' : `${activeResult.co2gKm} g/km`, color: activeResult.co2gKm === 0 ? '#2D6A4F' : '#F59E0B' },
                          ...(activeResult.co2SavedG > 0 ? [{ label: 'Ahorro vs 🚗', value: `↓ ${activeResult.co2SavedG} g CO₂`, color: '#2D6A4F' }] : []),
                        ].map(item => (
                          <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.label}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: item.color }}>{item.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Mini comparison */}
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                                         color: '#94A3B8', fontWeight: 600, mb: 0.8 }}>
                        Comparativa de modos
                      </Typography>
                      {routeResults.map(r => (
                        <Box key={r.mode} sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          py: 0.6, borderBottom: '1px solid #EDE8E3',
                          opacity: routeTransport === r.mode ? 1 : 0.55,
                          transition: 'opacity 0.15s',
                          cursor: 'pointer',
                        }} onClick={() => setRouteTransport(r.mode)}>
                          <Typography sx={{ fontSize: '0.9rem', width: 20 }}>{r.icon}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#475569', flex: 1 }}>{r.label}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: r.color }}>{r.timeMin} min</Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box onClick={() => { setRouteResults(null); setRouteOriginId(null); setRouteDestId(null) }}
                      sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #EDE8E3', cursor: 'pointer',
                            textAlign: 'center', '&:hover': { opacity: 0.7 } }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#C05928', fontWeight: 600 }}>← Nueva ruta</Typography>
                    </Box>
                  </>
                )}
              </>
            )}

            {/* ── HEATMAP panel ── */}
            {mode !== 'rutas' && (
              <>
                {/* Selected zone detail */}
                {selZone && selColor && (
                  <Box sx={{
                    borderRadius: '12px', border: `1.5px solid ${selColor}40`,
                    background: `linear-gradient(135deg, ${selColor}0D 0%, #FAFAF8 100%)`,
                    boxShadow: `0 2px 12px ${selColor}20`, overflow: 'hidden',
                  }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 1.4, py: 0.9, background: `${selColor}15`, borderBottom: `1px solid ${selColor}25`,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: selColor, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: selColor }}>
                          {TYPES[selZone.type].label}
                        </Typography>
                      </Box>
                      <CloseIcon sx={{ fontSize: 13, color: '#94A3B8', cursor: 'pointer',
                                       '&:hover': { color: '#475569' } }}
                        onClick={() => setSelectedZone(null)} />
                    </Box>
                    <Box sx={{ px: 1.4, py: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#1A3C5E', mb: 0.3 }}>
                        {zoneName(selZone, selectedZone!)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8' }}>Intensidad:</Typography>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: selColor }}>
                          {Math.round(selZone.intensity * 100)}%
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 600, mb: 0.5,
                                         textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Recomendación
                      </Typography>
                      {selRec.slice(0, 2).map((r, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 0.6, mb: 0.4 }}>
                          <Typography sx={{ fontSize: '0.62rem', color: selColor, flexShrink: 0, mt: '1px' }}>→</Typography>
                          <Typography sx={{ fontSize: '0.62rem', color: '#475569', lineHeight: 1.4 }}>{r}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Primary KPI */}
                <Box sx={{
                  p: 1.5, borderRadius: '12px', background: '#fff',
                  border: '1px solid #E8E3DC', borderTop: '3px solid #C05928',
                  boxShadow: '0 2px 10px rgba(26,60,94,0.08)',
                }}>
                  <Typography sx={{ fontSize: '0.67rem', color: '#64748B', mb: 0.5 }}>{primaryLabel}</Typography>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#1A3C5E', lineHeight: 1 }}>
                    {primaryValue}
                    <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94A3B8' }}>/100</span>
                  </Typography>
                  <LinearProgress variant="determinate" value={primaryValue} sx={{
                    mt: 0.9, height: 5, borderRadius: 3, backgroundColor: '#E8E3DC',
                    '& .MuiLinearProgress-bar': { background: primaryGradient, borderRadius: 3 },
                  }} />
                </Box>

                {/* 2×2 metric grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.9 }}>
                  {modeMetrics.map(m => (
                    <StatCard key={m.label} label={m.label} value={m.value} unit={m.unit} color={m.color} />
                  ))}
                </Box>

                {/* Zone status list */}
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                                     color: '#94A3B8', fontWeight: 600, mb: 0.9 }}>
                    {mode === 'concentracion' ? 'Zonas de atención'
                      : mode === 'accesibilidad' ? 'Brechas detectadas'
                      : 'Oportunidades de mejora'}
                  </Typography>
                  {[
                    { name: `Centro · ${destination.name}`,
                      status: mode === 'concentracion' ? 'Saturada' : mode === 'accesibilidad' ? 'Accesible' : 'Bien conectada',
                      color: mode === 'concentracion' ? '#EF4444' : '#10B981' },
                    { name: 'Área litoral / periférica',
                      status: mode === 'concentracion' ? 'Alta demanda' : mode === 'accesibilidad' ? 'Parcial' : 'Mejora pendiente',
                      color: '#F59E0B' },
                    { name: 'Zona rural / interior',
                      status: mode === 'concentracion' ? 'Infrautilizada' : mode === 'accesibilidad' ? 'Baja accesib.' : 'Sin cobertura',
                      color: mode === 'concentracion' ? '#10B981' : '#EF4444' },
                  ].map(z => (
                    <Box key={z.name} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      py: 0.8, borderBottom: '1px solid #EDE8E3',
                    }}>
                      <Typography sx={{ fontSize: '0.68rem', color: '#475569', flex: 1, mr: 1, lineHeight: 1.3 }}>
                        {z.name}
                      </Typography>
                      <Box sx={{
                        px: 0.8, py: 0.25, borderRadius: '20px', flexShrink: 0,
                        background: `${z.color}15`, border: `1px solid ${z.color}40`,
                      }}>
                        <Typography sx={{ fontSize: '0.58rem', color: z.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {z.status}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #EDE8E3' }}>
                  <Typography sx={{ fontSize: '0.58rem', color: '#B0A89E', lineHeight: 1.6 }}>
                    Fuente: OpenStreetMap · Datos sintéticos<br />
                    TUI Care Foundation · Reto 4
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
