import streamlit as st
import pandas as pd
from src.config.settings import DATA_DIR, TRANSPORT_PATH
from src.data.transport_generator import ensure_transport


@st.cache_data
def load_transport() -> pd.DataFrame:
    ensure_transport()
    return pd.read_csv(TRANSPORT_PATH)


@st.cache_data
def load_destinations() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "destinations.csv")


@st.cache_data
def load_sustainability() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "sustainability_scores.csv")


@st.cache_data
def get_full_profile() -> pd.DataFrame:
    transport = load_transport()
    dest = load_destinations()[["destination_id", "destination_name", "destination_type", "region"]]
    sust = load_sustainability()[["destination_id", "sustainability_score"]]
    return transport.merge(dest, on=["destination_id", "destination_name"], how="left").merge(sust, on="destination_id", how="left")
