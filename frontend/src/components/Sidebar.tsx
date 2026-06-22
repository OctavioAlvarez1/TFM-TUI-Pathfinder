import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Chip, Divider } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MapIcon from '@mui/icons-material/Map'
import AccessibleIcon from '@mui/icons-material/Accessible'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RouteIcon from '@mui/icons-material/Route'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SettingsIcon from '@mui/icons-material/Settings'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const navItems = [
  { label: 'Dashboard',            icon: <DashboardIcon    fontSize="small" />, active: true  },
  { label: 'Mapa Interactivo',     icon: <MapIcon          fontSize="small" />, active: false },
  { label: 'Accesibilidad',        icon: <AccessibleIcon   fontSize="small" />, active: false },
  { label: 'Movilidad Sostenible', icon: <DirectionsBikeIcon fontSize="small" />, active: false },
  { label: 'Recomendaciones IA',   icon: <AutoAwesomeIcon  fontSize="small" />, active: false },
  { label: 'Rutas',                icon: <RouteIcon        fontSize="small" />, active: false },
  { label: 'Análisis',             icon: <AnalyticsIcon    fontSize="small" />, active: false },
  { label: 'Reportes',             icon: <AssessmentIcon   fontSize="small" />, active: false },
  { label: 'Configuración',        icon: <SettingsIcon     fontSize="small" />, active: false },
]

export default function Sidebar() {
  return (
    <Box sx={{
      width: 220,
      flexShrink: 0,
      height: '100%',
      background: 'linear-gradient(180deg, #0D1627 0%, #0A1120 100%)',
      borderRight: '1px solid rgba(129,140,248,0.10)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <Box sx={{ p: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #818CF8, #0DD3C5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>🧭</Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#F1F5F9', lineHeight: 1.1 }}>TourFlow AI</Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>Smart Tourism Mobility</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(129,140,248,0.08)', mx: 1.5 }} />

      {/* Nav */}
      <List dense sx={{ px: 1, py: 1.5, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{
              borderRadius: '8px',
              mb: 0.25,
              py: 0.8,
              px: 1.2,
              background: item.active
                ? 'linear-gradient(135deg, rgba(129,140,248,0.18), rgba(13,211,197,0.08))'
                : 'transparent',
              border: item.active ? '1px solid rgba(129,140,248,0.25)' : '1px solid transparent',
              '&:hover': { background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.15)' },
            }}
          >
            <ListItemIcon sx={{
              minWidth: 30,
              color: item.active ? '#818CF8' : '#475569',
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.78rem',
                fontWeight: item.active ? 600 : 400,
                color: item.active ? '#F1F5F9' : '#64748B',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(129,140,248,0.08)', mx: 1.5 }} />

      {/* Destino actual */}
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', mb: 1 }}>
          Destino actual
        </Typography>
        <Box sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(129,140,248,0.15)',
          background: 'linear-gradient(135deg, rgba(5,62,78,0.6), rgba(3,30,50,0.9))',
        }}>
          <Box sx={{
            height: 72,
            background: 'linear-gradient(135deg, rgba(129,140,248,0.3) 0%, rgba(13,211,197,0.2) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>🏖️</Box>
          <Box sx={{ p: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 12, color: '#818CF8' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9' }}>Valencia, España</Typography>
            </Box>
            <Chip
              label="Cambiar destino"
              size="small"
              sx={{
                height: 20, fontSize: '0.62rem', color: '#0DD3C5',
                background: 'rgba(13,211,197,0.1)', border: '1px solid rgba(13,211,197,0.2)',
                cursor: 'pointer',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
