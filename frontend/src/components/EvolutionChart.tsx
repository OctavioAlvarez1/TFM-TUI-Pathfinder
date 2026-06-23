import { useState } from 'react'
import { Box, Typography, Select, MenuItem } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { evolutionData } from '../data/mockData'

const LINES = [
  { key: 'accesibilidad', color: '#818CF8', label: 'Accesibilidad' },
  { key: 'movilidad',     color: '#10B981', label: 'Movilidad'     },
  { key: 'transporte',    color: '#818CF8', label: 'Transporte', dash: '4 2'    },
  { key: 'sostenibilidad',color: '#F97316', label: 'Sostenibilidad'},
]

export default function EvolutionChart() {
  const [period, setPeriod] = useState('6m')
  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      p: 2,
      flex: 1,
      height: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
          Evolución de métricas
        </Typography>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          size="small"
          sx={{
            fontSize: '0.7rem', color: '#64748B', height: 26,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: '6px',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-icon': { color: '#94A3B8', fontSize: 16 },
          }}
        >
          <MenuItem value="3m" sx={{ fontSize: '0.72rem' }}>Últimos 3 meses</MenuItem>
          <MenuItem value="6m" sx={{ fontSize: '0.72rem' }}>Últimos 6 meses</MenuItem>
          <MenuItem value="1y" sx={{ fontSize: '0.72rem' }}>Último año</MenuItem>
        </Select>
      </Box>

      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={evolutionData} margin={{ top: 4, right: 8, left: -30, bottom: 0 }}>
          <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} ticks={[0, 25, 50, 75, 100]} />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: '#1E293B',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
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
              strokeDasharray={l.dash}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
        {LINES.map(l => (
          <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 2, background: l.color, borderRadius: 1 }} />
            <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
