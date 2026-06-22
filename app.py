import streamlit as st
from src.data.data_loader import load_transport, load_local_metrics
from src.components.map_builder import build_mobility_map
from src.ui.styles import render_css, kpi_card, insight_box, sunset_bar, tags
from streamlit_folium import st_folium

st.set_page_config(
    page_title="TUI Pathfinder — Movilidad Sostenible",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)
render_css(st)

# ── Sidebar ────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🧭 TUI Pathfinder")
    st.markdown("<p style='color:#475569;font-size:0.82rem;'>Reto 4 · Target 8.9 · Future Shapers Spain</p>", unsafe_allow_html=True)
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
    st.markdown("<p style='color:#475569;font-size:0.75rem;'>Fuentes: OpenStreetMap · GTFS · Datos Abiertos Municipales · INE</p>", unsafe_allow_html=True)

# ── Hero header ────────────────────────────────────────────────────────────
st.markdown("""
<div style="padding: 8px 0 4px;">
  <span class="hero-title">TUI <span class="hero-accent">Pathfinder</span></span><br>
  <span class="hero-sub">Generador de Mapas de Accesibilidad &amp; Movilidad Sostenible con IA · Target 8.9</span>
</div>
""", unsafe_allow_html=True)

st.markdown(tags("OpenStreetMap", "GTFS / Transporte Público", "Ciclovías", "Accesibilidad Universal", "CO₂ Evitado", "Smart Destinations"), unsafe_allow_html=True)
st.markdown(sunset_bar(), unsafe_allow_html=True)

# ── Data ──────────────────────────────────────────────────────────────────
try:
    transport = load_transport()
    local = load_local_metrics()

    # ── KPI Cards ─────────────────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    avg_acc = round(local["local_accessibility_index"].mean(), 1)
    total_bici = int(local["cycling_km"].sum())
    high_mob = int((transport["overall_mobility_score"] >= 75).sum())

    with c1:
        st.markdown(kpi_card("20", "Destinos Analizados", "España peninsular + islas"), unsafe_allow_html=True)
    with c2:
        st.markdown(kpi_card(str(avg_acc), "Índice Accesibilidad Local Medio", "Escala 0–100"), unsafe_allow_html=True)
    with c3:
        st.markdown(kpi_card(f"{total_bici:,}", "km de Carriles Bici (total)", "Suma de los 20 destinos"), unsafe_allow_html=True)
    with c4:
        st.markdown(kpi_card(str(high_mob), "Destinos Alta Movilidad Sostenible", "Score interurbano ≥ 75"), unsafe_allow_html=True)

    st.markdown("---")

    # ── Spain Map + Table ─────────────────────────────────────────────────
    col_map, col_table = st.columns([3, 2])

    with col_map:
        st.markdown('<div class="map-label">Mapa Nacional de Movilidad</div>', unsafe_allow_html=True)
        st.caption("Tamaño y color del círculo = puntuación de movilidad sostenible interurbana")
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

    # ── AI Insight ────────────────────────────────────────────────────────
    best_dest = transport.sort_values("overall_mobility_score", ascending=False).iloc[0]["destination_name"]
    worst_dest = transport.sort_values("overall_mobility_score").iloc[0]["destination_name"]
    avg_co2 = round(transport["carbon_kg_per_visitor"].mean(), 0)
    st.markdown(insight_box(
        f"El destino mejor conectado en transporte sostenible es <strong>{best_dest}</strong>. "
        f"El CO₂ medio por visitante en la llegada es <strong>{avg_co2:.0f} kg</strong> — "
        f"hasta 4× inferior al avión si se usa el tren AVE. "
        f"<strong>{worst_dest}</strong> y otros destinos insulares presentan brecha estructural "
        f"por dependencia del vuelo y requieren compensación vía movilidad intra-destino sostenible."
    ), unsafe_allow_html=True)

    st.markdown("---")

    # ── Problem context ───────────────────────────────────────────────────
    st.subheader("¿Qué problema resuelve Pathfinder?")
    p1, p2, p3 = st.columns(3)
    with p1:
        st.markdown("""**Falta de visibilidad**

Los destinos no saben cómo se conectan sus recursos turísticos mediante movilidad sostenible. ¿A qué distancia está el hotel del monumento más cercano en bici? ¿Hay carril habilitado?""")
    with p2:
        st.markdown("""**Alta dependencia del coche**

El 70% de los destinos analizados presentan dependencia del vehículo privado superior al 45%, generando congestión, emisiones y degradación de la experiencia turística.""")
    with p3:
        st.markdown("""**Brechas de infraestructura**

Ciudades con alto potencial turístico carecen de ciclovías, transporte local frecuente o rutas peatonales accesibles para conectar sus principales atractivos.""")

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)

st.markdown("---")
st.caption("TUI Pathfinder · Reto 4 — Target 8.9 · TUI Care Foundation Future Shapers Spain · UCM 2026")
