import { useState, useEffect } from 'react'

const _cache = new Map<string, string | null>()

function isScenic(url: string): boolean {
  const u = url.toLowerCase()
  if (u.endsWith('.svg')) return false
  const bad = [
    'flag', 'coat', 'escudo', 'bandera', '_map', 'mapa', 'location',
    'relief', 'locator', 'logo', 'shield', 'arms', 'emblem', 'heraldry',
    'blazon', 'coa_', 'pictogram', 'symbol', 'in_spain', 'in_europe',
    'administrative', 'orthographic', 'topographic', 'satellite_image',
    'localizacion', 'situacion', 'distrito', 'province_',
  ]
  return !bad.some(t => u.includes(t))
}

async function wikiImage(title: string, lang: string): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=900&origin=*`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const pages = data.query?.pages
    const page = pages && (Object.values(pages)[0] as Record<string, unknown>)
    const src = (page?.thumbnail as Record<string, string> | undefined)?.source
    return src && isScenic(src) ? src : null
  } catch {
    return null
  }
}

// Topbar: fallback list if main article photo is bad
const TOPBAR_FALLBACKS: Record<string, string[]> = {
  'mallorca':         ['Palma de Mallorca', 'Port de Sóller', 'Cala d\'Or'],
  'ibiza':            ['Eivissa', 'Cala Conta', 'Formentera'],
  'menorca':          ['Ciutadella de Menorca', 'Cala Macarella'],
  'tenerife':         ['Teide National Park', 'Los Gigantes, Tenerife'],
  'gran-canaria':     ['Maspalomas', 'Roque Nublo'],
  'lanzarote':        ['Timanfaya National Park', 'Jameos del Agua'],
  'costa-del-sol':    ['Nerja', 'Fuengirola', 'Mijas'],
  'marbella':         ['Puerto Banús', 'Marbella Old Town'],
  'malaga':           ['Alcazaba of Málaga', 'Málaga Cathedral'],
  'sevilla':          ['Seville Cathedral', 'Plaza de España, Seville', 'Real Alcázar of Seville'],
  'granada':          ['Alhambra', 'Albaicín'],
  'valencia':         ['City of Arts and Sciences', 'Valencia Cathedral'],
  'alicante':         ['Castle of Santa Bárbara', 'Alicante'],
  'benidorm':         ['Benidorm Island', 'Playa de Levante, Benidorm'],
  'costa-brava':      ['Tossa de Mar', 'Cap de Creus'],
  'barcelona':        ['Sagrada Família', 'Park Güell', 'La Barceloneta'],
  'madrid':           ['Royal Palace of Madrid', 'Retiro Park'],
  'bilbao':           ['Guggenheim Museum Bilbao', 'Casco Viejo, Bilbao'],
  'san-sebastian':    ['La Concha Bay', 'Monte Igueldo'],
  'picos-de-europa':  ['Picos de Europa', 'Naranjo de Bulnes'],
  'sierra-nevada':    ['Sierra Nevada (Spain)', 'Mulhacén'],
}

// Sidebar card: guaranteed scenic article — different from topbar
export const CARD_QUERIES: Record<string, string> = {
  'mallorca':         'Sa Calobra',
  'ibiza':            'Cala Conta',
  'menorca':          'Cala Macarella',
  'tenerife':         'Teide National Park',
  'gran-canaria':     'Maspalomas',
  'lanzarote':        'Timanfaya National Park',
  'costa-del-sol':    'Nerja',
  'marbella':         'Puerto Banús',
  'malaga':           'Alcazaba of Málaga',
  'sevilla':          'Real Alcázar of Seville',
  'granada':          'Alhambra',
  'valencia':         'City of Arts and Sciences',
  'alicante':         'Castle of Santa Bárbara',
  'benidorm':         'Benidorm Island',
  'costa-brava':      'Tossa de Mar',
  'barcelona':        'Park Güell',
  'madrid':           'Retiro Park',
  'bilbao':           'Guggenheim Museum Bilbao',
  'san-sebastian':    'La Concha Bay',
  'picos-de-europa':  'Naranjo de Bulnes',
  'sierra-nevada':    'Mulhacén',
}

export function useDestinationPhoto(
  cacheKey: string,
  primaryQuery: string,
  fallbackOverrides?: string[],
): string | null {
  const [photo, setPhoto] = useState<string | null>(
    _cache.has(cacheKey) ? _cache.get(cacheKey)! : null,
  )

  useEffect(() => {
    if (_cache.has(cacheKey)) {
      setPhoto(_cache.get(cacheKey)!)
      return
    }

    let cancelled = false

    async function load() {
      const destId = cacheKey.replace(/_card$|_region$/, '')
      const extra = fallbackOverrides ?? TOPBAR_FALLBACKS[destId] ?? []
      const queries = [primaryQuery, ...extra]

      let img: string | null = null
      for (const q of queries) {
        img = await wikiImage(q, 'en')
        if (img) break
        img = await wikiImage(q, 'es')
        if (img) break
      }

      if (!cancelled) {
        _cache.set(cacheKey, img)
        setPhoto(img)
      }
    }

    load()
    return () => { cancelled = true }
  }, [cacheKey, primaryQuery])

  return photo
}
