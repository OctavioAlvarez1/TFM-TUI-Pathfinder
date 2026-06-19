import streamlit as st
from src.data.data_loader import load_transport, get_full_profile
from src.components.chart_builder import build_mobility_bar

st.set_page_config(
    page_title="Pathfinder — Sustainable Mobility",
    page_icon="🧭",
    layout="wide",
)

st.title("🧭 Pathfinder — Sustainable Mobility & Accessibility")
st.caption("Mapping sustainable transport connections to 20 Spanish tourism destinations.")

try:
    transport = load_transport()
    profile = get_full_profile()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Destinations mapped", 20)
    high_mobility = int((transport["overall_mobility_score"] >= 75).sum())
    col2.metric("High mobility destinations", high_mobility, "score ≥ 75")
    low_carbon = int((transport["carbon_kg_per_visitor"] < 90).sum())
    col3.metric("Low-carbon destinations", low_carbon, "< 90 kg CO₂")
    avg_pt = round(transport["public_transport_modal_share"].mean(), 1)
    col4.metric("Avg public transport share", f"{avg_pt}%")

    st.divider()
    st.subheader("Overall Mobility Ranking")
    st.caption("Composite score: 45% train + 30% bus + 25% airport proximity. Higher = more sustainable access.")
    st.plotly_chart(build_mobility_bar(transport), use_container_width=True)

    st.divider()
    st.subheader("Transport Mode Carbon Footprint")
    st.markdown("""
Carbon intensity (kg CO₂ per 100 km) by transport mode:

| Mode | kg CO₂ / 100 km | Recommendation |
|---|---|---|
| 🚂 Train | 14 | Best choice — use whenever possible |
| 🚌 Bus | 68 | Good alternative to car |
| 🚗 Car | 170 | Avoid for medium/long distances |
| ✈️ Flight | 255 | Only for islands or remote destinations |

Pathfinder integrates with the TUI Care Foundation Suite — high-mobility destinations score
better in **Horizon**'s sustainability component and appear more in redistribution recommendations.
    """)

except Exception as e:
    st.error(f"Could not load data: {e}")
    st.info("Make sure TUI-Smart-Destination-Recommender is on the same Desktop folder, or place CSVs in data/raw/.")
