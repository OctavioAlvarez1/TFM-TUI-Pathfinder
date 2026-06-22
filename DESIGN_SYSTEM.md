# Horizon Design System

Reusable patterns from the Horizon frontend. Reference this when extending Horizon or building new React/MUI v9 projects in the TUI suite.

---

## 1. MUI v9 Dark Mode Rules

All colors must use theme tokens in `sx` props — never hardcoded hex values.

```tsx
// ✅ Correct
<Box sx={{ color: "text.primary", borderColor: "divider" }} />

// ❌ Wrong
<Box sx={{ color: "#0F172A", borderColor: "rgba(226,232,240,.8)" }} />
```

For inline `style` props (not `sx`), use a conditional:
```tsx
const theme = useTheme();
const dark = theme.palette.mode === "dark";

<div style={{ color: dark ? "#F1F5F9" : "#0F172A" }} />
```

`InputProps` is deprecated in v9 — use `slotProps`:
```tsx
<TextField slotProps={{ input: { startAdornment: <Icon /> }, htmlInput: { min: 1 } }} />
```

---

## 2. Glassmorphism KPI Cards (Hero Pattern)

Used in Analytics hero. Cards float inside a dark gradient hero section.

```tsx
// Hero container
<Box sx={{
  background: "linear-gradient(160deg, #070C16 0%, #0F1A2E 100%)",
  position: "relative", overflow: "hidden",
  pt: { xs: 14, md: 16 }, pb: { xs: 14, md: 18 },
}}>
  {/* Radial accent */}
  <Box sx={{
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(circle at 70% 40%, rgba(16,185,129,.07), transparent 55%)",
  }} />

  {/* Glass card */}
  <Box sx={{
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    borderTop: "3px solid #10B981",  // accent color per card
    borderRadius: "16px",
    p: { xs: 2, md: 3 },
  }}>
    {/* content */}
  </Box>
</Box>
```

---

## 3. SVG Area Chart Divider

Pure SVG — no chart library needed. Used at the bottom of hero sections.

```tsx
<Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
  <svg viewBox="0 0 1440 110" preserveAspectRatio="none" style={{ display: "block" }}>
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Smooth bezier path — data points mapped to viewBox coords */}
    <path d="M0,80 C120,70 240,30 360,40 ..." fill="url(#areaGrad)" />
    <path d="M0,80 C120,70 240,30 360,40 ..." fill="none" stroke="#10B981" strokeWidth="2" strokeOpacity="0.4" />
    {/* Floor rect to blend with page background */}
    <rect x="0" y="105" width="1440" height="10" fill="#0B1220" />
  </svg>
</Box>
```

---

## 4. Interactive Bar Chart (MonthlyChart Pattern)

Clickable bars — selected bar glows, others dim to 32% opacity.

```tsx
const MonthlyChart = ({ selectedMonth, onSelect }: { selectedMonth: number; onSelect: (m: number) => void }) => {
  const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const DATA = [0,0,0,8,8,0,12,12,0,8,0,0]; // your values

  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", height: 80 }}>
      {DATA.map((val, i) => {
        const month = i + 1;
        const selected = month === selectedMonth;
        const height = 20 + (val / Math.max(...DATA)) * 50;
        return (
          <Box key={month} onClick={() => onSelect(month)} sx={{ cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <Box sx={{
              width: "100%", borderRadius: "4px 4px 0 0",
              height: `${height}px`,
              bgcolor: selected ? "#EF4444" : "#EF444450",
              opacity: selected ? 1 : 0.32,
              boxShadow: selected ? "0 0 12px #EF444488" : "none",
              outline: selected ? "2px solid #EF4444" : "none",
              transition: "all .15s",
            }} />
            <Typography sx={{ fontSize: ".65rem", color: selected ? "text.primary" : "text.secondary", fontWeight: selected ? 800 : 400 }}>
              {MONTHS[i]}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
```

---

## 5. Heat Tile Grid with Sidebar Filter

Used in Analytics for destination ranking. Sidebar ~175px, tiles min 105px.

```tsx
const HeatGrid = ({ month }: { month: number }) => {
  const [filter, setFilter] = useState<string | null>(null);
  const TYPES = ["Beach", "City", "Nature", "Mixed"] as const;

  const scored = DESTINATIONS
    .map(d => ({ ...d, score: Math.round(d.sustainability * (1 - d.monthly[month-1] / 100)) }))
    .sort((a, b) => b.score - a.score);

  const visible = filter ? scored.filter(d => d.type === filter) : scored;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "175px 1fr" }, gap: 2 }}>
      {/* Sidebar */}
      <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: 1 }}>
        {[null, ...TYPES].map(t => (
          <Box key={t ?? "all"} onClick={() => setFilter(t)}
            sx={{ cursor: "pointer", px: 1.5, py: 1, borderRadius: "10px",
              bgcolor: filter === t ? "primary.main" : "background.paper",
              border: "1px solid", borderColor: filter === t ? "primary.main" : "divider",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: ".8rem", fontWeight: 700 }}>{t ?? "All"}</Typography>
            <Chip label={t ? scored.filter(d => d.type === t).length : scored.length} size="small" />
          </Box>
        ))}
      </Box>

      {/* Tiles */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <AnimatePresence>
          {visible.map((d, i) => (
            <motion.div key={d.id} layout animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}>
              <Box sx={{ width: "calc(20% - 8px)", minWidth: 105, p: 1.25, borderRadius: "12px",
                bgcolor: scoreToColor(d.score), border: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontSize: ".7rem", fontWeight: 800 }}>#{i + 1} {d.name}</Typography>
                <Typography sx={{ fontSize: ".65rem", color: "text.secondary" }}>
                  S: {d.sustainability} · C: {d.monthly[month-1]}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
};
```

---

## 6. Framer Motion Re-animation on Data Change

Use `key={`${id}-${selectedMonth}`}` to force re-animation when month changes:

```tsx
// This re-triggers the enter animation every time selectedMonth changes
<motion.div
  key={`status-${statusKey}-${selectedMonth}`}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}   // animate, NOT whileInView
  transition={{ duration: 0.35, delay: index * 0.05 }}
>
  {/* content */}
</motion.div>
```

Use `layout` on tiles for smooth reorder when filter/sort changes:
```tsx
<motion.div layout transition={{ duration: 0.25 }}>
  {/* tile that moves when its position in the list changes */}
</motion.div>
```

---

## 7. Map Tile Layers (Leaflet / CartoCDN)

```tsx
const dark = theme.palette.mode === "dark";

<TileLayer
  url={dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  }
  attribution='&copy; OpenStreetMap &copy; CARTO'
/>
```

---

## 8. Section Badge Pattern

Consistent section labeling across all pages:

```tsx
// Blue badge
<Typography sx={{
  fontSize: ".82rem", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: ".2em", color: "#2563EB", mb: 1,
}}>
  Section Name
</Typography>

// Green pill badge (hero/highlighted sections)
<Typography sx={{
  display: "inline-block", px: 2.5, py: 0.9, borderRadius: "999px",
  color: "#10B981", fontWeight: 700, fontSize: ".78rem",
  textTransform: "uppercase", letterSpacing: ".2em",
  border: "1px solid rgba(16,185,129,.2)",
  background: "rgba(16,185,129,.06)",
}}>
  Badge Text
</Typography>
```

---

## 9. Congestion Color Helper

Reuse this function wherever congestion scores map to colors:

```tsx
const congestionColor = (score: number) => {
  if (score <= 30) return { fill: "#16A34A", stroke: "#15803D" }; // Low
  if (score <= 60) return { fill: "#CA8A04", stroke: "#A16207" }; // Moderate
  if (score <= 80) return { fill: "#EA580C", stroke: "#C2410C" }; // High
  return { fill: "#DC2626", stroke: "#B91C1C" };                  // Very High
};

const congestionLevel = (score: number): "low" | "moderate" | "high" | "veryHigh" => {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  if (score <= 80) return "high";
  return "veryHigh";
};
```

---

## 10. Streamlit Equivalents (for Atlas / Sentinel / Pathfinder)

For Plotly-based projects, map these patterns:

| Horizon pattern | Streamlit/Plotly equivalent |
|---|---|
| Heat tile grid | `plotly.graph_objects.Heatmap` or `st.dataframe` with background_gradient |
| Congestion map circles | `folium.CircleMarker` with radius/color from congestion score |
| Glassmorphism KPI card | `st.metric` inside `st.columns` + custom CSS via `st.markdown` |
| Interactive bar chart | `plotly.bar` with `on_select` or Streamlit selectbox |
| Status breakdown | `plotly.pie` or colored `st.metric` delta |

Use the same hex colors from Section 9 in all Plotly figures for consistency across the suite.
