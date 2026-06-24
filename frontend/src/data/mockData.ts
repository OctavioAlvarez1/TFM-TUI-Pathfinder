export interface KPI {
  label: string
  value: string
  unit?: string
  delta: string
  icon: string
  color: string
}

export interface Opportunity {
  name: string
  issue: string
  priority: 'Alta' | 'Media' | 'Baja'
  priorityColor: string
}

export interface Recommendation {
  num: number
  title: string
  description: string
  impact: string
  cost: 'Bajo' | 'Medio' | 'Alto'
  priority: 'Alta' | 'Media' | 'Baja'
  impactPct: string
  lat: number
  lon: number
  lat2: number
  lon2: number
}

export interface TouristProfile {
  id: string
  label: string
  icon: string
  filters: string[]
}

// ── Seeded per-destination generators ────────────────────────────────────────
function hash(id: string): number {
  let h = 5381
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) & 0xFFFFFF
  return h
}

function sr(seed: number, offset: number, min: number, max: number): number {
  const x = Math.sin(seed * 0.0001 + offset * 9.7) * 43758.5453
  return min + Math.round((x - Math.floor(x)) * (max - min))
}

export function getDestinationKPIs(destinationId: string, lang: 'es' | 'en' = 'es'): KPI[] {
  const s = hash(destinationId)
  const acc  = sr(s, 0,  65, 96)
  const mob  = sr(s, 1,  52, 91)
  const trn  = sr(s, 2,  58, 95)
  const co2  = (sr(s, 3, 8, 48) / 10).toFixed(1)
  const time = sr(s, 4,  7, 24)
  const dest = sr(s, 5, 88, 195)
  const dAcc  = sr(s, 10, 3, 18)
  const dMob  = sr(s, 11, 2, 13)
  const dTrn  = sr(s, 12, 1, 11)
  const dCo2  = sr(s, 13, 7, 21)
  const dTime = sr(s, 14, 1, 5)
  const dDest = sr(s, 15, 4, 26)
  const vsMonth = lang === 'en' ? 'vs last month' : 'vs mes anterior'
  const newWord  = lang === 'en' ? 'new' : 'nuevos'
  const labels = lang === 'en'
    ? ['Accessibility Index', 'Sustainable Mobility', 'Transport Coverage', 'Avoided Emissions', 'Avg. Access Time', 'Accessible Destinations']
    : ['Índice de Accesibilidad', 'Movilidad Sostenible', 'Cobertura Transporte', 'Emisiones Evitadas', 'Tiempo Medio de Acceso', 'Destinos Accesibles']
  return [
    { label: labels[0], value: String(acc),  unit: '/100',   delta: `+${dAcc}% ${vsMonth}`,     icon: '♿', color: '#1A3C5E' },
    { label: labels[1], value: String(mob),  unit: '/100',   delta: `+${dMob}% ${vsMonth}`,     icon: '🌱', color: '#2D6A4F' },
    { label: labels[2], value: String(trn),  unit: '%',      delta: `+${dTrn}% ${vsMonth}`,     icon: '🚌', color: '#7B5E3A' },
    { label: labels[3], value: String(co2),  unit: 't CO₂',  delta: `+${dCo2}% ${vsMonth}`,     icon: '💚', color: '#2E7D98' },
    { label: labels[4], value: String(time), unit: 'min',    delta: `−${dTime} min ${vsMonth}`, icon: '⏱', color: '#C05928' },
    { label: labels[5], value: String(dest), unit: '',       delta: `+${dDest} ${newWord}`,      icon: '📍', color: '#8B2232' },
  ]
}

export function getDestinationEvolution(destinationId: string) {
  const s = hash(destinationId)
  const base = {
    acc: sr(s, 20, 55, 78), mob: sr(s, 21, 45, 68),
    trn: sr(s, 22, 52, 74), sos: sr(s, 23, 40, 63),
  }
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return MESES.map((mes, i) => ({
    mes,
    accesibilidad:   Math.min(99, base.acc + sr(s, 30 + i, 1, 5) * i),
    movilidad:       Math.min(99, base.mob + sr(s, 40 + i, 1, 4) * i),
    transporte:      Math.min(99, base.trn + sr(s, 50 + i, 1, 5) * i),
    sostenibilidad:  Math.min(99, base.sos + sr(s, 60 + i, 1, 4) * i),
  }))
}

export interface ModalEntry { name: string; value: number; color: string }

const ZONE_POOL: Record<string, Array<{ name: string; issue: string; priority: 'Alta' | 'Media' | 'Baja'; priorityColor: string }>> = {
  mallorca:    [{ name: 'Puerto de Palma',    issue: 'Congestión portuaria',    priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Playa de Muro',       issue: 'Acceso limitado PMR',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Serra de Tramuntana', issue: 'Rutas ciclistas',        priority: 'Baja',  priorityColor: '#10B981' }],
  ibiza:       [{ name: 'Ibiza Ciudad',       issue: 'Acceso casco histórico',  priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Playa d\'en Bossa',   issue: 'Transporte nocturno',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Santa Eulàlia',       issue: 'Ciclovías costeras',     priority: 'Baja',  priorityColor: '#10B981' }],
  menorca:     [{ name: 'Mahón Puerto',       issue: 'Señalización accesible',  priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Ciutadella',          issue: 'Movilidad peatonal',      priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Cala Galdana',        issue: 'Aparcamiento disuasorio',priority: 'Baja',  priorityColor: '#10B981' }],
  tenerife:    [{ name: 'Playa de las Américas', issue: 'Accesibilidad playa',  priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Los Gigantes',        issue: 'Conectividad bus',        priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Santa Cruz',          issue: 'Infraestructura ciclista',priority: 'Baja', priorityColor: '#10B981' }],
  'gran-canaria': [{ name: 'Maspalomas',      issue: 'Accesibilidad dunas',     priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Las Canteras',        issue: 'Transporte público',      priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Puerto Mogán',        issue: 'Ciclovías costeras',     priority: 'Baja',  priorityColor: '#10B981' }],
  lanzarote:   [{ name: 'Puerto del Carmen',  issue: 'Baja accesibilidad PMR',  priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Timanfaya',           issue: 'Acceso transporte',       priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Playa Blanca',        issue: 'Señalización turística', priority: 'Baja',  priorityColor: '#10B981' }],
  'costa-del-sol': [{ name: 'Torremolinos',   issue: 'Paseo marítimo PMR',      priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Fuengirola',          issue: 'Bus lanzadera playa',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Nerja',               issue: 'Ciclovías interiores',   priority: 'Baja',  priorityColor: '#10B981' }],
  marbella:    [{ name: 'Puerto Banús',       issue: 'Congestión vial',         priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Playa de Marbella',   issue: 'Transporte nocturno',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Casco Antiguo',       issue: 'Accesibilidad histórica',priority: 'Baja',  priorityColor: '#10B981' }],
  malaga:      [{ name: 'Malagueta',          issue: 'Acceso playa PMR',        priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Centro histórico',    issue: 'Movilidad peatonal',      priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Pedregalejo',         issue: 'Ciclovías costeras',     priority: 'Baja',  priorityColor: '#10B981' }],
  sevilla:     [{ name: 'Triana',             issue: 'Baja accesibilidad',      priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Macarena',            issue: 'Conectividad limitada',   priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Nervión',             issue: 'Mejora ciclovías',       priority: 'Baja',  priorityColor: '#10B981' }],
  granada:     [{ name: 'Albaicín',           issue: 'Acceso pendiente PMR',    priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Realejo',             issue: 'Transporte limitado',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Zaidín',              issue: 'Rutas ciclistas',        priority: 'Baja',  priorityColor: '#10B981' }],
  valencia:    [{ name: 'Playa Malvarrosa',   issue: 'Baja accesibilidad',      priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Cabanyal',            issue: 'Conectividad limitada',   priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Benimaclet',          issue: 'Mejora ciclovías',       priority: 'Media', priorityColor: '#F59E0B' }],
  alicante:    [{ name: 'Playa del Postiguet',issue: 'Acceso PMR deficiente',   priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'El Barrio',           issue: 'Transporte nocturno',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Cabo de las Huertas', issue: 'Ciclovías costeras',     priority: 'Baja',  priorityColor: '#10B981' }],
  benidorm:    [{ name: 'Playa de Levante',   issue: 'Congestión veraniega',    priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Rincón de Loix',      issue: 'Accesibilidad PMR',       priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Sierra Helada',       issue: 'Rutas senderismo',       priority: 'Baja',  priorityColor: '#10B981' }],
  'costa-brava': [{ name: 'Lloret de Mar',    issue: 'Transporte nocturno',     priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Tossa de Mar',        issue: 'Acceso PMR playas',       priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Blanes',              issue: 'Ciclovías interior',     priority: 'Baja',  priorityColor: '#10B981' }],
  barcelona:   [{ name: 'La Barceloneta',     issue: 'Masificación turística',  priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Gràcia',              issue: 'Conectividad metro',      priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Montjuïc',            issue: 'Accesibilidad colina',   priority: 'Baja',  priorityColor: '#10B981' }],
  madrid:      [{ name: 'Sol-Gran Vía',       issue: 'Saturación peatonal',     priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'La Latina',           issue: 'Acceso PMR calles',       priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Retiro',              issue: 'Ciclovías parque',       priority: 'Baja',  priorityColor: '#10B981' }],
  bilbao:      [{ name: 'Casco Viejo',        issue: 'Accesibilidad ladera',    priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Abandoibarra',        issue: 'Transporte nocturno',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Begoña',              issue: 'Ciclovías colinas',      priority: 'Baja',  priorityColor: '#10B981' }],
  'san-sebastian': [{ name: 'La Concha',      issue: 'Acceso playa PMR',        priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Parte Vieja',         issue: 'Congestión peatonal',     priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Gros',                issue: 'Ciclovías ribera',       priority: 'Baja',  priorityColor: '#10B981' }],
  'picos-de-europa': [{ name: 'Poncebos',    issue: 'Acceso PMR montaña',      priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Cangas de Onís',      issue: 'Transporte rural',        priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Covadonga',           issue: 'Señalización senderismo',priority: 'Baja',  priorityColor: '#10B981' }],
  'sierra-nevada': [{ name: 'Pradollano',     issue: 'Acceso invierno PMR',     priority: 'Alta',  priorityColor: '#EF4444' }, { name: 'Capileira',           issue: 'Transporte alpujarras',  priority: 'Media', priorityColor: '#F59E0B' }, { name: 'Trevélez',            issue: 'Rutas senderismo',       priority: 'Baja',  priorityColor: '#10B981' }],
}

const ZONE_FALLBACK = [
  { name: 'Zona costera',     issue: 'Acceso PMR playas',    priority: 'Alta'  as const, priorityColor: '#EF4444' },
  { name: 'Centro urbano',    issue: 'Conectividad limitada',priority: 'Media' as const, priorityColor: '#F59E0B' },
  { name: 'Área periférica',  issue: 'Ciclovías pendientes', priority: 'Baja'  as const, priorityColor: '#10B981' },
]

export function getDestinationOpportunities(destinationId: string) {
  return ZONE_POOL[destinationId] ?? ZONE_FALLBACK
}

export function getDestinationModal(destinationId: string): { entries: ModalEntry[]; total: number } {
  const s = hash(destinationId)
  const walk  = sr(s, 70, 35, 55)
  const bus   = sr(s, 71, 18, 32)
  const bike  = sr(s, 72,  8, 20)
  const car   = 100 - walk - bus - bike
  const total = sr(s, 73, 12000, 48000)
  return {
    entries: [
      { name: 'A pie',              value: walk, color: '#2D6A4F' },
      { name: 'Transporte público', value: bus,  color: '#1A3C5E' },
      { name: 'Bicicleta',          value: bike, color: '#2E7D98' },
      { name: 'Vehículo privado',   value: car,  color: '#C05928' },
    ],
    total,
  }
}

// Legacy static (unused by components, kept for compatibility)
export const kpis: KPI[] = getDestinationKPIs('valencia')
export const evolutionData = getDestinationEvolution('valencia')

export const modalData = [
  { name: 'A pie',             value: 48, color: '#10B981' },
  { name: 'Transporte público',value: 26, color: '#818CF8' },
  { name: 'Bicicleta',         value: 16, color: '#0DD3C5' },
  { name: 'Vehículo privado',  value: 10, color: '#F97316' },
]

export const opportunities: Opportunity[] = [
  { name: 'Playa Malvarrosa', issue: 'Baja accesibilidad',     priority: 'Alta',  priorityColor: '#EF4444' },
  { name: 'Cabanyal',         issue: 'Conectividad limitada',  priority: 'Media', priorityColor: '#F59E0B' },
  { name: 'Benimaclet',       issue: 'Mejora ciclovías',       priority: 'Media', priorityColor: '#F59E0B' },
]

export const recommendations: Recommendation[] = [
  {
    num: 1, title: 'Conectar Hotel X con Playa Malvarrosa',
    description: 'Nueva ruta ciclista de 2.3 km entre el eje hotelero y la playa',
    impact: '+18% accesibilidad', cost: 'Medio', priority: 'Alta', impactPct: '+18%',
    lat: 39.475, lon: -0.373, lat2: 39.478, lon2: -0.330,
  },
  {
    num: 2, title: 'Nueva ruta ciclista Centro ↔ Playa',
    description: 'Carril bici segregado de 3.1 km por el Paseo de Neptuno',
    impact: '+22% movilidad sostenible', cost: 'Bajo', priority: 'Alta', impactPct: '+22%',
    lat: 39.469, lon: -0.377, lat2: 39.478, lon2: -0.330,
  },
  {
    num: 3, title: 'Mejorar transporte nocturno',
    description: 'Nueva línea lanzadera entre el centro y los hoteles de playa (22h–2h)',
    impact: '+15% cobertura transporte', cost: 'Medio', priority: 'Media', impactPct: '+15%',
    lat: 39.474, lon: -0.379, lat2: 39.478, lon2: -0.335,
  },
]

export const touristProfiles: TouristProfile[] = [
  { id: 'familia',        label: 'Familia',         icon: '👨‍👩‍👧', filters: ['Transporte público', 'Zonas verdes', 'Accesibilidad'] },
  { id: 'mochilero',      label: 'Mochilero',        icon: '🎒', filters: ['Bicicleta', 'Rutas a pie', 'Monumentos'] },
  { id: 'mayor',          label: 'Persona mayor',    icon: '👴', filters: ['Transporte adaptado', 'Accesibilidad universal', 'Tiempo de espera'] },
  { id: 'movilidad_red',  label: 'Movilidad reducida',icon: '♿', filters: ['Rampas y ascensores', 'Transporte adaptado', 'Accesibilidad PMR'] },
]

export const aiMessages = [
  {
    role: 'user' as const,
    text: '¿Qué zonas de Valencia tienen problemas de accesibilidad?',
  },
  {
    role: 'assistant' as const,
    text: 'He analizado los datos de accesibilidad del destino. Estas son las principales zonas con problemas:\n\n**1. Playa Malvarrosa**\n• Déficit de transporte nocturno\n• Cruces peatonales no accesibles\n• Falta de señalización adaptada\n\n**2. Cabanyal - Canyamelar**\n• Aceras estrechas\n• Conectividad limitada con metro\n\n**Recomendaciones principales:**\n✅ Nueva línea lanzadera nocturna\n✅ Ciclovía costera conectada\n✅ Mejora de señalización accesible',
  },
]

export const radarData = [
  { subject: 'Accesibilidad', value: 83 },
  { subject: 'Movilidad',     value: 78 },
  { subject: 'Conectividad',  value: 80 },
  { subject: 'Sostenibilidad',value: 80 },
  { subject: 'Experiencia',   value: 83 },
]
