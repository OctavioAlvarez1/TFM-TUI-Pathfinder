"""
Rutas Sostenibles — calculadora de rutas entre dos POIs con comparativa de modos y CO₂ evitado.
"""
import streamlit as st
import folium
from streamlit_folium import st_folium
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from src.data.data_loader import load_local_metrics, load_pois
from src.data.local_mobility import compute_route

st.set_page_config(page_title="Rutas Sostenibles · Pathfinder", page_icon="🚴", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] { background: #0B1220; }
[data-testid="stSidebar"] { background: #111827; }
.route-card {
    background: rgba(17,24,39,0.95);
    border: 1px solid rgba(13,211,197,0.2);
    border-radius: 12px;
    padding: 18px;
    text-align: center;
    height: 100%;
}
.route-mode { font-size: 2rem; margin-bottom: 6px; }
.route-time { font-size: 1.8rem; font-weight: 700; color: #0DD3C5; }
.route-co2  { font-size: 0.85rem; color: #94A3B8; margin-top: 4px; }
.route-badge-green { display:inline-block; background:#166534; color:#4ADE80;
                     padding:3px 10px; border-radius:12px; font-size:0.75rem; margin-top:6px; }
.route-badge-red   { display:inline-block; background:#7F1D1D; color:#F87171;
                     padding:3px 10px; border-radius:12px; font-size:0.75rem; margin-top:6px; }
</style>
""", unsafe_allow_html=True)

st.title("🚴 Rutas Sostenibles")
st.caption("Comparativa de modos de transporte entre dos puntos de interés turístico: tiempo, CO₂ y recomendación.")

try:
    local = load_local_metrics()
    dest_names = sorted(local["destination_name"].tolist())

    # ── Sidebar ───────────────────────────────────────────────────────────
    with st.sidebar:
        st.markdown("### Configurar ruta")
        selected_city = st.selectbox("Destino", dest_names, index=0)

        city_row = local[local["destination_name"] == selected_city].iloc[0]
        pois = load_pois(selected_city)
        poi_names = pois["name"].tolist()

        st.markdown("---")
        origin_name = st.selectbox("Origen", poi_names, index=0)
        dest_name   = st.selectbox("Destino", poi_names, index=min(5, len(poi_names)-1))

        if origin_name == dest_name:
            st.warning("Selecciona puntos distintos para calcular la ruta.")

    if origin_name == dest_name:
        st.info("Selecciona un origen y un destino diferentes en la barra lateral.")
        st.stop()

    origin_poi = pois[pois["name"] == origin_name].iloc[0]
    dest_poi   = pois[pois["name"] == dest_name].iloc[0]
    route      = compute_route(origin_poi, dest_poi, city_row)

    dist_km = route["distance_km"]

    # ── Route header ──────────────────────────────────────────────────────
    st.markdown(f"""
**{origin_name}** &nbsp;→&nbsp; **{dest_name}**
Distancia estimada: **{dist_km:.2f} km** · Destino: **{selected_city}**
    """)

    st.markdown("---")
    st.subheader("Opciones de Transporte")

    # ── Route cards ───────────────────────────────────────────────────────
    r_walk = route["walk"]
    r_bike = route["bike"]
    r_bus  = route["bus"]
    r_car  = route["car"]

    co1, co2, co3, co4 = st.columns(4)
    with co1:
        st.markdown(f"""
<div class="route-card">
    <div class="route-mode">🚶</div>
    <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">A pie</div>
    <div class="route-time">{r_walk['time_min']} min</div>
    <div class="route-co2">0 kg CO₂ · {r_walk['steps']:,} pasos</div>
    <div class="route-co2">{r_walk['calories']} kcal quemadas</div>
    <div class="route-badge-green">Ahorro: {r_walk['co2_saved_vs_car']:.3f} kg CO₂ vs coche</div>
</div>""", unsafe_allow_html=True)

    with co2:
        bike_color = "#10B981" if r_bike["infra_quality"] == "Buena" else "#EAB308" if r_bike["infra_quality"] == "Moderada" else "#F97316"
        st.markdown(f"""
<div class="route-card">
    <div class="route-mode">🚲</div>
    <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Bicicleta</div>
    <div class="route-time">{r_bike['time_min']} min</div>
    <div class="route-co2">0 kg CO₂ · Infraestructura: <span style="color:{bike_color}">{r_bike['infra_quality']}</span></div>
    <div class="route-badge-green">Ahorro: {r_bike['co2_saved_vs_car']:.3f} kg CO₂ vs coche</div>
</div>""", unsafe_allow_html=True)

    with co3:
        st.markdown(f"""
<div class="route-card">
    <div class="route-mode">🚌</div>
    <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Bus / Tram</div>
    <div class="route-time">{r_bus['time_min']} min</div>
    <div class="route-co2">{r_bus['co2_kg']:.3f} kg CO₂ · Espera: ~{r_bus['wait_min']} min</div>
    <div class="route-badge-green">Ahorro: {r_bus['co2_saved_vs_car']:.3f} kg CO₂ vs coche</div>
</div>""", unsafe_allow_html=True)

    with co4:
        st.markdown(f"""
<div class="route-card">
    <div class="route-mode">🚗</div>
    <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Coche privado</div>
    <div class="route-time">{r_car['time_min']} min</div>
    <div class="route-co2">{r_car['co2_kg']:.3f} kg CO₂ · Incluye aparcamiento</div>
    <div class="route-badge-red">Referencia — mayor emisión</div>
</div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("---")

    # ── Charts ────────────────────────────────────────────────────────────
    col_time, col_co2 = st.columns(2)

    with col_time:
        st.subheader("Comparativa de Tiempo")
        modes = ["A pie", "Bicicleta", "Bus / Tram", "Coche"]
        times = [r_walk["time_min"], r_bike["time_min"], r_bus["time_min"], r_car["time_min"]]
        colors = ["#10B981", "#0DD3C5", "#818CF8", "#EF4444"]
        fig_time = go.Figure(go.Bar(
            x=modes, y=times,
            marker_color=colors,
            text=[f"{t} min" for t in times],
            textposition="outside",
        ))
        fig_time.update_layout(
            height=320, yaxis_title="Minutos",
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9", margin=dict(t=20, b=20),
            yaxis=dict(range=[0, max(times) * 1.25]),
        )
        st.plotly_chart(fig_time, use_container_width=True)

    with col_co2:
        st.subheader("Emisiones de CO₂")
        co2_vals = [0.0, 0.0, r_bus["co2_kg"], r_car["co2_kg"]]
        fig_co2 = go.Figure(go.Bar(
            x=modes, y=co2_vals,
            marker_color=colors,
            text=[f"{v:.3f} kg" for v in co2_vals],
            textposition="outside",
        ))
        fig_co2.update_layout(
            height=320, yaxis_title="kg CO₂",
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9", margin=dict(t=20, b=20),
            yaxis=dict(range=[0, max(co2_vals) * 1.35 if max(co2_vals) > 0 else 0.5]),
        )
        st.plotly_chart(fig_co2, use_container_width=True)

    st.markdown("---")

    # ── Map ────────────────────────────────────────────────────────────────
    col_map, col_rec = st.columns([3, 2])

    with col_map:
        st.subheader("Mapa de la Ruta")
        mid_lat = (origin_poi["lat"] + dest_poi["lat"]) / 2
        mid_lon = (origin_poi["lon"] + dest_poi["lon"]) / 2

        m = folium.Map(location=[mid_lat, mid_lon], zoom_start=14, tiles="CartoDB dark_matter")

        folium.Marker(
            [origin_poi["lat"], origin_poi["lon"]],
            icon=folium.Icon(color="green", icon="play", prefix="fa"),
            tooltip=f"Origen: {origin_name}",
        ).add_to(m)

        folium.Marker(
            [dest_poi["lat"], dest_poi["lon"]],
            icon=folium.Icon(color="red", icon="flag", prefix="fa"),
            tooltip=f"Destino: {dest_name}",
        ).add_to(m)

        folium.PolyLine(
            [[origin_poi["lat"], origin_poi["lon"]], [dest_poi["lat"], dest_poi["lon"]]],
            color="#0DD3C5", weight=3, opacity=0.8, dash_array="8 4",
            tooltip=f"Distancia: {dist_km:.2f} km",
        ).add_to(m)

        st_folium(m, use_container_width=True, height=380, returned_objects=[])

    with col_rec:
        st.subheader("Recomendación Pathfinder")

        # Determine best mode
        best_mode = "Bicicleta" if city_row["cycling_km"] >= 80 else "A pie" if dist_km < 1.5 else "Bus / Tram"

        co2_saved = r_car["co2_kg"]
        st.success(f"**Modo recomendado: {best_mode}**")

        st.markdown(f"""
**Análisis de la ruta:**

- Distancia: `{dist_km:.2f} km`
- Infraestructura ciclista: **{r_bike['infra_quality']}** ({city_row['cycling_km']} km de carril bici)
- Ahorro de CO₂ vs coche (bici/pie): **{co2_saved:.3f} kg**
- Frecuencia bus local: score **{city_row['local_bus_score']}/100**
- Accesibilidad universal: **{city_row['universal_access']}/100**

**Contexto de infraestructura en {selected_city}:**
- {city_row['bike_stations']} estaciones de bici pública
- Score movilidad a pie: {city_row['walking_score']}/100
        """)

        if city_row["cycling_km"] < 50:
            st.warning(f"{selected_city} tiene infraestructura ciclista limitada ({city_row['cycling_km']} km). Se recomienda invertir en nuevos carriles bici en el eje turístico.")

        st.info(f"Usando {best_mode} en vez del coche ahorras **{co2_saved:.3f} kg CO₂** en este trayecto.")

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
