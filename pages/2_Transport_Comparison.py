import streamlit as st
from src.data.data_loader import load_transport
from src.components.chart_builder import build_transport_breakdown, build_mode_carbon_comparison

st.set_page_config(page_title="Transport Comparison · Pathfinder", page_icon="🚂", layout="wide")
st.title("🚂 Transport Mode Comparison")
st.caption("Train, bus, and EV charging infrastructure scores per destination.")

try:
    transport = load_transport()

    col1, col2 = st.columns([3, 2])
    with col1:
        st.subheader("Train · Bus · EV Charging per Destination")
        st.plotly_chart(build_transport_breakdown(transport), use_container_width=True)

    with col2:
        st.subheader("Carbon Intensity by Mode")
        st.caption("kg CO₂ per 100 km")
        st.plotly_chart(build_mode_carbon_comparison(), use_container_width=True)

        st.markdown("""
**Key insight:** A train journey emits **18× less CO₂** than flying over the same distance.

For mainland destinations with good rail connectivity (Madrid, Barcelona, Cordoba, Valencia),
train should be the default recommendation.
        """)

    st.divider()
    st.subheader("Top Destinations by Train Connectivity")
    top_train = transport.sort_values("train_score", ascending=False).head(10)
    st.dataframe(
        top_train[["destination_name", "train_score", "bus_score", "overall_mobility_score"]],
        use_container_width=True,
    )

except Exception as e:
    st.error(f"Could not load data: {e}")
