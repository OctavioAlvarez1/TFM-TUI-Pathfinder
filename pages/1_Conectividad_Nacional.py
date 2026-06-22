import streamlit as st
from streamlit_folium import st_folium
from src.data.data_loader import load_transport, get_full_profile
from src.components.map_builder import build_mobility_map
from src.components.chart_builder import build_mobility_bar, build_transport_breakdown

st.set_page_config(page_title="Conectividad · Pathfinder", page_icon="🔗", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] { background: #0B1220; }
[data-testid="stSidebar"] { background: #111827; }
</style>
""", unsafe_allow_html=True)

st.title("🔗 Conectividad Nacional")
st.caption("Análisis de accesibilidad interurbana por transporte sostenible. Tren, bus y emisiones evitadas por destino.")

try:
    transport = load_transport()

    # KPIs
    c1, c2, c3, c4 = st.columns(4)
    high_mobility = int((transport["overall_mobility_score"] >= 75).sum())
    c1.metric("Alta movilidad (≥75)", high_mobility, "destinos")
    c2.metric("Movilidad moderada (50–74)", int(((transport["overall_mobility_score"] >= 50) & (transport["overall_mobility_score"] < 75)).sum()))
    c3.metric("Baja movilidad (<50)", int((transport["overall_mobility_score"] < 50).sum()), delta_color="inverse")
    avg_carbon = round(transport["carbon_kg_per_visitor"].mean(), 0)
    c4.metric("CO₂ medio/visitante", f"{avg_carbon:.0f} kg", "emisiones de llegada")

    st.divider()

    col_map, col_chart = st.columns([3, 2])

    with col_map:
        st.subheader("Mapa de Movilidad Sostenible")
        st.caption("Verde = alta sostenibilidad · Amarillo = moderada · Rojo = dependencia del coche/vuelo")
        m = build_mobility_map(transport)
        st_folium(m, use_container_width=True, height=500, returned_objects=[])

    with col_chart:
        st.subheader("Ranking por Score de Movilidad")
        st.plotly_chart(build_mobility_bar(transport), use_container_width=True)

    st.divider()
    st.subheader("Desglose por Modo de Transporte")
    st.caption("Puntuaciones de tren, bus y carga EV por destino")
    st.plotly_chart(build_transport_breakdown(transport), use_container_width=True)

    st.divider()
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
