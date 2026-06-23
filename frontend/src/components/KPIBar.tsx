import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import AccessibleIcon from '@mui/icons-material/Accessible'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { kpis } from '../data/mockData'

const ICONS = [
  <AccessibleIcon        sx={{ fontSize: 20 }} />,
  <TrendingUpIcon        sx={{ fontSize: 20 }} />,
  <DirectionsBusIcon     sx={{ fontSize: 20 }} />,
  <EnergySavingsLeafIcon sx={{ fontSize: 20 }} />,
  <AccessTimeIcon        sx={{ fontSize: 20 }} />,
  <LocationOnIcon        sx={{ fontSize: 20 }} />,
]

export default function KPIBar() {
  return (
    <Box sx={{
      display: 'flex',
      gap: 1.5,
      px: 2,
      py: 1.5,
      background: 'transparent',
      borderBottom: '1px solid rgba(226,232,240,0.5)',
      flexShrink: 0,
    }}>
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Box sx={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            borderTop: `3px solid ${k.color}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            px: 2, py: 1.8,
            height: '100%',
            transition: 'box-shadow 0.2s, transform 0.15s',
            '&:hover': {
              boxShadow: `0 6px 20px ${k.color}28`,
              transform: 'translateY(-1px)',
            },
          }}>
            {/* Icon + label */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '10px',
                background: `${k.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: k.color, flexShrink: 0, mt: '1px',
              }}>
                {ICONS[i]}
              </Box>
              <Typography sx={{
                fontSize: '0.72rem', color: '#475569', fontWeight: 600,
                lineHeight: 1.3,
              }}>
                {k.label}
              </Typography>
            </Box>

            {/* Value */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4, mb: 0.5 }}>
              <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {k.value}
              </Typography>
              {k.unit && (
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {k.unit}
                </Typography>
              )}
            </Box>

            {/* Delta */}
            <Typography sx={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap' }}>
              ↑ {k.delta}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </Box>
  )
}
