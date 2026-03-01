/* ═══════════════════════════════════════════════════════════════════════════
   DDRiVE-M  ·  Data & Constants
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── SVG ICON PATHS ─────────────────────────────────────────────────────────── */
window.ICONS = {
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  radar:        "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 12l9-9",
  activity:     "M22 12h-4l-3 9L9 3l-3 9H2",
  alertTriangle:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  check:        "M20 6L9 17l-5-5",
  layers:       "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  fileText:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  bell:         "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  users:        "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  zap:          "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  eye:          "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  download:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  wind:         "M9.59 4.59A2 2 0 1111 8H2M17.59 11.59A2 2 0 1119 15H2M14.83 16.83A2 2 0 1116 20H2",
  droplets:     "M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z",
  home:         "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  play:         "M5 3l14 9-14 9V3z",
  search:       "M11 3a8 8 0 100 16A8 8 0 0011 3zM21 21l-4.35-4.35",
  plus:         "M12 5v14M5 12h14",
  send:         "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  video:        "M23 7l-7 5 7 5V7zM1 5h14a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z",
  menu:         "M3 12h18M3 6h18M3 18h18",
  x:            "M18 6L6 18M6 6l12 12",
  chevronRight: "M9 18l6-6-6-6",
};

/* ── ICON HELPER ─────────────────────────────────────────────────────────────── */
window.svg = (name, size = 16, color = 'currentColor', extraClass = '') => {
  const d = ICONS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="${extraClass}" aria-hidden="true">
    <path d="${d}"/>
  </svg>`;
};

/* ── PHASES ─────────────────────────────────────────────────────────────────── */
window.PHASES = [
  { id: 1, label: "Detection",   module: "detection",   icon: "radar",    color: "#00d4ff",
    desc: "Multi-agency hazard monitoring with PHIVOLCS, PAGASA & NOAH APIs" },
  { id: 2, label: "Diagnosis",   module: "diagnosis",   icon: "activity", color: "#ff6b35",
    desc: "ISO 31000-aligned AI risk analysis across strategic, operational & financial domains" },
  { id: 3, label: "Response",    module: "response",    icon: "shield",   color: "#ff3366",
    desc: "Structured treatment options with OCD protocol-aligned controls" },
  { id: 4, label: "Integration", module: "integration", icon: "layers",   color: "#a855f7",
    desc: "UNDRR 10 Essentials with customizable DRRM plan templates" },
  { id: 5, label: "Validation",  module: "validation",  icon: "check",    color: "#10b981",
    desc: "Simulation-based validation with performance scoring & gap analysis" },
  { id: 6, label: "Enhancement", module: "enhancement", icon: "zap",      color: "#f59e0b",
    desc: "AI-generated DANA, DRRM Plans, Contingency Plans, PSCP & BCP" },
  { id: 7, label: "Monitoring",  module: "monitoring",  icon: "eye",      color: "#06b6d4",
    desc: "Real-time collaborative command center with SMS, video & chat" },
];

/* ── HAZARDS ────────────────────────────────────────────────────────────────── */
window.HAZARDS = [
  { name: "Typhoon MAWAR",       level: "WARNING",  intensity: 85, agency: "PAGASA",   time: "2m ago",  trend: "↑", color: "#ff3366", icon: "wind" },
  { name: "Seismic Activity M4.2", level: "WATCH",   intensity: 42, agency: "PHIVOLCS", time: "15m ago", trend: "→", color: "#f59e0b", icon: "activity" },
  { name: "Flood Risk Zone A",    level: "ADVISORY", intensity: 67, agency: "NOAH",     time: "1h ago",  trend: "↓", color: "#06b6d4", icon: "droplets" },
  { name: "Landslide Potential",  level: "ADVISORY", intensity: 55, agency: "MGB",      time: "3h ago",  trend: "→", color: "#a855f7", icon: "alertTriangle" },
];

/* ── RISKS ──────────────────────────────────────────────────────────────────── */
window.RISKS = [
  { category: "Strategic",     level: "High",   score: 8.2, trend: "up",     controls: 12 },
  { category: "Operational",   level: "Medium", score: 5.7, trend: "down",   controls: 18 },
  { category: "Financial",     level: "Medium", score: 4.9, trend: "stable", controls: 9  },
  { category: "Compliance",    level: "Low",    score: 2.1, trend: "down",   controls: 24 },
  { category: "Environmental", level: "High",   score: 7.8, trend: "up",     controls: 15 },
  { category: "Reputational",  level: "Low",    score: 1.8, trend: "stable", controls: 6  },
];

/* ── LGUS ───────────────────────────────────────────────────────────────────── */
window.LGUS = [
  { name: "Cabanatuan City",   province: "Nueva Ecija",       compliance: 94, phase: "Monitoring",  status: "active" },
  { name: "Naga City",         province: "Camarines Sur",     compliance: 98, phase: "Enhancement", status: "active" },
  { name: "Iloilo City",       province: "Iloilo",            compliance: 87, phase: "Validation",  status: "active" },
  { name: "Cagayan de Oro",    province: "Misamis Oriental",  compliance: 91, phase: "Integration", status: "active" },
  { name: "Legazpi City",      province: "Albay",             compliance: 76, phase: "Response",    status: "warning" },
  { name: "Dagupan City",      province: "Pangasinan",        compliance: 62, phase: "Diagnosis",   status: "alert" },
  { name: "General Santos",    province: "South Cotabato",    compliance: 83, phase: "Integration", status: "active" },
  { name: "Zamboanga City",    province: "Zamboanga del Sur", compliance: 78, phase: "Response",    status: "active" },
];

/* ── DOCUMENTS ──────────────────────────────────────────────────────────────── */
window.DOCS = [
  { name: "Damage Assessment (DANA)",   desc: "Post-disaster needs assessment report",     status: "Ready" },
  { name: "DRRM Plan 2024-2026",        desc: "3-year comprehensive DRRM plan",            status: "Draft" },
  { name: "Contingency Plan — Typhoon", desc: "Typhoon response contingency plan",         status: "Ready" },
  { name: "PSCP Template",              desc: "Pre-disaster safety checklist protocol",    status: "Draft" },
  { name: "BCP — Critical Services",   desc: "Business Continuity Plan for LGU services", status: "Ready" },
];

/* ── ESSENTIALS ─────────────────────────────────────────────────────────────── */
window.ESSENTIALS = [
  { no: 1,  title: "Organize for DRR",                  score: 92, status: "Compliant" },
  { no: 2,  title: "Identify, Understand & Use",        score: 88, status: "Compliant" },
  { no: 3,  title: "Strengthen Fiscal Capacity",        score: 71, status: "In Progress" },
  { no: 4,  title: "Pursue Resilient Urban Development",score: 85, status: "Compliant" },
  { no: 5,  title: "Safeguard Natural Buffers",         score: 79, status: "In Progress" },
  { no: 6,  title: "Strengthen Institutional Capacity", score: 94, status: "Compliant" },
  { no: 7,  title: "Understand & Strengthen Capacity",  score: 68, status: "In Progress" },
  { no: 8,  title: "Increase Infrastructure Resilience",score: 82, status: "Compliant" },
  { no: 9,  title: "Ensure Effective Response",         score: 96, status: "Compliant" },
  { no: 10, title: "Expedite Recovery",                 score: 74, status: "In Progress" },
];

/* ── CONTROLS ───────────────────────────────────────────────────────────────── */
window.CONTROLS = [
  { type: "Preventive", count: 18, color: "#10b981",
    items: ["Evacuation pre-positioning", "Early warning SMS", "Stockpile maintenance", "Training drills"] },
  { type: "Detective",  count: 12, color: "#00d4ff",
    items: ["Sensor network monitoring", "Community watchers", "Social media monitoring", "Damage reporting"] },
  { type: "Corrective", count: 9,  color: "#f59e0b",
    items: ["Emergency response teams", "Search and rescue", "Medical surge plans", "Debris clearing"] },
  { type: "Directive",  count: 15, color: "#a855f7",
    items: ["OCD coordination protocol", "Mandatory evacuation orders", "Price freeze declaration", "LDRRMO activation"] },
];

/* ── AGENCIES ───────────────────────────────────────────────────────────────── */
window.AGENCIES = [
  { name: "PHIVOLCS", type: "Seismic / Volcanic", latency: "234ms", feeds: 18 },
  { name: "PAGASA",   type: "Weather / Typhoon",  latency: "189ms", feeds: 42 },
  { name: "NOAH",     type: "Floods / Rainfall",  latency: "312ms", feeds: 127 },
  { name: "MGB",      type: "Landslide / Ground", latency: "441ms", feeds: 34 },
];

/* ── INITIAL CHAT MESSAGES ─────────────────────────────────────────────────── */
window.INITIAL_CMD_MSGS = [
  { from: "OCD-NCR",           text: "Typhoon MAWAR — Coordination call in 30 min", time: "14:23" },
  { from: "LDRRMO-Cabanatuan", text: "Pre-emptive evacuation of 234 families complete", time: "14:18" },
  { from: "RDRRMC-V",          text: "Signal #2 now includes Camarines Norte", time: "14:05" },
  { from: "DILG Region V",     text: "Requesting DRRM Fund utilization report", time: "13:55" },
];

/* ── DRRM PLAN TEMPLATES ────────────────────────────────────────────────────── */
window.DRRM_TEMPLATES = [
  { name: "Barangay DRRM Plan", level: "Barangay", pages: 24 },
  { name: "Municipal DRRM Plan", level: "Municipal", pages: 68 },
  { name: "Provincial DRRM Plan", level: "Provincial", pages: 112 },
  { name: "City DRRM Plan", level: "City", pages: 89 },
];

/* ── LEVEL COLORS ───────────────────────────────────────────────────────────── */
window.LEVEL_COLORS = {
  High:   { bg: "rgba(255,51,102,0.12)",  text: "#ff3366", border: "rgba(255,51,102,0.3)" },
  Medium: { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  Low:    { bg: "rgba(16,185,129,0.12)",  text: "#10b981", border: "rgba(16,185,129,0.3)" },
};

window.COMPLIANCE_COLOR = (v) =>
  v >= 90 ? "#10b981" : v >= 75 ? "#f59e0b" : "#ff3366";

window.SCORE_COLOR = (v) =>
  v >= 7 ? "#ff3366" : v >= 4 ? "#f59e0b" : "#10b981";

window.STATUS_COLOR = (s) =>
  s === "active" ? "#10b981" : s === "warning" ? "#f59e0b" : "#ff3366";
