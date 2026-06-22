import { Box, Typography, Chip, IconButton, Avatar } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

export default function TopBar() {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 2.5, py: 1.2,
      background: 'rgba(11,18,32,0.85)',
      borderBottom: '1px solid rgba(129,140,248,0.10)',
      backdropFilter: 'blur(10px)',
      flexShrink: 0,
    }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F1F5F9', lineHeight: 1.2 }}>
          Dashboard
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>
          Resumen general de accesibilidad y movilidad del destino
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          icon={<CalendarTodayIcon sx={{ fontSize: '12px !important', color: '#818CF8 !important' }} />}
          label="01 May 2026 – 31 May 2026"
          size="small"
          sx={{
            background: 'rgba(129,140,248,0.08)',
            border: '1px solid rgba(129,140,248,0.20)',
            color: '#94A3B8',
            fontSize: '0.72rem',
            height: 26,
          }}
        />
        <IconButton size="small" sx={{
          color: '#64748B', background: 'rgba(129,140,248,0.06)',
          border: '1px solid rgba(129,140,248,0.12)',
          '&:hover': { background: 'rgba(129,140,248,0.12)' },
        }}>
          <NotificationsNoneIcon fontSize="small" />
        </IconButton>
        <Avatar sx={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #818CF8, #0DD3C5)',
          fontSize: '0.75rem', fontWeight: 700,
        }}>O</Avatar>
      </Box>
    </Box>
  )
}
