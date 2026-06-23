import { useState } from 'react'
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, Menu, MenuItem } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MapIcon from '@mui/icons-material/Map'
import AccessibleIcon from '@mui/icons-material/Accessible'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import RouteIcon from '@mui/icons-material/Route'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SettingsIcon from '@mui/icons-material/Settings'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useDestination } from '../context/DestinationContext'
import { SPANISH_DESTINATIONS } from '../data/destinations'

const navItems = [
  { label: 'Inicio',               icon: <DashboardIcon      sx={{ fontSize: 18 }} />, active: true  },
  { label: 'Mapa interactivo',     icon: <MapIcon            sx={{ fontSize: 18 }} />, active: false },
  { label: 'Accesibilidad',        icon: <AccessibleIcon     sx={{ fontSize: 18 }} />, active: false },
  { label: 'Movilidad sostenible', icon: <DirectionsBikeIcon sx={{ fontSize: 18 }} />, active: false },
  { label: 'Rutas turísticas',     icon: <RouteIcon          sx={{ fontSize: 18 }} />, active: false },
  { label: 'Recomendaciones IA',   icon: <AutoAwesomeIcon    sx={{ fontSize: 18 }} />, active: false },
  { label: 'Análisis',             icon: <AnalyticsIcon      sx={{ fontSize: 18 }} />, active: false },
  { label: 'Informes',             icon: <AssessmentIcon     sx={{ fontSize: 18 }} />, active: false },
  { label: 'Configuración',        icon: <SettingsIcon       sx={{ fontSize: 18 }} />, active: false },
]

export default function Sidebar() {
  const { destination, setDestination } = useDestination()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  return (
    <Box sx={{
      width: 200,
      flexShrink: 0,
      height: '100%',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <Box sx={{ p: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '9px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '17px', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
        }}>🧭</Box>
        <Box>
          <Typography style={{ fontWeight: 800, fontSize: '0.85rem', color: '#F8FAFC', lineHeight: 1.1 }}>
            TourFlow AI
          </Typography>
          <Typography style={{ fontSize: '0.6rem', color: '#64748B' }}>
            Smart Tourism Mobility
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List dense sx={{ px: 1, py: 0.5, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{
              borderRadius: '8px',
              mb: 0.15,
              py: 0.7,
              px: 1,
              background: item.active ? 'rgba(129,140,248,0.18)' : 'transparent',
              borderLeft: item.active ? '3px solid #818CF8' : '3px solid transparent',
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Box style={{ color: item.active ? '#818CF8' : '#94A3B8', display: 'flex' }}>
                {item.icon}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <span style={{
                  fontSize: '0.76rem',
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? '#F1F5F9' : '#94A3B8',
                }}>
                  {item.label}
                </span>
              }
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 1 }} />

      {/* Destino card */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          height: 130,
          background: `
            linear-gradient(to bottom, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.72) 100%),
            linear-gradient(135deg, #0E7490 0%, #0891B2 30%, #164E63 60%, #083344 100%)
          `,
          position: 'relative',
        }}>
          <Box sx={{
            position: 'absolute', bottom: 28, left: 0, right: 0,
            height: 44, opacity: 0.22,
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 44'%3E%3Cpath d='M0,44 L0,30 L10,30 L10,18 L14,18 L14,30 L20,30 L20,22 L24,22 L24,14 L28,14 L28,22 L34,22 L34,30 L40,30 L40,26 L44,26 L44,30 L50,30 L50,18 L55,18 L55,8 L60,8 L60,18 L65,18 L65,30 L72,30 L72,24 L78,24 L78,30 L85,30 L85,16 L90,16 L90,6 L94,6 L94,16 L98,16 L98,30 L106,30 L106,20 L112,20 L112,30 L120,30 L120,26 L128,26 L128,30 L135,30 L135,22 L140,22 L140,16 L145,16 L145,22 L150,22 L150,30 L158,30 L158,18 L162,18 L162,30 L170,30 L170,26 L176,26 L176,30 L184,30 L184,22 L190,22 L190,30 L200,30 L200,44 Z' fill='%23F1F5F9'/%3E%3C%2Fsvg%3E")`,
            backgroundSize: 'cover',
          }} />
        </Box>

        <Box sx={{ background: '#0F172A', px: 1.5, pb: 1.5, pt: 0 }}>
          <Box sx={{ mt: '-28px', mb: 1 }}>
            <Typography style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              Destino actual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC' }}>{destination.label}</Typography>
              <Typography style={{ fontSize: '0.82rem' }}>🇪🇸</Typography>
            </Box>
          </Box>
          <Box
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 1, py: 0.5, borderRadius: '7px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              '&:hover': { background: 'rgba(255,255,255,0.08)' },
            }}
          >
            <Typography style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Cambiar destino</Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#64748B' }} />
          </Box>
        </Box>
      </Box>

      {/* Destination dropdown menu */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              background: '#1E293B',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              borderRadius: '10px',
              maxHeight: 360,
              width: 220,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.15)', borderRadius: 4 },
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        {SPANISH_DESTINATIONS.map(dest => (
          <MenuItem
            key={dest.id}
            selected={dest.id === destination.id}
            onClick={() => {
              setDestination(dest)
              setMenuAnchor(null)
            }}
            sx={{
              py: 0.8,
              px: 1.5,
              borderRadius: '6px',
              mx: 0.5,
              my: 0.15,
              '&.Mui-selected': { background: 'rgba(129,140,248,0.22)' },
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <Box>
              <Typography style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9' }}>
                {dest.name}
              </Typography>
              <Typography style={{ fontSize: '0.65rem', color: '#64748B' }}>
                {dest.region}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
