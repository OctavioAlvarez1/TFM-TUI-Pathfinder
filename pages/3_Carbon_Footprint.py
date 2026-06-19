import streamlit as st
import plotly.express as px
from src.data.data_loader import load_transport, get_full_profile
from src.components.chart_builder import build_carbon_bar
from src.config.settings import CARBON_BY_MODE

st.set_page_config(page_title="Carbon Footprint · Pathfinder", page_icon="🌱", layout="wide")
st.title("🌱 Carbon Footprint per Destination")
st.caption("Estimated CO₂ per visitor arrival, factoring in typical transport mode for each destination.")

try:
    transport = load_transport()
    profile = get_full_profile()

    col1, col2, col3 = st.columns(3)
    low_carbon = transport[transport["carbon_kg_per_visitor"] < 90]
    high_carbon = transport[transport["carbon_kg_per_visitor"] > 150]
    col1.metric("Low-carbon destinations", len(low_carbon), "< 90 kg CO₂")
    col2.metric("High-carbon destinations", len(high_carbon), "> 150 kg CO₂ (islands)", delta_color="inverse")
    col3.metric("Avg carbon per visitor", f"{transport['carbon_kg_per_visitor'].mean():.0f} kg CO₂")

    st.divider()
    st.plotly_chart(build_carbon_bar(transport), use_container_width=True)

    st.divider()
    st.subheader("Carbon vs. Sustainability Score")
    st.caption("Ideal destinations: low carbon footprint + high ESG sustainability score.")
    if "sustainability_score" in profile.columns:
        fig = px.scatter(
            profile,
            x="carbon_kg_per_visitor",
            y="sustainability_score",
            text="destination_name",
            color="destination_type" if "destination_type" in profile.columns else None,
            height=420,
        )
        fig.add_vline(x=90, line_dash="dash", line_color="#10B981", annotation_text="Low-carbon threshold")
        fig.add_hline(y=70, line_dash="dash", line_color="#6366F1", annotation_text="Good sustainability")
        fig.update_traces(textposition="top center", marker_size=10)
        fig.update_layout(plot_bgcolor="white", xaxis_title="Carbon kg/visitor", yaxis_title="Sustainability score")
        st.plotly_chart(fig, use_container_width=True)

    st.divider()
    st.subheader("Personal Carbon Calculator")
    distance = st.number_input("Journey distance (km)", min_value=50, max_value=3000, value=400, step=50)
    cols = st.columns(len(CARBON_BY_MODE))
    for col, (mode, factor) in zip(cols, CARBON_BY_MODE.items()):
        total = round(distance * factor / 100, 1)
        col.metric(f"{mode}", f"{total} kg CO₂", f"({factor} kg/100km)")

except Exception as e:
    st.error(f"Could not load data: {e}")
