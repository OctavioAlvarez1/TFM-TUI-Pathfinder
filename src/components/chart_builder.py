import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from src.config.settings import CARBON_BY_MODE


def build_mobility_bar(df: pd.DataFrame):
    df_sorted = df.sort_values("overall_mobility_score", ascending=True)
    colors = [
        "#EF4444" if s < 50 else "#F59E0B" if s < 75 else "#10B981"
        for s in df_sorted["overall_mobility_score"]
    ]
    fig = go.Figure(go.Bar(
        x=df_sorted["overall_mobility_score"],
        y=df_sorted["destination_name"],
        orientation="h",
        marker_color=colors,
        text=[f"{s:.0f}" for s in df_sorted["overall_mobility_score"]],
        textposition="outside",
    ))
    fig.update_layout(
        xaxis_title="Overall Mobility Score (0–100)",
        yaxis_title="",
        height=520,
        margin=dict(l=160, r=60, t=20, b=40),
        plot_bgcolor="white",
        xaxis=dict(range=[0, 115]),
    )
    return fig


def build_transport_breakdown(df: pd.DataFrame):
    cols = ["train_score", "bus_score", "ev_charging_score"]
    labels = {"train_score": "Train", "bus_score": "Bus", "ev_charging_score": "EV Charging"}
    melted = df.melt(
        id_vars=["destination_name"],
        value_vars=cols,
        var_name="Mode",
        value_name="Score",
    )
    melted["Mode"] = melted["Mode"].map(labels)
    fig = px.bar(
        melted,
        x="Score",
        y="destination_name",
        color="Mode",
        orientation="h",
        barmode="group",
        color_discrete_sequence=["#6366F1", "#10B981", "#F59E0B"],
        height=560,
    )
    fig.update_layout(
        yaxis_title="",
        xaxis=dict(range=[0, 115]),
        margin=dict(l=160, r=40, t=20, b=40),
        plot_bgcolor="white",
    )
    return fig


def build_carbon_bar(df: pd.DataFrame):
    df_sorted = df.sort_values("carbon_kg_per_visitor", ascending=False)
    colors = [
        "#EF4444" if c > 150 else "#F59E0B" if c > 90 else "#10B981"
        for c in df_sorted["carbon_kg_per_visitor"]
    ]
    fig = go.Figure(go.Bar(
        x=df_sorted["carbon_kg_per_visitor"],
        y=df_sorted["destination_name"],
        orientation="h",
        marker_color=colors,
        text=[f"{c} kg" for c in df_sorted["carbon_kg_per_visitor"]],
        textposition="outside",
    ))
    fig.update_layout(
        xaxis_title="Estimated CO₂ per visitor arrival (kg)",
        yaxis_title="",
        height=520,
        margin=dict(l=160, r=80, t=20, b=40),
        plot_bgcolor="white",
    )
    return fig


def build_mode_carbon_comparison():
    fig = px.bar(
        x=list(CARBON_BY_MODE.keys()),
        y=list(CARBON_BY_MODE.values()),
        color=list(CARBON_BY_MODE.keys()),
        color_discrete_sequence=["#10B981", "#6366F1", "#F59E0B", "#EF4444"],
        labels={"x": "Transport mode", "y": "kg CO₂ per 100 km"},
        height=320,
    )
    fig.update_layout(showlegend=False, plot_bgcolor="white")
    return fig
