import { Box, Typography } from '@mui/material'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { radarData } from '../data/mockData'

const GLOBAL_SCORE = 82

function GaugeArc({ score }: { score: number }) {
  const r = 42
  const cx = 60
  const cy = 60
  const startAngle = 210
  const endAngle = startAngle - (score / 100) * 240
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const arcPath = (from: number, to: number, color: string) => {
    const x1 = cx + r * Math.cos(toRad(from))
    const y1 = cy - r * Math.sin(toRad(from))
    const x2 = cx + r * Math.cos(toRad(to))
    const y2 = cy - r * Math.sin(toRad(to))
    const large = Math.abs(from - to) > 180 ? 1 : 0
    const sweep = from > to ? 0 : 1
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${from > to ? 1 : 0} ${x2} ${y2}`
  }

  return (
    <svg width={120} height={80} viewBox="0 0 120 80">
      <path d={arcPath(210, -30, '#334155')} fill="none" stroke="rgba(129,140,248,0.15)" strokeWidth="8" strokeLinecap="round" />
      <path d={arcPath(210, endAngle, '#818CF8')} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round" />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#F1F5F9">{score}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8" fill="#10B981">Muy bueno</text>
    </svg>
  )
}

export default function ExecutiveView() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, height: '100%' }}>
      {/* Score gauge */}
      <Box sx={{
        background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: '12px',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140,
      }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#F1F5F9', mb: 1, textAlign: 'center' }}>
          Score global del destino
        </Typography>
        <GaugeArc score={GLOBAL_SCORE} />
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#818CF8', lineHeight: 1, mt: 0.5 }}>
          {GLOBAL_SCORE}<Typography component="span" sx={{ fontSize: '0.8rem', color: '#475569' }}>/100</Typography>
        </Typography>
      </Box>

      {/* Radar */}
      <Box sx={{
        background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: '12px',
        p: 1.5,
        flex: 1,
      }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#F1F5F9', mb: 0.5 }}>
          Vista Ejecutiva
        </Typography>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} cx="50%" cy="50%">
            <PolarGrid stroke="rgba(129,140,248,0.12)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9, fill: '#64748B' }}
            />
            <Radar
              dataKey="value"
              stroke="#818CF8"
              fill="#818CF8"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ fill: '#818CF8', r: 3 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
