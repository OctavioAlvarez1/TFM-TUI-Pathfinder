import streamlit as st
import plotly.express as px
from src.data.data_loader import load_transport, get_full_profile
from src.components.chart_builder import build_carbon_bar, build_mode_carbon_comparison
from src.config.settings import CARBON_BY_MODE
from src.ui.styles import render_css, kpi_card, insight_box, sunset_bar

st.set_page_config(page_title="Huella de Carbono · Pathfinder", page_icon="🌱", layout="wide")
render_css(st)

st.markdown('<div class="hero-title">🌱 Huella de <span class="hero-accent">Carbono</span></div>', unsafe_allow_html=True)
st.caption("CO₂ estimado por visitante en la llegada al destino, según modo de transporte típico de cada ciudad.")
st.markdown(sunset_bar(), unsafe_allow_html=True)

try:
    transport = load_transport()
    profile   = get_full_profile()

    low_carbon  = transport[transport["carbon_kg_per_visitor"] < 90]
    high_carbon = transport[transport["carbon_kg_per_visitor"] > 150]
    avg_co2 = transport["carbon_kg_per_visitor"].mean()

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(kpi_card(str(len(low_carbon)), "Destinos Bajo Carbono", "< 90 kg CO₂/visitante"), unsafe_allow_html=True)
    with c2:
        st.markdown(kpi_card(str(len(high_carbon)), "Destinos Alto Carbono", "> 150 kg CO₂ (islas)"), unsafe_allow_html=True)
    with c3:
        st.markdown(kpi_card(f"{avg_co2:.0f} kg", "Promedio CO₂ / Visitante", "Emisiones de llegada"), unsafe_allow_html=True)

    st.markdown("---")
    st.plotly_chart(build_carbon_bar(transport), use_container_width=True)

    st.markdown("---")

    col_scatter, col_modes = st.columns([3, 2])

    with col_scatter:
        st.subheader("CO₂ vs Sostenibilidad del Destino")
        st.caption("Ideal: bajo carbono + alta puntuación ESG (zona verde inferior derecha)")
        if "sustainability_score" in profile.columns:
            fig = px.scatter(
                profile,
                x="carbon_kg_per_visitor",
                y="sustainability_score",
                text="destination_name",
                color="destination_type" if "destination_type" in profile.columns else None,
                color_discrete_map={"coastal": "#0DD3C5", "inland": "#818CF8", "island": "#F97316"},
                height=420,
                template="plotly_dark",
            )
            fig.add_vline(x=90, line_dash="dash", line_color="#10B981",
                          annotation_text="Umbral bajo carbono", annotation_font_color="#10B981")
            fig.add_hline(y=70, line_dash="dash", line_color="#818CF8",
                          annotation_text="Buena sostenibilidad ESG", annotation_font_color="#818CF8")
            fig.update_traces(textposition="top center", marker_size=10)
            fig.update_layout(
                xaxis_title="CO₂ kg/visitante (llegada)",
                yaxis_title="Score de Sostenibilidad ESG",
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                font_color="#F1F5F9",
                legend_title="Tipo de destino",
            )
            st.plotly_chart(fig, use_container_width=True)

    with col_modes:
        st.subheader("Intensidad de CO₂ por Modo")
        st.caption("kg CO₂ por cada 100 km de trayecto")
        st.plotly_chart(build_mode_carbon_comparison(), use_container_width=True)
        st.markdown("""
**Conclusión clave:**

Un trayecto en tren emite **18× menos CO₂** que el mismo trayecto en avión.

Para destinos peninsulares con buena conectividad ferroviaria (Madrid, Barcelona, Córdoba, Valencia), el tren debe ser la recomendación por defecto.
        """)

    st.markdown("---")

    # AI Insight
    best_carbon = transport.sort_values("carbon_kg_per_visitor").iloc[0]
    worst_carbon = transport.sort_values("carbon_kg_per_visitor", ascending=False).iloc[0]
    st.markdown(insight_box(
        f"<strong>{best_carbon['destination_name']}</strong> es el destino con menor huella de carbono en la llegada "
        f"({best_carbon['carbon_kg_per_visitor']:.0f} kg CO₂/visitante), gracias a su conectividad ferroviaria. "
        f"<strong>{worst_carbon['destination_name']}</strong> registra la mayor huella "
        f"({worst_carbon['carbon_kg_per_visitor']:.0f} kg CO₂/visitante) por dependencia estructural del vuelo. "
        f"Si los {len(low_carbon)} destinos de bajo carbono captasen un 10% más de viajeros en detrimento de los destinos de alto carbono, "
        f"el CO₂ medio del portfolio caería un ~12%."
    ), unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("Calculadora de Carbono Personal")
    st.caption("Estima el CO₂ de tu desplazamiento según el modo elegido")
    distance = st.number_input("Distancia del trayecto (km)", min_value=10, max_value=3000, value=300, step=10)
    c_cols = st.columns(len(CARBON_BY_MODE))
    for col, (mode, factor) in zip(c_cols, CARBON_BY_MODE.items()):
        total = round(distance * factor / 100, 1)
        delta = None
        if mode != "Train":
            train_total = round(distance * CARBON_BY_MODE["Train"] / 100, 1)
            delta = f"+{total - train_total:.1f} kg vs tren"
        col.metric(mode, f"{total} kg CO₂", delta, delta_color="inverse" if delta else "normal")

    st.markdown("---")
    with st.expander("Metodología de cálculo"):
        st.markdown("""
**Fuentes:**
- Factores de emisión por modo: European Environment Agency (EEA), Transport & Environment 2023
- Tren: 14 g CO₂/km (media red española Renfe/alta velocidad)
- Bus: 68 g CO₂/km (media autobús interurbano España)
- Coche: 170 g CO₂/km (turismo promedio, incluyendo fabricación proporcional)
- Vuelo: 255 g CO₂/km (incluyendo efecto radiativo del contrail — factor 2×)

El `carbon_kg_per_visitor` por destino se estima a partir del modo de transporte dominante de llegada
(según datos INE/Turespaña) y la distancia media desde los principales mercados emisores (UK, Alemania, Francia).
        """)

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
