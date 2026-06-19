import streamlit as st
from streamlit_folium import st_folium
from src.data.data_loader import load_transport
from src.components.map_builder import build_mobility_map

st.set_page_config(page_title="Connectivity Map · Pathfinder", page_icon="🗺️", layout="wide")
st.title("🗺️ Connectivity Map")
st.caption("Sustainable transport accessibility per destination. Circle size and colour = mobility score.")

try:
    transport = load_transport()
    m = build_mobility_map(transport)
    st_folium(m, use_container_width=True, height=560)

    st.divider()
    col1, col2, col3 = st.columns(3)
    col1.metric("High mobility (≥75)", int((transport["overall_mobility_score"] >= 75).sum()))
    col2.metric("Moderate (50–74)", int(((transport["overall_mobility_score"] >= 50) & (transport["overall_mobility_score"] < 75)).sum()))
    col3.metric("Low (<50)", int((transport["overall_mobility_score"] < 50).sum()))

    st.subheader("Islands require flights — unavoidable carbon cost")
    islands = transport[transport["destination_name"].isin(["Palma de Mallorca", "Las Palmas", "Tenerife"])]
    st.dataframe(
        islands[["destination_name", "overall_mobility_score", "carbon_kg_per_visitor", "airport_distance_km"]],
        use_container_width=True,
    )

    with st.expander("All destinations — mobility data"):
        st.dataframe(
            transport[["destination_name", "overall_mobility_score", "train_score", "bus_score", "carbon_kg_per_visitor"]]
            .sort_values("overall_mobility_score", ascending=False),
            use_container_width=True,
        )

except Exception as e:
    st.error(f"Could not load data: {e}")
