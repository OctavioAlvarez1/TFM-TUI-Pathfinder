import { Box, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { modalData } from '../data/mockData'

export default function ModalDonut() {
  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      p: 2,
      minWidth: 190,
      height: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', mb: 1 }}>
        Distribución modal
      </Typography>
      <Box sx={{ position: 'relative', height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={modalData}
              cx="50%" cy="50%"
              innerRadius={42} outerRadius={60}
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
              }}
              formatter={(value) => [`${value}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8' }}>Viajes</Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>24,532</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
        {modalData.map(m => (
          <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>{m.name}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#1E293B' }}>{m.value}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
