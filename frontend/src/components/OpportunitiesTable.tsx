import { Box, Typography, Chip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { opportunities } from '../data/mockData'

export default function OpportunitiesTable() {
  return (
    <Box sx={{
      background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
      border: '1px solid rgba(129,140,248,0.15)',
      borderRadius: '12px',
      p: 1.5,
      flex: 1,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9' }}>
          Zonas con más oportunidades
        </Typography>
      </Box>
      {opportunities.map((op) => (
        <Box key={op.name} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          py: 0.8, px: 0.5,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          '&:last-child': { borderBottom: 'none' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: op.priorityColor }} />
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#F1F5F9', fontWeight: 500 }}>{op.name}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>{op.issue}</Typography>
            </Box>
          </Box>
          <Chip
            label={op.priority}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 600,
              color: op.priorityColor,
              background: `${op.priorityColor}18`,
              border: `1px solid ${op.priorityColor}40`,
            }}
          />
        </Box>
      ))}
      <Box sx={{
        mt: 1, textAlign: 'center', py: 0.6, borderRadius: '6px',
        background: 'rgba(129,140,248,0.06)',
        border: '1px solid rgba(129,140,248,0.12)',
        cursor: 'pointer',
      }}>
        <Typography sx={{ fontSize: '0.68rem', color: '#818CF8' }}>Ver todas las zonas →</Typography>
      </Box>
    </Box>
  )
}
