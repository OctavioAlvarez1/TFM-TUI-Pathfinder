import { Box, Typography, Chip } from '@mui/material'
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet'
import { motion } from 'framer-motion'
import { recommendations } from '../data/mockData'
import 'leaflet/dist/leaflet.css'

const PRIORITY_COLOR: Record<string, string> = {
  Alta:  '#EF4444',
  Media: '#F59E0B',
  Baja:  '#10B981',
}
const COST_COLOR: Record<string, string> = {
  Bajo:  '#10B981',
  Medio: '#F59E0B',
  Alto:  '#EF4444',
}

export default function RecommendationCards() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#F1F5F9' }}>Recomendaciones IA</Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>Oportunidades identificadas por el análisis</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5 }}>
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.num}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Box sx={{
              background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
              border: '1px solid rgba(129,140,248,0.15)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, #818CF8, #0DD3C5, #F97316)',
              },
            }}>
              {/* Mini map */}
              <Box sx={{ height: 90, position: 'relative' }}>
                <MapContainer
                  center={[(rec.lat + rec.lat2) / 2, (rec.lon + rec.lon2) / 2]}
                  zoom={13}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  keyboard={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <CircleMarker center={[rec.lat, rec.lon]} radius={5} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 1 }} />
                  <CircleMarker center={[rec.lat2, rec.lon2]} radius={5} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 1 }} />
                  <Polyline positions={[[rec.lat, rec.lon], [rec.lat2, rec.lon2]]} pathOptions={{ color: '#818CF8', weight: 2, dashArray: '6 3' }} />
                </MapContainer>
                <Box sx={{
                  position: 'absolute', top: 6, left: 6, zIndex: 1000,
                  background: 'rgba(11,18,32,0.85)', borderRadius: '4px', px: 0.8, py: 0.2,
                }}>
                  <Typography sx={{ fontSize: '0.6rem', color: '#818CF8', fontWeight: 700 }}>
                    Oportunidad #{rec.num}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9', mb: 0.5, lineHeight: 1.2 }}>
                  {rec.title}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748B', mb: 0.8, lineHeight: 1.4 }}>
                  {rec.description}
                </Typography>

                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 0.8, py: 0.25, borderRadius: '6px',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  mb: 1,
                }}>
                  <Typography sx={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>
                    Impacto {rec.impactPct}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 0.8 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.58rem', color: '#475569' }}>Costo</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: COST_COLOR[rec.cost], fontWeight: 600 }}>{rec.cost}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.58rem', color: '#475569' }}>Prioridad</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: PRIORITY_COLOR[rec.priority], fontWeight: 600 }}>{rec.priority}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    px: 1, py: 0.4, borderRadius: '6px',
                    background: 'rgba(129,140,248,0.10)',
                    border: '1px solid rgba(129,140,248,0.20)',
                    cursor: 'pointer',
                    '&:hover': { background: 'rgba(129,140,248,0.18)' },
                  }}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#818CF8', fontWeight: 600 }}>Ver detalle →</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  )
}
