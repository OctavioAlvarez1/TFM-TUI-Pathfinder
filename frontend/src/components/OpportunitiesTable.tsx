import { Box, Typography, Chip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { opportunities } from '../data/mockData'

const ICONS: Record<string, React.ReactNode> = {
  Alta:  <ErrorIcon       sx={{ fontSize: 16, color: '#EF4444' }} />,
  Media: <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
  Baja:  <InfoIcon         sx={{ fontSize: 16, color: '#10B981' }} />,
}

export default function OpportunitiesTable() {
  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
          Zonas con más oportunidades
        </Typography>
      </Box>

      {opportunities.map((op) => (
        <Box key={op.name} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1,
          borderBottom: '1px solid #F8FAFC',
          '&:last-child': { borderBottom: 'none' },
          '&:hover': { background: '#FAFAFA' },
          cursor: 'pointer',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {ICONS[op.priority]}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#1E293B', fontWeight: 500 }}>{op.name}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>{op.issue}</Typography>
            </Box>
          </Box>
          <Chip
            label={op.priority}
            size="small"
            sx={{
              height: 20, fontSize: '0.62rem', fontWeight: 600,
              color: op.priorityColor,
              background: `${op.priorityColor}14`,
              border: `1px solid ${op.priorityColor}30`,
            }}
          />
        </Box>
      ))}

      <Box sx={{
        px: 2, py: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
        cursor: 'pointer',
        '&:hover': { background: '#F8FAFC' },
      }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 500 }}>Ver todas las zonas</Typography>
        <ArrowForwardIcon sx={{ fontSize: 14, color: '#818CF8' }} />
      </Box>

      {/* City photo placeholder */}
      <Box sx={{
        height: 130,
        background: 'linear-gradient(135deg, #0E7490 0%, #0891B2 40%, #B45309 70%, #92400E 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Simulate architecture photo with shapes */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
        }} />
        <Box sx={{ position: 'absolute', bottom: 10, left: 12 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#fff' }}>Sevilla, Catedral</Typography>
          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>Alta prioridad</Typography>
        </Box>
        <Typography sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          fontSize: '3.5rem', opacity: 0.4,
        }}>🏛️</Typography>
      </Box>
    </Box>
  )
}
