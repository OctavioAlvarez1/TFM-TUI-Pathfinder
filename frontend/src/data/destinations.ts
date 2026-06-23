export interface SpanishDestination {
  id: string
  name: string
  label: string
  region: string
  lat: number
  lon: number
  zoom: number
  bboxDelta?: number  // Overpass search radius override (default 0.05)
}

export const SPANISH_DESTINATIONS: SpanishDestination[] = [
  // ── Islas Baleares ──────────────────────────────────────────────────────────
  { id: 'mallorca',      name: 'Mallorca',          label: 'Mallorca, España',          region: 'Islas Baleares',        lat: 39.5696,  lon:   2.6502,  zoom: 12, bboxDelta: 0.07 },
  { id: 'ibiza',         name: 'Ibiza',             label: 'Ibiza, España',             region: 'Islas Baleares',        lat: 38.9067,  lon:   1.4206,  zoom: 13 },
  { id: 'menorca',       name: 'Menorca',           label: 'Menorca, España',           region: 'Islas Baleares',        lat: 39.9496,  lon:   4.1016,  zoom: 12, bboxDelta: 0.07 },

  // ── Canarias ────────────────────────────────────────────────────────────────
  { id: 'tenerife',      name: 'Tenerife',          label: 'Tenerife, España',          region: 'Canarias',              lat: 28.4180,  lon: -16.5480,  zoom: 12, bboxDelta: 0.07 },
  { id: 'gran-canaria',  name: 'Gran Canaria',      label: 'Gran Canaria, España',      region: 'Canarias',              lat: 27.9202,  lon: -15.5477,  zoom: 12, bboxDelta: 0.07 },
  { id: 'lanzarote',     name: 'Lanzarote',         label: 'Lanzarote, España',         region: 'Canarias',              lat: 28.9637,  lon: -13.5496,  zoom: 12, bboxDelta: 0.07 },

  // ── Andalucía ───────────────────────────────────────────────────────────────
  { id: 'costa-del-sol', name: 'Costa del Sol',     label: 'Costa del Sol, España',     region: 'Andalucía',             lat: 36.5238,  lon:  -4.9204,  zoom: 12, bboxDelta: 0.07 },
  { id: 'marbella',      name: 'Marbella',          label: 'Marbella, España',          region: 'Andalucía',             lat: 36.5101,  lon:  -4.8825,  zoom: 13 },
  { id: 'malaga',        name: 'Málaga',            label: 'Málaga, España',            region: 'Andalucía',             lat: 36.7213,  lon:  -4.4214,  zoom: 13 },
  { id: 'sevilla',       name: 'Sevilla',           label: 'Sevilla, España',           region: 'Andalucía',             lat: 37.3891,  lon:  -5.9845,  zoom: 13 },
  { id: 'granada',       name: 'Granada',           label: 'Granada, España',           region: 'Andalucía',             lat: 37.1773,  lon:  -3.5986,  zoom: 13 },

  // ── Comunitat Valenciana ────────────────────────────────────────────────────
  { id: 'valencia',      name: 'Valencia',          label: 'Valencia, España',          region: 'Comunitat Valenciana',  lat: 39.4699,  lon:  -0.3763,  zoom: 13 },
  { id: 'alicante',      name: 'Alicante',          label: 'Alicante, España',          region: 'Comunitat Valenciana',  lat: 38.3452,  lon:  -0.4815,  zoom: 13 },
  { id: 'benidorm',      name: 'Benidorm',          label: 'Benidorm, España',          region: 'Comunitat Valenciana',  lat: 38.5393,  lon:  -0.1310,  zoom: 13 },

  // ── Cataluña ────────────────────────────────────────────────────────────────
  { id: 'costa-brava',   name: 'Costa Brava',       label: 'Costa Brava, España',       region: 'Cataluña',              lat: 41.6990,  lon:   2.8491,  zoom: 12, bboxDelta: 0.07 },
  { id: 'barcelona',     name: 'Barcelona',         label: 'Barcelona, España',         region: 'Cataluña',              lat: 41.3851,  lon:   2.1734,  zoom: 13 },

  // ── Centro & Norte ──────────────────────────────────────────────────────────
  { id: 'madrid',        name: 'Madrid',            label: 'Madrid, España',            region: 'Comunidad de Madrid',   lat: 40.4168,  lon:  -3.7038,  zoom: 13 },
  { id: 'bilbao',        name: 'Bilbao',            label: 'Bilbao, España',            region: 'País Vasco',            lat: 43.2630,  lon:  -2.9350,  zoom: 13 },
  { id: 'san-sebastian', name: 'San Sebastián',     label: 'San Sebastián, España',     region: 'País Vasco',            lat: 43.3183,  lon:  -1.9812,  zoom: 13 },

  // ── Naturaleza ──────────────────────────────────────────────────────────────
  { id: 'picos-europa',  name: 'Picos de Europa',   label: 'Picos de Europa, España',   region: 'Asturias / Cantabria',  lat: 43.1887,  lon:  -4.8395,  zoom: 11, bboxDelta: 0.10 },
  { id: 'sierra-nevada', name: 'Sierra Nevada',     label: 'Sierra Nevada, España',     region: 'Andalucía',             lat: 37.0580,  lon:  -3.3846,  zoom: 11, bboxDelta: 0.10 },
]
