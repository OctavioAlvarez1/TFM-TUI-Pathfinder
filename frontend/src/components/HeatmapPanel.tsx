import { useState } from 'react'
import { Box, Typography, Tabs, Tab } from '@mui/material'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { pois, VALENCIA_CENTER } from '../data/mockData'
import 'leaflet/dist/leaflet.css'

const TABS = ['Accesibilidad', 'Movilidad', 'Transporte', 'Tiempo de acceso']

const SCORE_MAP = {
  'Accesibilidad':     (p: typeof pois[0]) => p.accesibilidad,
  'Movilidad':         (p: typeof pois[0]) => p.movilidad,
  'Transporte':        (p: typeof pois[0]) => p.transporte,
  'Tiempo de acceso':  (p: typeof pois[0]) => 100 - Math.min(parseInt(p.tiempoCentro), 30) * 3,
}

function heatColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#84CC16'
  if (score >= 45) return '#EAB308'
  if (score >= 30) return '#F97316'
  return '#EF4444'
}

export default function HeatmapPanel() {
  const [tab, setTab] = useState(0)
  const activeTab = TABS[tab]
  const scoreFunc = SCORE_MAP[activeTab as keyof typeof SCORE_MAP]

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
      <Box sx={{ px: 1.5, pt: 1.2, pb: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9', mb: 0.8 }}>
          Mapa de Calor — Accesibilidad
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: 28,
            '& .MuiTabs-indicator': { background: '#818CF8', height: 2 },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t}
              label={t}
              sx={{
                minHeight: 28,
                py: 0,
                fontSize: '0.62rem',
                textTransform: 'none',
                color: '#475569',
                '&.Mui-selected': { color: '#818CF8' },
                minWidth: 'unset',
                px: 1,
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer
          center={VALENCIA_CENTER}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {pois.map(poi => {
            const score = scoreFunc(poi)
            return (
              <CircleMarker
                key={poi.id}
                center={[poi.lat, poi.lon]}
                radius={16 + score * 0.1}
                pathOptions={{
                  color: 'none',
                  fillColor: heatColor(score),
                  fillOpacity: 0.45,
                }}
              />
            )
          })}
        </MapContainer>

        {/* Legend */}
        <Box sx={{
          position: 'absolute', right: 8, top: 8, zIndex: 1000,
          background: 'rgba(11,18,32,0.90)',
          border: '1px solid rgba(129,140,248,0.15)',
          borderRadius: '8px',
          p: '6px 8px',
          backdropFilter: 'blur(8px)',
        }}>
          <Typography sx={{ fontSize: '0.58rem', color: '#475569', mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Índice de accesibilidad
          </Typography>
          {[
            { label: '80–100', color: '#10B981' },
            { label: '60–80',  color: '#84CC16' },
            { label: '40–60',  color: '#EAB308' },
            { label: '20–40',  color: '#F97316' },
            { label: '0–20',   color: '#EF4444' },
          ].map(l => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
              <Box sx={{ width: 10, height: 6, borderRadius: '2px', background: l.color }} />
              <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8' }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
