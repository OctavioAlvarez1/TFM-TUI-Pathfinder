import { Box, Typography } from '@mui/material'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getDestinationModal } from '../data/mockData'
import { useDestination } from '../context/DestinationContext'

export default function ModalDonut() {
  const { destination } = useDestination()
  const { entries: modalData, total } = getDestinationModal(destination.id)
  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E0D8CF',
      borderTop: '3px solid #2D6A4F',
      borderRadius: '12px',
      p: 2,
      minWidth: 190,
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
        <Box sx={{
          width: 26, height: 26, borderRadius: '8px',
          background: '#2D6A4F12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DirectionsBikeIcon sx={{ fontSize: 15, color: '#2D6A4F' }} />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
          Distribución modal
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', height: 108 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={modalData}
              cx="50%" cy="50%"
              innerRadius={32} outerRadius={48}
              paddingAngle={2}
              dataKey="value"
              startAngle={90} endAngle={-270}
            >
              {modalData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.72rem',
                color: '#1E293B',
                boxShadow: '0 4px 16px rgba(13,211,197,0.15)',
              }}
              formatter={(value) => [`${value}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.52rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>VIAJES</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{total.toLocaleString('es-ES')}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.3 }}>
        {modalData.map(m => (
          <Box key={m.name} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 0.8, py: 0.25, borderRadius: '6px',
            background: `${m.color}0D`,
            border: `1px solid ${m.color}20`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.67rem', color: '#475569', fontWeight: 500 }}>{m.name}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: m.color }}>{m.value}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
