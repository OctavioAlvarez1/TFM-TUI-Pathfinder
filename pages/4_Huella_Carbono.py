import streamlit as st
import plotly.express as px
from src.data.data_loader import load_transport, get_full_profile
from src.components.chart_builder import build_carbon_bar, build_mode_carbon_comparison
from src.config.settings import CARBON_BY_MODE

st.set_page_config(page_title="Huella de Carbono · Pathfinder", page_icon="🌱", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] { background: #0B1220; }
[data-testid="stSidebar"] { background: #111827; }
</style>
""", unsafe_allow_html=True)

st.title("🌱 Huella de Carbono por Destino")
st.caption("CO₂ estimado por visitante en la llegada al destino, según modo de transporte típico de cada ciudad.")

try:
    transport = load_transport()
    profile = get_full_profile()

    # KPIs
    low_carbon  = transport[transport["carbon_kg_per_visitor"] < 90]
    high_carbon = transport[transport["carbon_kg_per_visitor"] > 150]
    c1, c2, c3 = st.columns(3)
    c1.metric("Destinos bajo carbono", len(low_carbon), "< 90 kg CO₂/visitante")
    c2.metric("Destinos alto carbono", len(high_carbon), "> 150 kg CO₂ (islas)", delta_color="inverse")
    c3.metric("Promedio CO₂/visitante", f"{transport['carbon_kg_per_visitor'].mean():.0f} kg CO₂")

    st.divider()
    st.plotly_chart(build_carbon_bar(transport), use_container_width=True)

    st.divider()

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

Las islas (Canarias, Baleares) tienen un coste de carbono inevitable por vuelo que Pathfinder registra como "brecha estructural de accesibilidad".
        """)

    st.divider()
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

    st.divider()
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
