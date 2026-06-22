"""
Accesibilidad Local — mapa interactivo de POIs turísticos dentro de cada destino.
Muestra conectividad a pie, en bici y en bus para cada punto de interés.
"""
import streamlit as st
import folium
from streamlit_folium import st_folium
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from src.data.data_loader import load_local_metrics, load_pois
from src.data.local_mobility import get_type_colors, get_type_labels

st.set_page_config(page_title="Accesibilidad Local · Pathfinder", page_icon="📍", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] { background: #0B1220; }
[data-testid="stSidebar"] { background: #111827; }
</style>
""", unsafe_allow_html=True)

st.title("📍 Accesibilidad Local")
st.caption("Conectividad entre recursos turísticos dentro de cada destino: a pie, en bicicleta y en transporte público.")

try:
    local = load_local_metrics()
    dest_names = sorted(local["destination_name"].tolist())

    # ── Sidebar ───────────────────────────────────────────────────────────
    with st.sidebar:
        st.markdown("### Filtros")
        selected_city = st.selectbox("Destino", dest_names, index=0)
        mode_filter = st.radio(
            "Modo de transporte",
            ["Todos", "A pie", "Bicicleta", "Bus / Tram"],
            index=0,
        )
        show_heatmap = st.toggle("Mostrar mapa de calor", value=False)
        st.divider()
        st.caption("Color de los marcadores:\n🟠 Monumento · 🩵 Hotel · 🟣 Transporte · 🟡 Gastronomía · 🟢 Naturaleza · 🔵 Bici")

    # ── City metrics ──────────────────────────────────────────────────────
    city_row = local[local["destination_name"] == selected_city].iloc[0]
    pois = load_pois(selected_city)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Índice accesibilidad local", f"{city_row['local_accessibility_index']:.1f} / 100")
    c2.metric("Km de carril bici", f"{city_row['cycling_km']} km")
    c3.metric("Estaciones de bici pública", int(city_row["bike_stations"]))
    c4.metric("Cobertura bus local", f"{city_row['local_bus_score']} / 100")

    st.markdown("---")

    col_map, col_detail = st.columns([3, 2])

    with col_map:
        st.subheader(f"Mapa de Recursos Turísticos — {selected_city}")

        score_col = {
            "Todos": "overall_accessibility",
            "A pie": "walk_score",
            "Bicicleta": "bike_score",
            "Bus / Tram": "bus_score",
        }[mode_filter]

        def acc_color(score: float) -> str:
            if score >= 75: return "#10B981"
            if score >= 55: return "#0DD3C5"
            if score >= 40: return "#EAB308"
            return "#F97316"

        m = folium.Map(
            location=[city_row["lat"], city_row["lon"]],
            zoom_start=14,
            tiles="CartoDB dark_matter",
        )

        if show_heatmap:
            from folium.plugins import HeatMap
            heat_data = [[r["lat"], r["lon"], r[score_col] / 100] for _, r in pois.iterrows()]
            HeatMap(heat_data, radius=25, blur=18, max_zoom=14).add_to(m)

        # POI markers
        for _, poi in pois.iterrows():
            score = poi[score_col]
            folium.CircleMarker(
                location=[poi["lat"], poi["lon"]],
                radius=7 + score * 0.06,
                color=poi["color"],
                fill=True,
                fill_color=acc_color(score),
                fill_opacity=0.85,
                tooltip=folium.Tooltip(
                    f"<b>{poi['name']}</b><br>"
                    f"Tipo: {poi['type_label']}<br>"
                    f"Accesibilidad global: {poi['overall_accessibility']:.0f}/100<br>"
                    f"🚶 A pie: {poi['walk_time_min']} min · Score {poi['walk_score']}<br>"
                    f"🚲 Bici: {poi['bike_time_min']} min · Score {poi['bike_score']}<br>"
                    f"🚌 Bus: {poi['bus_time_min']} min · Score {poi['bus_score']}<br>"
                    f"Dist. parada bus: {poi['distance_to_bus_m']} m<br>"
                    f"Dist. punto bici: {poi['distance_to_bike_m']} m"
                ),
            ).add_to(m)

        # City center marker
        folium.Marker(
            [city_row["lat"], city_row["lon"]],
            icon=folium.Icon(color="blue", icon="home", prefix="fa"),
            tooltip="Centro de la ciudad",
        ).add_to(m)

        # Legend
        legend = """
        <div style="position:fixed;bottom:25px;left:25px;z-index:1000;
                    background:rgba(17,24,39,0.95);padding:10px 14px;
                    border-radius:8px;border:1px solid #374151;font-size:12px;color:#F1F5F9;">
            <b>Accesibilidad</b><br>
            <span style="color:#10B981">●</span> Alta (≥75)<br>
            <span style="color:#0DD3C5">●</span> Buena (55–74)<br>
            <span style="color:#EAB308">●</span> Moderada (40–54)<br>
            <span style="color:#F97316">●</span> Limitada (&lt;40)
        </div>"""
        m.get_root().html.add_child(folium.Element(legend))

        st_folium(m, use_container_width=True, height=500, returned_objects=[])

    with col_detail:
        st.subheader("Puntuaciones por POI")
        st.caption(f"Modo seleccionado: **{mode_filter}**")

        label_map = {
            "overall_accessibility": "Accesibilidad Global",
            "walk_score": "Score a Pie",
            "bike_score": "Score Bici",
            "bus_score": "Score Bus",
        }

        pois_sorted = pois.sort_values(score_col, ascending=True)
        colors_list = [acc_color(s) for s in pois_sorted[score_col]]
        fig = go.Figure(go.Bar(
            x=pois_sorted[score_col],
            y=pois_sorted["name"],
            orientation="h",
            marker_color=colors_list,
            text=[f"{s:.0f}" for s in pois_sorted[score_col]],
            textposition="outside",
        ))
        fig.update_layout(
            height=500,
            margin=dict(l=10, r=50, t=20, b=20),
            xaxis=dict(range=[0, 115], title=label_map[score_col]),
            yaxis_title="",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9",
        )
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    # ── Accessibility table ────────────────────────────────────────────────
    st.subheader("Detalle de Accesibilidad por Recurso")
    display_cols = ["name", "type_label", "overall_accessibility", "walk_time_min", "bike_time_min", "bus_time_min", "distance_to_bus_m"]
    st.dataframe(
        pois[display_cols].sort_values("overall_accessibility", ascending=False).rename(columns={
            "name": "Recurso",
            "type_label": "Tipo",
            "overall_accessibility": "Score Global",
            "walk_time_min": "A pie (min)",
            "bike_time_min": "Bici (min)",
            "bus_time_min": "Bus (min)",
            "distance_to_bus_m": "Dist. bus (m)",
        }),
        use_container_width=True,
        hide_index=True,
    )

    # ── City mobility profile ──────────────────────────────────────────────
    st.markdown("---")
    st.subheader(f"Perfil de Movilidad Urbana — {selected_city}")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Score movilidad a pie", f"{city_row['walking_score']:.0f} / 100")
    m2.metric("Score bus / tram local", f"{city_row['local_bus_score']:.0f} / 100")
    m3.metric("Accesibilidad universal", f"{city_row['universal_access']:.0f} / 100")
    m4.metric("Sentimiento movilidad", f"{city_row['sentiment_mobility']:.2f}", "(escala -1 a +1)")

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
