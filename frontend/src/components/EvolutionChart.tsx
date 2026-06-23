import { useState } from 'react'
import { Box, Typography, Select, MenuItem } from '@mui/material'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDestinationEvolution } from '../data/mockData'
import { useDestination } from '../context/DestinationContext'

const LINES = [
  { key: 'accesibilidad', color: '#1A3C5E', label: 'Accesibilidad' },
  { key: 'movilidad',     color: '#2D6A4F', label: 'Movilidad'     },
  { key: 'transporte',    color: '#2E7D98', label: 'Transporte', dash: '4 2' },
  { key: 'sostenibilidad',color: '#C05928', label: 'Sostenibilidad'},
]

export default function EvolutionChart() {
  const [period, setPeriod] = useState('6m')
  const { destination } = useDestination()
  const evolutionData = getDestinationEvolution(destination.id)

  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E0D8CF',
      borderTop: '3px solid #1A3C5E',
      borderRadius: '12px',
      p: 2,
      flex: 1,
      height: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '8px',
            background: '#1A3C5E12',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShowChartIcon sx={{ fontSize: 16, color: '#1A3C5E' }} />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            Evolución de métricas
          </Typography>
        </Box>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          size="small"
          sx={{
            fontSize: '0.7rem', color: '#64748B', height: 26,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-icon': { color: '#64748B', fontSize: 16 },
          }}
        >
          <MenuItem value="3m" sx={{ fontSize: '0.72rem' }}>Últimos 3 meses</MenuItem>
          <MenuItem value="6m" sx={{ fontSize: '0.72rem' }}>Últimos 6 meses</MenuItem>
          <MenuItem value="1y" sx={{ fontSize: '0.72rem' }}>Último año</MenuItem>
        </Select>
      </Box>

      <ResponsiveContainer width="100%" height={130}>
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
              boxShadow: '0 4px 16px rgba(129,140,248,0.15)',
            }}
          />
          {LINES.map(l => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              strokeWidth={2.5}
              dot={false}
              strokeDasharray={l.dash}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <Box sx={{ display: 'flex', gap: 1.5, mt: 0.8, flexWrap: 'wrap' }}>
        {LINES.map(l => (
          <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 2.5, background: l.color, borderRadius: 2,
                        borderBottom: l.dash ? `2px dashed ${l.color}` : undefined,
                        background: l.dash ? 'none' : l.color }} />
            <Typography sx={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
