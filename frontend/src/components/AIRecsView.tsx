import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useDestination } from '../context/DestinationContext'

function mkRng(seed: string) {
  let s = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 1)
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }
}

type Priority = 'high' | 'medium' | 'low'
type FilterPriority = 'all' | Priority

interface Recommendation {
  id: number
  priority: Priority
  category: string
  title: string
  impact: 'Alto' | 'Medio' | 'Bajo'
  cost: 'Alto' | 'Medio' | 'Bajo'
  timeWeeks: number
}

const CATEGORIES = ['Accesibilidad', 'Movilidad', 'Señalización', 'Transporte', 'Infraestructura', 'Digital']

const TITLES = [
  'Instalar ascensores en estaciones de metro',
  'Ampliar red de carriles bici al sur',
  'Señalética táctil en zona histórica',
  'Flota de autobuses eléctricos accesibles',
  'App móvil multimodal accesible',
  'Puntos de recarga EV en parking turístico',
  'Rediseño de pasos de peatones clave',
  'Sistema de monitoreo de flujos en tiempo real',
]

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Accesibilidad: 'Mejora el acceso para personas con movilidad reducida y usuarios de silla de ruedas.',
  Movilidad: 'Optimiza los desplazamientos entre zonas turísticas y facilita la intermodalidad.',
  Señalización: 'Garantiza una orientación clara y accesible para todos los perfiles de visitante.',
  Transporte: 'Potencia la oferta de transporte público y reduce la dependencia del vehículo privado.',
  Infraestructura: 'Refuerza la capacidad física del destino para absorber flujos turísticos con calidad.',
  Digital: 'Digitaliza servicios de información y reservas para una experiencia más fluida e inclusiva.',
}

const LEVEL_OPTIONS: Array<'Alto' | 'Medio' | 'Bajo'> = ['Alto', 'Medio', 'Bajo']

const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#2D6A4F',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const FILTER_OPTIONS: Array<{ key: FilterPriority; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'high', label: 'Alta' },
  { key: 'medium', label: 'Media' },
  { key: 'low', label: 'Baja' },
]

function pickLevel(rng: () => number): 'Alto' | 'Medio' | 'Bajo' {
  return LEVEL_OPTIONS[Math.floor(rng() * 3)]
}

function Chip({ label, bg, color, border }: { label: string; bg: string; color: string; border?: string }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 0.9, py: 0.25, borderRadius: '20px',
      background: bg,
      border: border ?? `1px solid ${color}40`,
      flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  )
}

export default function AIRecsView() {
  const { destination } = useDestination()
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')

  const recommendations = useMemo<Recommendation[]>(() => {
    const rng = mkRng(destination.id + 'ai')

    const priorities: Priority[] = [
      'high', 'high', 'high',
      'medium', 'medium', 'medium',
      'low', 'low',
    ]

    return priorities.map((priority, i) => ({
      id: i + 1,
      priority,
      category: CATEGORIES[Math.floor(rng() * CATEGORIES.length)],
      title: TITLES[i],
      impact: pickLevel(rng),
      cost: pickLevel(rng),
      timeWeeks: Math.round(4 + rng() * 48),
    }))
  }, [destination.id])

  const filtered = useMemo(
    () => filterPriority === 'all' ? recommendations : recommendations.filter(r => r.priority === filterPriority),
    [recommendations, filterPriority],
  )

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
              Recomendaciones IA
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        {/* Filter pills */}
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {FILTER_OPTIONS.map(({ key, label }) => {
            const active = filterPriority === key
            return (
              <Box
                key={key}
                onClick={() => setFilterPriority(key)}
                sx={{
                  px: 1.4, py: 0.5, borderRadius: '20px', cursor: 'pointer',
                  background: active ? '#1A3C5E' : 'transparent',
                  border: `1px solid ${active ? '#1A3C5E' : '#CBD5E1'}`,
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#1A3C5E' },
                }}
              >
                <Typography sx={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: active ? '#fff' : '#64748B',
                }}>
                  {label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filtered.map((rec) => {
          const priorityColor = PRIORITY_COLORS[rec.priority]
          return (
            <Box
              key={rec.id}
              sx={{
                background: '#fff',
                border: '1px solid #E0D8CF',
                borderLeft: `4px solid ${priorityColor}`,
                borderRadius: '12px',
                p: 2,
                boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {/* Row 1: priority badge + category + title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`● ${PRIORITY_LABELS[rec.priority]}`}
                  bg={`${priorityColor}18`}
                  color={priorityColor}
                  border={`1px solid ${priorityColor}50`}
                />
                <Chip
                  label={rec.category}
                  bg="#F1F5F9"
                  color="#475569"
                  border="1px solid #E2E8F0"
                />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A3C5E', flex: 1, minWidth: 0 }}>
                  {rec.title}
                </Typography>
              </Box>

              {/* Row 2: impact + cost + time chips */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip
                  label={`Impacto: ${rec.impact}`}
                  bg={rec.impact === 'Alto' ? '#EF444415' : rec.impact === 'Medio' ? '#F59E0B15' : '#2D6A4F15'}
                  color={rec.impact === 'Alto' ? '#EF4444' : rec.impact === 'Medio' ? '#F59E0B' : '#2D6A4F'}
                />
                <Chip
                  label={`Coste: ${rec.cost}`}
                  bg={rec.cost === 'Alto' ? '#EF444415' : rec.cost === 'Medio' ? '#F59E0B15' : '#2D6A4F15'}
                  color={rec.cost === 'Alto' ? '#EF4444' : rec.cost === 'Medio' ? '#F59E0B' : '#2D6A4F'}
                />
                <Chip
                  label={`Plazo: ${rec.timeWeeks} sem.`}
                  bg="#EFF6FF"
                  color="#2E7D98"
                  border="1px solid #2E7D9830"
                />
              </Box>

              {/* Row 3: description + link */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.5, flex: 1 }}>
                  {CATEGORY_DESCRIPTIONS[rec.category]}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.72rem', fontWeight: 600, color: '#C05928',
                    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Ver detalle →
                </Typography>
              </Box>
            </Box>
          )
        })}

        {filtered.length === 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 1, minHeight: 200,
          }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              No hay recomendaciones para este filtro.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
