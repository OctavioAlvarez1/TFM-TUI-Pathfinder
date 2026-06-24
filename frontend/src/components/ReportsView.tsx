import { useState } from 'react'
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
  Listo:      '#2D6A4F',
  Procesando: '#F59E0B',
  Programado: '#2E7D98',
}

const TYPE_COLORS: Record<ReportType, string> = {
  PDF:   '#EF4444',
  Excel: '#2D6A4F',
}

const COLUMN_LABELS = ['NOMBRE', 'TIPO', 'FECHA', 'ESTADO', 'ACCIONES']

// ── CSV generator (Excel reports) ─────────────────────────────────────────────
function buildCsv(report: Report, destName: string): string {
  const rows: string[][] = [
    ['TUI Pathfinder · Generador de Mapas de Accesibilidad & Movilidad Sostenible'],
    [],
    ['Informe',    report.name],
    ['Destino',    destName],
    ['Fecha',      report.date],
    ['Generado',   new Date().toLocaleDateString('es-ES')],
    [],
    ['MÉTRICAS PRINCIPALES', '', ''],
    ['Métrica', 'Valor', 'Periodo'],
    ['Pernoctaciones totales',      '847.234',  'Jun 2026'],
    ['Variación interanual',        '+12%',     'Jun 2026'],
    ['Índice de accesibilidad',     '7.4/10',   'Jun 2026'],
    ['Flujo de movilidad sostenible','38%',     'Jun 2026'],
    ['Incidencias registradas',     '5',        'Jun 2026'],
    ['Rutas turísticas activas',    '6',        'Jun 2026'],
    ['Paradas de transporte accesibles', '142', 'Jun 2026'],
    ['CO₂ evitado (kg/mes)',        '4.230',    'Jun 2026'],
    [],
    ['DISTRIBUCIÓN POR MODO DE TRANSPORTE', '', ''],
    ['Modo', 'Uso (%)', 'Variación YoY'],
    ['A pie',        '34%', '+4%'],
    ['Bicicleta',    '18%', '+9%'],
    ['Transporte público', '34%', '+6%'],
    ['Vehículo privado',  '14%', '-8%'],
    [],
    ['Informe generado automáticamente por TUI Pathfinder · TUI Care Foundation Future Shapers Spain'],
  ]
  return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\r\n')
}

// ── HTML generator (PDF reports — opens in new tab for Ctrl+P) ───────────────
function buildHtml(report: Report, destName: string): string {
  const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${report.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A3C5E; background: #fff; padding: 48px 52px; max-width: 860px; margin: 0 auto; }
  .logo-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 3px solid #C05928; }
  .logo-text { font-size: 20px; font-weight: 800; color: #1A3C5E; letter-spacing: -0.5px; }
  .logo-sub { font-size: 11px; color: #94A3B8; margin-top: 2px; }
  .badge { background: #C0592818; border: 1px solid #C0592850; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #C05928; }
  h1 { font-size: 22px; font-weight: 800; color: #1A3C5E; margin-bottom: 6px; }
  .meta { display: flex; gap: 24px; margin-bottom: 28px; }
  .meta span { font-size: 12px; color: #64748B; }
  .meta strong { color: #1A3C5E; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 12px; margin-top: 28px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
  .kpi { background: #F8F5F2; border: 1px solid #E0D8CF; border-top: 3px solid #1A3C5E; border-radius: 10px; padding: 12px; }
  .kpi.green { border-top-color: #2D6A4F; }
  .kpi.teal  { border-top-color: #2E7D98; }
  .kpi.red   { border-top-color: #EF4444; }
  .kpi-val { font-size: 26px; font-weight: 800; color: #1A3C5E; line-height: 1; margin-bottom: 2px; }
  .kpi-val.green { color: #2D6A4F; }
  .kpi-val.teal  { color: #2E7D98; }
  .kpi-val.red   { color: #EF4444; }
  .kpi-lbl { font-size: 10px; color: #94A3B8; }
  .kpi-delta { font-size: 10px; color: #2D6A4F; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94A3B8; text-align: left; padding: 8px 12px; background: #F8F5F2; border-bottom: 1px solid #E0D8CF; }
  td { font-size: 12px; color: #475569; padding: 9px 12px; border-bottom: 1px solid #F0EBE6; }
  tr:last-child td { border-bottom: none; }
  .tag { display: inline-block; background: #EFF6FF; border: 1px solid #2E7D9830; border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 600; color: #2E7D98; }
  .tag.green { background: #2D6A4F15; border-color: #2D6A4F40; color: #2D6A4F; }
  .bar-row { margin-bottom: 10px; }
  .bar-label { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 3px; }
  .bar-track { height: 8px; background: #E0D8CF; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: #1A3C5E; border-radius: 4px; }
  .bar-fill.green { background: #2D6A4F; }
  .bar-fill.teal { background: #2E7D98; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E0D8CF; display: flex; justify-content: space-between; align-items: center; }
  .footer-txt { font-size: 10px; color: #CBD5E1; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
<div class="logo-bar">
  <div>
    <div class="logo-text">TUI Pathfinder</div>
    <div class="logo-sub">Generador de Mapas de Accesibilidad &amp; Movilidad Sostenible · TUI Care Foundation</div>
  </div>
  <div class="badge">Informe Oficial</div>
</div>

<h1>${report.name}</h1>
<div class="meta">
  <span><strong>Destino:</strong> ${destName}</span>
  <span><strong>Fecha del informe:</strong> ${report.date}</span>
  <span><strong>Generado:</strong> ${now}</span>
  <span><strong>Tipo:</strong> ${report.type}</span>
</div>

<div class="section-title">Indicadores clave de desempeño</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">847K</div><div class="kpi-lbl">Pernoctaciones mes</div><div class="kpi-delta">↑ 12% vs año anterior</div></div>
  <div class="kpi green"><div class="kpi-val green">38%</div><div class="kpi-lbl">Flujo sostenible</div><div class="kpi-delta">↑ 8 pp vs año anterior</div></div>
  <div class="kpi teal"><div class="kpi-val teal">7.4</div><div class="kpi-lbl">Índice accesibilidad</div></div>
  <div class="kpi red"><div class="kpi-val red">5</div><div class="kpi-lbl">Incidencias activas</div><div class="kpi-delta" style="color:#EF4444">↓ 3 vs periodo anterior</div></div>
</div>

<div class="section-title">Distribución de movilidad</div>
<div class="bar-row"><div class="bar-label"><span>🚶 A pie</span><span>34%</span></div><div class="bar-track"><div class="bar-fill" style="width:34%"></div></div></div>
<div class="bar-row"><div class="bar-label"><span>🚌 Transporte público</span><span>34%</span></div><div class="bar-track"><div class="bar-fill teal" style="width:34%"></div></div></div>
<div class="bar-row"><div class="bar-label"><span>🚲 Bicicleta</span><span>18%</span></div><div class="bar-track"><div class="bar-fill green" style="width:18%"></div></div></div>
<div class="bar-row"><div class="bar-label"><span>🚗 Vehículo privado</span><span>14%</span></div><div class="bar-track"><div class="bar-fill" style="width:14%;background:#94A3B8"></div></div></div>

<div class="section-title">Recomendaciones prioritarias</div>
<table>
  <thead><tr><th>Acción</th><th>Categoría</th><th>Impacto</th><th>Plazo</th></tr></thead>
  <tbody>
    <tr><td>Instalar ascensores en estaciones de metro</td><td>Accesibilidad</td><td><span class="tag" style="background:#EF444415;border-color:#EF444440;color:#EF4444">Alto</span></td><td>12 sem.</td></tr>
    <tr><td>Ampliar red de carriles bici al sur</td><td>Movilidad</td><td><span class="tag" style="background:#F59E0B15;border-color:#F59E0B40;color:#F59E0B">Medio</span></td><td>20 sem.</td></tr>
    <tr><td>App móvil multimodal accesible</td><td>Digital</td><td><span class="tag" style="background:#EF444415;border-color:#EF444440;color:#EF4444">Alto</span></td><td>16 sem.</td></tr>
    <tr><td>Flota de autobuses eléctricos accesibles</td><td>Transporte</td><td><span class="tag" style="background:#F59E0B15;border-color:#F59E0B40;color:#F59E0B">Medio</span></td><td>36 sem.</td></tr>
    <tr><td>Señalética táctil en zona histórica</td><td>Señalización</td><td><span class="tag green">Bajo</span></td><td>8 sem.</td></tr>
  </tbody>
</table>

<div class="section-title">Impacto ambiental</div>
<table>
  <thead><tr><th>Indicador</th><th>Este periodo</th><th>Variación</th></tr></thead>
  <tbody>
    <tr><td>CO₂ evitado por movilidad sostenible</td><td>4.230 kg</td><td>↑ 18%</td></tr>
    <tr><td>Viajes en transporte público</td><td>142.500</td><td>↑ 11%</td></tr>
    <tr><td>Usuarios de bicicleta compartida</td><td>8.340</td><td>↑ 24%</td></tr>
    <tr><td>Puntos de recarga EV utilizados</td><td>1.230</td><td>↑ 9%</td></tr>
  </tbody>
</table>

<div class="footer">
  <div class="footer-txt">TUI Pathfinder · Reto 4 · TUI Care Foundation Future Shapers Spain · UCM TFM 2026</div>
  <div class="footer-txt">Documento generado automáticamente · ${now}</div>
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`
}

// ── Download trigger ──────────────────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function handleDownload(report: Report, destName: string) {
  const safeName = report.name.replace(/[^a-zA-Z0-9À-ÿ\s\-]/g, '').trim()
  if (report.type === 'Excel') {
    const csv  = buildCsv(report, destName)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    triggerDownload(blob, `${safeName}.csv`)
  } else {
    const html = buildHtml(report, destName)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 8000)
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <Box sx={{
      background: '#fff', border: '1px solid #E0D8CF', borderTop: `3px solid ${color}`,
      borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(26,60,94,0.07)', flex: 1, minWidth: 0,
    }}>
      <Typography sx={{ fontSize: '0.67rem', color: '#94A3B8', lineHeight: 1, mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
        {unit && <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{unit}</Typography>}
      </Box>
    </Box>
  )
}

function TypeBadge({ type }: { type: ReportType }) {
  const color = TYPE_COLORS[type]
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.9, py: 0.25, borderRadius: '6px', background: `${color}18`, border: `1px solid ${color}40` }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color }}>{type}</Typography>
    </Box>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: '20px', background: `${color}15`, border: `1px solid ${color}40` }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>{status}</Typography>
    </Box>
  )
}

function SpinnerIcon() {
  return (
    <Box sx={{
      width: 20, height: 20, border: '2px solid #F59E0B40', borderTop: '2px solid #F59E0B',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
      '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
    }} />
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function ReportsView() {
  const { destination } = useDestination()
  const [downloading, setDownloading] = useState<string | null>(null)

  function onDownload(report: Report) {
    setDownloading(report.name)
    // Slight delay so the UI updates before the blocking blob creation
    setTimeout(() => {
      handleDownload(report, destination.name)
      setDownloading(null)
    }, 80)
  }

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
              Informes
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
              {destination.name}
            </Typography>
          </Box>
        </Box>

        <Box
          component="button"
          onClick={() => onDownload({ name: `Dashboard Ejecutivo ${destination.name}`, type: 'PDF', date: new Date().toLocaleDateString('es-ES'), status: 'Listo' })}
          sx={{
            px: 1.8, py: 0.6, borderRadius: '8px', cursor: 'pointer',
            background: 'transparent', border: '1.5px solid #C05928',
            display: 'flex', alignItems: 'center', transition: 'all 0.15s',
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

        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <StatCard label="Informes disponibles" value={12}    color="#1A3C5E" />
          <StatCard label="Última generación"    value="Hoy"  color="#2D6A4F" />
          <StatCard label="Descargados este mes" value={47}   color="#2E7D98" />
        </Box>

        {/* Reports table */}
        <Box sx={{ background: '#fff', border: '1px solid #E0D8CF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(26,60,94,0.07)', overflow: 'hidden' }}>
          {/* Table header */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, background: '#F8F5F2', borderBottom: '1px solid #E0D8CF', gap: 1 }}>
            {COLUMN_LABELS.map((col) => (
              <Typography key={col} sx={{
                fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                flex: col === 'NOMBRE' ? 3 : col === 'ACCIONES' ? 0.7 : 1, minWidth: 0,
              }}>
                {col}
              </Typography>
            ))}
          </Box>

          {/* Table rows */}
          {REPORTS.map((report, i) => {
            const isDownloading = downloading === report.name
            return (
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
                <Typography sx={{
                  fontSize: '0.78rem', fontWeight: 700, color: '#1A3C5E',
                  flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {report.name}
                </Typography>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TypeBadge type={report.type} />
                </Box>

                <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', flex: 1, minWidth: 0 }}>
                  {report.date}
                </Typography>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <StatusBadge status={report.status} />
                </Box>

                <Box sx={{ flex: 0.7, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                  {report.status === 'Listo' && (
                    <IconButton
                      size="small"
                      disabled={isDownloading}
                      onClick={() => onDownload(report)}
                      title={`Descargar ${report.name}`}
                      sx={{
                        color: isDownloading ? '#CBD5E1' : '#2E7D98',
                        transition: 'all 0.15s',
                        '&:hover': { background: '#2E7D9815', transform: 'translateY(-1px)' },
                        '&:active': { transform: 'translateY(0)' },
                      }}
                    >
                      {isDownloading
                        ? <SpinnerIcon />
                        : <DownloadIcon sx={{ fontSize: '1rem' }} />
                      }
                    </IconButton>
                  )}
                  {report.status === 'Procesando' && <SpinnerIcon />}
                  {report.status === 'Programado' && (
                    <Box sx={{ px: 0.8, py: 0.25, borderRadius: '4px', background: '#2E7D9815', border: '1px solid #2E7D9840' }}>
                      <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: '#2E7D98', whiteSpace: 'nowrap' }}>
                        En cola
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
