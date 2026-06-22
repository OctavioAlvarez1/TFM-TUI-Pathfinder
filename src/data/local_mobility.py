"""
Local (within-city) mobility data for 20 Spanish destinations.
Covers cycling infrastructure, walking quality, local bus coverage, POIs, and sustainable route options.
Inspired by OpenStreetMap data, Spanish municipal cycling plans, and GTFS feeds.
"""
import pandas as pd
import numpy as np

# columns: id, name, lat, lon, cycling_km, walking_score, bike_stations, local_bus, universal_access, avg_walk_min, sentiment_mobility
_LOCAL_DATA = [
    (1,  "Barcelona",         41.3851,  2.1734,  210, 88, 420, 90, 72, 8,  0.72),
    (2,  "Madrid",            40.4168, -3.7038,   95, 82, 265, 88, 68, 12, 0.65),
    (3,  "Seville",           37.3891, -5.9845,  180, 85, 260, 74, 65, 9,  0.71),
    (4,  "Valencia",          39.4699, -0.3763,  155, 83, 280, 78, 70, 10, 0.68),
    (5,  "Granada",           37.1773, -3.5986,   40, 71,  45, 62, 55, 18, 0.54),
    (6,  "Malaga",            36.7213, -4.4214,   65, 76,  85, 68, 62, 14, 0.61),
    (7,  "Bilbao",            43.2630, -2.9350,   85, 80, 130, 83, 75, 11, 0.70),
    (8,  "San Sebastian",     43.3183, -1.9812,   70, 82,  95, 76, 70, 10, 0.72),
    (9,  "Toledo",            39.8628, -4.0273,   25, 68,  18, 48, 48, 22, 0.45),
    (10, "Salamanca",         40.9701, -5.6635,   30, 74,  25, 55, 52, 16, 0.52),
    (11, "Cordoba",           37.8882, -4.7794,   55, 78,  68, 65, 60, 13, 0.62),
    (12, "Tenerife",          28.2916,-16.6291,   35, 62,  40, 58, 55, 20, 0.48),
    (13, "Palma de Mallorca", 39.5696,  2.6502,   90, 75, 115, 65, 65, 13, 0.64),
    (14, "Zaragoza",          41.6560, -0.8773,   75, 79, 110, 72, 67, 12, 0.63),
    (15, "Santander",         43.4623, -3.8099,   45, 73,  55, 60, 58, 17, 0.55),
    (16, "Murcia",            37.9922, -1.1307,   50, 71,  60, 58, 56, 16, 0.54),
    (17, "Alicante",          38.3452, -0.4810,   60, 74,  78, 64, 63, 15, 0.60),
    (18, "Cadiz",             36.5271, -6.2886,   48, 80,  52, 62, 60, 14, 0.62),
    (19, "Pamplona",          42.8125, -1.6458,   65, 78,  88, 68, 65, 13, 0.65),
    (20, "Las Palmas",        28.1235,-15.4366,   55, 70,  65, 60, 58, 17, 0.55),
]

_COLS = ["destination_id", "destination_name", "lat", "lon", "cycling_km",
         "walking_score", "bike_stations", "local_bus_score", "universal_access",
         "avg_walk_min_to_poi", "sentiment_mobility"]

_POI_NAMES = {
    "monumento":   ["Catedral", "Museo de Arte", "Plaza Mayor", "Alcázar", "Torre Medieval", "Basílica"],
    "alojamiento": ["Gran Hotel", "Parador Nacional", "Hotel Boutique", "Hostal Centro"],
    "transporte":  ["Estación Central", "Hub Intermodal", "Parada Metro/Tram"],
    "gastronomia": ["Mercado Gastronómico", "Taberna Histórica", "Bar de Tapas"],
    "naturaleza":  ["Parque Fluvial", "Jardín Botánico", "Mirador Panorámico", "Zona Verde"],
    "bici":        ["Estación Bici Centro", "Hub Movilidad Sostenible", "Punto BiciPublic"],
}

_TYPE_COLORS = {
    "monumento":   "#F97316",
    "alojamiento": "#0DD3C5",
    "transporte":  "#818CF8",
    "gastronomia": "#EAB308",
    "naturaleza":  "#10B981",
    "bici":        "#22D3EE",
}

_TYPE_LABELS = {
    "monumento":   "Monumento / Cultura",
    "alojamiento": "Alojamiento",
    "transporte":  "Nodo de Transporte",
    "gastronomia": "Gastronomía",
    "naturaleza":  "Naturaleza / Parque",
    "bici":        "Estación de Bicicleta",
}

_TYPE_COUNT = {
    "monumento": 3, "alojamiento": 2, "transporte": 2,
    "gastronomia": 2, "naturaleza": 2, "bici": 2,
}

_local_cache: pd.DataFrame | None = None
_poi_cache: pd.DataFrame | None = None


def get_local_metrics() -> pd.DataFrame:
    global _local_cache
    if _local_cache is not None:
        return _local_cache

    df = pd.DataFrame(_LOCAL_DATA, columns=_COLS)

    cycling_norm = df["cycling_km"] / df["cycling_km"].max() * 100
    df["local_accessibility_index"] = (
        cycling_norm * 0.25
        + df["walking_score"] * 0.30
        + df["local_bus_score"] * 0.25
        + df["universal_access"] * 0.20
    ).round(1)

    df["car_dependency"] = (100 - df["local_accessibility_index"] * 0.6).clip(20, 80).round(0).astype(int)
    df["co2_saved_kg_day"] = (cycling_norm / 100 * 2.1 + df["local_bus_score"] / 100 * 1.4).round(2)
    df["infrastructure_gap"] = (100 - df["local_accessibility_index"]).round(1)

    _local_cache = df
    return df


def get_all_pois() -> pd.DataFrame:
    global _poi_cache
    if _poi_cache is not None:
        return _poi_cache

    metrics = get_local_metrics()
    rows = []

    for _, row in metrics.iterrows():
        rng = np.random.RandomState(int(row["destination_id"]) * 77)
        poi_id = int(row["destination_id"]) * 100
        city = row["destination_name"]

        for ptype, count in _TYPE_COUNT.items():
            names = _POI_NAMES[ptype]
            for i in range(count):
                spread = 0.011 + rng.uniform(0, 0.005)
                poi_lat = row["lat"] + rng.uniform(-spread, spread)
                poi_lon = row["lon"] + rng.uniform(-spread, spread)

                walk_s = int(np.clip(row["walking_score"] + rng.randint(-15, 20), 20, 100))
                bike_s = int(np.clip(row["cycling_km"] / 210 * 90 + rng.randint(-10, 25), 10, 100))
                bus_s  = int(np.clip(row["local_bus_score"] + rng.randint(-20, 15), 20, 100))
                overall = round(walk_s * 0.35 + bike_s * 0.30 + bus_s * 0.35, 1)

                dist_km = max(0.1, float(np.sqrt((poi_lat - row["lat"])**2 + (poi_lon - row["lon"])**2)) * 111)
                walk_t = max(2, int(round(dist_km / (5 / 60))))
                bike_t = max(1, int(round(dist_km / (15 / 60))))
                bus_t  = max(3, int(round(dist_km / (20 / 60) + rng.randint(3, 8))))

                # More descriptive name
                if ptype in ("monumento", "alojamiento"):
                    poi_name = f"{names[i % len(names)]} de {city}"
                else:
                    poi_name = names[i % len(names)]

                rows.append({
                    "poi_id": poi_id,
                    "destination_id": int(row["destination_id"]),
                    "destination_name": city,
                    "name": poi_name,
                    "type": ptype,
                    "type_label": _TYPE_LABELS[ptype],
                    "lat": round(float(poi_lat), 6),
                    "lon": round(float(poi_lon), 6),
                    "walk_score": walk_s,
                    "bike_score": bike_s,
                    "bus_score": bus_s,
                    "overall_accessibility": overall,
                    "walk_time_min": walk_t,
                    "bike_time_min": bike_t,
                    "bus_time_min": bus_t,
                    "distance_to_bus_m": int(np.clip(rng.randint(60, 650), 30, 2000)),
                    "distance_to_bike_m": int(np.clip(
                        rng.randint(40, 450) * (210 / max(row["cycling_km"], 1)), 20, 3000
                    )),
                    "color": _TYPE_COLORS[ptype],
                })
                poi_id += 1

    _poi_cache = pd.DataFrame(rows)
    return _poi_cache


def get_pois(destination_name: str) -> pd.DataFrame:
    all_pois = get_all_pois()
    return all_pois[all_pois["destination_name"] == destination_name].copy()


def get_type_colors() -> dict:
    return _TYPE_COLORS


def get_type_labels() -> dict:
    return _TYPE_LABELS


def compute_route(origin_poi: pd.Series, dest_poi: pd.Series, local_row: pd.Series) -> dict:
    """Compute walk / bike / bus / car alternatives between two POIs."""
    dist_km = max(0.15, float(
        np.sqrt((dest_poi["lat"] - origin_poi["lat"])**2 + (dest_poi["lon"] - origin_poi["lon"])**2) * 111
    ))

    bike_speed_kmh = 16 if local_row["cycling_km"] >= 100 else 11
    bus_wait_min   = int(5 + (100 - local_row["local_bus_score"]) / 10)

    walk_time = max(2, round(dist_km / (5 / 60)))
    bike_time = max(1, round(dist_km / (bike_speed_kmh / 60)))
    bus_time  = max(5, round(dist_km / (20 / 60) + bus_wait_min))
    car_time  = max(3, round(dist_km / (30 / 60) + 4))  # +4 min parking

    car_co2  = round(0.171 * dist_km, 3)
    bus_co2  = round(0.089 * dist_km, 3)

    return {
        "distance_km": round(dist_km, 2),
        "walk": {
            "time_min": walk_time, "co2_kg": 0.0,
            "steps": int(dist_km * 1312),
            "calories": int(dist_km * 65),
            "co2_saved_vs_car": round(car_co2, 3),
        },
        "bike": {
            "time_min": bike_time, "co2_kg": 0.0,
            "co2_saved_vs_car": round(car_co2, 3),
            "infra_quality": "Buena" if local_row["cycling_km"] >= 100 else
                             "Moderada" if local_row["cycling_km"] >= 50 else "Limitada",
        },
        "bus": {
            "time_min": bus_time, "co2_kg": bus_co2,
            "co2_saved_vs_car": round(car_co2 - bus_co2, 3),
            "wait_min": bus_wait_min,
        },
        "car": {
            "time_min": car_time, "co2_kg": car_co2,
        },
    }
