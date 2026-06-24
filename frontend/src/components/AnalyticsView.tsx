import { useMemo, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useDestination } from '../context/DestinationContext'
import { useLanguage } from '../context/LanguageContext'
import { fetchPernoctaciones } from '../api/ine'
import type { INEObs } from '../api/ine'

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

type TimeRangeKey = '6m' | '12m' | '24m'
const TIME_RANGE_KEYS: TimeRangeKey[] = ['6m', '12m', '24m']
const TIME_RANGE_N: Record<TimeRangeKey, number> = { '6m': 6, '12m': 12, '24m': 24 }

const PEER_DESTINATIONS = ['Barcelona', 'Sevilla', 'Málaga', 'Valencia', 'Bilbao', 'Granada', 'San Sebastián']

function fmtPernocta(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return String(n)
}

function KPICard({
  label, value, unit, color, delta,
}: {
  label: string
  value: string
  unit?: string
  color: string
  delta?: string
}) {
  return (
    <Box sx={{
      background: '#fff',
      border: '1px solid #E0D8CF',
      borderTop: `3px solid ${color}`,
      borderRadius: '12px',
      p: 2,
      boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
      flex: 1,
      minWidth: 0,
    }}>
      <Typography sx={{ fontSize: '0.67rem', color: '#94A3B8', lineHeight: 1, mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.4 }}>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{unit}</Typography>
        )}
      </Box>
      {delta && (
        <Typography sx={{ fontSize: '0.7rem', color: delta.startsWith('↓') ? '#EF4444' : '#2D6A4F' }}>
          {delta}
        </Typography>
      )}
    </Box>
  )
}

export default function AnalyticsView() {
  const { destination } = useDestination()
  const { t } = useLanguage()
  const [timeRange, setTimeRange]     = useState<TimeRangeKey>('12m')
  const [ineData,   setIneData]       = useState<INEObs[]>([])
  const [ineLoading, setIneLoading]   = useState(false)

  useEffect(() => {
    setIneData([])
    setIneLoading(true)
    fetchPernoctaciones(destination.id)
      .then(setIneData)
      .finally(() => setIneLoading(false))
  }, [destination.id])

  const MONTH_LABELS = useMemo(() => t('analytics.months').split(','), [t])

  const synth = useMemo(() => {
    const rng = mkRng(destination.id + 'analytics')

    const visitors     = Math.round(12000 + rng() * 73000)
    const sustainable  = Math.round(32 + rng() * 46)
    const satisfaction = Math.round((6.8 + rng() * 2.6) * 10) / 10
    const incidents    = Math.round(2 + rng() * 16)

    const SUMMER = [6, 7]
    const WINTER = [0, 1, 11]
    const months = Array.from({ length: 12 }, (_, i) => {
      if (SUMMER.includes(i)) return Math.round(85 + rng() * 15)
      if (WINTER.includes(i)) return Math.round(40 + rng() * 20)
      return Math.round(55 + rng() * 35)
    })

    const peers = PEER_DESTINATIONS
      .filter(p => p.toLowerCase() !== destination.name.toLowerCase())
      .slice(0, 4)
      .map(name => ({ name, value: Math.round(60 + rng() * 35) }))

    const currentValue = Math.round(60 + rng() * 35)

    return { visitors, sustainable, satisfaction, incidents, months, peers, currentValue }
  }, [destination.id, destination.name])

  const hasRealData = ineData.length > 0

  // KPI — real when available
  const kpiPernocta = useMemo(() => {
    if (!hasRealData) return { value: synth.visitors.toLocaleString(), delta: `↑ 12% ${t('analytics.vs_year')}` }
    const last = ineData[ineData.length - 1]
    const prevYear = ineData.find(o => o.year === last.year - 1 && o.month === last.month)
    const delta = prevYear
      ? `${last.pernoctaciones >= prevYear.pernoctaciones ? '↑' : '↓'} ${
          Math.abs(Math.round((last.pernoctaciones - prevYear.pernoctaciones) / prevYear.pernoctaciones * 100))
        }% ${t('analytics.vs_year')}`
      : undefined
    return { value: fmtPernocta(last.pernoctaciones), delta }
  }, [hasRealData, ineData, synth.visitors, t])

  // Bar chart data — real months or synthetic fallback
  interface BarObs { label: string; value: number; year?: number }

  const visibleBars = useMemo((): BarObs[] => {
    const n = TIME_RANGE_N[timeRange]

    if (hasRealData) {
      return ineData.slice(-n).map(obs => ({
        label: MONTH_LABELS[obs.month - 1],
        value: obs.pernoctaciones,
        year:  obs.year,
      }))
    }

    if (timeRange === '6m') {
      return MONTH_LABELS.slice(6).map((label, i) => ({ label, value: synth.months[6 + i] }))
    }
    return MONTH_LABELS.map((label, i) => ({ label, value: synth.months[i] }))
  }, [timeRange, hasRealData, ineData, synth.months, MONTH_LABELS])

  const maxBarVal = Math.max(...visibleBars.map(b => b.value), 1)

  const allPeers = [
    { name: destination.name, value: synth.currentValue, isCurrent: true },
    ...synth.peers.map(p => ({ ...p, isCurrent: false })),
  ]
  const maxPeerVal = Math.max(...allPeers.map(p => p.value))

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAF8' }}>

      {/* Header */}
      <Box sx={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5, background: '#fff', borderBottom: '1px solid #E0D8CF',
        boxShadow: '0 1px 8px rgba(26,60,94,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: '#C05928', flexShrink: 0 }} />
          <Box>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', lineHeight: 1,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {t('analytics.header')}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {TIME_RANGE_KEYS.map((key) => {
            const active = timeRange === key
            const rangeKey = `analytics.range.${key}` as Parameters<typeof t>[0]
            return (
              <Box
                key={key}
                onClick={() => setTimeRange(key)}
                sx={{
                  px: 1.4, py: 0.5, borderRadius: '20px', cursor: 'pointer',
                  background: active ? '#1A3C5E' : 'transparent',
                  border: `1px solid ${active ? '#1A3C5E' : '#CBD5E1'}`,
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#1A3C5E' },
                }}
              >
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#fff' : '#64748B' }}>
                  {t(rangeKey)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* KPI row */}
        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <KPICard
            label={hasRealData ? t('analytics.kpi.pernoctaciones') : t('analytics.kpi.visits')}
            value={kpiPernocta.value}
            color="#1A3C5E"
            delta={kpiPernocta.delta}
          />
          <KPICard
            label={t('analytics.kpi.sustainable')}
            value={`${synth.sustainable}`}
            unit="%"
            color="#2D6A4F"
            delta={t('analytics.kpi.sus_delta')}
          />
          <KPICard
            label={t('analytics.kpi.satisfaction')}
            value={synth.satisfaction.toFixed(1)}
            unit="/10"
            color="#2E7D98"
          />
          <KPICard
            label={t('analytics.kpi.incidents')}
            value={`${synth.incidents}`}
            color="#EF4444"
            delta={t('analytics.kpi.inc_delta')}
          />
        </Box>

        {/* Two-column charts */}
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>

          {/* LEFT — Monthly bar chart */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{
                fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 600,
              }}>
                {hasRealData ? t('analytics.chart.ine') : t('analytics.chart.monthly')}
              </Typography>
              {ineLoading && (
                <Typography sx={{ fontSize: '0.6rem', color: '#CBD5E1' }}>{t('analytics.chart.loading')}</Typography>
              )}
              {hasRealData && !ineLoading && (
                <Box sx={{
                  px: 0.9, py: 0.2, borderRadius: '10px',
                  background: 'rgba(45,106,79,0.1)', border: '1px solid rgba(45,106,79,0.25)',
                }}>
                  <Typography sx={{ fontSize: '0.58rem', color: '#2D6A4F', fontWeight: 700 }}>
                    {t('analytics.chart.real_data')}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Bar chart */}
            <Box sx={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 0.5, px: 0.5 }}>
              {visibleBars.map(({ label, value, year }, idx) => {
                const isMax = value === maxBarVal
                const barH  = `${(value / maxBarVal) * 100}%`
                return (
                  <Box
                    key={`${label}-${year ?? idx}`}
                    sx={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'flex-end', height: '100%',
                    }}
                  >
                    {isMax && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#C05928', mb: 0.4, flexShrink: 0 }} />
                    )}
                    {hasRealData && (
                      <Typography sx={{ fontSize: '0.46rem', color: '#94A3B8', mb: 0.25, lineHeight: 1 }}>
                        {fmtPernocta(value)}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        width: '100%', maxWidth: 26,
                        height: barH,
                        background: 'linear-gradient(to top, #1A3C5E, #2E7D98)',
                        opacity: isMax ? 1 : 0.72,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                        minHeight: 4,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.56rem', color: '#94A3B8', mt: 0.5, lineHeight: 1 }}>
                      {label}
                    </Typography>
                    {hasRealData && visibleBars.length > 12 && (
                      <Typography sx={{ fontSize: '0.44rem', color: '#CBD5E1', lineHeight: 1 }}>
                        {String(year).slice(2)}
                      </Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Box>

          {/* RIGHT — Peer comparison + trends */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>
              {t('analytics.chart.peers')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
              {allPeers.map((peer) => {
                const fillPct  = (peer.value / maxPeerVal) * 100
                const barColor = peer.isCurrent ? '#1A3C5E' : '#2E7D98'
                return (
                  <Box key={peer.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
                      <Typography sx={{
                        fontSize: '0.72rem',
                        color: peer.isCurrent ? '#1A3C5E' : '#475569',
                        fontWeight: peer.isCurrent ? 700 : 400,
                      }}>
                        {peer.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: barColor }}>
                        {peer.value}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 9, borderRadius: 5, background: `${barColor}20`, overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%', width: `${fillPct}%`,
                        background: barColor, borderRadius: 5,
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Trend bullets */}
            <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #EDE8E3' }}>
              <Typography sx={{
                fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 600, mb: 1,
              }}>
                {t('analytics.chart.trends')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {([1, 2, 3] as const).map((n) => {
                  const bullet = t(`analytics.trend.${n}` as Parameters<typeof t>[0])
                  return (
                    <Box key={n} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#2E7D98', flexShrink: 0, mt: 0.55,
                      }} />
                      <Typography sx={{ fontSize: '0.71rem', color: '#475569', lineHeight: 1.5 }}>
                        {bullet}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
