import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Box, Typography, Chip, IconButton, Divider, LinearProgress } from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'
import CloseIcon from '@mui/icons-material/Close'
// pois and VALENCIA_CENTER were removed from mockData — use local constants
interface POI {
  id: number
  name: string
  type: 'hotel' | 'monument' | 'transport' | 'restaurant' | 'beach' | 'bike'
  lat: number
  lon: number
  accesibilidad: number
  transporte: number
  movilidad: number
  distanciaMetro: string
  tiempoCentro: string
}
const VALENCIA_CENTER: [number, number] = [39.470, -0.376]
const pois: POI[] = []
import 'leaflet/dist/leaflet.css'

const LAYER_CONFIG = [
  { label: 'Alojamientos',       icon: '🏨', active: true,  color: '#0DD3C5' },
  { label: 'Recursos turísticos',icon: '🏛️', active: true,  color: '#F97316' },
  { label: 'Restaurantes',       icon: '🍽️', active: false, color: '#EAB308' },
  { label: 'Playas',             icon: '🏖️', active: true,  color: '#22D3EE' },
  { label: 'Transporte público', icon: '🚌', active: true,  color: '#818CF8' },
  { label: 'Ciclovías',          icon: '🚲', active: true,  color: '#10B981' },
  { label: 'Senderos',           icon: '🥾', active: false, color: '#94A3B8' },
  { label: 'Estaciones Bici',    icon: '🚴', active: true,  color: '#0DD3C5' },
  { label: 'Puntos de interés',  icon: '📍', active: true,  color: '#F97316' },
  { label: 'Accesibilidad',      icon: '♿', active: true,  color: '#818CF8' },
  { label: 'Zonas problemáticas',icon: '⚠️', active: false, color: '#EF4444' },
]

const POI_COLORS: Record<POI['type'], string> = {
  hotel:     '#0DD3C5',
  monument:  '#F97316',
  transport: '#818CF8',
  restaurant:'#EAB308',
  beach:     '#22D3EE',
  bike:      '#10B981',
}

function accColor(score: number) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#0DD3C5'
  if (score >= 40) return '#EAB308'
  return '#EF4444'
}

function POIPopupContent({ poi }: { poi: POI }) {
  return (
    <Box sx={{ width: 220, p: 0 }}>
      <Box sx={{
        height: 80,
        background: 'linear-gradient(135deg, rgba(129,140,248,0.3), rgba(13,211,197,0.2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
      }}>
        {{ hotel:'🏨', monument:'🏛️', transport:'🚇', restaurant:'🍽️', beach:'🏖️', bike:'🚴' }[poi.type]}
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#F1F5F9', mb: 1 }}>{poi.name}</Typography>
        {[
          { label: 'Accesibilidad',       value: poi.accesibilidad },
          { label: 'Transporte',          value: poi.transporte },
          { label: 'Movilidad Sostenible',value: poi.movilidad },
        ].map(r => (
          <Box key={r.label} sx={{ mb: 0.8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>{r.label}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: accColor(r.value), fontWeight: 600 }}>{r.value}/100</Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={r.value}
              sx={{
                height: 3, borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${accColor(r.value)}, ${accColor(r.value)}88)`,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        ))}
        <Divider sx={{ my: 0.8, borderColor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.62rem', color: '#475569' }}>Dist. metro</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#818CF8', fontWeight: 600 }}>{poi.distanciaMetro}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.62rem', color: '#475569' }}>Tiempo centro</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#0DD3C5', fontWeight: 600 }}>{poi.tiempoCentro}</Typography>
          </Box>
        </Box>
        <Box sx={{
          mt: 1, py: 0.7, textAlign: 'center', borderRadius: '6px',
          background: 'rgba(129,140,248,0.12)',
          border: '1px solid rgba(129,140,248,0.2)',
          cursor: 'pointer',
        }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#818CF8', fontWeight: 600 }}>Ver detalles →</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default function MainMap() {
  const [layerPanelOpen, setLayerPanelOpen] = useState(false)
  const [layers, setLayers] = useState(LAYER_CONFIG)

  const toggleLayer = (label: string) =>
    setLayers(prev => prev.map(l => l.label === label ? { ...l, active: !l.active } : l))

  return (
    <Box sx={{ position: 'relative', flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(129,140,248,0.15)' }}>
      <MapContainer
        center={VALENCIA_CENTER}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© CartoDB'
        />
        {pois.map(poi => (
          <CircleMarker
            key={poi.id}
            center={[poi.lat, poi.lon]}
            radius={8 + poi.accesibilidad * 0.05}
            pathOptions={{
              color: POI_COLORS[poi.type],
              fillColor: accColor(poi.accesibilidad),
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup minWidth={220} maxWidth={220}>
              <POIPopupContent poi={poi} />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Layer toggle button */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <IconButton
          size="small"
          onClick={() => setLayerPanelOpen(o => !o)}
          sx={{
            background: 'rgba(11,18,32,0.92)',
            border: '1px solid rgba(129,140,248,0.25)',
            color: '#818CF8',
            '&:hover': { background: 'rgba(129,140,248,0.15)' },
          }}
        >
          <LayersIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Layer panel */}
      {layerPanelOpen && (
        <Box sx={{
          position: 'absolute', top: 46, right: 10, zIndex: 1000,
          width: 200,
          background: 'rgba(11,18,32,0.96)',
          border: '1px solid rgba(129,140,248,0.20)',
          borderRadius: '10px',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9' }}>Capas del mapa</Typography>
            <IconButton size="small" onClick={() => setLayerPanelOpen(false)} sx={{ color: '#475569', p: 0.3 }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Box sx={{ p: 0.5, maxHeight: 300, overflowY: 'auto' }}>
            {layers.map(l => (
              <Box
                key={l.label}
                onClick={() => toggleLayer(l.label)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1, py: 0.6, borderRadius: '6px', cursor: 'pointer',
                  '&:hover': { background: 'rgba(129,140,248,0.06)' },
                }}
              >
                <Box sx={{
                  width: 14, height: 14, borderRadius: '3px',
                  border: `2px solid ${l.color}`,
                  background: l.active ? l.color : 'transparent',
                  flexShrink: 0, transition: 'all 0.15s',
                }} />
                <Typography sx={{ fontSize: '0.7rem', color: l.active ? '#F1F5F9' : '#475569' }}>
                  {l.icon} {l.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Map legend */}
      <Box sx={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
        background: 'rgba(11,18,32,0.92)',
        border: '1px solid rgba(129,140,248,0.18)',
        borderRadius: '8px',
        px: 1.2, py: 0.8,
        backdropFilter: 'blur(8px)',
      }}>
        <Typography sx={{ fontSize: '0.6rem', color: '#475569', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Accesibilidad
        </Typography>
        {[
          { label: '80–100 Muy alto', color: '#10B981' },
          { label: '60–80 Alto',      color: '#0DD3C5' },
          { label: '40–60 Medio',     color: '#EAB308' },
          { label: '20–40 Bajo',      color: '#F97316' },
          { label: '0–20  Muy bajo',  color: '#EF4444' },
        ].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
