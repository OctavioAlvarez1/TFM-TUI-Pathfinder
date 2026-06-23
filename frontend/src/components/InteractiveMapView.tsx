import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { MapContainer, TileLayer, Circle, Polyline, useMap } from 'react-leaflet'
import { useDestination } from '../context/DestinationContext'
import { fetchCyclePaths } from '../api/overpass'
import type { CyclePath } from '../api/overpass'
import 'leaflet/dist/leaflet.css'

type Mode = 'concentracion' | 'accesibilidad' | 'movilidad'

interface HeatZone {
  lat: number
  lon: number
  intensity: number
  radius: number
}

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

function generateZones(lat: number, lon: number, destId: string, mode: Mode): HeatZone[] {
  const rng = mkRng(destId + mode)
  const zones: HeatZone[] = []

  // Hotspots — near center
  for (let i = 0; i < 4; i++) {
    const angle = rng() * Math.PI * 2
    const dist = 0.007 + rng() * 0.014
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity: 0.65 + rng() * 0.35, radius: 700 + rng() * 400 })
  }

  // Medium zones
  for (let i = 0; i < 3; i++) {
    const angle = rng() * Math.PI * 2
    const dist = 0.022 + rng() * 0.018
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity: 0.35 + rng() * 0.28, radius: 550 + rng() * 250 })
  }

  // Underutilized — periphery
  for (let i = 0; i < 5; i++) {
    const angle = rng() * Math.PI * 2
    const dist = 0.038 + rng() * 0.038
    zones.push({ lat: lat + Math.sin(angle) * dist, lon: lon + Math.cos(angle) * dist,
      intensity: rng() * 0.28, radius: 500 + rng() * 300 })
  }

  return zones
}

const MODE_META: Record<Mode, {
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

function zoneColor(mode: Mode, intensity: number): string {
  const m = MODE_META[mode]
  if (intensity >= 0.6) return m.highColor
  if (intensity >= 0.33) return m.midColor
  return m.lowColor
}

function generateStats(destId: string) {
  const rng = mkRng(destId + 'stats-v2')
  return {
    saturacion:     Math.round(42 + rng() * 52),
    zonasCriticas:  Math.round(2  + rng() * 6),
    zonasVacias:    Math.round(4  + rng() * 8),
    capacidad:      Math.round(28 + rng() * 48),
    transporte:     Math.round(38 + rng() * 55),
    ciclismo:       Math.round(12 + rng() * 62),
    accesibilidad:  Math.round(33 + rng() * 60),
    movilidad:      Math.round(22 + rng() * 65),
    emisiones:      Math.round(4  + rng() * 18),
    paradast:       Math.round(18 + rng() * 45),
  }
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center, zoom, map])
  return null
}

function MetricCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <Box sx={{
      p: 1.2, borderRadius: '10px', border: '1px solid #E0D8CF',
      background: `linear-gradient(135deg, ${color}0A, #fff)`,
    }}>
      <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', lineHeight: 1, mb: 0.4 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: '0.62rem', fontWeight: 400, color: '#94A3B8', marginLeft: 2 }}>{unit}</span>
      </Typography>
    </Box>
  )
}

export default function InteractiveMapView() {
  const { destination } = useDestination()
  const [mode, setMode] = useState<Mode>('concentracion')
  const [livePaths, setLivePaths] = useState<CyclePath[]>([])

  const zones = useMemo(
    () => generateZones(destination.lat, destination.lon, destination.id, mode),
    [destination.id, destination.lat, destination.lon, mode],
  )

  const stats = useMemo(() => generateStats(destination.id), [destination.id])

  useEffect(() => {
    fetchCyclePaths(destination.lat, destination.lon, destination.id, destination.bboxDelta)
      .then(setLivePaths)
      .catch(() => setLivePaths([]))
  }, [destination])

  const mapCenter: [number, number] = [destination.lat, destination.lon]
  const cfg = MODE_META[mode]

  const modeMetrics = mode === 'concentracion'
    ? [
        { label: 'Zonas críticas',   value: stats.zonasCriticas, unit: '',  color: '#EF4444' },
        { label: 'Capacidad libre',  value: stats.capacidad,     unit: '%', color: '#10B981' },
        { label: 'Zonas vacías',     value: stats.zonasVacias,   unit: '',  color: '#2D6A4F' },
        { label: 'Sat. litoral',     value: Math.min(100, stats.saturacion + 11), unit: '%', color: '#C05928' },
      ]
    : mode === 'accesibilidad'
    ? [
        { label: 'Cobertura transp.', value: stats.transporte,  unit: '%', color: '#2E7D98' },
        { label: 'Nodos accesibles',  value: Math.round(28 + stats.accesibilidad * 0.9), unit: '', color: '#2D6A4F' },
        { label: 'Barreras',          value: Math.max(2, Math.round(14 - stats.accesibilidad * 0.11)), unit: '', color: '#EF4444' },
        { label: 'Cobertura peat.',   value: Math.min(98, stats.accesibilidad + 9), unit: '%', color: '#1A3C5E' },
      ]
    : [
        { label: 'Red ciclista',   value: stats.ciclismo,                      unit: 'km', color: '#2D6A4F' },
        { label: 'Paradas transp.',value: stats.paradast,                       unit: '',   color: '#2E7D98' },
        { label: 'Cobertura EV',   value: Math.round(stats.movilidad * 0.38),  unit: '%',  color: '#1A3C5E' },
        { label: 'Emisiones evit.',value: stats.emisiones,                      unit: 't',  color: '#10B981' },
      ]

  const primaryValue = mode === 'concentracion' ? stats.saturacion
    : mode === 'accesibilidad' ? stats.accesibilidad
    : stats.movilidad

  const primaryLabel = mode === 'concentracion' ? 'Índice de saturación'
    : mode === 'accesibilidad' ? 'Índice de accesibilidad'
    : 'Cobertura movilidad'

  const primaryGradient = mode === 'concentracion'
    ? 'linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%)'
    : mode === 'accesibilidad'
    ? 'linear-gradient(90deg, #EF4444 0%, #2E7D98 50%, #2D6A4F 100%)'
    : 'linear-gradient(90deg, #C05928 0%, #2E7D98 50%, #1A3C5E 100%)'

  const zoneRows = [
    { name: `Centro · ${destination.name}`,
      status: mode === 'concentracion' ? 'Saturada' : mode === 'accesibilidad' ? 'Accesible' : 'Bien conectada',
      color:  mode === 'concentracion' ? '#EF4444' : '#10B981' },
    { name: 'Área litoral / periférica',
      status: mode === 'concentracion' ? 'Alta demanda' : mode === 'accesibilidad' ? 'Parcial' : 'Mejora pendiente',
      color: '#F59E0B' },
    { name: 'Zona rural / interior',
      status: mode === 'concentracion' ? 'Infrautilizada' : mode === 'accesibilidad' ? 'Baja accesib.' : 'Sin cobertura',
      color:  mode === 'concentracion' ? '#10B981' : '#EF4444' },
  ]

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

        {/* Mode toggles */}
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {(['concentracion', 'accesibilidad', 'movilidad'] as Mode[]).map(m => (
            <Box key={m} onClick={() => setMode(m)} sx={{
              px: 1.4, py: 0.5, borderRadius: '8px', cursor: 'pointer',
              background: mode === m ? '#1A3C5E' : 'transparent',
              border: `1px solid ${mode === m ? '#1A3C5E' : '#E0D8CF'}`,
              transition: 'all 0.15s',
              '&:hover': { background: mode === m ? '#1A3C5E' : '#F8F4F0' },
            }}>
              <Typography sx={{
                fontSize: '0.72rem', fontWeight: mode === m ? 600 : 400,
                color: mode === m ? '#fff' : '#64748B',
                userSelect: 'none',
              }}>
                {m === 'concentracion' ? 'Concentración' : m === 'accesibilidad' ? 'Accesibilidad' : 'Movilidad'}
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

            {/* Heat zones — 3 concentric circles per zone */}
            {zones.map((zone, i) => {
              const color = zoneColor(mode, zone.intensity)
              return (
                <Circle key={`${i}-a`} center={[zone.lat, zone.lon]} radius={zone.radius}
                  pathOptions={{ fillColor: color, fillOpacity: 0.09, stroke: false }} />
              )
            })}
            {zones.map((zone, i) => {
              const color = zoneColor(mode, zone.intensity)
              return (
                <Circle key={`${i}-b`} center={[zone.lat, zone.lon]} radius={zone.radius * 0.58}
                  pathOptions={{ fillColor: color, fillOpacity: 0.16, stroke: false }} />
              )
            })}
            {zones.map((zone, i) => {
              const color = zoneColor(mode, zone.intensity)
              return (
                <Circle key={`${i}-c`} center={[zone.lat, zone.lon]} radius={zone.radius * 0.28}
                  pathOptions={{ fillColor: color, fillOpacity: 0.28, stroke: false }} />
              )
            })}

            {/* Ciclovías — visible in movilidad mode */}
            {mode === 'movilidad' && livePaths.map(path => (
              <Polyline key={path.id} positions={path.coords}
                pathOptions={{ color: '#2D6A4F', weight: 2.5, opacity: 0.75 }} />
            ))}
          </MapContainer>

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
                transition: 'background 0.15s',
                '&:hover': { background: '#FDF6F0' },
              }}>{lbl}</Box>
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
            border: '1px solid #E0D8CF', borderRadius: '12px',
            px: 1.5, py: 1, boxShadow: '0 4px 16px rgba(26,60,94,0.10)',
          }}>
            <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8', mb: 0.7,
                               textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {cfg.label}
            </Typography>
            {[
              { label: cfg.highLabel, color: cfg.highColor },
              { label: 'Moderado',    color: cfg.midColor  },
              { label: cfg.lowLabel,  color: cfg.lowColor  },
            ].map(l => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.35 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Attribution */}
          <Box sx={{
            position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
            background: 'rgba(255,255,255,0.82)', borderRadius: '6px',
            px: 0.8, py: 0.3,
          }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#94A3B8' }}>
              © OpenStreetMap · CARTO
            </Typography>
          </Box>
        </Box>

        {/* Stats Panel */}
        <Box sx={{
          width: 256, flexShrink: 0,
          background: '#fff', borderLeft: '1px solid #E0D8CF',
          overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.8,
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-thumb': { background: '#E0D8CF', borderRadius: 4 },
        }}>

          {/* Destination header */}
          <Box>
            <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase',
                               letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 600, mb: 0.4 }}>
              Análisis del destino
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A3C5E', lineHeight: 1.2 }}>
              {destination.name}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>{destination.region}</Typography>
          </Box>

          {/* Primary KPI */}
          <Box sx={{
            p: 1.5, borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(26,60,94,0.05), #fff)',
            border: '1px solid #E0D8CF', borderTop: '3px solid #C05928',
          }}>
            <Typography sx={{ fontSize: '0.67rem', color: '#64748B', mb: 0.5 }}>{primaryLabel}</Typography>
            <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#1A3C5E', lineHeight: 1 }}>
              {primaryValue}
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94A3B8' }}>/100</span>
            </Typography>
            <LinearProgress variant="determinate" value={primaryValue} sx={{
              mt: 0.8, height: 5, borderRadius: 3,
              backgroundColor: '#E0D8CF',
              '& .MuiLinearProgress-bar': { background: primaryGradient, borderRadius: 3 },
            }} />
          </Box>

          {/* 2×2 metrics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.9 }}>
            {modeMetrics.map(m => (
              <MetricCard key={m.label} label={m.label} value={m.value} unit={m.unit} color={m.color} />
            ))}
          </Box>

          {/* Zone status list */}
          <Box>
            <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                               color: '#94A3B8', fontWeight: 600, mb: 0.8 }}>
              {mode === 'concentracion' ? 'Zonas de atención'
                : mode === 'accesibilidad' ? 'Brechas detectadas'
                : 'Oportunidades de mejora'}
            </Typography>
            {zoneRows.map(z => (
              <Box key={z.name} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                py: 0.75, borderBottom: '1px solid #F1EDE7',
              }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#475569', flex: 1, mr: 1, lineHeight: 1.3 }}>
                  {z.name}
                </Typography>
                <Box sx={{
                  px: 0.8, py: 0.25, borderRadius: '20px',
                  background: `${z.color}15`, border: `1px solid ${z.color}40`, flexShrink: 0,
                }}>
                  <Typography sx={{ fontSize: '0.58rem', color: z.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {z.status}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #E0D8CF' }}>
            <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Fuente: OpenStreetMap · Datos sintéticos<br />
              TUI Care Foundation · Reto 4
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
