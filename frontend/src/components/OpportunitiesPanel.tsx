import { Box, Typography, Chip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { getDestinationOpportunities } from '../data/mockData'
import { useDestination } from '../context/DestinationContext'

const ICONS: Record<string, React.ReactNode> = {
  Alta:  <ErrorIcon        sx={{ fontSize: 16, color: '#EF4444' }} />,
  Media: <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
  Baja:  <CheckCircleIcon  sx={{ fontSize: 16, color: '#10B981' }} />,
}

const BORDER_COLOR: Record<string, string> = {
  Alta: '#EF4444', Media: '#F59E0B', Baja: '#10B981',
}

export default function OpportunitiesPanel({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { destination } = useDestination()
  const opportunities = getDestinationOpportunities(destination.id)

  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E0D8CF',
      borderTop: '3px solid #1A3C5E',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 0.8,
                  borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: '8px',
          background: '#1A3C5E12',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LightbulbIcon sx={{ fontSize: 16, color: '#1A3C5E' }} />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
          Zonas con más oportunidades
        </Typography>
      </Box>

      {/* Opportunity rows */}
      {opportunities.map((op) => (
        <Box key={op.name} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1.5, py: 0.75,
          borderBottom: '1px solid #F1F5F9',
          borderLeft: `3px solid ${BORDER_COLOR[op.priority]}30`,
          '&:last-of-type': { borderBottom: 'none' },
          '&:hover': {
            background: `${BORDER_COLOR[op.priority]}08`,
            borderLeft: `3px solid ${BORDER_COLOR[op.priority]}`,
          },
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {ICONS[op.priority]}
            <Box>
              <Typography sx={{ fontSize: '0.76rem', color: '#1E293B', fontWeight: 600 }}>{op.name}</Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8' }}>{op.issue}</Typography>
            </Box>
          </Box>
          <Chip
            label={op.priority}
            size="small"
            sx={{
              height: 20, fontSize: '0.6rem', fontWeight: 700,
              color: op.priorityColor,
              background: `${op.priorityColor}18`,
              border: `1px solid ${op.priorityColor}40`,
            }}
          />
        </Box>
      ))}

      {/* Ver todas */}
      <Box
        onClick={() => onNavigate?.('accessibility')}
        sx={{
          px: 2, py: 0.7, mt: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
          cursor: 'pointer', borderTop: '1px solid #FEF3C7',
          '&:hover': { background: '#EFF6FF' },
          transition: 'background 0.15s',
        }}
      >
        <Typography sx={{ fontSize: '0.71rem', color: '#1A3C5E', fontWeight: 600 }}>Ver todas las zonas</Typography>
        <ArrowForwardIcon sx={{ fontSize: 13, color: '#1A3C5E' }} />
      </Box>

      {/* City photo */}
      <Box sx={{
        flex: 1, minHeight: 60,
        background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0C4A6E 0%, #075985 40%, #0E4A6E 70%, #134E4A 100%)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: 14, left: 0, right: 0, height: 50, opacity: 0.28,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 55'%3E%3Cpath d='M0,55 L0,40 L30,40 L30,25 L40,20 L50,25 L50,15 L60,8 L70,3 L80,8 L85,5 L90,8 L100,15 L100,25 L110,20 L120,25 L120,30 L130,25 L140,30 L140,40 L160,40 L160,30 L170,25 L180,30 L185,20 L190,25 L200,18 L210,25 L215,20 L220,25 L225,22 L235,28 L235,40 L250,40 L250,35 L260,30 L270,35 L270,40 L300,40 L300,55 Z' fill='%23F1F5F9'/%3E%3C%2Fsvg%3E")`,
          backgroundSize: 'cover',
        }} />
        <Box sx={{ position: 'absolute', bottom: 8, left: 14, zIndex: 2 }}>
          <Typography style={{ fontSize: '0.68rem', fontWeight: 600, color: '#fff' }}>{destination.label}</Typography>
          <Typography style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)' }}>{destination.region} · Destino prioritario</Typography>
        </Box>
        <Typography sx={{ position: 'absolute', top: '20%', right: 14, fontSize: '2.2rem', opacity: 0.15 }}>🏛️</Typography>
      </Box>
    </Box>
  )
}
