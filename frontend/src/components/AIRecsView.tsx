import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useDestination } from '../context/DestinationContext'
import { useLanguage } from '../context/LanguageContext'

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
  Accesibilidad:  'Mejora el acceso para personas con movilidad reducida y usuarios de silla de ruedas.',
  Movilidad:      'Optimiza los desplazamientos entre zonas turísticas y facilita la intermodalidad.',
  Señalización:   'Garantiza una orientación clara y accesible para todos los perfiles de visitante.',
  Transporte:     'Potencia la oferta de transporte público y reduce la dependencia del vehículo privado.',
  Infraestructura:'Refuerza la capacidad física del destino para absorber flujos turísticos con calidad.',
  Digital:        'Digitaliza servicios de información y reservas para una experiencia más fluida e inclusiva.',
}

const IMPL_STEPS: Record<string, string[]> = {
  Accesibilidad:  ['Auditoría de barreras arquitectónicas con expertos PMR', 'Diseño técnico conforme a normativa AENOR', 'Licitación pública y selección de contratistas', 'Instalación, inspección y certificación final'],
  Movilidad:      ['Análisis de flujos de movilidad y puntos de congestión', 'Diseño de intervención con planificadores urbanos', 'Coordinación con ayuntamiento y operadores de transporte', 'Implementación por fases y evaluación continua'],
  Señalización:   ['Mapeo de rutas prioritarias y puntos de confusión', 'Diseño de sistema gráfico multiidioma e inclusivo', 'Prototipado y validación con grupos de usuarios reales', 'Instalación progresiva y mantenimiento programado'],
  Transporte:     ['Evaluación de la flota actual y estudio de demanda', 'Selección de tecnología y proveedores de vehículos', 'Adaptación de infraestructura (paradas, cargadores)', 'Puesta en marcha piloto y escala gradual'],
  Infraestructura:['Diagnóstico técnico del estado actual de activos', 'Plan director de inversiones y priorización', 'Ejecución por fases con mínima afección al visitante', 'Mantenimiento preventivo y monitoreo de rendimiento'],
  Digital:        ['Levantamiento de necesidades con usuarios objetivo', 'Diseño UX/UI accesible (WCAG 2.1 AA)', 'Desarrollo ágil con pruebas de usabilidad iterativas', 'Lanzamiento beta y despliegue progresivo multicanal'],
}

const KPIS: Record<'Alto' | 'Medio' | 'Bajo', { label: string; value: string }[]> = {
  Alto:  [{ label: 'Usuarios beneficiados', value: '+45%' }, { label: 'Satisfacción estimada', value: '8.6/10' }, { label: 'Reducción de incidencias', value: '-32%' }],
  Medio: [{ label: 'Usuarios beneficiados', value: '+22%' }, { label: 'Satisfacción estimada', value: '7.8/10' }, { label: 'Reducción de incidencias', value: '-18%' }],
  Bajo:  [{ label: 'Usuarios beneficiados', value: '+9%' },  { label: 'Satisfacción estimada', value: '7.2/10' }, { label: 'Reducción de incidencias', value: '-8%' }],
}

const STAKEHOLDERS: Record<string, string[]> = {
  Accesibilidad:  ['Ayuntamiento', 'ONCE / Fundación ONCE', 'Operadores turísticos'],
  Movilidad:      ['Consorcio de Transportes', 'DGT', 'Ayuntamiento'],
  Señalización:   ['Turismo municipal', 'Turespaña', 'Empresas de señalización'],
  Transporte:     ['EMT / Operador local', 'Consejería de Movilidad', 'TUI Care Foundation'],
  Infraestructura:['Ministerio de Fomento', 'Diputación Provincial', 'Empresas constructoras'],
  Digital:        ['Proveedor tecnológico', 'Usuarios piloto', 'TUI Care Foundation'],
}

const TUI_BENEFIT: Record<Priority, string> = {
  high:   'Impacto directo en la propuesta de valor diferencial de TUI para este destino.',
  medium: 'Refuerza la oferta de turismo responsable e inclusivo en la estrategia de TUI.',
  low:    'Contribuye a los objetivos de sostenibilidad a largo plazo de TUI Care Foundation.',
}

const LEVEL_OPTIONS: Array<'Alto' | 'Medio' | 'Bajo'> = ['Alto', 'Medio', 'Bajo']

const PRIORITY_COLORS: Record<Priority, string> = { high: '#EF4444', medium: '#F59E0B', low: '#2D6A4F' }
const PRIORITY_LABELS: Record<Priority, string>  = { high: 'Alta',    medium: 'Media',   low: 'Baja' }

const FILTER_OPTIONS: Array<{ key: FilterPriority; label: string }> = [
  { key: 'all', label: 'Todas' }, { key: 'high', label: 'Alta' },
  { key: 'medium', label: 'Media' }, { key: 'low', label: 'Baja' },
]

function levelColor(v: 'Alto' | 'Medio' | 'Bajo'): string {
  return v === 'Alto' ? '#EF4444' : v === 'Medio' ? '#F59E0B' : '#2D6A4F'
}

function pickLevel(rng: () => number): 'Alto' | 'Medio' | 'Bajo' {
  return LEVEL_OPTIONS[Math.floor(rng() * 3)]
}

function Chip({ label, bg, color, border }: { label: string; bg: string; color: string; border?: string }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 0.9, py: 0.25, borderRadius: '20px',
      background: bg, border: border ?? `1px solid ${color}40`, flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  )
}

// ── Expanded detail section ───────────────────────────────────────────────────
function RecDetail({ rec }: { rec: Recommendation }) {
  const { t } = useLanguage()

  const CAT_STEP_KEY: Record<string, string> = {
    Accesibilidad: 'ai.steps.access', Movilidad: 'ai.steps.mobility',
    Señalización: 'ai.steps.signage', Transporte: 'ai.steps.transport',
    Infraestructura: 'ai.steps.infra', Digital: 'ai.steps.digital',
  }
  const steps        = t((CAT_STEP_KEY[rec.category] ?? 'ai.steps.digital') as Parameters<typeof t>[0]).split('|')
  const kpis         = KPIS[rec.impact]
  const stakeholders = STAKEHOLDERS[rec.category] ?? []
  const tuiBenefit   = t(({ high: 'ai.tui.high', medium: 'ai.tui.med', low: 'ai.tui.low' } as const)[rec.priority])

  const KPI_LABELS = {
    'Usuarios beneficiados':     t('ai.kpi.users'),
    'Satisfacción estimada':     t('ai.kpi.satisfaction'),
    'Reducción de incidencias':  t('ai.kpi.incidents'),
  }
  const LEVEL_LABEL: Record<'Alto' | 'Medio' | 'Bajo', string> = {
    Alto: t('ai.level.high'), Medio: t('ai.level.med'), Bajo: t('ai.level.low'),
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>

      {/* Left: implementation steps */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{
          fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1,
        }}>
          {t('ai.detail.steps')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
          {steps.map((step, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: '#1A3C5E', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#fff' }}>{i + 1}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.71rem', color: '#475569', lineHeight: 1.4, pt: 0.2 }}>
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right: KPIs + stakeholders + TUI benefit */}
      <Box sx={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.4 }}>

        {/* KPIs */}
        <Box>
          <Typography sx={{
            fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.8,
          }}>
            {t('ai.detail.impact')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {kpis.map(kpi => (
              <Box key={kpi.label} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 1, py: 0.4, borderRadius: '8px', background: '#F8FAFC',
              }}>
                <Typography sx={{ fontSize: '0.66rem', color: '#64748B' }}>{KPI_LABELS[kpi.label as keyof typeof KPI_LABELS] ?? kpi.label}</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#1A3C5E' }}>{kpi.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stakeholders */}
        <Box>
          <Typography sx={{
            fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.8,
          }}>
            {t('ai.detail.stakeholders')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {stakeholders.map(s => (
              <Box key={s} sx={{
                px: 0.8, py: 0.25, borderRadius: '6px',
                background: '#F1F5F9', border: '1px solid #E2E8F0',
              }}>
                <Typography sx={{ fontSize: '0.63rem', color: '#475569', fontWeight: 500 }}>{s}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* TUI benefit */}
        <Box sx={{
          px: 1, py: 0.9, borderRadius: '8px',
          background: 'rgba(192,89,40,0.07)', border: '1px solid rgba(192,89,40,0.2)',
        }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#C05928', fontWeight: 700, mb: 0.3 }}>
            TUI Care Foundation
          </Typography>
          <Typography sx={{ fontSize: '0.67rem', color: '#92400E', lineHeight: 1.4 }}>
            {tuiBenefit}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function AIRecsView() {
  const { destination } = useDestination()
  const { t } = useLanguage()
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [expandedId, setExpandedId]         = useState<number | null>(null)

  const PRIORITY_LABELS_T: Record<Priority, string> = {
    high: t('ai.priority.high'), medium: t('ai.priority.med'), low: t('ai.priority.low'),
  }
  const FILTER_OPTIONS_T: Array<{ key: FilterPriority; label: string }> = [
    { key: 'all',    label: t('ai.filter.all') },
    { key: 'high',   label: t('ai.filter.high') },
    { key: 'medium', label: t('ai.filter.med') },
    { key: 'low',    label: t('ai.filter.low') },
  ]
  const CAT_LABEL: Record<string, string> = {
    Accesibilidad: t('ai.cat.access'), Movilidad: t('ai.cat.mobility'),
    Señalización: t('ai.cat.signage'), Transporte: t('ai.cat.transport'),
    Infraestructura: t('ai.cat.infra'), Digital: t('ai.cat.digital'),
  }
  const CAT_DESC: Record<string, string> = {
    Accesibilidad: t('ai.desc.access'), Movilidad: t('ai.desc.mobility'),
    Señalización: t('ai.desc.signage'), Transporte: t('ai.desc.transport'),
    Infraestructura: t('ai.desc.infra'), Digital: t('ai.desc.digital'),
  }
  const LEVEL_LABEL: Record<'Alto' | 'Medio' | 'Bajo', string> = {
    Alto: t('ai.level.high'), Medio: t('ai.level.med'), Bajo: t('ai.level.low'),
  }
  const TITLES_T = [
    t('ai.title.0'), t('ai.title.1'), t('ai.title.2'), t('ai.title.3'),
    t('ai.title.4'), t('ai.title.5'), t('ai.title.6'), t('ai.title.7'),
  ]

  const recommendations = useMemo<Recommendation[]>(() => {
    const rng = mkRng(destination.id + 'ai')
    const priorities: Priority[] = ['high', 'high', 'high', 'medium', 'medium', 'medium', 'low', 'low']
    return priorities.map((priority, i) => ({
      id: i + 1,
      priority,
      category:  CATEGORIES[Math.floor(rng() * CATEGORIES.length)],
      title:     TITLES_T[i],
      impact:    pickLevel(rng),
      cost:      pickLevel(rng),
      timeWeeks: Math.round(4 + rng() * 48),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.id, t])

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
            <Typography sx={{ fontSize: '0.63rem', color: '#94A3B8', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('ai.header')}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {FILTER_OPTIONS_T.map(({ key, label }) => {
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
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#fff' : '#64748B' }}>
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
          const isExpanded    = expandedId === rec.id

          return (
            <Box
              key={rec.id}
              sx={{
                background: '#fff',
                border: '1px solid #E0D8CF',
                borderLeft: `4px solid ${priorityColor}`,
                borderRadius: '12px',
                p: 2,
                boxShadow: isExpanded
                  ? '0 4px 20px rgba(26,60,94,0.12)'
                  : '0 2px 8px rgba(26,60,94,0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Row 1: priority + category + title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`● ${PRIORITY_LABELS_T[rec.priority]}`}
                  bg={`${priorityColor}18`}
                  color={priorityColor}
                  border={`1px solid ${priorityColor}50`}
                />
                <Chip label={CAT_LABEL[rec.category] ?? rec.category} bg="#F1F5F9" color="#475569" border="1px solid #E2E8F0" />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A3C5E', flex: 1, minWidth: 0 }}>
                  {rec.title}
                </Typography>
              </Box>

              {/* Row 2: impact + cost + time */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip label={`${t('ai.chip.impact')} ${LEVEL_LABEL[rec.impact as keyof typeof LEVEL_LABEL] ?? rec.impact}`} bg={`${levelColor(rec.impact)}15`} color={levelColor(rec.impact)} />
                <Chip label={`${t('ai.chip.cost')} ${LEVEL_LABEL[rec.cost as keyof typeof LEVEL_LABEL] ?? rec.cost}`}     bg={`${levelColor(rec.cost)}15`}   color={levelColor(rec.cost)} />
                <Chip label={`${rec.timeWeeks} ${t('ai.chip.weeks')}`} bg="#EFF6FF" color="#2E7D98" border="1px solid #2E7D9830" />
              </Box>

              {/* Row 3: description + toggle button */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.5, flex: 1 }}>
                  {CAT_DESC[rec.category]}
                </Typography>
                <Box
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  sx={{
                    fontSize: '0.72rem', fontWeight: 600,
                    color: isExpanded ? '#64748B' : '#C05928',
                    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                    px: 1.2, py: 0.4, borderRadius: '8px',
                    border: `1px solid ${isExpanded ? '#E2E8F0' : 'rgba(192,89,40,0.3)'}`,
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: isExpanded ? '#F8FAFC' : 'rgba(192,89,40,0.07)',
                      borderColor: isExpanded ? '#CBD5E1' : '#C05928',
                    },
                  }}
                >
                  {isExpanded ? t('ai.toggle.close') : t('ai.toggle.open')}
                </Box>
              </Box>

              {/* Expanded detail */}
              {isExpanded && (
                <Box sx={{
                  mt: 0.5, pt: 1.5,
                  borderTop: '1px solid #EDE8E3',
                }}>
                  <RecDetail rec={rec} />
                </Box>
              )}
            </Box>
          )
        })}

        {filtered.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 200 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              {t('ai.empty')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
