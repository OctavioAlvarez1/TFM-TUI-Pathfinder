"""
ETL — OpenStreetMap Overpass API
Fetches real cycling infrastructure, bike stations, bus stops, and tourist POI
counts for the 20 Spanish destinations used in Pathfinder.

Run once:
    python data/open/fetch_osm_data.py

Output:
    data/open/osm_mobility.json

local_mobility.py checks for this file at startup and blends real OSM counts
with the baseline synthetic metrics (same pattern as Sentinel's INE/OD-TripM
integration).
"""

import json
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

CITIES = [
    {"name": "Barcelona",       "lat": 41.3851, "lon":  2.1734, "radius": 6000},
    {"name": "Madrid",          "lat": 40.4168, "lon": -3.7038, "radius": 6000},
    {"name": "Valencia",        "lat": 39.4699, "lon": -0.3763, "radius": 5000},
    {"name": "Sevilla",         "lat": 37.3891, "lon": -5.9845, "radius": 5000},
    {"name": "Granada",         "lat": 37.1773, "lon": -3.5986, "radius": 4000},
    {"name": "Málaga",          "lat": 36.7213, "lon": -4.4214, "radius": 4000},
    {"name": "Bilbao",          "lat": 43.2630, "lon": -2.9350, "radius": 4000},
    {"name": "San Sebastián",   "lat": 43.3183, "lon": -1.9812, "radius": 4000},
    {"name": "Córdoba",         "lat": 37.8882, "lon": -4.7794, "radius": 4000},
    {"name": "Toledo",          "lat": 39.8628, "lon": -4.0273, "radius": 3500},
    {"name": "Salamanca",       "lat": 40.9701, "lon": -5.6635, "radius": 3500},
    {"name": "Zaragoza",        "lat": 41.6488, "lon": -0.8891, "radius": 4500},
    {"name": "Palma de Mallorca","lat": 39.5696, "lon":  2.6502, "radius": 5000},
    {"name": "Las Palmas",      "lat": 28.1235, "lon": -15.4366,"radius": 5000},
    {"name": "Tenerife",        "lat": 28.2916, "lon": -16.6291,"radius": 5000},
    {"name": "Alicante",        "lat": 38.3452, "lon": -0.4815, "radius": 4000},
    {"name": "Murcia",          "lat": 37.9922, "lon": -1.1307, "radius": 4000},
    {"name": "Valladolid",      "lat": 41.6523, "lon": -4.7245, "radius": 4000},
    {"name": "Santander",       "lat": 43.4623, "lon": -3.8099, "radius": 4000},
    {"name": "Cádiz",           "lat": 36.5271, "lon": -6.2886, "radius": 3500},
]

# Overpass QL queries (counts within radius of city centre)
def build_query(lat: float, lon: float, radius: int) -> str:
    return f"""
[out:json][timeout:30];
(
  way["highway"="cycleway"](around:{radius},{lat},{lon});
  way["cycleway"~"lane|track|opposite_lane"](around:{radius},{lat},{lon});
  way["bicycle"="designated"](around:{radius},{lat},{lon});
);
out count;
"""

def build_bike_station_query(lat: float, lon: float, radius: int) -> str:
    return f"""
[out:json][timeout:20];
(
  node["amenity"="bicycle_rental"](around:{radius},{lat},{lon});
  node["amenity"="bicycle_parking"]["capacity"](around:{radius},{lat},{lon});
);
out count;
"""

def build_bus_stop_query(lat: float, lon: float, radius: int) -> str:
    return f"""
[out:json][timeout:20];
(
  node["highway"="bus_stop"](around:{radius},{lat},{lon});
  node["public_transport"="stop_position"]["bus"="yes"](around:{radius},{lat},{lon});
);
out count;
"""

def build_poi_query(lat: float, lon: float, radius: int) -> str:
    return f"""
[out:json][timeout:30];
(
  node["tourism"~"museum|attraction|hotel|viewpoint|gallery"](around:{radius},{lat},{lon});
  node["historic"~"monument|castle|ruins|memorial"](around:{radius},{lat},{lon});
);
out count;
"""


def overpass_count(query: str, city_name: str, retries: int = 3) -> int:
    data = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(OVERPASS_URL, data=data)
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            with urllib.request.urlopen(req, timeout=40) as resp:
                result = json.loads(resp.read().decode())
                elements = result.get("elements", [])
                if elements and "tags" in elements[0]:
                    return int(elements[0]["tags"].get("total", 0))
                return len(elements)
        except (urllib.error.URLError, json.JSONDecodeError) as exc:
            print(f"  [{city_name}] attempt {attempt+1} failed: {exc}")
            if attempt < retries - 1:
                time.sleep(3 * (attempt + 1))
    return -1   # mark as failed


def fetch_all() -> dict:
    results = {}
    for city in CITIES:
        name   = city["name"]
        lat    = city["lat"]
        lon    = city["lon"]
        radius = city["radius"]
        print(f"Fetching OSM data for {name}...")

        cycling_ways    = overpass_count(build_query(lat, lon, radius),               name)
        bike_rentals    = overpass_count(build_bike_station_query(lat, lon, radius),   name)
        bus_stops       = overpass_count(build_bus_stop_query(lat, lon, radius),       name)
        tourist_pois    = overpass_count(build_poi_query(lat, lon, radius),            name)

        results[name] = {
            "cycling_ways_count": cycling_ways,
            "bike_rental_nodes":  bike_rentals,
            "bus_stop_count":     bus_stops,
            "tourist_poi_count":  tourist_pois,
            "radius_m":           radius,
        }

        print(f"  cycling_ways={cycling_ways}  bike_rentals={bike_rentals}  bus_stops={bus_stops}  pois={tourist_pois}")
        time.sleep(1.5)   # be polite to Overpass

    return results


if __name__ == "__main__":
    out_path = Path(__file__).parent / "osm_mobility.json"
    print(f"Starting OSM fetch for {len(CITIES)} cities...")
    data = fetch_all()
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSaved → {out_path}")

    # Quick sanity check
    ok = sum(1 for v in data.values() if v["cycling_ways_count"] >= 0)
    print(f"Success rate: {ok}/{len(CITIES)} cities")
