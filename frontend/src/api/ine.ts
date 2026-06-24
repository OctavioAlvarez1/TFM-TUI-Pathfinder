const INE_BASE = 'https://servicios.ine.es/wstempus/js/ES'
const EOH_TABLE = 2066  // EOH: Pernoctaciones por residencia y provincias (monthly)

// Destination ID → INE province name fragment for series matching
export const DEST_PROVINCE: Record<string, string> = {
  mallorca:        'Balears',
  ibiza:           'Balears',
  menorca:         'Balears',
  tenerife:        'Santa Cruz de Tenerife',
  'gran-canaria':  'Palmas',
  lanzarote:       'Palmas',
  'costa-del-sol': 'Málaga',
  marbella:        'Málaga',
  malaga:          'Málaga',
  sevilla:         'Sevilla',
  granada:         'Granada',
  'sierra-nevada': 'Granada',
  valencia:        'Valencia',
  alicante:        'Alicante',
  benidorm:        'Alicante',
  'costa-brava':   'Girona',
  barcelona:       'Barcelona',
  madrid:          'Madrid',
  bilbao:          'Vizcaya',
  'san-sebastian': 'Guipúzcoa',
  'picos-europa':  'Asturias',
}

export interface INEObs {
  date: Date
  year: number
  month: number  // 1-12
  pernoctaciones: number
}

// Module-level caches
let _tableData: Record<string, unknown>[] | null = null
const _destCache = new Map<string, INEObs[]>()

function parseDate(d: Record<string, unknown>): Date | null {
  if (d['Fecha']) return new Date(d['Fecha'] as string)
  if (d['Anyo'] && d['Periodo']) return new Date(Number(d['Anyo']), Number(d['Periodo']) - 1, 1)
  return null
}

async function loadTable(): Promise<Record<string, unknown>[]> {
  if (_tableData !== null) return _tableData
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  try {
    const r = await fetch(`${INE_BASE}/DATOS_TABLA/${EOH_TABLE}?nult=24&det=0`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!r.ok) throw new Error(`INE ${r.status}`)
    const json = await r.json()
    _tableData = Array.isArray(json) ? json : []
    return _tableData
  } catch {
    clearTimeout(timer)
    _tableData = []
    return _tableData
  }
}

export async function fetchPernoctaciones(destinationId: string): Promise<INEObs[]> {
  if (_destCache.has(destinationId)) return _destCache.get(destinationId)!

  const provinceName = DEST_PROVINCE[destinationId]
  if (!provinceName) return []

  try {
    const table = await loadTable()

    // Prefer series with "Total" to avoid domestic-only or foreign-only splits
    const match =
      table.find(s => {
        const n = String(s['Nombre'] ?? '')
        return n.includes(provinceName) && n.toLowerCase().includes('total')
      }) ??
      table.find(s => String(s['Nombre'] ?? '').includes(provinceName))

    if (!match) return []
    const rawData = match['Data']
    if (!Array.isArray(rawData) || rawData.length === 0) return []

    const obs: INEObs[] = rawData
      .filter((d: Record<string, unknown>) => d['Valor'] != null && !d['Secreto'])
      .map((d: Record<string, unknown>): INEObs | null => {
        const date = parseDate(d)
        if (!date) return null
        return {
          date,
          year:            date.getFullYear(),
          month:           date.getMonth() + 1,
          pernoctaciones:  Math.round(Number(d['Valor'])),
        }
      })
      .filter((x): x is INEObs => x !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (obs.length > 0) _destCache.set(destinationId, obs)
    return obs
  } catch {
    return []
  }
}
