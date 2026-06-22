"""
Pathfinder design system — same token set as TUI-Atlas coastal palette,
adapted with indigo (#818CF8) as primary accent to distinguish from Atlas (teal).
"""

PATHFINDER_CSS = """
<style>
/* ── Base ──────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html, body,
[data-testid="stAppViewContainer"],
[data-testid="stMain"] { background: #0B1220 !important; }
[data-testid="stSidebar"] {
    background: #0D1627 !important;
    border-right: 1px solid rgba(129,140,248,0.12);
}
[data-testid="stHeader"] { background: transparent !important; box-shadow: none !important; }
h1, h2, h3, h4 { color: #F1F5F9 !important; font-weight: 700; letter-spacing: -0.01em; }
p  { color: #94A3B8; line-height: 1.6; }

/* ── KPI card — coastal gradient + indigo accent bar ───────────────── */
.kpi-card {
    background: linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%);
    border: 1px solid rgba(129,140,248,0.25);
    border-radius: 12px;
    padding: 22px 18px 18px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
    position: relative;
    overflow: hidden;
}
.kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #818CF8 0%, #0DD3C5 50%, #F97316 100%);
}
.kpi-value {
    font-size: 2.2rem;
    font-weight: 800;
    color: #818CF8;
    line-height: 1.1;
    letter-spacing: -0.03em;
}
.kpi-label {
    font-size: 0.70rem;
    color: #475569;
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    font-weight: 600;
}
.kpi-sub { font-size: 0.80rem; color: #0DD3C5; margin-top: 4px; font-weight: 500; }

/* ── Sunset gradient bar ────────────────────────────────────────────── */
.sunset-bar {
    height: 3px;
    background: linear-gradient(90deg,
        #818CF8 0%, #0DD3C5 25%, #22D3EE 50%, #F97316 78%, #EAB308 100%);
    border-radius: 3px;
    margin: 18px 0 22px;
}

/* ── AI Insight box (Perspectiva equivalent) ────────────────────────── */
.insight-box {
    background: linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(3,20,40,0.98) 100%);
    border: 1px solid rgba(249,115,22,0.22);
    border-radius: 10px;
    padding: 14px 16px 14px 20px;
    position: relative;
    margin-top: 8px;
}
.insight-box::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #F97316 0%, #EAB308 100%);
    border-radius: 3px 0 0 3px;
    box-shadow: 0 0 6px rgba(249,115,22,0.5);
}
.insight-label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #F97316;
    font-weight: 700;
    margin-bottom: 6px;
}
.insight-text { font-size: 0.87rem; color: #CBD5E1; line-height: 1.58; }

/* ── Section card (for grouped content) ────────────────────────────── */
.section-card {
    background: linear-gradient(158deg, rgba(5,50,65,0.55) 0%, rgba(3,30,50,0.80) 100%);
    border: 1px solid rgba(129,140,248,0.14);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
}

/* ── Route card ─────────────────────────────────────────────────────── */
.route-card {
    background: linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%);
    border: 1px solid rgba(129,140,248,0.20);
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    height: 100%;
    position: relative;
    overflow: hidden;
}
.route-mode  { font-size: 2rem; margin-bottom: 8px; }
.route-time  { font-size: 1.85rem; font-weight: 800; color: #818CF8; }
.route-meta  { font-size: 0.77rem; color: #475569; margin-top: 4px; }

/* ── Tags / chips ───────────────────────────────────────────────────── */
.tag {
    display: inline-block;
    background: rgba(129,140,248,0.10);
    color: #818CF8;
    border: 1px solid rgba(129,140,248,0.25);
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 0.72rem;
    font-weight: 500;
    margin: 3px 2px;
}
.tag-teal {
    background: rgba(13,211,197,0.10);
    color: #0DD3C5;
    border: 1px solid rgba(13,211,197,0.25);
}

/* ── Badges ─────────────────────────────────────────────────────────── */
.badge-green { display:inline-block; background:rgba(16,185,129,0.15); color:#4ADE80;
               border:1px solid rgba(16,185,129,0.3); padding:2px 10px; border-radius:12px; font-size:0.72rem; }
.badge-amber { display:inline-block; background:rgba(234,179,8,0.15); color:#FDE047;
               border:1px solid rgba(234,179,8,0.3); padding:2px 10px; border-radius:12px; font-size:0.72rem; }
.badge-red   { display:inline-block; background:rgba(239,68,68,0.15); color:#FCA5A5;
               border:1px solid rgba(239,68,68,0.3); padding:2px 10px; border-radius:12px; font-size:0.72rem; }

/* ── Hero header ────────────────────────────────────────────────────── */
.hero-title { font-size: 2.6rem; font-weight: 800; color: #F1F5F9; letter-spacing: -0.03em; line-height: 1.1; }
.hero-sub   { font-size: 0.92rem; color: #475569; margin-top: 8px; }
.hero-accent { color: #818CF8; }

/* ── Map section label ──────────────────────────────────────────────── */
.map-label {
    font-size: 0.65rem; text-transform: uppercase;
    letter-spacing: 0.14em; color: #0DD3C5; font-weight: 700; margin-bottom: 4px;
}

/* ── Streamlit native element overrides ─────────────────────────────── */
[data-testid="metric-container"] {
    background: linear-gradient(158deg, rgba(5,62,78,0.6) 0%, rgba(3,44,58,0.8) 100%) !important;
    border: 1px solid rgba(129,140,248,0.18) !important;
    border-radius: 10px !important;
    padding: 12px 16px !important;
}
[data-testid="stMetricValue"]  { color: #818CF8 !important; font-size: 1.7rem !important; font-weight: 700 !important; }
[data-testid="stMetricLabel"]  { color: #475569 !important; font-size: 0.72rem !important; text-transform: uppercase; }
[data-testid="stMetricDelta"]  { font-size: 0.78rem !important; }

hr { border-color: rgba(129,140,248,0.12) !important; }

[data-testid="stDataFrame"] {
    border: 1px solid rgba(129,140,248,0.14) !important;
    border-radius: 10px !important;
    overflow: hidden;
}
[data-testid="stExpander"] {
    border: 1px solid rgba(129,140,248,0.14) !important;
    border-radius: 8px !important;
    background: rgba(3,20,40,0.6) !important;
}
[data-baseweb="select"] { background: rgba(3,20,40,0.9) !important; }
[data-testid="stTabs"] [data-baseweb="tab"][aria-selected="true"] {
    color: #818CF8 !important;
    border-bottom: 2px solid #818CF8 !important;
}
</style>
"""


def render_css(st) -> None:
    st.markdown(PATHFINDER_CSS, unsafe_allow_html=True)


def kpi_card(value: str, label: str, sub: str = "") -> str:
    sub_html = f'<div class="kpi-sub">{sub}</div>' if sub else ""
    return f"""<div class="kpi-card">
  <div class="kpi-value">{value}</div>
  <div class="kpi-label">{label}</div>
  {sub_html}
</div>"""


def insight_box(text: str, label: str = "Análisis Pathfinder IA") -> str:
    return f"""<div class="insight-box">
  <div class="insight-label">✦ {label}</div>
  <div class="insight-text">{text}</div>
</div>"""


def sunset_bar() -> str:
    return '<div class="sunset-bar"></div>'


def tags(*labels: str, teal: bool = False) -> str:
    cls = "tag tag-teal" if teal else "tag"
    return "".join(f'<span class="{cls}">{l}</span>' for l in labels)
