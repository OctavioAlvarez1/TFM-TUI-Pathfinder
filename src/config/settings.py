from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_CANDIDATES = [
    BASE_DIR / "data" / "raw",
    BASE_DIR.parent / "TUI-Smart-Destination-Recommender" / "data" / "raw",
]
DATA_DIR = next((p for p in DATA_CANDIDATES if list(p.glob("*.csv"))), DATA_CANDIDATES[0])
TRANSPORT_DIR = BASE_DIR / "data" / "transport"
TRANSPORT_DIR.mkdir(parents=True, exist_ok=True)
TRANSPORT_PATH = TRANSPORT_DIR / "transport_accessibility.csv"

MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

DESTINATION_COORDS = {
    "Barcelona": (41.3851, 2.1734),
    "Madrid": (40.4168, -3.7038),
    "Seville": (37.3891, -5.9845),
    "Granada": (37.1773, -3.5986),
    "Valencia": (39.4699, -0.3763),
    "Bilbao": (43.2630, -2.9350),
    "San Sebastian": (43.3183, -1.9812),
    "Malaga": (36.7213, -4.4214),
    "Palma de Mallorca": (39.5696, 2.6502),
    "Las Palmas": (28.1235, -15.4366),
    "Tenerife": (28.2916, -16.6291),
    "Cordoba": (37.8882, -4.7794),
    "Toledo": (39.8628, -4.0273),
    "Salamanca": (40.9701, -5.6635),
    "Zaragoza": (41.6488, -0.8891),
    "Alicante": (38.3452, -0.4810),
    "Cadiz": (36.5297, -6.2925),
    "Santander": (43.4623, -3.8099),
    "Pamplona": (42.8169, -1.6432),
    "Murcia": (37.9922, -1.1307),
}

CARBON_BY_MODE = {
    "Train": 14,
    "Bus": 68,
    "Car": 170,
    "Flight": 255,
}


def mobility_color(score: float) -> str:
    if score >= 75:
        return "#10B981"
    if score >= 50:
        return "#F59E0B"
    return "#EF4444"
