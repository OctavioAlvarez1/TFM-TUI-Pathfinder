import streamlit as st
from streamlit_folium import st_folium
from src.data.data_loader import load_transport, get_full_profile
from src.components.map_builder import build_mobility_map
from src.components.chart_builder import build_mobility_bar, build_transport_breakdown
from src.ui.styles import render_css, kpi_card, insight_box, sunset_bar

st.set_page_config(page_title="Conectividad · Pathfinder", page_icon="🔗", layout="wide")
render_css(st)

st.markdown('<div class="hero-title">🔗 Conectividad <span class="hero-accent">Nacional</span></div>', unsafe_allow_html=True)
st.caption("Análisis de accesibilidad interurbana por transporte sostenible. Tren, bus y emisiones evitadas por destino.")
st.markdown(sunset_bar(), unsafe_allow_html=True)

try:
    transport = load_transport()

    # KPIs
    high_mobility = int((transport["overall_mobility_score"] >= 75).sum())
    mid_mobility  = int(((transport["overall_mobility_score"] >= 50) & (transport["overall_mobility_score"] < 75)).sum())
    low_mobility  = int((transport["overall_mobility_score"] < 50).sum())
    avg_carbon    = round(transport["carbon_kg_per_visitor"].mean(), 0)

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(kpi_card(str(high_mobility), "Alta Movilidad Sostenible", "Score ≥ 75"), unsafe_allow_html=True)
    with c2:
        st.markdown(kpi_card(str(mid_mobility), "Movilidad Moderada", "Score 50–74"), unsafe_allow_html=True)
    with c3:
        st.markdown(kpi_card(str(low_mobility), "Baja Movilidad", "Score < 50"), unsafe_allow_html=True)
    with c4:
        st.markdown(kpi_card(f"{avg_carbon:.0f} kg", "CO₂ Medio / Visitante", "Emisiones de llegada"), unsafe_allow_html=True)

    st.markdown("---")

    col_map, col_chart = st.columns([3, 2])

    with col_map:
        st.markdown('<div class="map-label">Mapa de Movilidad Sostenible</div>', unsafe_allow_html=True)
        st.caption("Verde = alta sostenibilidad · Amarillo = moderada · Rojo = dependencia del coche/vuelo")
        m = build_mobility_map(transport)
        st_folium(m, use_container_width=True, height=500, returned_objects=[])

    with col_chart:
        st.subheader("Ranking por Score de Movilidad")
        st.plotly_chart(build_mobility_bar(transport), use_container_width=True)

    st.markdown("---")
    st.subheader("Desglose por Modo de Transporte")
    st.caption("Puntuaciones de tren, bus y carga EV por destino")
    st.plotly_chart(build_transport_breakdown(transport), use_container_width=True)

    st.markdown("---")

    # AI Insight
    best = transport.sort_values("overall_mobility_score", ascending=False).iloc[0]
    worst = transport.sort_values("overall_mobility_score").iloc[0]
    st.markdown(insight_box(
        f"<strong>{best['destination_name']}</strong> lidera la conectividad interurbana sostenible con un score de "
        f"<strong>{best['overall_mobility_score']:.0f}/100</strong>, impulsado por su red de tren de alta velocidad. "
        f"<strong>{worst['destination_name']}</strong> registra la mayor huella de carbono "
        f"({worst['carbon_kg_per_visitor']:.0f} kg CO₂/visitante) por dependencia estructural del vuelo. "
        f"Invertir en conectividad ferroviaria peninsular reduciría las emisiones de llegada un 60–75%."
    ), unsafe_allow_html=True)

    st.markdown("---")

    st.subheader("Islas — coste de carbono inevitable")
    st.caption("Las islas requieren vuelo para la llegada, lo que penaliza su puntuación de movilidad interurbana.")
    islands = transport[transport["destination_name"].isin(["Palma de Mallorca", "Las Palmas", "Tenerife"])]
    st.dataframe(
        islands[["destination_name", "overall_mobility_score", "carbon_kg_per_visitor", "airport_distance_km"]]
        .rename(columns={
            "destination_name": "Destino",
            "overall_mobility_score": "Score Movilidad",
            "carbon_kg_per_visitor": "CO₂/visitante (kg)",
            "airport_distance_km": "Dist. Aeropuerto (km)",
        }),
        use_container_width=True,
        hide_index=True,
    )
    st.info("Pathfinder integra la accesibilidad interurbana en el modelo de redistribución de Horizon (Reto 2). Destinos con alta puntuación aparecen más en las recomendaciones de viaje sostenible.")

    with st.expander("Tabla completa — todos los destinos"):
        st.dataframe(
            transport[["destination_name", "overall_mobility_score", "train_score", "bus_score",
                        "public_transport_modal_share", "carbon_kg_per_visitor"]]
            .sort_values("overall_mobility_score", ascending=False)
            .rename(columns={
                "destination_name": "Destino",
                "overall_mobility_score": "Score Total",
                "train_score": "Tren",
                "bus_score": "Bus",
                "public_transport_modal_share": "% TP Modal",
                "carbon_kg_per_visitor": "CO₂/visitante (kg)",
            }),
            use_container_width=True,
            hide_index=True,
        )

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
