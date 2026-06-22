import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { kpis } from '../data/mockData'

export default function KPIBar() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, py: 1.5, flexShrink: 0 }}>
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{ flex: 1 }}
        >
          <Box sx={{
            flex: 1,
            background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
            border: '1px solid rgba(129,140,248,0.15)',
            borderRadius: '10px',
            p: '10px 14px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #818CF8, #0DD3C5, #F97316)',
            },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.2 }}>
                {k.label}
              </Typography>
              <Box sx={{
                width: 24, height: 24, borderRadius: '6px',
                background: `${k.color}18`,
                border: `1px solid ${k.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', flexShrink: 0,
              }}>{k.icon}</Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>
                {k.value}
              </Typography>
              {k.unit && (
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                  {k.unit}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.62rem', color: k.delta.startsWith('+') ? '#10B981' : k.delta.startsWith('−') ? '#10B981' : '#64748B', mt: 0.3 }}>
              {k.delta}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </Box>
  )
}
