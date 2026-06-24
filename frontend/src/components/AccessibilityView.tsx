import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useDestination } from '../context/DestinationContext'
import { useLanguage } from '../context/LanguageContext'

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

interface KPIData {
  accessIndex: number
  accessiblePOIs: number
  barriers: number
  walkCoverage: number
}

interface CategoryData {
  emoji: string
  label: string
  pct: number
}

interface BarrierData {
  label: string
  count: number
}

function barColor(pct: number): string {
  if (pct > 70) return '#2D6A4F'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

function barrierSeverityColor(rank: number, total: number): string {
  if (rank === 0) return '#EF4444'
  if (rank < Math.ceil(total / 2)) return '#F59E0B'
  return '#2D6A4F'
}

function KPICard({
  label, value, unit, color, delta, deltaPositive,
}: {
  label: string
  value: number
  unit: string
  color: string
  delta: string
  deltaPositive: boolean
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
        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{unit}</Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.7rem', color: deltaPositive ? '#2D6A4F' : '#EF4444' }}>
        {delta}
      </Typography>
    </Box>
  )
}

export default function AccessibilityView() {
  const { destination } = useDestination()
  const { t } = useLanguage()

  const data = useMemo(() => {
    const rng = mkRng(destination.id + 'acc')
    const accessIndex = Math.round(33 + rng() * 60)
    const accessiblePOIs = Math.round(40 + rng() * 140)
    const barriers = Math.round(4 + rng() * 20)
    const walkCoverage = Math.round(35 + rng() * 57)

    const categories: CategoryData[] = [
      { emoji: '🏨', label: 'hotels',      pct: Math.round(60 + rng() * 35) },
      { emoji: '🏛️', label: 'monuments',  pct: Math.round(40 + rng() * 40) },
      { emoji: '🍽️', label: 'restaurants',pct: Math.round(50 + rng() * 35) },
      { emoji: '🏖️', label: 'beaches',    pct: Math.round(30 + rng() * 40) },
      { emoji: '🚌', label: 'transport',   pct: Math.round(55 + rng() * 35) },
      { emoji: '🚲', label: 'bikes',       pct: Math.round(70 + rng() * 28) },
    ]
    const avgPct = Math.round(categories.reduce((s, c) => s + c.pct, 0) / categories.length)

    const rawBarriers: BarrierData[] = [
      { label: 'steps',     count: Math.round(3 + rng() * 9) },
      { label: 'narrow',    count: Math.round(5 + rng() * 13) },
      { label: 'signage',   count: Math.round(2 + rng() * 7) },
      { label: 'elevators', count: Math.round(1 + rng() * 5) },
      { label: 'lighting',  count: Math.round(2 + rng() * 8) },
    ]

    const kpi: KPIData = { accessIndex, accessiblePOIs, barriers, walkCoverage }

    return { kpi, categories, avgPct, rawBarriers }
  }, [destination.id])

  const sortedBarriers = useMemo(
    () => [...data.rawBarriers].sort((a, b) => b.count - a.count),
    [data.rawBarriers],
  )

  const [_hover, setHover] = useState<number | null>(null)

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAF8' }}>

      {/* Header */}
      <Box sx={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
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
              {t('acc.header')}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* KPI row */}
        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <KPICard
            label={t('acc.kpi.index')}
            value={data.kpi.accessIndex}
            unit="/100"
            color="#2D6A4F"
            delta={`↑ ${Math.round(data.kpi.accessIndex * 0.04)} ${t('acc.vs_month')}`}
            deltaPositive
          />
          <KPICard
            label={t('acc.kpi.pois')}
            value={data.kpi.accessiblePOIs}
            unit=""
            color="#2E7D98"
            delta={t('acc.kpi.delta.new_pois')}
            deltaPositive
          />
          <KPICard
            label={t('acc.kpi.barriers')}
            value={data.kpi.barriers}
            unit=""
            color="#EF4444"
            delta={t('acc.kpi.delta.barriers')}
            deltaPositive={false}
          />
          <KPICard
            label={t('acc.kpi.walk')}
            value={data.kpi.walkCoverage}
            unit="%"
            color="#1A3C5E"
            delta={`↑ ${Math.round(data.kpi.walkCoverage * 0.03)}% ${t('acc.vs_month')}`}
            deltaPositive
          />
        </Box>

        {/* Two-column row */}
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>

          {/* LEFT — Category distribution */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>
              {t('acc.section.categories')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
              {data.categories.map((cat, i) => {
                const color = barColor(cat.pct)
                const catLabelMap: Record<string, string> = {
                  hotels: t('acc.cat.hotels'), monuments: t('acc.cat.monuments'),
                  restaurants: t('acc.cat.restaurants'), beaches: t('acc.cat.beaches'),
                  transport: t('acc.cat.transport'), bikes: t('acc.cat.bikes'),
                }
                return (
                  <Box
                    key={cat.label}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    sx={{ cursor: 'default' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#475569' }}>
                        {cat.emoji} {catLabelMap[cat.label] ?? cat.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color }}>
                        {cat.pct}%
                      </Typography>
                    </Box>
                    <Box sx={{
                      height: 10, borderRadius: 5,
                      background: `${color}30`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <Box sx={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${cat.pct}%`,
                        background: color,
                        borderRadius: 5,
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Average dashed line indicator */}
            <Box sx={{
              mt: 0.5, pt: 1.5,
              borderTop: '1.5px dashed #E0D8CF',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#1A3C5E', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                {t('acc.avg')}{' '}
                <span style={{ fontWeight: 700, color: '#1A3C5E' }}>{data.avgPct}%</span>
              </Typography>
            </Box>
          </Box>

          {/* RIGHT — Barrier analysis */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>
              {t('acc.section.barriers')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortedBarriers.map((b, i) => {
                const color = barrierSeverityColor(i, sortedBarriers.length)
                const maxCount = 18
                const fillPct = Math.min(100, (b.count / maxCount) * 100)
                const barrierLabelMap: Record<string, string> = {
                  steps: t('acc.barrier.steps'), narrow: t('acc.barrier.narrow'),
                  signage: t('acc.barrier.signage'), elevators: t('acc.barrier.elevators'),
                  lighting: t('acc.barrier.lighting'),
                }
                return (
                  <Box key={b.label}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                      <Box sx={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: color, display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                          {b.count}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1 }}>
                        {barrierLabelMap[b.label] ?? b.label}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 7, borderRadius: 4, background: `${color}25`, overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%', width: `${fillPct}%`,
                        background: color, borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Recommendations */}
            <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #EDE8E3' }}>
              <Typography sx={{
                fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 600, mb: 1,
              }}>
                {t('acc.section.recs')}
              </Typography>

              {[
                { text: t('acc.rec.ramps'),    dot: '#EF4444', badge: t('acc.badge.high'),     badgeBg: '#EF444415', badgeColor: '#EF4444' },
                { text: t('acc.rec.sidewalks'),dot: '#F59E0B', badge: t('acc.badge.med'),      badgeBg: '#F59E0B15', badgeColor: '#F59E0B' },
                { text: t('acc.rec.signage'),  dot: '#2D6A4F', badge: t('acc.badge.progress'), badgeBg: '#2D6A4F15', badgeColor: '#2D6A4F' },
              ].map((rec) => (
                <Box key={rec.text} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  py: 0.6, borderBottom: '1px solid #F5F0EC',
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: rec.dot, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1 }}>
                    {rec.text}
                  </Typography>
                  <Box sx={{
                    px: 0.8, py: 0.2, borderRadius: '20px',
                    background: rec.badgeBg, border: `1px solid ${rec.badgeColor}40`,
                    flexShrink: 0,
                  }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: rec.badgeColor, whiteSpace: 'nowrap' }}>
                      {rec.badge}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
