"""
Rutas Sostenibles — calculadora de rutas entre dos POIs con comparativa de modos y CO₂ evitado.
"""
import streamlit as st
import folium
from streamlit_folium import st_folium
import plotly.graph_objects as go
from src.data.data_loader import load_local_metrics, load_pois
from src.data.local_mobility import compute_route
from src.ui.styles import render_css, insight_box, sunset_bar

st.set_page_config(page_title="Rutas Sostenibles · Pathfinder", page_icon="🚴", layout="wide")
render_css(st)

st.markdown('<div class="hero-title">🚴 Rutas <span class="hero-accent">Sostenibles</span></div>', unsafe_allow_html=True)
st.caption("Comparativa de modos de transporte entre dos puntos de interés turístico: tiempo, CO₂ y recomendación.")
st.markdown(sunset_bar(), unsafe_allow_html=True)

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
<div class="section-card">
  <span style="color:#818CF8;font-weight:700;">{origin_name}</span>
  <span style="color:#475569;margin:0 10px;">→</span>
  <span style="color:#0DD3C5;font-weight:700;">{dest_name}</span>
  <span style="color:#475569;margin-left:16px;font-size:0.85rem;">Distancia: <strong style="color:#F1F5F9">{dist_km:.2f} km</strong> · {selected_city}</span>
</div>
""", unsafe_allow_html=True)

    st.subheader("Opciones de Transporte")

    r_walk = route["walk"]
    r_bike = route["bike"]
    r_bus  = route["bus"]
    r_car  = route["car"]

    co1, co2, co3, co4 = st.columns(4)
    bike_color = "#10B981" if r_bike["infra_quality"] == "Buena" else "#EAB308" if r_bike["infra_quality"] == "Moderada" else "#F97316"

    with co1:
        st.markdown(f"""
<div class="route-card">
  <div class="route-mode">🚶</div>
  <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">A pie</div>
  <div class="route-time">{r_walk['time_min']} min</div>
  <div class="route-meta">0 kg CO₂ · {r_walk['steps']:,} pasos</div>
  <div class="route-meta">{r_walk['calories']} kcal quemadas</div>
  <div style="margin-top:8px;"><span class="badge-green">↓ {r_walk['co2_saved_vs_car']:.3f} kg CO₂ vs coche</span></div>
</div>""", unsafe_allow_html=True)

    with co2:
        st.markdown(f"""
<div class="route-card">
  <div class="route-mode">🚲</div>
  <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Bicicleta</div>
  <div class="route-time">{r_bike['time_min']} min</div>
  <div class="route-meta">0 kg CO₂ · Carril: <span style="color:{bike_color}">{r_bike['infra_quality']}</span></div>
  <div style="margin-top:8px;"><span class="badge-green">↓ {r_bike['co2_saved_vs_car']:.3f} kg CO₂ vs coche</span></div>
</div>""", unsafe_allow_html=True)

    with co3:
        st.markdown(f"""
<div class="route-card">
  <div class="route-mode">🚌</div>
  <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Bus / Tram</div>
  <div class="route-time">{r_bus['time_min']} min</div>
  <div class="route-meta">{r_bus['co2_kg']:.3f} kg CO₂ · Espera: ~{r_bus['wait_min']} min</div>
  <div style="margin-top:8px;"><span class="badge-green">↓ {r_bus['co2_saved_vs_car']:.3f} kg CO₂ vs coche</span></div>
</div>""", unsafe_allow_html=True)

    with co4:
        st.markdown(f"""
<div class="route-card">
  <div class="route-mode">🚗</div>
  <div style="font-weight:600;color:#F1F5F9;margin-bottom:4px;">Coche privado</div>
  <div class="route-time">{r_car['time_min']} min</div>
  <div class="route-meta">{r_car['co2_kg']:.3f} kg CO₂ · Incluye aparcamiento</div>
  <div style="margin-top:8px;"><span class="badge-red">Referencia — mayor emisión</span></div>
</div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("---")

    # ── Charts ────────────────────────────────────────────────────────────
    col_time, col_co2 = st.columns(2)
    modes  = ["A pie", "Bicicleta", "Bus / Tram", "Coche"]
    times  = [r_walk["time_min"], r_bike["time_min"], r_bus["time_min"], r_car["time_min"]]
    co2v   = [0.0, 0.0, r_bus["co2_kg"], r_car["co2_kg"]]
    colors = ["#10B981", "#0DD3C5", "#818CF8", "#EF4444"]

    with col_time:
        st.subheader("Comparativa de Tiempo")
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
        fig_co2 = go.Figure(go.Bar(
            x=modes, y=co2v,
            marker_color=colors,
            text=[f"{v:.3f} kg" for v in co2v],
            textposition="outside",
        ))
        fig_co2.update_layout(
            height=320, yaxis_title="kg CO₂",
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font_color="#F1F5F9", margin=dict(t=20, b=20),
            yaxis=dict(range=[0, max(co2v) * 1.35 if max(co2v) > 0 else 0.5]),
        )
        st.plotly_chart(fig_co2, use_container_width=True)

    st.markdown("---")

    # ── Map ────────────────────────────────────────────────────────────────
    col_map, col_rec = st.columns([3, 2])

    with col_map:
        st.markdown('<div class="map-label">Mapa de la Ruta</div>', unsafe_allow_html=True)
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
            color="#818CF8", weight=3, opacity=0.9, dash_array="8 4",
            tooltip=f"Distancia: {dist_km:.2f} km",
        ).add_to(m)
        st_folium(m, use_container_width=True, height=380, returned_objects=[])

    with col_rec:
        st.subheader("Análisis Pathfinder")
        best_mode = "Bicicleta" if city_row["cycling_km"] >= 80 else "A pie" if dist_km < 1.5 else "Bus / Tram"
        co2_saved = r_car["co2_kg"]
        st.success(f"**Modo recomendado: {best_mode}**")
        st.markdown(f"""
**Análisis de la ruta:**
- Distancia: `{dist_km:.2f} km`
- Infraestructura ciclista: **{r_bike['infra_quality']}** ({city_row['cycling_km']} km de carril bici)
- Ahorro de CO₂ vs coche: **{co2_saved:.3f} kg**
- Frecuencia bus local: score **{city_row['local_bus_score']}/100**
- Accesibilidad universal: **{city_row['universal_access']}/100**

**Infraestructura en {selected_city}:**
- {city_row['bike_stations']} estaciones de bici pública
- Score movilidad a pie: {city_row['walking_score']}/100
        """)
        if city_row["cycling_km"] < 50:
            st.warning(f"{selected_city} tiene infraestructura ciclista limitada ({city_row['cycling_km']} km). Se recomienda invertir en nuevos carriles bici en el eje turístico.")

        st.markdown("---")
        st.markdown(insight_box(
            f"Para este trayecto de <strong>{dist_km:.2f} km</strong> en {selected_city}, "
            f"elegir <strong>{best_mode}</strong> en vez del coche ahorra <strong>{co2_saved:.3f} kg CO₂</strong>. "
            f"Si el 30% de los visitantes adoptase este modo, el ahorro diario superaría los "
            f"<strong>{co2_saved * 50:.1f} kg CO₂</strong> solo en esta ruta."
        ), unsafe_allow_html=True)

        st.info(f"Usando {best_mode} en vez del coche ahorras **{co2_saved:.3f} kg CO₂** en este trayecto.")

except Exception as e:
    st.error(f"Error cargando datos: {e}")
    st.exception(e)
