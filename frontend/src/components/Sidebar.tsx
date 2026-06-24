import { useState } from 'react'
import { Box, Typography, Menu, MenuItem, Divider } from '@mui/material'
import { useDestinationPhoto, CARD_QUERIES } from '../hooks/useDestinationPhoto'
import DashboardIcon         from '@mui/icons-material/Dashboard'
import MapIcon               from '@mui/icons-material/Map'
import AccessibleIcon        from '@mui/icons-material/Accessible'
import DirectionsBikeIcon    from '@mui/icons-material/DirectionsBike'
import RouteIcon             from '@mui/icons-material/Route'
import AutoAwesomeIcon       from '@mui/icons-material/AutoAwesome'
import AnalyticsIcon         from '@mui/icons-material/Analytics'
import AssessmentIcon        from '@mui/icons-material/Assessment'
import SettingsIcon          from '@mui/icons-material/Settings'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LocationOnIcon        from '@mui/icons-material/LocationOn'
import { useDestination }    from '../context/DestinationContext'
import { SPANISH_DESTINATIONS } from '../data/destinations'

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function TourFlowLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tf-bg" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="tf-shine" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="38" height="38" rx="10" fill="url(#tf-bg)" />
      <rect width="38" height="38" rx="10" fill="url(#tf-shine)" />
      <path d="M6 30 C8 26 11 24 14 23 C17 22 16 20 19 19"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="30" r="2" fill="rgba(255,255,255,0.6)" />
      <path d="M19 8 C15.13 8 12 11.13 12 15 C12 20.25 19 30 19 30 C19 30 26 20.25 26 15 C26 11.13 22.87 8 19 8Z" fill="white" />
      <circle cx="19" cy="15" r="4" fill="url(#tf-bg)" />
      <circle cx="19" cy="15" r="1.8" fill="white" />
      <g opacity="0.85">
        <line x1="29" y1="8"  x2="29" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="27" y1="10" x2="31" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

// ── Nav data ──────────────────────────────────────────────────────────────────
type NavItem = { label: string; icon: React.ReactNode; color: string; view: string }

const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: 'Inicio',               icon: <DashboardIcon      sx={{ fontSize: 16 }} />, color: '#C05928', view: 'home'          },
      { label: 'Mapa interactivo',     icon: <MapIcon            sx={{ fontSize: 16 }} />, color: '#818CF8', view: 'map'           },
      { label: 'Accesibilidad',        icon: <AccessibleIcon     sx={{ fontSize: 16 }} />, color: '#10B981', view: 'accessibility'  },
      { label: 'Movilidad sostenible', icon: <DirectionsBikeIcon sx={{ fontSize: 16 }} />, color: '#F59E0B', view: 'mobility'       },
      { label: 'Rutas turísticas',     icon: <RouteIcon          sx={{ fontSize: 16 }} />, color: '#F97316', view: 'routes'         },
    ],
  },
  {
    title: 'IA & Análisis',
    items: [
      { label: 'Recomendaciones IA',   icon: <AutoAwesomeIcon    sx={{ fontSize: 16 }} />, color: '#A78BFA', view: 'ai-recs'        },
      { label: 'Análisis',             icon: <AnalyticsIcon      sx={{ fontSize: 16 }} />, color: '#38BDF8', view: 'analytics'      },
      { label: 'Informes',             icon: <AssessmentIcon     sx={{ fontSize: 16 }} />, color: '#34D399', view: 'reports'        },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { destination, setDestination } = useDestination()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const photo = useDestinationPhoto(destination.id, destination.name)
  const cardQuery = CARD_QUERIES[destination.id] ?? destination.name
  const cardPhoto = useDestinationPhoto(destination.id + '_card', cardQuery)

  return (
    <Box sx={{
      width: 216,
      flexShrink: 0,
      height: '100%',
      background: `
        radial-gradient(ellipse 130% 30% at 50% 0%, rgba(46,125,152,0.35) 0%, transparent 100%),
        radial-gradient(ellipse 80% 40% at 10% 80%, rgba(192,89,40,0.12) 0%, transparent 70%),
        radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(165deg, #0C2135 0%, #1A3C5E 50%, #14304F 100%)
      `,
      backgroundSize: 'auto, auto, 18px 18px, auto',
      boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.06), 4px 0 24px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: 'none',
      position: 'relative',
    }}>


      {/* ── Logo header ── */}
      <Box sx={{
        px: 2, pt: 2, pb: 1.5, position: 'relative', zIndex: 1,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
          <Box sx={{ flexShrink: 0, filter: 'drop-shadow(0 4px 10px rgba(245,158,11,0.4))' }}>
            <TourFlowLogo />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#F8FAFC', lineHeight: 1.1 }}>
              TourFlow AI
            </Typography>
            <Typography sx={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Smart Tourism Mobility
            </Typography>
          </Box>
        </Box>

        {/* Destination badge */}
        <Box sx={{
          px: 1, py: 0.55, borderRadius: '8px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', gap: 0.6,
        }}>
          <LocationOnIcon sx={{ fontSize: 12, color: '#C05928', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.68rem', color: '#F8FAFC', fontWeight: 600,
                             flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {destination.name}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            {destination.region.split('/')[0].trim()}
          </Typography>
        </Box>
      </Box>

      {/* ── Nav ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.2, pt: 1, pb: 0.5, position: 'relative', zIndex: 1,
        '&::-webkit-scrollbar': { width: 0 },
      }}>
        {NAV_GROUPS.map((group, gi) => (
          <Box key={gi} sx={{ mb: 0.5 }}>
            {group.title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, pt: 1.2, pb: 0.6 }}>
                <Typography sx={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700,
                                   textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  {group.title}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.15), transparent)' }} />
              </Box>
            )}

            {group.items.map((item) => {
              const isActive = item.view === currentView

              return (
                <Box key={item.label} onClick={() => onNavigate(item.view)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1, py: 0.6, borderRadius: '10px', mb: 0.25,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C05928' : '3px solid transparent',
                  transition: 'all 0.15s',
                  '&:hover': {
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  },
                }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? '#F8FAFC' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s',
                  }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F8FAFC' : 'rgba(255,255,255,0.55)',
                    transition: 'color 0.15s', flex: 1,
                  }}>
                    {item.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>

      {/* ── Settings ── */}
      <Box sx={{ px: 1.2, pb: 0.5, position: 'relative', zIndex: 1 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.10)', mb: 0.5 }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1, py: 0.6, borderRadius: '10px',
          cursor: 'pointer', transition: 'background 0.15s',
          '&:hover': { background: 'rgba(255,255,255,0.06)' },
        }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '8px',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
          }}>
            <SettingsIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Configuración</Typography>
        </Box>
      </Box>

      {/* ── Destination card ── */}
      {/* Glow aura behind the card */}
      <Box sx={{
        mx: 1.2, mb: 1.5, position: 'relative', zIndex: 1,
      }}>
        <Box sx={{
          position: 'absolute', inset: '-8px', borderRadius: '20px',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(46,125,152,0.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{
          borderRadius: '14px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.04)',
        }}>
        {/* Destination photo */}
        <Box sx={{
          height: 90,
          background: 'linear-gradient(135deg, #081520 0%, #1A3C5E 60%, #1E5080 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          {cardPhoto && (
            <Box
              component="img"
              src={cardPhoto}
              alt={destination.region}
              sx={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                maskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
                transition: 'opacity 0.4s ease',
              }}
            />
          )}
          {/* Bottom fade into button row */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
            background: 'linear-gradient(to top, rgba(8,21,32,0.7) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <Box sx={{ position: 'absolute', bottom: 8, left: 10, zIndex: 2 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', lineHeight: 1.2,
                               textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {destination.name}
            </Typography>
            <Typography sx={{ fontSize: '0.54rem', color: 'rgba(255,255,255,0.65)',
                               textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              {destination.region}
            </Typography>
          </Box>
        </Box>

        {/* Change button */}
        <Box
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.2, py: 0.65,
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 0.15s',
            '&:hover': { background: 'rgba(255,255,255,0.06)' },
          }}
        >
          <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Cambiar destino</Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }} />
        </Box>
        </Box>{/* inner glass card */}
      </Box>{/* outer glow wrapper */}

      {/* ── Destination dropdown menu ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              background: '#1E293B',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              borderRadius: '10px',
              maxHeight: 360, width: 220,
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
            onClick={() => { setDestination(dest); setMenuAnchor(null) }}
            sx={{
              py: 0.8, px: 1.5, borderRadius: '6px', mx: 0.5, my: 0.1,
              '&.Mui-selected': { background: 'rgba(192,89,40,0.2)' },
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9' }}>{dest.name}</Typography>
              <Typography sx={{ fontSize: '0.64rem', color: '#64748B' }}>{dest.region}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
