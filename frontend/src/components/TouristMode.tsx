import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { motion } from 'framer-motion'
import { touristProfiles } from '../data/mockData'
// pois and VALENCIA_CENTER were removed from mockData — use local constants
const VALENCIA_CENTER: [number, number] = [39.470, -0.376]
const pois: { id: number; lat: number; lon: number; accesibilidad: number }[] = []
import 'leaflet/dist/leaflet.css'

const PROFILE_COLORS: Record<string, string> = {
  familia:       '#0DD3C5',
  mochilero:     '#818CF8',
  mayor:         '#F97316',
  movilidad_red: '#10B981',
}

export default function TouristMode() {
  const [active, setActive] = useState('movilidad_red')
  const profile = touristProfiles.find(p => p.id === active)!

  return (
    <Box sx={{
      background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
      border: '1px solid rgba(129,140,248,0.15)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9', mb: 0.5 }}>
          Modo Turista
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: '#475569', mb: 1 }}>
          Selecciona el perfil para personalizar el análisis
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8, mb: 1 }}>
          {touristProfiles.map(p => (
            <motion.div key={p.id} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
              <Box
                onClick={() => setActive(p.id)}
                sx={{
                  textAlign: 'center', py: 0.8, px: 0.5, borderRadius: '8px', cursor: 'pointer',
                  background: active === p.id
                    ? `linear-gradient(135deg, ${PROFILE_COLORS[p.id]}22, ${PROFILE_COLORS[p.id]}11)`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active === p.id ? PROFILE_COLORS[p.id] + '55' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.2s',
                }}>
                <Typography sx={{ fontSize: '1.2rem', lineHeight: 1, mb: 0.2 }}>{p.icon}</Typography>
                <Typography sx={{
                  fontSize: '0.6rem', lineHeight: 1.2,
                  color: active === p.id ? PROFILE_COLORS[p.id] : '#475569',
                  fontWeight: active === p.id ? 600 : 400,
                }}>{p.label}</Typography>
              </Box>
            </motion.div>
          ))}
        </Box>

        <Box sx={{
          background: `${PROFILE_COLORS[active]}10`,
          border: `1px solid ${PROFILE_COLORS[active]}25`,
          borderRadius: '8px', p: 0.8, mb: 1,
        }}>
          <Typography sx={{ fontSize: '0.65rem', color: PROFILE_COLORS[active], fontWeight: 600, mb: 0.4 }}>
            Análisis para: {profile.label}
          </Typography>
          {profile.filters.map(f => (
            <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: PROFILE_COLORS[active] }} />
              <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>{f}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 140 }}>
        <MapContainer
          center={VALENCIA_CENTER}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {pois.map(poi => (
            <CircleMarker
              key={poi.id}
              center={[poi.lat, poi.lon]}
              radius={7}
              pathOptions={{
                color: PROFILE_COLORS[active],
                fillColor: PROFILE_COLORS[active],
                fillOpacity: poi.accesibilidad >= 70 ? 0.9 : 0.3,
                weight: 1.5,
              }}
            />
          ))}
        </MapContainer>

        <Box sx={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 1000,
          background: `${PROFILE_COLORS[active]}cc`,
          borderRadius: '6px', px: 1, py: 0.4,
        }}>
          <Typography sx={{ fontSize: '0.62rem', color: '#0B1220', fontWeight: 700 }}>Aplicar filtros</Typography>
        </Box>
      </Box>
    </Box>
  )
}
