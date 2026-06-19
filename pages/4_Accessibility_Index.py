import streamlit as st
import plotly.express as px
from src.data.data_loader import get_full_profile, load_transport

st.set_page_config(page_title="Accessibility Index · Pathfinder", page_icon="♿", layout="wide")
st.title("♿ Accessibility & Investment Index")
st.caption("Composite view of mobility, sustainability, and where infrastructure investment is most needed.")

try:
    profile = get_full_profile()
    transport = load_transport()

    # Accessibility index = mobility score weighted with pt_modal_share
    transport["accessibility_index"] = (
        0.5 * transport["overall_mobility_score"] +
        0.3 * transport["train_score"] +
        0.2 * (100 - transport["carbon_kg_per_visitor"].clip(0, 200) / 2)
    ).round(1)

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Accessibility Index Ranking")
        fig1 = px.bar(
            transport.sort_values("accessibility_index"),
            x="accessibility_index",
            y="destination_name",
            orientation="h",
            color="accessibility_index",
            color_continuous_scale=[[0, "#EF4444"], [0.5, "#F59E0B"], [1, "#10B981"]],
            height=520,
            text="accessibility_index",
        )
        fig1.update_layout(
            yaxis_title="",
            xaxis_title="Accessibility Index",
            margin=dict(l=160, r=40, t=20, b=40),
        )
        fig1.update_coloraxes(showscale=False)
        st.plotly_chart(fig1, use_container_width=True)

    with col2:
        st.subheader("Public Transport Modal Share")
        st.caption("% of tourists arriving by public transport")
        fig2 = px.bar(
            transport.sort_values("public_transport_modal_share"),
            x="public_transport_modal_share",
            y="destination_name",
            orientation="h",
            color="public_transport_modal_share",
            color_continuous_scale=[[0, "#EF4444"], [0.5, "#F59E0B"], [1, "#10B981"]],
            height=520,
            text="public_transport_modal_share",
        )
        fig2.update_layout(
            yaxis_title="",
            xaxis_title="% arriving by public transport",
            margin=dict(l=160, r=40, t=20, b=40),
        )
        fig2.update_coloraxes(showscale=False)
        st.plotly_chart(fig2, use_container_width=True)

    st.divider()
    st.subheader("Investment Priority — Where to Improve Connectivity")
    st.caption("Destinations with high visitor demand (low congestion score = underused) but low transport connectivity.")

    bottom_mobility = transport.sort_values("overall_mobility_score").head(5)
    st.markdown("**Top 5 destinations needing transport investment:**")
    for _, row in bottom_mobility.iterrows():
        with st.expander(f"🚧 {row['destination_name']} — mobility score: {row['overall_mobility_score']:.0f}"):
            c1, c2, c3 = st.columns(3)
            c1.metric("Train score", f"{row['train_score']}/100")
            c2.metric("Bus score", f"{row['bus_score']}/100")
            c3.metric("Carbon/visitor", f"{row['carbon_kg_per_visitor']} kg CO₂")
            st.markdown(f"**Recommended action:** Improve train/bus connections to reduce reliance on flights and private cars.")

    with st.expander("Full data table"):
        st.dataframe(
            transport[["destination_name", "overall_mobility_score", "train_score", "bus_score",
                        "public_transport_modal_share", "carbon_kg_per_visitor", "accessibility_index"]]
            .sort_values("accessibility_index", ascending=False),
            use_container_width=True,
        )

except Exception as e:
    st.error(f"Could not load data: {e}")
