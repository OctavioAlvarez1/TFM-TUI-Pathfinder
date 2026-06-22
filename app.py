import streamlit as st
from src.data.data_loader import load_transport, load_local_metrics
from src.components.map_builder import build_mobility_map
from streamlit_folium import st_folium

st.set_page_config(
    page_title="TUI Pathfinder — Movilidad Sostenible",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
[data-testid="stAppViewContainer"] { background: #0B1220; }
[data-testid="stSidebar"] { background: #111827; }
.metric-card {
    background: linear-gradient(135deg, rgba(13,211,197,0.08) 0%, rgba(3,44,58,0.95) 100%);
    border: 1px solid rgba(13,211,197,0.3);
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    margin-bottom: 8px;
}
.metric-value { font-size: 2rem; font-weight: 700; color: #0DD3C5; line-height: 1.1; }
.metric-label { font-size: 0.78rem; color: #94A3B8; margin-top: 6px; }
.hero-title   { font-size: 2.4rem; font-weight: 800; color: #F1F5F9; line-height: 1.15; }
.hero-sub     { font-size: 1rem; color: #64748B; margin-top: 6px; }
.tag { display:inline-block; background:rgba(13,211,197,0.12); color:#0DD3C5;
       border:1px solid rgba(13,211,197,0.3); border-radius:20px;
       padding:3px 12px; font-size:0.75rem; margin:3px 2px; }
</style>
""", unsafe_allow_html=True)

# ── Sidebar ────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🧭 TUI Pathfinder")
    st.markdown("<p style='color:#64748B;font-size:0.82rem;'>Reto 4 · Target 8.9 · Future Shapers Spain</p>", unsafe_allow_html=True)
    st.divider()
    st.markdown("""
**Páginas disponibles:**
- 🏠 Inicio — Visión general
- 🔗 Conectividad Nacional
- 📍 Accesibilidad Local
- 🚴 Rutas Sostenibles
- 🌱 Huella de Carbono
- 📊 Brechas e Infraestructura
    """)
    st.divider()
    st.markdown("<p style='color:#64748B;font-size:0.75rem;'>Fuentes: OpenStreetMap · GTFS · Datos Abiertos Municipales · INE</p>", unsafe_allow_html=True)

# ── Header ────────────────────────────────────────────────────────────────
st.markdown("""
<div>
  <span class="hero-title">TUI Pathfinder</span><br>
  <span class="hero-sub">Generador de Mapas de Accesibilidad &amp; Movilidad Sostenible con IA · Target 8.9</span>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style='margin:12px 0 20px;'>
<span class="tag">OpenStreetMap</span>
<span class="tag">GTFS / Transporte Público</span>
<span class="tag">Ciclovías</span>
<span class="tag">Accesibilidad Universal</span>
<span class="tag">CO₂ Evitado</span>
<span class="tag">Smart Destinations</span>
</div>
""", unsafe_allow_html=True)

# ── Data ──────────────────────────────────────────────────────────────────
try:
    transport = load_transport()
    local = load_local_metrics()

    # ── KPI Cards ─────────────────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""<div class="metric-card">
            <div class="metric-value">20</div>
            <div class="metric-label">Destinos Analizados</div>
        </div>""", unsafe_allow_html=True)
    with c2:
        avg_acc = round(local["local_accessibility_index"].mean(), 1)
        st.markdown(f"""<div class="metric-card">
            <div class="metric-value">{avg_acc}</div>
            <div class="metric-label">Índice Accesibilidad Local Medio</div>
        </div>""", unsafe_allow_html=True)
    with c3:
        total_bici = int(local["cycling_km"].sum())
        st.markdown(f"""<div class="metric-card">
            <div class="metric-value">{total_bici:,}</div>
            <div class="metric-label">km de Carriles Bici (total)</div>
        </div>""", unsafe_allow_html=True)
    with c4:
        high_mob = int((transport["overall_mobility_score"] >= 75).sum())
        st.markdown(f"""<div class="metric-card">
            <div class="metric-value">{high_mob}</div>
            <div class="metric-label">Destinos con Alta Movilidad Sostenible</div>
        </div>""", unsafe_allow_html=True)

    st.markdown("---")

    # ── Spain Map + Table ─────────────────────────────────────────────────
    col_map, col_table = st.columns([3, 2])

    with col_map:
        st.subheader("🗺️ Mapa de Conectividad — España")
        st.caption("Tamaño y color del círculo = puntuación de movilidad sostenible interurbana. Haz clic para detalles.")
        m = build_mobility_map(transport)
        st_folium(m, use_container_width=True, height=440, returned_objects=[])

    with col_table:
        st.subheader("Ranking de Movilidad Sostenible")
        st.caption("Puntuación compuesta: tren + bus + emisiones evitadas")

        top5 = transport.sort_values("overall_mobility_score", ascending=False).head(5)
        st.markdown("**Top 5 — Mejor conectados**")
        st.dataframe(
            top5[["destination_name", "overall_mobility_score", "train_score", "carbon_kg_per_visitor"]]
            .rename(columns={
                "destination_name": "Destino",
                "overall_mobility_score": "Score",
                "train_score": "Tren",
                "carbon_kg_per_visitor": "CO₂/visitante (kg)",
            }),
            use_container_width=True, hide_index=True,
        )

        st.markdown("<br>", unsafe_allow_html=True)
        bot5 = transport.sort_values("overall_mobility_score").head(5)
        st.markdown("**Requieren mejora urgente**")
        st.dataframe(
            bot5[["destination_name", "overall_mobility_score", "carbon_kg_per_visitor"]]
            .rename(columns={
                "destination_name": "Destino",
                "overall_mobility_score": "Score",
                "carbon_kg_per_visitor": "CO₂/visitante (kg)",
            }),
            use_container_width=True, hide_index=True,
        )

    st.markdown("---")

    # ── Problem context ───────────────────────────────────────────────────
    st.subheader("¿Qué problema resuelve Pathfinder?")
    p1, p2, p3 = st.columns(3)
    with p1:
        st.markdown("""
**Falta de visibilidad**

Los destinos no saben cómo se conectan sus recursos turísticos mediante movilidad sostenible. ¿A qué distancia está el hotel del monumento más cercano en bici? ¿Hay carril habilitado?
        """)
    with p2:
        st.markdown("""
**Alta dependencia del coche**

El 70% de los destinos analizados presentan dependencia del vehículo privado superior al 45%, generando congestión, emisiones y degradación de la experiencia turística.
        """)
    with p3:
        st.markdown("""
**Brechas de infraestructura**

Ciudades con alto potencial turístico carecen de ciclovías, transporte local frecuente o rutas peatonales accesibles para conectar sus principales atractivos.
        """)

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)

st.markdown("---")
st.caption("TUI Pathfinder · Reto 4 — Target 8.9 · TUI Care Foundation Future Shapers Spain · UCM 2026")
