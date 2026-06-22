import { Box, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { modalData } from '../data/mockData'

const TOTAL_TRIPS = '24,532'

export default function ModalDonut() {
  return (
    <Box sx={{
      background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
      border: '1px solid rgba(129,140,248,0.15)',
      borderRadius: '12px',
      p: 1.5,
      minWidth: 170,
    }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9', mb: 0.5 }}>
        Distribución modal
      </Typography>
      <Box sx={{ position: 'relative', height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={modalData}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {modalData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(11,18,32,0.95)',
                border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: '8px',
                fontSize: '0.72rem',
                color: '#F1F5F9',
              }}
              formatter={(value: number) => [`${value}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#475569' }}>Viajes</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9' }}>{TOTAL_TRIPS}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: 0.5 }}>
        {modalData.map(m => (
          <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>{m.name}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.65rem', color: m.color, fontWeight: 600 }}>{m.value}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
