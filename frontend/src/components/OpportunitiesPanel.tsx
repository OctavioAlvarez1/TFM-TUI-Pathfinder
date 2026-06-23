import { Box, Typography, Chip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { opportunities } from '../data/mockData'

const ICONS: Record<string, React.ReactNode> = {
  Alta:  <ErrorIcon        sx={{ fontSize: 16, color: '#EF4444' }} />,
  Media: <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
  Baja:  <CheckCircleIcon  sx={{ fontSize: 16, color: '#10B981' }} />,
}

export default function OpportunitiesPanel() {
  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid #F1F5F9' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
          Zonas con más oportunidades
        </Typography>
      </Box>

      {opportunities.map((op) => (
        <Box key={op.name} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 0.9,
          borderBottom: '1px solid #F8FAFC',
          '&:last-child': { borderBottom: 'none' },
          '&:hover': { background: '#FAFAFA' },
          cursor: 'pointer',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {ICONS[op.priority]}
            <Box>
              <Typography sx={{ fontSize: '0.77rem', color: '#1E293B', fontWeight: 500 }}>{op.name}</Typography>
              <Typography sx={{ fontSize: '0.63rem', color: '#94A3B8' }}>{op.issue}</Typography>
            </Box>
          </Box>
          <Chip
            label={op.priority}
            size="small"
            sx={{
              height: 20, fontSize: '0.6rem', fontWeight: 600,
              color: op.priorityColor,
              background: `${op.priorityColor}14`,
              border: `1px solid ${op.priorityColor}30`,
            }}
          />
        </Box>
      ))}

      <Box sx={{
        px: 2, py: 0.8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
        cursor: 'pointer', borderTop: '1px solid #F1F5F9',
        '&:hover': { background: '#F8FAFC' },
      }}>
        <Typography sx={{ fontSize: '0.71rem', color: '#818CF8', fontWeight: 500 }}>Ver todas las zonas</Typography>
        <ArrowForwardIcon sx={{ fontSize: 13, color: '#818CF8' }} />
      </Box>

      {/* City photo — Valencia Palau de les Arts */}
      <Box sx={{
        height: 120,
        background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Futuristic skyline silhouette */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%),
            linear-gradient(135deg, #0C4A6E 0%, #075985 40%, #0E4A6E 70%, #134E4A 100%)
          `,
        }} />
        {/* Silhouette of Palau de les Arts */}
        <Box sx={{
          position: 'absolute', bottom: 20, left: 0, right: 0, height: 55,
          opacity: 0.3,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 55'%3E%3Cpath d='M0,55 L0,40 L30,40 L30,25 L40,20 L50,25 L50,15 L60,8 L70,3 L80,8 L85,5 L90,8 L100,15 L100,25 L110,20 L120,25 L120,30 L130,25 L140,30 L140,40 L160,40 L160,30 L170,25 L180,30 L185,20 L190,25 L200,18 L210,25 L215,20 L220,25 L225,22 L235,28 L235,40 L250,40 L250,35 L260,30 L270,35 L270,40 L300,40 L300,55 Z' fill='%23F1F5F9'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
        }} />
        <Box sx={{ position: 'absolute', bottom: 10, left: 14, zIndex: 2 }}>
          <Typography style={{ fontSize: '0.68rem', fontWeight: 600, color: '#fff' }}>Valencia, Ciudad de las Artes</Typography>
          <Typography style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.65)' }}>Destino prioritario · Reto 3</Typography>
        </Box>
        <Typography sx={{
          position: 'absolute', top: '30%', right: 20,
          fontSize: '2.8rem', opacity: 0.18, zIndex: 1,
        }}>🏛️</Typography>
      </Box>
    </Box>
  )
}
