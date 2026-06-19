import pandas as pd
from src.config.settings import TRANSPORT_PATH

# Synthetic transport accessibility data for 20 Spanish destinations.
# Scores 0-100. carbon_kg_per_visitor = estimated kg CO2 for a typical journey to this destination.
TRANSPORT_DATA = [
    # id, name, train, bus, ev_charging, airport_km, pt_modal_share, carbon_kg, distance_from_madrid_km
    (1,  "Barcelona",         95, 88, 80, 15,  65, 85,  620),
    (2,  "Madrid",            98, 92, 85, 12,  70, 75,    0),
    (3,  "Seville",           85, 78, 60, 10,  55, 90,  530),
    (4,  "Granada",           52, 72, 40, 15,  45, 110, 430),
    (5,  "Valencia",          88, 84, 72,  8,  62, 80,  355),
    (6,  "Bilbao",            82, 78, 65, 10,  58, 85,  395),
    (7,  "San Sebastian",     78, 74, 55, 20,  50, 95,  470),
    (8,  "Malaga",            75, 76, 55,  5,  48, 95,  530),
    (9,  "Palma de Mallorca", 40, 62, 45,  8,  28, 145, 600),
    (10, "Las Palmas",        20, 58, 35, 18,  22, 185, 1850),
    (11, "Tenerife",          15, 55, 30, 22,  18, 200, 1900),
    (12, "Cordoba",           90, 74, 45, 80,  62, 68,  400),
    (13, "Toledo",            72, 78, 42, 72,  65, 65,   70),
    (14, "Salamanca",         68, 70, 40, 200, 55, 78,  210),
    (15, "Zaragoza",          85, 76, 60, 10,  58, 78,  320),
    (16, "Alicante",          72, 74, 55,  9,  42, 100, 420),
    (17, "Cadiz",             65, 68, 35, 35,  50, 90,  650),
    (18, "Santander",         70, 66, 45,  5,  45, 95,  450),
    (19, "Pamplona",          75, 70, 40,  6,  48, 88,  440),
    (20, "Murcia",            60, 66, 40, 45,  35, 108, 400),
]


def generate_transport() -> pd.DataFrame:
    rows = []
    for row in TRANSPORT_DATA:
        dest_id, name, train, bus, ev, airport_km, pt_share, carbon, dist_madrid = row
        overall = round(0.45 * train + 0.30 * bus + 0.25 * (100 - min(airport_km, 100)), 1)
        rows.append({
            "destination_id": dest_id,
            "destination_name": name,
            "train_score": train,
            "bus_score": bus,
            "ev_charging_score": ev,
            "airport_distance_km": airport_km,
            "public_transport_modal_share": pt_share,
            "carbon_kg_per_visitor": carbon,
            "distance_from_madrid_km": dist_madrid,
            "overall_mobility_score": overall,
        })
    return pd.DataFrame(rows)


def ensure_transport() -> None:
    if not TRANSPORT_PATH.exists():
        df = generate_transport()
        df.to_csv(TRANSPORT_PATH, index=False)
