import { useMemo } from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { useDestination } from '../context/DestinationContext'

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

interface KPIData {
  cycleNetwork: number
  bikeStations: number
  emissionsAvoided: number
  transitCoverage: number
}

interface ModalShare {
  walk: number
  bike: number
  transit: number
  car: number
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

export default function MobilityView() {
  const { destination } = useDestination()

  const data = useMemo(() => {
    const rng = mkRng(destination.id + 'mob')

    const kpi: KPIData = {
      cycleNetwork: Math.round(12 + rng() * 73),
      bikeStations: Math.round(8 + rng() * 52),
      emissionsAvoided: Math.round(3 + rng() * 25),
      transitCoverage: Math.round(40 + rng() * 54),
    }

    // Modal share — must sum to 100
    const rawWalk = 20 + rng() * 20       // 20–40
    const rawBike = 5 + rng() * 20        // 5–25
    const rawTransit = 20 + rng() * 20    // 20–40
    const rawCar = 20 + rng() * 25        // 20–45
    const rawTotal = rawWalk + rawBike + rawTransit + rawCar
    const modal: ModalShare = {
      walk: Math.round((rawWalk / rawTotal) * 100),
      bike: Math.round((rawBike / rawTotal) * 100),
      transit: Math.round((rawTransit / rawTotal) * 100),
      car: 0,
    }
    modal.car = 100 - modal.walk - modal.bike - modal.transit

    // Emission values
    const carEmissions = Math.round(1800 + rng() * 1400)   // 1800–3200
    const busEmissions = Math.round(120 + rng() * 160)     // 120–280

    // Objective 2026
    const bikeTarget = 20
    const bikeCurrentPct = modal.bike
    const targetMet = bikeCurrentPct >= bikeTarget

    return { kpi, modal, carEmissions, busEmissions, bikeTarget, bikeCurrentPct, targetMet }
  }, [destination.id])

  // Build conic gradient for donut
  const donutGradient = useMemo(() => {
    const { walk, bike, transit, car } = data.modal
    let acc = 0
    const seg = (pct: number, color: string) => {
      const start = acc
      acc += pct
      return `${color} ${start}% ${acc}%`
    }
    return `conic-gradient(${[
      seg(walk, '#2D6A4F'),
      seg(bike, '#2E7D98'),
      seg(transit, '#1A3C5E'),
      seg(car, '#EF4444'),
    ].join(', ')})`
  }, [data.modal])

  const maxEmission = data.carEmissions

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
              Movilidad Sostenible
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
            label="Red ciclista"
            value={data.kpi.cycleNetwork}
            unit="km"
            color="#2D6A4F"
            delta="↑ 4 km nuevos este mes"
            deltaPositive
          />
          <KPICard
            label="Estaciones bici"
            value={data.kpi.bikeStations}
            unit=""
            color="#2E7D98"
            delta="↑ 2 estaciones nuevas"
            deltaPositive
          />
          <KPICard
            label="Emisiones evitadas"
            value={data.kpi.emissionsAvoided}
            unit="t CO₂"
            color="#10B981"
            delta="↑ 12% vs mes anterior"
            deltaPositive
          />
          <KPICard
            label="Cobertura transporte"
            value={data.kpi.transitCoverage}
            unit="%"
            color="#1A3C5E"
            delta={`↑ ${Math.max(1, Math.round(data.kpi.transitCoverage * 0.03))}% vs año anterior`}
            deltaPositive
          />
        </Box>

        {/* Two-column content */}
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>

          {/* LEFT — Modal split donut */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>
              Reparto modal de viajes
            </Typography>

            {/* Donut */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
              <Box sx={{
                width: 160, height: 160, borderRadius: '50%',
                background: donutGradient,
                position: 'relative',
                boxShadow: '0 4px 16px rgba(26,60,94,0.12)',
              }}>
                {/* Hole */}
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.3 }}>
                    Movilidad{'\n'}sostenible
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1A3C5E', lineHeight: 1 }}>
                    {data.modal.walk + data.modal.bike + data.modal.transit}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
              {[
                { emoji: '🚶', label: 'A pie', pct: data.modal.walk, color: '#2D6A4F', change: '+3%', up: true },
                { emoji: '🚲', label: 'Bicicleta', pct: data.modal.bike, color: '#2E7D98', change: '+5%', up: true },
                { emoji: '🚌', label: 'Transporte público', pct: data.modal.transit, color: '#1A3C5E', change: '+2%', up: true },
                { emoji: '🚗', label: 'Vehículo privado', pct: data.modal.car, color: '#EF4444', change: '-4%', up: false },
              ].map((mode) => (
                <Box key={mode.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: mode.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1 }}>
                    {mode.emoji} {mode.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: mode.color, minWidth: 30, textAlign: 'right' }}>
                    {mode.pct}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: mode.up ? '#2D6A4F' : '#EF4444', minWidth: 32, textAlign: 'right' }}>
                    {mode.change}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* RIGHT — Emissions + 2026 target */}
          <Box sx={{
            flex: 1, background: '#fff', border: '1px solid #E0D8CF',
            borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}>
            <Typography sx={{
              fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>
              CO₂ emitido por modo (g/viaje)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                { emoji: '🚗', label: 'Vehículo privado', value: data.carEmissions, color: '#EF4444' },
                { emoji: '🚌', label: 'Bus eléctrico', value: data.busEmissions, color: '#F59E0B' },
                { emoji: '🚲', label: 'Bicicleta', value: 0, color: '#2D6A4F' },
                { emoji: '🚶', label: 'A pie', value: 0, color: '#2D6A4F' },
              ].map((mode) => (
                <Box key={mode.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#475569' }}>
                      {mode.emoji} {mode.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: mode.color }}>
                      {mode.value === 0 ? '0 g' : `${mode.value.toLocaleString('es-ES')} g`}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 10, borderRadius: 5, background: `${mode.color}25`, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%',
                      width: mode.value === 0 ? '2%' : `${(mode.value / maxEmission) * 100}%`,
                      background: mode.value === 0 ? `${mode.color}50` : mode.color,
                      borderRadius: 5,
                      transition: 'width 0.4s ease',
                    }} />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{
              mt: 0.5, px: 1.5, py: 1, borderRadius: '10px',
              background: '#F0FBF6', border: '1px solid #2D6A4F30',
            }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#2D6A4F', fontWeight: 600 }}>
                Reducción del 8% en emisiones totales ↓
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748B' }}>
                Comparativa vs año anterior
              </Typography>
            </Box>

            {/* 2026 Target */}
            <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #EDE8E3' }}>
              <Typography sx={{
                fontSize: '0.63rem', color: '#94A3B8', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 600, mb: 1,
              }}>
                Objetivo 2026
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#475569' }}>
                  Cuota bicicleta: {data.bikeCurrentPct}% / meta {data.bikeTarget}%
                </Typography>
                {data.targetMet ? (
                  <Box sx={{
                    px: 0.9, py: 0.2, borderRadius: '20px',
                    background: '#2D6A4F15', border: '1px solid #2D6A4F40',
                  }}>
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#2D6A4F' }}>
                      Meta alcanzada ✓
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{
                    px: 0.9, py: 0.2, borderRadius: '20px',
                    background: '#2E7D9815', border: '1px solid #2E7D9840',
                  }}>
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#2E7D98' }}>
                      En camino
                    </Typography>
                  </Box>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (data.bikeCurrentPct / data.bikeTarget) * 100)}
                sx={{
                  height: 8, borderRadius: 4,
                  backgroundColor: '#E0D8CF',
                  '& .MuiLinearProgress-bar': {
                    background: data.targetMet
                      ? 'linear-gradient(90deg, #2D6A4F, #10B981)'
                      : 'linear-gradient(90deg, #2E7D98, #1A3C5E)',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
