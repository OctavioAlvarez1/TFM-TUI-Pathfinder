import { Box, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { evolutionData } from '../data/mockData'

const LINES = [
  { key: 'accesibilidad', color: '#10B981', label: 'Accesibilidad' },
  { key: 'movilidad',     color: '#818CF8', label: 'Movilidad'     },
  { key: 'transporte',    color: '#0DD3C5', label: 'Transporte'    },
  { key: 'sostenibilidad',color: '#F97316', label: 'Sostenibilidad'},
]

export default function EvolutionChart() {
  return (
    <Box sx={{
      background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
      border: '1px solid rgba(129,140,248,0.15)',
      borderRadius: '12px',
      p: 1.5,
      flex: 1,
    }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F1F5F9', mb: 1 }}>
        Evolución de métricas
      </Typography>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={evolutionData} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[50, 100]}
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(11,18,32,0.95)',
              border: '1px solid rgba(129,140,248,0.2)',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: '#F1F5F9',
            }}
          />
          {LINES.map(l => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
        {LINES.map(l => (
          <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ width: 12, height: 2, background: l.color, borderRadius: 1 }} />
            <Typography sx={{ fontSize: '0.62rem', color: '#475569' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
