import { Box, Typography, IconButton } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { useDestination } from '../context/DestinationContext'

type ReportStatus = 'Listo' | 'Procesando' | 'Programado'
type ReportType = 'PDF' | 'Excel'

interface Report {
  name: string
  type: ReportType
  date: string
  status: ReportStatus
}

const REPORTS: Report[] = [
  { name: 'Informe de Accesibilidad Q2 2026',     type: 'PDF',   date: '15 jun 2026', status: 'Listo' },
  { name: 'Análisis de Movilidad Mensual',         type: 'Excel', date: '01 jun 2026', status: 'Listo' },
  { name: 'Mapa de Concentración Turística',       type: 'PDF',   date: '28 may 2026', status: 'Listo' },
  { name: 'Recomendaciones IA - Mayo 2026',        type: 'PDF',   date: '20 may 2026', status: 'Listo' },
  { name: 'Informe de Rutas Accesibles',           type: 'PDF',   date: '10 may 2026', status: 'Listo' },
  { name: 'Dashboard Ejecutivo - Abril 2026',      type: 'PDF',   date: '30 abr 2026', status: 'Listo' },
  { name: 'Análisis de Emisiones CO₂',             type: 'Excel', date: '15 abr 2026', status: 'Procesando' },
  { name: 'Benchmarking Regional 2026',            type: 'PDF',   date: 'En proceso',  status: 'Programado' },
]

const STATUS_COLORS: Record<ReportStatus, string> = {
  Listo:       '#2D6A4F',
  Procesando:  '#F59E0B',
  Programado:  '#2E7D98',
}

const TYPE_COLORS: Record<ReportType, string> = {
  PDF:   '#EF4444',
  Excel: '#2D6A4F',
}

const COLUMN_LABELS = ['NOMBRE', 'TIPO', 'FECHA', 'ESTADO', 'ACCIONES']

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
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
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{unit}</Typography>
        )}
      </Box>
    </Box>
  )
}

function TypeBadge({ type }: { type: ReportType }) {
  const color = TYPE_COLORS[type]
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 0.9, py: 0.25, borderRadius: '6px',
      background: `${color}18`,
      border: `1px solid ${color}40`,
    }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color }}>
        {type}
      </Typography>
    </Box>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 1, py: 0.3, borderRadius: '20px',
      background: `${color}15`,
      border: `1px solid ${color}40`,
    }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>
        {status}
      </Typography>
    </Box>
  )
}

function SpinnerIcon() {
  return (
    <Box
      sx={{
        width: 20, height: 20,
        border: '2px solid #F59E0B40',
        borderTop: '2px solid #F59E0B',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      }}
    />
  )
}

export default function ReportsView() {
  const { destination } = useDestination()

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
              Informes
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        {/* New report button */}
        <Box
          component="button"
          onClick={() => console.log('generate')}
          sx={{
            px: 1.8, py: 0.6, borderRadius: '8px', cursor: 'pointer',
            background: 'transparent',
            border: '1.5px solid #C05928',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.15s',
            '&:hover': { background: '#C0592810' },
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#C05928' }}>
            + Nuevo informe
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Stat cards row */}
        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <StatCard label="Informes disponibles" value={12} color="#1A3C5E" />
          <StatCard label="Última generación"    value="Hoy" color="#2D6A4F" />
          <StatCard label="Descargados este mes" value={47} color="#2E7D98" />
        </Box>

        {/* Reports table */}
        <Box sx={{
          background: '#fff',
          border: '1px solid #E0D8CF',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            px: 2, py: 1,
            background: '#F8F5F2',
            borderBottom: '1px solid #E0D8CF',
            gap: 1,
          }}>
            {COLUMN_LABELS.map((col) => (
              <Typography
                key={col}
                sx={{
                  fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  flex: col === 'NOMBRE' ? 3 : col === 'ACCIONES' ? 0.7 : 1,
                  minWidth: 0,
                }}
              >
                {col}
              </Typography>
            ))}
          </Box>

          {/* Table rows */}
          {REPORTS.map((report, i) => (
            <Box
              key={report.name}
              sx={{
                display: 'flex', alignItems: 'center',
                px: 2, py: 1.25,
                background: i % 2 === 0 ? '#fff' : '#FAFAF8',
                borderBottom: i < REPORTS.length - 1 ? '1px solid #F0EBE6' : 'none',
                gap: 1,
                transition: 'background 0.1s',
                '&:hover': { background: '#F5F0EC' },
              }}
            >
              {/* Name */}
              <Typography sx={{
                fontSize: '0.78rem', fontWeight: 700, color: '#1A3C5E',
                flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {report.name}
              </Typography>

              {/* Type */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TypeBadge type={report.type} />
              </Box>

              {/* Date */}
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', flex: 1, minWidth: 0 }}>
                {report.date}
              </Typography>

              {/* Status */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatusBadge status={report.status} />
              </Box>

              {/* Actions */}
              <Box sx={{ flex: 0.7, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                {report.status === 'Listo' && (
                  <IconButton
                    size="small"
                    onClick={() => console.log('download', report.name)}
                    sx={{
                      color: '#2E7D98',
                      '&:hover': { background: '#2E7D9815' },
                    }}
                  >
                    <DownloadIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                )}
                {report.status === 'Procesando' && <SpinnerIcon />}
                {report.status === 'Programado' && (
                  <Box sx={{
                    px: 0.8, py: 0.25, borderRadius: '4px',
                    background: '#2E7D9815', border: '1px solid #2E7D9840',
                  }}>
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: '#2E7D98', whiteSpace: 'nowrap' }}>
                      En cola
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
