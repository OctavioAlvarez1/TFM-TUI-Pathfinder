import { Box, Typography, Button, IconButton, Avatar } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useDestination } from '../context/DestinationContext'
import { useDestinationPhoto } from '../hooks/useDestinationPhoto'

function currentMonthRange(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function TopBar() {
  const { destination } = useDestination()
  const photo = useDestinationPhoto(destination.id, destination.name)

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, py: 0,
      background: '#1A3C5E',
      boxShadow: 'inset 0 -3px 0 #C05928, 0 2px 16px rgba(26,60,94,0.22)',
      flexShrink: 0,
      height: 54,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Photo — full brightness, fades left→right */}
      {photo && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${photo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          maskImage: 'linear-gradient(to right, black 30%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 85%)',
          transition: 'background-image 0.5s ease',
        }} />
      )}

      {/* Gradient veil only on the left, for text readability */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to right, rgba(10,25,45,0.62) 0%, rgba(10,25,45,0.25) 35%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Left — destination */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 2 }}>
        <Box sx={{ width: 4, height: 32, borderRadius: '2px', background: '#C05928', flexShrink: 0 }} />
        <Box>
          <Typography sx={{
            fontSize: '0.63rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          }}>
            Destino activo
          </Typography>
          <Typography sx={{
            fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
          }}>
            {destination.label}
          </Typography>
        </Box>
      </Box>

      {/* Right */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 2 }}>
        <Button
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }} />}
          sx={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.72rem', fontWeight: 500,
            textTransform: 'none',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '6px',
            px: 1.4, height: 28,
            backdropFilter: 'blur(6px)',
            '&:hover': { background: 'rgba(255,255,255,0.18)' },
          }}
        >
          {currentMonthRange()}
        </Button>

        <IconButton size="small" sx={{
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(6px)',
          width: 28, height: 28,
          '&:hover': { background: 'rgba(255,255,255,0.18)' },
        }}>
          <NotificationsNoneIcon sx={{ fontSize: 15 }} />
        </IconButton>

        <Avatar
          src="https://i.pravatar.cc/150?img=47"
          sx={{ width: 28, height: 28, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
        />
      </Box>
    </Box>
  )
}
