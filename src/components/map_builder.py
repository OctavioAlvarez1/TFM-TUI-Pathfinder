import folium
import pandas as pd
from src.config.settings import DESTINATION_COORDS, mobility_color


def build_mobility_map(df: pd.DataFrame) -> folium.Map:
    m = folium.Map(location=[40.4, -3.7], zoom_start=6, tiles="CartoDB positron")

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
            fill_opacity=0.75,
            popup=folium.Popup(
                f"<b>{name}</b><br>"
                f"Mobility score: {score:.0f}/100<br>"
                f"Train: {row['train_score']}/100<br>"
                f"Bus: {row['bus_score']}/100<br>"
                f"Carbon/visitor: {row['carbon_kg_per_visitor']} kg CO₂",
                max_width=200,
            ),
            tooltip=f"{name} — {score:.0f}",
        ).add_to(m)

    legend = """
    <div style="position:fixed;bottom:30px;left:30px;z-index:1000;background:white;
                padding:10px 16px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:13px">
        <b>Mobility Score</b><br>
        <span style="color:#10B981">●</span> ≥ 75 — High (sustainable)<br>
        <span style="color:#F59E0B">●</span> 50–74 — Moderate<br>
        <span style="color:#EF4444">●</span> &lt; 50 — Low (car/flight dependent)
    </div>"""
    m.get_root().html.add_child(folium.Element(legend))
    return m
