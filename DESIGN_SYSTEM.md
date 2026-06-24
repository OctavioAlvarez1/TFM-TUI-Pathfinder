# Pathfinder Design System

Guia de patrones visuales y de componentes para TUI Pathfinder (Reto 4). Referencia para mantener consistencia al extender el dashboard.

---

## 1. Paleta de colores

### Colores de marca (Pathfinder)

| Token | Hex | Uso |
|---|---|---|
| Azul marino | `#1A3C5E` | Color primario — fondos de cabecera, KPIs principales |
| Naranja TUI | `#C05928` | Acento — bordes superiores, botones de accion, barras de seccion |
| Verde sostenible | `#2D6A4F` | Positivo — baja emision, alta accesibilidad |
| Azul laguna | `#2E7D98` | Informativo — bicicleta, transporte publico, comparativas |
| Fondo calido | `#FAFAF8` | Fondo de pagina |
| Borde calido | `#E0D8CF` | Bordes de tarjetas |

### Colores de estado (movilidad)

| Estado | Hex | Umbral |
|---|---|---|
| Alto / positivo | `#10B981` | >= 75 |
| Moderado | `#F59E0B` | 50–74 |
| Bajo / critico | `#EF4444` | < 50 |

### Colores de modo de transporte

| Modo | Hex |
|---|---|
| A pie | `#2D6A4F` verde |
| Bicicleta | `#2E7D98` azul |
| Transporte publico | `#1A3C5E` marino |
| Vehiculo privado | `#EF4444` rojo |

---

## 2. KPI Card

Patron comun en todas las vistas. Borde superior de color semantico.

```tsx
<Box sx={{
  background: '#fff',
  border: '1px solid #E0D8CF',
  borderTop: `3px solid ${color}`,   // color = semantico segun metrica
  borderRadius: '12px',
  p: 2,
  boxShadow: '0 2px 8px rgba(26,60,94,0.07)',
  flex: 1,
  minWidth: 0,
}}>
  <Typography sx={{ fontSize: '0.67rem', color: '#94A3B8', mb: 0.5 }}>
    {label}
  </Typography>
  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.4 }}>
    <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{unit}</Typography>
  </Box>
  <Typography sx={{ fontSize: '0.7rem', color: deltaPositive ? '#2D6A4F' : '#EF4444' }}>
    {delta}
  </Typography>
</Box>
```

---

## 3. Cabecera de vista

Todas las vistas tienen la misma cabecera de 52px con barra naranja vertical, subtitulo en gris y nombre del destino en azul marino.

```tsx
<Box sx={{
  height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
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
        {t('view.header')}
      </Typography>
      <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1A3C5E' }}>
        {destination.name}
      </Typography>
    </Box>
  </Box>
</Box>
```

---

## 4. Contenedor scrollable de contenido

Patron estandar del area de contenido bajo la cabecera de vista.

```tsx
<Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
  {/* KPI row */}
  <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
    {/* KPICards */}
  </Box>

  {/* Two-column section — altura fija para no expulsar contenido inferior */}
  <Box sx={{ display: 'flex', gap: 2, flexShrink: 0, minHeight: 300 }}>
    {/* left panel */}
    {/* right panel */}
  </Box>

  {/* Seccion adicional */}
  <Box sx={{ flexShrink: 0 }}>
    {/* ... */}
  </Box>
</Box>
```

> **Importante**: No usar `flex: 1` en secciones internas del contenedor scrollable — hace que el contenido inferior quede fuera del viewport. Usar `flexShrink: 0` con `minHeight` explicito.

---

## 5. Chip de estado

Etiqueta inline de estado con fondo semitransparente.

```tsx
// Chip de prioridad / nivel
<Box sx={{
  display: 'inline-flex', alignItems: 'center',
  px: 0.9, py: 0.25, borderRadius: '20px',
  background: `${color}18`,
  border: `1px solid ${color}50`,
  flexShrink: 0,
}}>
  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>
    {label}
  </Typography>
</Box>
```

---

## 6. Panel de detalle expandible

Patron del RecDetail en AIRecsView — contenido oculto que se expande al hacer clic.

```tsx
const [isExpanded, setIsExpanded] = useState(false)

// Toggle
<Box onClick={() => setIsExpanded(p => !p)} sx={{ cursor: 'pointer', ... }}>
  {isExpanded ? t('ai.toggle.close') : t('ai.toggle.open')}
</Box>

// Contenido expandido
{isExpanded && (
  <Box sx={{ mt: 0.5, pt: 1.5, borderTop: '1px solid #EDE8E3' }}>
    {/* detalle */}
  </Box>
)}
```

---

## 7. Mapa Leaflet con capas de calor

El InteractiveMapView usa `react-leaflet` con tiles CartoDB Voyager y circulos CSS para las zonas de calor. Tres capas de circulos por zona (exterior difuso -> nucleo solido) para efecto de halo.

```tsx
<MapContainer center={[lat, lon]} zoom={zoom} zoomControl={false} attributionControl={false}>
  <TileLayer
    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    attribution='&copy; OpenStreetMap &copy; CARTO'
  />
  {/* Capa exterior — muy transparente */}
  <Circle center={[zone.lat, zone.lon]} radius={zone.radius}
    pathOptions={{ fillColor: color, fillOpacity: 0.09, stroke: false }} />
  {/* Capa media */}
  <Circle center={[zone.lat, zone.lon]} radius={zone.radius * 0.58}
    pathOptions={{ fillColor: color, fillOpacity: 0.16, stroke: false }} />
  {/* Nucleo — clickable */}
  <Circle center={[zone.lat, zone.lon]} radius={zone.radius * 0.28}
    pathOptions={{ fillColor: color, fillOpacity: 0.28, stroke: false }}
    eventHandlers={{ click: () => setSelectedZone(i) }} />
</MapContainer>
```

---

## 8. Donut CSS (MobilityView)

El grafico de reparto modal usa `conic-gradient` CSS puro — sin libreria de graficos.

```typescript
// Construir gradiente conico
let acc = 0
const seg = (pct: number, color: string) => {
  const start = acc; acc += pct
  return `${color} ${start}% ${acc}%`
}
const donutGradient = `conic-gradient(${[
  seg(walk,    '#2D6A4F'),
  seg(bike,    '#2E7D98'),
  seg(transit, '#1A3C5E'),
  seg(car,     '#EF4444'),
].join(', ')})`
```

```tsx
<Box sx={{
  width: 160, height: 160, borderRadius: '50%',
  background: donutGradient,
}}>
  {/* Agujero central */}
  <Box sx={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 80, height: 80, borderRadius: '50%', background: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  }}>
    <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8', textAlign: 'center' }}>
      {t('mob.donut.center')}
    </Typography>
    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1A3C5E' }}>
      {sustainablePct}%
    </Typography>
  </Box>
</Box>
```

---

## 9. Filtros de periodo (botones pill)

Patron de filtro activo/inactivo usado en Analytics y AIRecsView.

```tsx
{OPTIONS.map(({ key, label }) => {
  const active = current === key
  return (
    <Box key={key} onClick={() => setCurrent(key)} sx={{
      px: 1.4, py: 0.5, borderRadius: '20px', cursor: 'pointer',
      background: active ? '#1A3C5E' : 'transparent',
      border: `1px solid ${active ? '#1A3C5E' : '#CBD5E1'}`,
      transition: 'all 0.15s',
      '&:hover': { borderColor: '#1A3C5E' },
    }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#fff' : '#64748B' }}>
        {label}
      </Typography>
    </Box>
  )
})}
```

---

## 10. Selector POI (dropdown personalizado)

Usado en el planificador de rutas del mapa interactivo. Dropdown sin libreria externa.

```tsx
function POISelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const sel = options.find(o => o.id === value)
  return (
    <Box sx={{ position: 'relative' }}>
      <Box onClick={() => setOpen(o => !o)} sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.2, py: 0.85, borderRadius: '8px', cursor: 'pointer',
        border: `1.5px solid ${open ? '#C05928' : '#E0D8CF'}`,
        background: '#fff',
      }}>
        <Typography sx={{ flex: 1, fontSize: '0.74rem', color: sel ? '#1A3C5E' : '#94A3B8' }}>
          {sel ? `${sel.icon} ${sel.label}` : placeholder}
        </Typography>
      </Box>
      {open && (
        <Box sx={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 2000,
          background: '#fff', border: '1px solid #E0D8CF', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(26,60,94,0.14)',
        }}>
          {options.map(o => (
            <Box key={o.id} onClick={() => { onChange(o.id); setOpen(false) }}
              sx={{ px: 1.2, py: 0.7, cursor: 'pointer', '&:hover': { background: 'rgba(26,60,94,0.04)' } }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#1A3C5E' }}>
                {o.icon} {o.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
```
