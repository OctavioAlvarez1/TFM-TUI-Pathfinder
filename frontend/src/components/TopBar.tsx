import { Box, Typography, Button, IconButton, Avatar } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export default function TopBar() {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, py: 1.4,
      background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 45%, #0E2340 100%)',
      borderBottom: '1px solid rgba(13,211,197,0.18)',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #0DD3C5 0%, #818CF8 50%, #F59E0B 100%)',
        opacity: 0.7,
      },
    }}>
      {/* Left — title + subtitle */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#F8FAFC' }}>
          Dashboard
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
          Resumen general de accesibilidad y movilidad del destino
        </Typography>
      </Box>

      {/* Right — date, bell, avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        {/* Date range dropdown */}
        <Button
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
          sx={{
            color: '#CBD5E1',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            px: 1.5,
            py: 0.55,
            height: 32,
            '&:hover': { background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' },
          }}
        >
          01 May 2026 – 31 May 2026
        </Button>

        {/* Bell */}
        <IconButton size="small" sx={{
          color: '#94A3B8',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          width: 32, height: 32,
          '&:hover': { background: 'rgba(255,255,255,0.12)' },
        }}>
          <NotificationsNoneIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Avatar */}
        <Avatar
          src="https://i.pravatar.cc/150?img=47"
          sx={{ width: 32, height: 32, cursor: 'pointer', border: '2px solid rgba(13,211,197,0.4)' }}
        />
      </Box>
    </Box>
  )
}
