export type Lang = 'es' | 'en'

const translations = {
  es: {
    // TopBar
    'topbar.active_destination': 'Destino activo',

    // Sidebar
    'nav.home':       'Inicio',
    'nav.map':        'Mapa interactivo',
    'nav.access':     'Accesibilidad',
    'nav.mobility':   'Movilidad sostenible',
    'nav.routes':     'Rutas turísticas',
    'nav.ai':         'Recomendaciones IA',
    'nav.analytics':  'Análisis',
    'nav.reports':    'Informes',
    'nav.settings':   'Configuración',
    'nav.group.ai':   'IA & Análisis',
    'nav.change_dest':'Cambiar destino',

    // KPIs
    'kpi.accessibility':  'Índice de Accesibilidad',
    'kpi.mobility':       'Movilidad Sostenible',
    'kpi.transport':      'Cobertura Transporte',
    'kpi.emissions':      'Emisiones Evitadas',
    'kpi.time':           'Tiempo Medio de Acceso',
    'kpi.destinations':   'Destinos Accesibles',
    'kpi.delta.pct':      'vs mes anterior',
    'kpi.delta.time':     'min vs mes anterior',
    'kpi.delta.new':      'nuevos',

    // HeatmapPanel layers
    'layer.hotels':      'Alojamientos',
    'layer.monuments':   'Recursos turísticos',
    'layer.restaurants': 'Restaurantes',
    'layer.beaches':     'Playas',
    'layer.transport':   'Transporte público',
    'layer.cycling':     'Ciclovías',
    'layer.hiking':      'Senderos',
    'layer.bikes':       'Estaciones Bici',
    'layer.access':      'Accesibilidad',
    'layer.problems':    'Zonas problemáticas',
    'layer.panel_title': 'Capas del mapa',

    // HeatmapPanel status
    'map.mock_data':   'Datos de muestra · OSM no disponible',
    'map.no_osm':      'Sin datos OSM para esta zona',
    'map.osm_source':  'OpenStreetMap',

    // EvolutionChart
    'chart.evolution.title':  'Evolución de métricas',
    'chart.evolution.period': 'Últimos 6 meses',
    'chart.line.access':      'Accesibilidad',
    'chart.line.mobility':    'Movilidad',
    'chart.line.transport':   'Transporte',
    'chart.line.sustain':     'Sostenibilidad',
    'chart.months':           'Ene,Feb,Mar,Abr,May,Jun',

    // ModalDonut
    'donut.title':    'Distribución modal',
    'donut.walking':  'A pie',
    'donut.bike':     'Bicicleta',
    'donut.bus':      'Bus/Metro',
    'donut.car':      'Vehículo privado',

    // OpportunitiesPanel
    'opp.title':    'Zonas con más oportunidades',
    'opp.priority': 'Prioridad',
    'opp.high':     'Alta',
    'opp.medium':   'Media',
    'opp.low':      'Baja',
    'opp.view_all': 'Ver análisis completo',
  },
  en: {
    // TopBar
    'topbar.active_destination': 'Active destination',

    // Sidebar
    'nav.home':       'Home',
    'nav.map':        'Interactive Map',
    'nav.access':     'Accessibility',
    'nav.mobility':   'Sustainable Mobility',
    'nav.routes':     'Tourist Routes',
    'nav.ai':         'AI Recommendations',
    'nav.analytics':  'Analytics',
    'nav.reports':    'Reports',
    'nav.settings':   'Settings',
    'nav.group.ai':   'AI & Analytics',
    'nav.change_dest':'Change destination',

    // KPIs
    'kpi.accessibility':  'Accessibility Index',
    'kpi.mobility':       'Sustainable Mobility',
    'kpi.transport':      'Transport Coverage',
    'kpi.emissions':      'Avoided Emissions',
    'kpi.time':           'Avg. Access Time',
    'kpi.destinations':   'Accessible Destinations',
    'kpi.delta.pct':      'vs last month',
    'kpi.delta.time':     'min vs last month',
    'kpi.delta.new':      'new',

    // HeatmapPanel layers
    'layer.hotels':      'Accommodation',
    'layer.monuments':   'Tourist Attractions',
    'layer.restaurants': 'Restaurants',
    'layer.beaches':     'Beaches',
    'layer.transport':   'Public Transport',
    'layer.cycling':     'Cycle Paths',
    'layer.hiking':      'Hiking Trails',
    'layer.bikes':       'Bike Stations',
    'layer.access':      'Accessibility',
    'layer.problems':    'Problem Areas',
    'layer.panel_title': 'Map Layers',

    // HeatmapPanel status
    'map.mock_data':   'Sample data · OSM unavailable',
    'map.no_osm':      'No OSM data for this area',
    'map.osm_source':  'OpenStreetMap',

    // EvolutionChart
    'chart.evolution.title':  'Metrics Evolution',
    'chart.evolution.period': 'Last 6 months',
    'chart.line.access':      'Accessibility',
    'chart.line.mobility':    'Mobility',
    'chart.line.transport':   'Transport',
    'chart.line.sustain':     'Sustainability',
    'chart.months':           'Jan,Feb,Mar,Apr,May,Jun',

    // ModalDonut
    'donut.title':    'Modal Distribution',
    'donut.walking':  'Walking',
    'donut.bike':     'Bicycle',
    'donut.bus':      'Bus/Metro',
    'donut.car':      'Private vehicle',

    // OpportunitiesPanel
    'opp.title':    'Priority Opportunity Zones',
    'opp.priority': 'Priority',
    'opp.high':     'High',
    'opp.medium':   'Medium',
    'opp.low':      'Low',
    'opp.view_all': 'View full analysis',
  },
} as const

type TranslationKey = keyof typeof translations.es

export function getT(lang: Lang) {
  return (key: TranslationKey): string => translations[lang][key] ?? translations.es[key] ?? key
}
