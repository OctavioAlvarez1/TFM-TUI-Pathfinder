import folium
import pandas as pd
from src.config.settings import DESTINATION_COORDS, mobility_color


def build_mobility_map(df: pd.DataFrame) -> folium.Map:
    m = folium.Map(location=[40.4, -3.7], zoom_start=6, tiles="CartoDB dark_matter")

    for _, row in df.iterrows():
        name = row["destination_name"]
        coords = DESTINATION_COORDS.get(name)
        if not coords:
            continue
        score = row["overall_mobility_score"]
        color = mobility_color(score)
        radius = 8 + score * 0.18

        folium.CircleMarker(
            location=coords,
            radius=radius,
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.80,
            tooltip=folium.Tooltip(
                f"<b>{name}</b><br>"
                f"Score movilidad: {score:.0f}/100<br>"
                f"Tren: {row['train_score']}/100<br>"
                f"Bus: {row['bus_score']}/100<br>"
                f"CO₂/visitante: {row['carbon_kg_per_visitor']} kg"
            ),
        ).add_to(m)

    legend = """
    <div style="position:fixed;bottom:25px;left:25px;z-index:1000;
                background:rgba(17,24,39,0.95);padding:10px 14px;
                border-radius:8px;border:1px solid #374151;font-size:12px;color:#F1F5F9;">
        <b>Score de Movilidad Sostenible</b><br>
        <span style="color:#10B981">●</span> ≥ 75 — Alta (sostenible)<br>
        <span style="color:#F59E0B">●</span> 50–74 — Moderada<br>
        <span style="color:#EF4444">●</span> &lt; 50 — Baja (dep. coche/vuelo)
    </div>"""
    m.get_root().html.add_child(folium.Element(legend))
    return m
