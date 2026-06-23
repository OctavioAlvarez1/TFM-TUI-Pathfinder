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

export const kpis: KPI[] = [
  { label: 'Índice de Accesibilidad', value: '87', unit: '/100', delta: '+12% vs mes anterior', icon: '♿', color: '#10B981' },
  { label: 'Movilidad Sostenible',    value: '74', unit: '/100', delta: '+8% vs mes anterior',  icon: '🌱', color: '#0DD3C5' },
  { label: 'Cobertura Transporte',    value: '81', unit: '%',    delta: '+9% vs mes anterior',  icon: '🚌', color: '#818CF8' },
  { label: 'Emisiones Evitadas',      value: '2.3', unit: 't CO₂', delta: '+15% vs mes anterior', icon: '💚', color: '#10B981' },
  { label: 'Tiempo Medio de Acceso',   value: '12', unit: 'min', delta: '−2 min vs mes anterior', icon: '⏱', color: '#F97316' },
  { label: 'Destinos Accesibles',     value: '142', unit: '',   delta: '+18 nuevos',             icon: '📍', color: '#EAB308' },
]

export const evolutionData = [
  { mes: 'Ene', accesibilidad: 72, movilidad: 60, transporte: 68, sostenibilidad: 55 },
  { mes: 'Feb', accesibilidad: 74, movilidad: 63, transporte: 70, sostenibilidad: 58 },
  { mes: 'Mar', accesibilidad: 76, movilidad: 65, transporte: 71, sostenibilidad: 62 },
  { mes: 'Abr', accesibilidad: 79, movilidad: 67, transporte: 74, sostenibilidad: 65 },
  { mes: 'May', accesibilidad: 83, movilidad: 71, transporte: 78, sostenibilidad: 70 },
  { mes: 'Jun', accesibilidad: 87, movilidad: 74, transporte: 81, sostenibilidad: 76 },
]

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
