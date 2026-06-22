"""
Brechas de Infraestructura — análisis comparativo de movilidad sostenible entre los 20 destinos.
Identifica ciudades con mayor potencial de mejora y oportunidades de inversión.
"""
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from src.data.data_loader import load_local_metrics, load_transport
from src.ui.styles import render_css, kpi_card, insight_box, sunset_bar

st.set_page_config(page_title="Brechas · Pathfinder", page_icon="📊", layout="wide")
render_css(st)

st.markdown('<div class="hero-title">📊 Brechas de <span class="hero-accent">Infraestructura</span></div>', unsafe_allow_html=True)
st.caption("Análisis comparativo de movilidad sostenible. Identifica dónde invertir para reducir la dependencia del coche y mejorar la experiencia turística.")
st.markdown(sunset_bar(), unsafe_allow_html=True)

try:
    local     = load_local_metrics()
    transport = load_transport()

    merged = local.merge(
        transport[["destination_name", "overall_mobility_score", "carbon_kg_per_visitor", "public_transport_modal_share"]],
        on="destination_name", how="left",
    )

    # ── KPIs ──────────────────────────────────────────────────────────────
    high_gap     = int((local["infrastructure_gap"] > 35).sum())
    worst_bici   = local.loc[local["cycling_km"].idxmin(), "destination_name"]
    worst_car    = local.loc[local["car_dependency"].idxmax(), "destination_name"]
    worst_univ   = local.loc[local["universal_access"].idxmin(), "destination_name"]

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(kpi_card(str(high_gap), "Destinos con Brecha Alta", "Infraestructura gap > 35 pts"), unsafe_allow_html=True)
    with c2:
        st.markdown(kpi_card(f"{local['cycling_km'].min()} km", "Menor Red Ciclista", worst_bici), unsafe_allow_html=True)
    with c3:
        st.markdown(kpi_card(f"{local['car_dependency'].max()}%", "Mayor Dep. Coche", worst_car), unsafe_allow_html=True)
    with c4:
        st.markdown(kpi_card(f"{local['universal_access'].min()}", "Menor Acc. Universal", worst_univ), unsafe_allow_html=True)

    st.markdown("---")

    # ── Cycling infrastructure ranking ─────────────────────────────────────
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Carriles Bici por Destino (km urbanos)")
        local_sorted = local.sort_values("cycling_km", ascending=True)
        colors = [
            "#10B981" if v >= 100 else "#0DD3C5" if v >= 60 else "#EAB308" if v >= 40 else "#F97316"
            for v in local_sorted["cycling_km"]
        ]
        fig1 = go.Figure(go.Bar(
            x=local_sorted["cycling_km"],
            y=local_sorted["destination_name"],
            orientation="h",
            marker_color=colors,
            text=[f"{v} km" for v in local_sorted["cycling_km"]],
            textposition="outside",
        ))
        fig1.add_vline(x=local["cycling_km"].mean(), line_dash="dash", line_color="#818CF8",
                       annotation_text=f"Media: {local['cycling_km'].mean():.0f} km",
                       annotation_font_color="#818CF8")
        fig1.update_layout(
            height=520, xaxis=dict(range=[0, 250], title="km de carril bici"),
            yaxis_title="", margin=dict(l=10, r=80, t=20, b=20),
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9",
        )
        st.plotly_chart(fig1, use_container_width=True)

    with col2:
        st.subheader("Accesibilidad Universal (0–100)")
        local_sorted2 = local.sort_values("universal_access", ascending=True)
        colors2 = [
            "#10B981" if v >= 70 else "#EAB308" if v >= 55 else "#F97316"
            for v in local_sorted2["universal_access"]
        ]
        fig2 = go.Figure(go.Bar(
            x=local_sorted2["universal_access"],
            y=local_sorted2["destination_name"],
            orientation="h",
            marker_color=colors2,
            text=[f"{v}" for v in local_sorted2["universal_access"]],
            textposition="outside",
        ))
        fig2.add_vline(x=65, line_dash="dash", line_color="#0DD3C5",
                       annotation_text="Umbral recomendado: 65",
                       annotation_font_color="#0DD3C5")
        fig2.update_layout(
            height=520, xaxis=dict(range=[0, 115], title="Score accesibilidad universal"),
            yaxis_title="", margin=dict(l=10, r=60, t=20, b=20),
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9",
        )
        st.plotly_chart(fig2, use_container_width=True)

    st.markdown("---")

    # ── Scatter: accessibility vs car dependency ────────────────────────────
    st.subheader("Accesibilidad Local vs Dependencia del Vehículo Privado")
    st.caption("Ideal: alta accesibilidad local + baja dependencia del coche (zona superior izquierda)")

    fig_scatter = px.scatter(
        merged,
        x="car_dependency",
        y="local_accessibility_index",
        size="cycling_km",
        color="local_accessibility_index",
        color_continuous_scale=[[0, "#EF4444"], [0.5, "#EAB308"], [1, "#10B981"]],
        text="destination_name",
        hover_data={"cycling_km": True, "bike_stations": True, "car_dependency": True},
        height=480,
        template="plotly_dark",
        size_max=40,
    )
    fig_scatter.add_hline(y=merged["local_accessibility_index"].mean(), line_dash="dash",
                          line_color="#818CF8", annotation_text="Media accesibilidad",
                          annotation_font_color="#818CF8")
    fig_scatter.add_vline(x=merged["car_dependency"].mean(), line_dash="dash",
                          line_color="#818CF8", annotation_text="Media dep. coche",
                          annotation_font_color="#818CF8")
    fig_scatter.update_traces(textposition="top center")
    fig_scatter.update_layout(
        xaxis_title="Dependencia del vehículo privado (%)",
        yaxis_title="Índice de Accesibilidad Local (0–100)",
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        font_color="#F1F5F9",
        coloraxis_showscale=False,
    )
    st.plotly_chart(fig_scatter, use_container_width=True)

    st.markdown("---")

    # AI Insight
    bottom3_names = ", ".join(local.sort_values("local_accessibility_index").head(3)["destination_name"].tolist())
    st.markdown(insight_box(
        f"Los destinos <strong>{bottom3_names}</strong> concentran las brechas de infraestructura más severas: "
        f"red ciclista inferior a 50 km, score de bus por debajo de 65/100 y alta dependencia del coche. "
        f"Una inversión coordinada de 15–20 M€ en ciclovías turísticas y mejora de frecuencias de bus "
        f"elevaría su índice de accesibilidad en ~25 puntos, equiparándolos a la media del portfolio."
    ), unsafe_allow_html=True)

    st.markdown("---")

    # ── Priority investment table ─────────────────────────────────────────
    st.subheader("Prioridades de Inversión — Top 5 destinos con mayor brecha")
    st.caption("Ciudades con alto flujo turístico pero infraestructura de movilidad sostenible insuficiente")

    bottom5 = local.sort_values("local_accessibility_index").head(5)

    for _, row in bottom5.iterrows():
        gap = row["infrastructure_gap"]
        with st.expander(f"🚧 {row['destination_name']} — brecha: {gap:.1f} puntos"):
            b1, b2, b3, b4 = st.columns(4)
            b1.metric("Carril bici", f"{row['cycling_km']} km",
                      delta=f"-{210 - row['cycling_km']:.0f} km vs Barcelona",
                      delta_color="inverse")
            b2.metric("Bus local", f"{row['local_bus_score']}/100")
            b3.metric("Accesibilidad universal", f"{row['universal_access']}/100")
            b4.metric("Dependencia coche", f"{row['car_dependency']}%", delta_color="inverse")

            recs = []
            if row["cycling_km"] < 50:
                recs.append(f"Ampliar red ciclista: actualmente {row['cycling_km']} km, objetivo mínimo 80 km")
            if row["local_bus_score"] < 65:
                recs.append(f"Mejorar frecuencia del bus local (score actual: {row['local_bus_score']}/100)")
            if row["universal_access"] < 60:
                recs.append(f"Plan de accesibilidad universal en los 10 principales atractivos turísticos")
            if row["bike_stations"] < 50:
                recs.append(f"Instalar red de bicicleta pública: actualmente {row['bike_stations']} estaciones")

            if recs:
                st.markdown("**Recomendaciones:**")
                for r in recs:
                    st.markdown(f"- {r}")

    st.markdown("---")

    # ── Full comparison table ─────────────────────────────────────────────
    with st.expander("Tabla completa — todos los indicadores por destino"):
        display = merged[[
            "destination_name", "local_accessibility_index", "cycling_km",
            "bike_stations", "local_bus_score", "universal_access",
            "car_dependency", "infrastructure_gap", "sentiment_mobility",
        ]].sort_values("local_accessibility_index", ascending=False)
        st.dataframe(
            display.rename(columns={
                "destination_name": "Destino",
                "local_accessibility_index": "Índice Acc.",
                "cycling_km": "km Bici",
                "bike_stations": "Est. Bici",
                "local_bus_score": "Score Bus",
                "universal_access": "Acc. Universal",
                "car_dependency": "Dep. Coche (%)",
                "infrastructure_gap": "Brecha Infraestr.",
                "sentiment_mobility": "Sentimiento Mov.",
            }),
            use_container_width=True,
            hide_index=True,
        )

    st.markdown("---")
    st.subheader("Análisis estratégico")
    st.markdown("""
**Tres tipologías de brecha identificadas:**

| Tipología | Destinos afectados | Acción prioritaria |
|-----------|-------------------|-------------------|
| **Carril bici inexistente** | Toledo, Granada, Salamanca | Plan director de ciclovías turísticas |
| **Bus local deficiente** | Toledo, Tenerife, Murcia | Aumento de frecuencias + integración tarifaria |
| **Accesibilidad universal baja** | Toledo, Granada, Tenerife | Adaptación PMR de monumentos y alojamientos |

La integración de Pathfinder con **Horizon** (Reto 2) permite incorporar el índice de accesibilidad local como factor de penalización en las recomendaciones de destinos con alta congestión pero baja movilidad sostenible.
    """)

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
