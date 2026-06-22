"""
Accesibilidad Local — mapa interactivo de POIs turísticos dentro de cada destino.
Muestra conectividad a pie, en bici y en bus para cada punto de interés.
Incluye perfil radar del destino y análisis Pathfinder IA.
"""
import streamlit as st
import folium
from streamlit_folium import st_folium
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from src.data.data_loader import load_local_metrics, load_pois
from src.data.local_mobility import get_type_colors, get_type_labels
from src.ui.styles import render_css, kpi_card, insight_box, sunset_bar

st.set_page_config(page_title="Accesibilidad Local · Pathfinder", page_icon="📍", layout="wide")
render_css(st)

st.markdown('<div class="hero-title">📍 Accesibilidad <span class="hero-accent">Local</span></div>', unsafe_allow_html=True)
st.caption("Conectividad entre recursos turísticos dentro de cada destino: a pie, en bicicleta y en transporte público.")
st.markdown(sunset_bar(), unsafe_allow_html=True)

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
    with c1:
        st.markdown(kpi_card(f"{city_row['local_accessibility_index']:.1f}", "Índice Accesibilidad Local", "Escala 0–100"), unsafe_allow_html=True)
    with c2:
        st.markdown(kpi_card(f"{city_row['cycling_km']} km", "Carril Bici Urbano", "km en zona turística"), unsafe_allow_html=True)
    with c3:
        st.markdown(kpi_card(str(int(city_row["bike_stations"])), "Estaciones Bici Pública", "Puntos de préstamo"), unsafe_allow_html=True)
    with c4:
        st.markdown(kpi_card(f"{city_row['local_bus_score']}", "Cobertura Bus / Tram", "Score 0–100"), unsafe_allow_html=True)

    st.markdown("---")

    col_map, col_detail = st.columns([3, 2])

    with col_map:
        st.markdown(f'<div class="map-label">Recursos Turísticos — {selected_city}</div>', unsafe_allow_html=True)

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

        folium.Marker(
            [city_row["lat"], city_row["lon"]],
            icon=folium.Icon(color="blue", icon="home", prefix="fa"),
            tooltip="Centro de la ciudad",
        ).add_to(m)

        legend = """
        <div style="position:fixed;bottom:25px;left:25px;z-index:1000;
                    background:rgba(11,18,32,0.95);padding:10px 14px;
                    border-radius:8px;border:1px solid rgba(129,140,248,0.25);font-size:12px;color:#F1F5F9;">
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

    # ── Radar chart ────────────────────────────────────────────────────────
    col_radar, col_table = st.columns([2, 3])

    with col_radar:
        st.subheader(f"Perfil de Destino — {selected_city}")
        st.caption("Pentágono de movilidad: accesibilidad, infraestructura, transporte, sostenibilidad y sentimiento")

        categories = ["Accesibilidad", "Infraestructura\nciclista", "Transporte\npúblico", "Acc. Universal", "Sentimiento\nmovilidad"]
        values = [
            city_row["local_accessibility_index"],
            min(city_row["cycling_km"] / 210 * 100, 100),   # normalise vs best (210 km Barcelona)
            city_row["local_bus_score"],
            city_row["universal_access"],
            (city_row["sentiment_mobility"] + 1) / 2 * 100,  # -1..+1 → 0..100
        ]
        values_closed = values + [values[0]]
        cats_closed   = categories + [categories[0]]

        fig_radar = go.Figure(go.Scatterpolar(
            r=values_closed,
            theta=cats_closed,
            fill="toself",
            fillcolor="rgba(129,140,248,0.15)",
            line=dict(color="#818CF8", width=2),
            marker=dict(color="#818CF8", size=6),
        ))
        fig_radar.update_layout(
            polar=dict(
                bgcolor="rgba(0,0,0,0)",
                radialaxis=dict(visible=True, range=[0, 100], tickfont=dict(color="#475569", size=9), gridcolor="rgba(129,140,248,0.15)"),
                angularaxis=dict(tickfont=dict(color="#CBD5E1", size=9), gridcolor="rgba(129,140,248,0.15)"),
            ),
            showlegend=False,
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9",
            height=320,
            margin=dict(l=20, r=20, t=20, b=20),
        )
        st.plotly_chart(fig_radar, use_container_width=True)

        # Modal distribution donut
        st.caption("Distribución modal de movilidad intra-ciudad")
        walk_share = max(city_row["walking_score"] - 40, 5)
        bike_share = max(city_row["cycling_km"] / 10, 3)
        bus_share  = max(city_row["local_bus_score"] - 50, 5)
        car_share  = city_row["car_dependency"]
        total      = walk_share + bike_share + bus_share + car_share
        fig_donut = go.Figure(go.Pie(
            labels=["A pie", "Bicicleta", "Bus / Tram", "Coche"],
            values=[walk_share/total*100, bike_share/total*100, bus_share/total*100, car_share/total*100],
            hole=0.55,
            marker=dict(colors=["#10B981", "#0DD3C5", "#818CF8", "#F97316"]),
            textinfo="label+percent",
            textfont=dict(size=10, color="#F1F5F9"),
        ))
        fig_donut.update_layout(
            showlegend=False,
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            height=260,
            margin=dict(l=0, r=0, t=0, b=0),
        )
        st.plotly_chart(fig_donut, use_container_width=True)

    with col_table:
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

        # City mobility profile metrics
        st.markdown("<br>", unsafe_allow_html=True)
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Score movilidad a pie", f"{city_row['walking_score']:.0f} / 100")
        m2.metric("Score bus / tram local", f"{city_row['local_bus_score']:.0f} / 100")
        m3.metric("Acc. universal", f"{city_row['universal_access']:.0f} / 100")
        m4.metric("Sentimiento movilidad", f"{city_row['sentiment_mobility']:.2f}", "(−1 → +1)")

    st.markdown("---")

    # AI Insight
    best_poi = pois.sort_values("overall_accessibility", ascending=False).iloc[0]
    worst_poi = pois.sort_values("overall_accessibility").iloc[0]
    avg_score = pois["overall_accessibility"].mean()
    st.markdown(insight_box(
        f"En <strong>{selected_city}</strong>, el recurso turístico más accesible es "
        f"<strong>{best_poi['name']}</strong> (score {best_poi['overall_accessibility']:.0f}/100). "
        f"El acceso más limitado corresponde a <strong>{worst_poi['name']}</strong> "
        f"(score {worst_poi['overall_accessibility']:.0f}/100). "
        f"El score medio de accesibilidad del destino es <strong>{avg_score:.1f}/100</strong> — "
        f"{'por encima' if avg_score >= 65 else 'por debajo'} del umbral recomendado de 65 puntos. "
        f"La infraestructura ciclista de {int(city_row['cycling_km'])} km "
        f"{'es suficiente para una red turística básica.' if city_row['cycling_km'] >= 80 else 'es insuficiente y limita el modo bicicleta como alternativa real al coche.'}"
    ), unsafe_allow_html=True)

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
