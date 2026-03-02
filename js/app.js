/* ═══════════════════════════════════════════════════════════════════════════
   DDRiVE-M  ·  AI Disaster Resilience Platform  ·  Main Application
   Vanilla JS  ·  Mobile-First PWA  ·  No Framework Dependencies
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── APP STATE ──────────────────────────────────────────────────────────────── */
const State = {
  activeModule:  'dashboard',
  alertCount:    3,
  sidebarOpen:   false,
  chatOpen:      false,
  chatHistory:   [{ role: 'system', text: 'DDRiVE-M AI Assistant online. How can I assist your disaster resilience operations?' }],
  cmdMessages:   [...INITIAL_CMD_MSGS],
  radarAngle:    0,
  radarTimer:    null,
  simRunning:    false,
  simProgress:   0,
  simResults:    null,
  simTimer:      null,
  generatedDoc:  null,
  generating:    false,
  lguFilter:     '',
  clockTimer:    null,
};

/* ── DOM HELPERS ────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const html = (strings, ...vals) => strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');
const esc = (str) => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setInner(sel, content) {
  const el = $(sel);
  if (el) el.innerHTML = content;
}

function announce(msg) {
  const live = $('#aria-live');
  if (live) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); }
}

/* ── NAVIGATION ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: 'home' },
  { id: 'detection',   label: 'Detection',      icon: 'radar' },
  { id: 'diagnosis',   label: 'Diagnosis',      icon: 'activity' },
  { id: 'response',    label: 'Response',       icon: 'shield' },
  { id: 'integration', label: 'Integration',    icon: 'layers' },
  { id: 'validation',  label: 'Validation',     icon: 'check' },
  { id: 'enhancement', label: 'Enhancement',    icon: 'zap' },
  { id: 'monitoring',  label: 'Command Center', icon: 'eye' },
  { id: 'lgus',        label: 'LGU Registry',   icon: 'users' },
];

const BOTTOM_NAV = [
  { id: 'dashboard',  label: 'Home',    icon: 'home' },
  { id: 'detection',  label: 'Detect',  icon: 'radar' },
  { id: 'monitoring', label: 'Command', icon: 'eye' },
  { id: 'enhancement',label: 'AI Gen',  icon: 'zap' },
  { id: 'lgus',       label: 'LGUs',    icon: 'users' },
];

function navigateTo(moduleId) {
  if (State.radarTimer) { clearInterval(State.radarTimer); State.radarTimer = null; }
  State.activeModule = moduleId;
  closeSidebar();
  renderModule();
  updateNavHighlights();
  announce(`Navigated to ${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} module`);
  window.location.hash = moduleId;
}

function updateNavHighlights() {
  $$('.nav-btn').forEach(btn => {
    const active = btn.dataset.module === State.activeModule;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
  $$('.bottom-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.module === State.activeModule);
  });
}

/* ── SIDEBAR ────────────────────────────────────────────────────────────────── */
function openSidebar() {
  State.sidebarOpen = true;
  $('#sidebar').classList.add('open');
  $('#sidebar-overlay').classList.add('visible');
  $('#hamburger').classList.add('open');
  $('#hamburger').setAttribute('aria-expanded', 'true');
  setTimeout(() => { const first = $('#sidebar .nav-btn'); if (first) first.focus(); }, 50);
}

function closeSidebar() {
  State.sidebarOpen = false;
  $('#sidebar').classList.remove('open');
  $('#sidebar-overlay').classList.remove('visible');
  $('#hamburger').classList.remove('open');
  $('#hamburger').setAttribute('aria-expanded', 'false');
}

function toggleSidebar() {
  State.sidebarOpen ? closeSidebar() : openSidebar();
}

/* ── CLOCK ──────────────────────────────────────────────────────────────────── */
function startClock() {
  function tick() {
    const el = $('#clock-display');
    if (el) el.textContent = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  State.clockTimer = setInterval(tick, 1000);
}

/* ── MODULE HEADER ──────────────────────────────────────────────────────────── */
function moduleHeader(title, subtitle, color, height = 32) {
  return html`
    <div class="module-header">
      <div class="module-header-inner">
        <div class="module-accent" style="height:${height}px;background:${esc(color)}"></div>
        <div>
          <h1 class="module-title">${esc(title)}</h1>
          <p class="module-subtitle">${esc(subtitle)}</p>
        </div>
      </div>
    </div>`;
}

/* ── PROGRESS BAR ───────────────────────────────────────────────────────────── */
function progressBar(pct, color) {
  return html`
    <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" style="width:${pct}%;background:${esc(color)}"></div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const stats = [
    { label: "Active LGUs",    value: "120+", sub: "+8 this month",  icon: "users",         color: "#00d4ff" },
    { label: "Compliance Rate",value: "98%",  sub: "ISO 31000 avg",  icon: "check",         color: "#10b981" },
    { label: "Active Alerts",  value: "3",    sub: "2 critical",     icon: "alertTriangle", color: "#ff3366" },
    { label: "Risk Score Avg", value: "4.2",  sub: "↓ from 5.1",    icon: "activity",      color: "#f59e0b" },
  ];

  const statsHtml = stats.map(s => html`
    <article class="card stat-card" aria-label="${esc(s.label)}: ${esc(s.value)}">
      <div class="flex-between">
        <div>
          <div class="stat-label">${esc(s.label)}</div>
          <div class="stat-value" style="color:${esc(s.color)};font-family:var(--font-display)">${esc(s.value)}</div>
          <div class="stat-sub">${esc(s.sub)}</div>
        </div>
        <div class="stat-icon" style="background:${esc(s.color)}18;border:1px solid ${esc(s.color)}33">
          ${svg(s.icon, 16, s.color)}
        </div>
      </div>
    </article>`).join('');

  const phasesHtml = PHASES.map(p => html`
    <button class="phase-btn-card" data-module="${esc(p.module)}"
      style="border-color:${esc(p.color)}30" title="${esc(p.desc)}"
      aria-label="Go to Phase ${p.id}: ${esc(p.label)} — ${esc(p.desc)}">
      <div class="phase-num" style="color:${esc(p.color)}">${p.id}</div>
      <div class="phase-icon-wrap" style="background:${esc(p.color)}18;border:1px solid ${esc(p.color)}30">
        ${svg(p.icon, 13, p.color)}
      </div>
      <div class="phase-label">${esc(p.label)}</div>
    </button>`).join('');

  const hazardsHtml = HAZARDS.map(h => html`
    <div class="hazard-item">
      <span class="${h.level === 'WARNING' ? 'pulse-dot' : ''} status-dot"
        style="background:${esc(h.color)};width:8px;height:8px;border-radius:50%;flex-shrink:0"
        aria-label="${esc(h.level)}"></span>
      <div class="hazard-info">
        <div class="hazard-name">${esc(h.name)}</div>
        <div class="hazard-meta">${esc(h.agency)} · ${esc(h.time)}</div>
      </div>
      <span class="tag" style="background:${esc(h.color)}18;color:${esc(h.color)};border:1px solid ${esc(h.color)}30">${esc(h.level)}</span>
      <div class="hazard-intensity">
        <div class="hazard-pct">${h.intensity}%</div>
        ${progressBar(h.intensity, h.color)}
      </div>
    </div>`).join('');

  const lguHtml = LGUS.slice(0, 6).map(l => {
    const c = COMPLIANCE_COLOR(l.compliance);
    return html`
      <div class="lgu-item">
        <div class="lgu-info">
          <div class="lgu-name">${esc(l.name)}</div>
          <div class="lgu-meta">${esc(l.province)} · ${esc(l.phase)}</div>
        </div>
        <div class="lgu-compliance">
          <div class="compliance-header">
            <span class="compliance-label">Compliance</span>
            <span class="compliance-value" style="color:${c}">${l.compliance}%</span>
          </div>
          ${progressBar(l.compliance, c)}
        </div>
        <span style="width:8px;height:8px;border-radius:50%;background:${esc(STATUS_COLOR(l.status))};flex-shrink:0" aria-label="Status: ${esc(l.status)}"></span>
      </div>`; }).join('');

  return html`
    <div class="module fade-in" id="module-dashboard">
      <div style="margin-bottom:20px">
        <h1 class="display-title" style="font-size:18px">MISSION CONTROL</h1>
        <p style="font-size:10px;color:var(--text-muted);margin-top:4px">
          DDRiVE-M Intelligence Resilience Dashboard · Philippine LGU Operations Center
        </p>
      </div>

      <div class="alert-banner" role="alert" aria-live="assertive">
        <span class="alert-dot pulse-dot"></span>
        <span class="alert-text">
          ⚠ ACTIVE ALERT: Typhoon MAWAR — Warning Signal No.2 affecting 12 LGUs in Region V. PAGASA update 14 min ago.
        </span>
        <button class="btn-outline btn-sm" data-module="detection"
          style="border-color:rgba(255,51,102,0.4);color:#ff6688;flex-shrink:0"
          aria-label="View detection module">VIEW →</button>
      </div>

      <div class="grid-2" style="margin-bottom:16px">
        ${statsHtml}
      </div>

      <section aria-labelledby="phases-heading" style="margin-bottom:16px">
        <h2 id="phases-heading" class="section-label">7-Phase Intelligence Resilience Cycle</h2>
        <div class="phase-grid">${phasesHtml}</div>
      </section>

      <div class="grid-auto" style="grid-template-columns:1fr">
        <section class="card card-body" aria-labelledby="hazard-heading">
          <h2 id="hazard-heading" class="section-label">Live Hazard Feed</h2>
          ${hazardsHtml}
        </section>
        <section class="card card-body" aria-labelledby="lgu-heading">
          <h2 id="lgu-heading" class="section-label">LGU Compliance Overview</h2>
          ${lguHtml}
        </section>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: DETECTION
   ═══════════════════════════════════════════════════════════════════ */
function renderDetection() {
  const alertsHtml = HAZARDS.map(h => html`
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:42px;height:42px;border-radius:var(--radius-sm);background:${esc(h.color)}18;border:1px solid ${esc(h.color)}30;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${svg(h.icon, 18, h.color)}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;font-weight:600;color:var(--text-primary)">${esc(h.name)}</div>
        <div style="font-size:9px;color:var(--text-muted);margin-top:2px">Source: ${esc(h.agency)} · Updated ${esc(h.time)}</div>
        <div style="margin-top:6px">${progressBar(h.intensity, h.color)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:${esc(h.color)}">${h.intensity}%</div>
        <span class="tag" style="background:${esc(h.color)}18;color:${esc(h.color)};border:1px solid ${esc(h.color)}30;margin-top:3px">${esc(h.level)}</span>
      </div>
    </div>`).join('');

  const agenciesHtml = AGENCIES.map(a => html`
    <div class="agency-card">
      <div class="flex-between" style="margin-bottom:6px">
        <span class="agency-name">${esc(a.name)}</span>
        <span style="width:7px;height:7px;border-radius:50%;background:#10b981;display:block" aria-label="Online"></span>
      </div>
      <div class="agency-type">${esc(a.type)}</div>
      <div class="agency-stat">Feeds: <span>${a.feeds}</span></div>
      <div class="agency-stat">Latency: <span style="color:#10b981">${esc(a.latency)}</span></div>
    </div>`).join('');

  const metrics = [
    { l: "Wind Speed", v: "142 kph", c: "#ff3366" },
    { l: "Rainfall",   v: "89 mm",  c: "#00d4ff" },
    { l: "Seismic",    v: "M4.2",   c: "#f59e0b" },
  ];

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 1 — DETECTION", "Multi-agency real-time hazard monitoring with PHIVOLCS, PAGASA & NOAH APIs", "#00d4ff")}

      <div style="display:grid;gap:12px">
        <div style="display:grid;gap:12px;grid-template-columns:200px 1fr">
          <section class="card card-body" aria-label="Meteorological Radar">
            <h2 class="section-label">Meteorological Radar</h2>
            <div class="radar-wrap" id="radar-wrap">
              <svg id="radar-svg" class="radar-svg" width="180" height="180" viewBox="0 0 180 180" aria-label="Rotating radar sweep animation" role="img">
                <circle cx="90" cy="90" r="22" fill="none" stroke="#1a3352" stroke-width="1"/>
                <circle cx="90" cy="90" r="44" fill="none" stroke="#1a3352" stroke-width="1"/>
                <circle cx="90" cy="90" r="66" fill="none" stroke="#1a3352" stroke-width="1"/>
                <circle cx="90" cy="90" r="88" fill="none" stroke="#1a3352" stroke-width="1"/>
                <line x1="90" y1="2" x2="90" y2="178" stroke="#1a3352" stroke-width="0.5"/>
                <line x1="2" y1="90" x2="178" y2="90" stroke="#1a3352" stroke-width="0.5"/>
                <defs>
                  <radialGradient id="radarGrad" cx="50%" cy="50%">
                    <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#00d4ff" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <path id="radar-sweep-path" fill="url(#radarGrad)"/>
                <line id="radar-sweep-line" x1="90" y1="90" stroke="#00d4ff" stroke-width="1.5"/>
                <circle cx="130" cy="62" r="4" fill="#ff3366" opacity="0.9" class="pulse-dot"/>
                <circle cx="55" cy="120" r="3" fill="#f59e0b" opacity="0.7"/>
                <circle cx="102" cy="140" r="2.5" fill="#10b981" opacity="0.6"/>
              </svg>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
              ${metrics.map(m => html`
                <div style="text-align:center;background:var(--bg-input);border-radius:var(--radius-sm);padding:7px">
                  <div style="font-family:var(--font-display);font-size:11px;font-weight:700;color:${esc(m.c)}">${esc(m.v)}</div>
                  <div style="font-size:8px;color:var(--text-muted);margin-top:2px">${esc(m.l)}</div>
                </div>`).join('')}
            </div>
          </section>

          <section class="card card-body" aria-labelledby="alerts-heading">
            <h2 id="alerts-heading" class="section-label">Active Hazard Alerts</h2>
            ${alertsHtml}
          </section>
        </div>

        <section class="card card-body" aria-labelledby="agencies-heading">
          <h2 id="agencies-heading" class="section-label">Monitoring Agency APIs</h2>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
            ${agenciesHtml}
          </div>
        </section>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: DIAGNOSIS
   ═══════════════════════════════════════════════════════════════════ */
function renderDiagnosis() {
  const risksHtml = RISKS.map(r => {
    const lc = LEVEL_COLORS[r.level];
    const sc = SCORE_COLOR(r.score);
    const trendIcon = r.trend === 'up' ? '↑' : r.trend === 'down' ? '↓' : '→';
    const trendClass = r.trend === 'up' ? 'trend-up' : r.trend === 'down' ? 'trend-down' : 'trend-stable';
    return html`
      <tr>
        <td style="font-weight:600;color:var(--text-primary)">${esc(r.category)}</td>
        <td><span class="tag" style="background:${esc(lc.bg)};color:${esc(lc.text)};border:1px solid ${esc(lc.border)}">${esc(r.level)}</span></td>
        <td><span class="risk-score" style="color:${esc(sc)}">${r.score}</span></td>
        <td><span class="${trendClass}" style="font-size:14px" aria-label="Trend: ${r.trend}">${trendIcon}</span></td>
        <td style="color:var(--cyan)">${r.controls}</td>
      </tr>`;
  }).join('');

  const matrixCells = Array.from({ length: 25 }, (_, i) => {
    const row = Math.floor(i / 5), col = i % 5;
    const risk = (5 - row) * (col + 1);
    const c = risk >= 20 ? '#ff3366' : risk >= 12 ? '#f59e0b' : risk >= 6 ? '#ffdd00' : '#10b981';
    return html`<div class="risk-cell" style="background:${esc(c)}b3" aria-label="Risk score ${risk}">${risk}</div>`;
  }).join('');

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 2 — DIAGNOSIS", "ISO 31000-aligned AI risk analysis — strategic, operational, financial, compliance & environmental", "#ff6b35")}

      <div style="display:grid;gap:12px">
        <section class="card card-body" aria-labelledby="risk-register-heading">
          <h2 id="risk-register-heading" class="section-label">Risk Register — ISO 31000 Framework</h2>
          <div style="overflow-x:auto">
            <table class="risk-table" aria-label="Risk register by category">
              <thead>
                <tr>
                  <th>Risk Category</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Trend</th>
                  <th>Controls</th>
                </tr>
              </thead>
              <tbody>${risksHtml}</tbody>
            </table>
          </div>
        </section>

        <div style="display:grid;gap:12px;grid-template-columns:1fr 1fr">
          <section class="card card-body" aria-labelledby="matrix-heading">
            <h2 id="matrix-heading" class="section-label">Overall Risk Matrix</h2>
            <div class="risk-matrix" aria-label="5x5 risk matrix grid">${matrixCells}</div>
            <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
              ${[['#ff3366','High'],['#f59e0b','Med-High'],['#ffdd00','Medium'],['#10b981','Low']].map(([c,l]) =>
                html`<div style="display:flex;align-items:center;gap:4px">
                  <div style="width:8px;height:8px;background:${esc(c)};border-radius:1px"></div>
                  <span style="font-size:9px;color:var(--text-muted)">${esc(l)}</span>
                </div>`).join('')}
            </div>
          </section>

          <section class="card card-body" aria-labelledby="ai-assessment-heading">
            <h2 id="ai-assessment-heading" class="section-label">AI Assessment</h2>
            <div class="ai-box" style="border:1px solid rgba(255,107,53,0.25)">
              <span style="color:#ff6b35;font-weight:700">AI ANALYSIS:</span>
              Environmental and strategic risk categories show elevated scores (7.8 and 8.2 respectively).
              Recommend immediate activation of <span style="color:var(--cyan)">Phase 3 Response protocols</span>
              for high-risk categories. Compliance risk remains well-controlled at 2.1.
            </div>
          </section>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: RESPONSE
   ═══════════════════════════════════════════════════════════════════ */
function renderResponse() {
  const controlsHtml = CONTROLS.map(c => {
    const itemsHtml = c.items.map((item, i) => html`
      <div class="control-item">
        <div class="control-dot-wrap" style="background:${esc(c.color)}18;border:1px solid ${esc(c.color)}44">
          <div class="control-dot" style="background:${esc(c.color)}"></div>
        </div>
        <span class="control-text">${esc(item)}</span>
        <button class="btn-outline btn-sm" data-action="activate-control" data-item="${esc(item)}"
          style="border-color:${esc(c.color)}30;color:${esc(c.color)};margin-left:auto"
          aria-label="Activate ${esc(item)}">ACTIVATE</button>
      </div>`).join('');
    return html`
      <article class="card control-card" style="border-left:3px solid ${esc(c.color)}">
        <div class="control-header">
          <div>
            <div class="control-type" style="color:${esc(c.color)}">${esc(c.type.toUpperCase())} CONTROLS</div>
            <div style="font-size:9px;color:var(--text-muted);margin-top:2px">OCD Protocol Aligned</div>
          </div>
          <div class="control-count" style="color:${esc(c.color)}">${c.count}</div>
        </div>
        ${itemsHtml}
      </article>`;
  }).join('');

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 3 — RESPONSE", "Risk treatment options with preventive, detective, corrective & directive controls aligned to OCD protocols", "#ff3366")}
      <div class="grid-2" style="gap:14px">${controlsHtml}</div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: INTEGRATION
   ═══════════════════════════════════════════════════════════════════ */
function renderIntegration() {
  const essHtml = ESSENTIALS.map(e => {
    const c = e.score >= 85 ? '#10b981' : e.score >= 70 ? '#f59e0b' : '#ff3366';
    const sc = e.status === 'Compliant';
    return html`
      <div class="essential-item">
        <div class="essential-num" aria-label="Essential ${e.no}">${e.no}</div>
        <div class="essential-info">
          <div class="essential-name">Essential ${e.no}: ${esc(e.title)}</div>
          <div style="margin-top:5px">${progressBar(e.score, c)}</div>
        </div>
        <div class="essential-score">
          <div class="essential-pct" style="color:${esc(c)}">${e.score}%</div>
          <span class="tag" style="background:${sc ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'};color:${sc ? '#10b981' : '#f59e0b'};border:1px solid ${sc ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}">${esc(e.status)}</span>
        </div>
      </div>`; }).join('');

  const tmplHtml = DRRM_TEMPLATES.map(t => html`
    <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:11px;margin-bottom:8px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;color:var(--text-primary);font-weight:600">${esc(t.name)}</div>
        <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${esc(t.level)} · ${t.pages} pages</div>
      </div>
      <button class="btn-outline btn-sm" aria-label="Use ${esc(t.name)} template">USE</button>
    </div>`).join('');

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 4 — INTEGRATION", "UNDRR MCR2030 10 Essentials assessment with barangay, municipal & provincial DRRM plan templates", "#a855f7")}
      <div style="display:grid;gap:14px">
        <section class="card card-body" aria-labelledby="essentials-heading">
          <h2 id="essentials-heading" class="section-label">UNDRR MCR2030 — 10 Essentials Scorecard</h2>
          ${essHtml}
        </section>
        <div style="display:grid;gap:14px;grid-template-columns:1fr 1fr">
          <section class="card card-body" aria-labelledby="templates-heading">
            <h2 id="templates-heading" class="section-label">DRRM Plan Templates</h2>
            ${tmplHtml}
          </section>
          <div class="card card-body">
            <div class="section-label">Overall MCR2030 Score</div>
            <div class="score-box" style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2)">
              <div class="score-label" style="color:#a855f7">MCR2030 COMPOSITE</div>
              <div class="score-value" style="color:#a855f7">82.9%</div>
              <div class="score-sub">Above national average of 74.3%</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: VALIDATION
   ═══════════════════════════════════════════════════════════════════ */
function renderValidation() {
  const params = [
    { label: "Scenario",    value: "Typhoon Cat.4" },
    { label: "Population",  value: "124,500"       },
    { label: "Duration",    value: "72 hours"      },
    { label: "Resources",   value: "85% deployed"  },
  ];

  const kpis = [
    { kpi: "Evacuation Speed",    score: 87, grade: "A"  },
    { kpi: "Resource Allocation", score: 72, grade: "B"  },
    { kpi: "Communication",       score: 94, grade: "A+" },
    { kpi: "Medical Response",    score: 68, grade: "C+" },
    { kpi: "Recovery Timeline",   score: 81, grade: "B+" },
  ];

  const paramsHtml = params.map(p => html`
    <div class="sim-param">
      <div class="sim-param-label">${esc(p.label)}</div>
      <div class="sim-param-value">${esc(p.value)}</div>
    </div>`).join('');

  const progressHtml = State.simRunning ? html`
    <div style="margin-bottom:14px" id="sim-progress-wrap">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:10px;color:var(--green)">Running simulation...</span>
        <span style="font-size:10px;color:var(--green);font-family:var(--font-display)" id="sim-pct">${Math.floor(State.simProgress)}%</span>
      </div>
      <div class="progress-track" style="height:8px">
        <div class="progress-fill" id="sim-bar" style="width:${State.simProgress}%;background:linear-gradient(90deg,#10b981,#00d4ff)"></div>
      </div>
    </div>` : '';

  const kpisHtml = State.simResults ? kpis.map(k => {
    const c = k.score >= 85 ? '#10b981' : k.score >= 70 ? '#f59e0b' : '#ff3366';
    return html`
      <div class="kpi-item">
        <div class="kpi-info">
          <div class="kpi-name">${esc(k.kpi)}</div>
          ${progressBar(k.score, c)}
        </div>
        <div class="kpi-grade" style="color:${esc(c)}">${esc(k.grade)}</div>
      </div>`;
  }).join('') : '';

  const overallHtml = State.simResults ? html`
    <div class="score-box fade-in" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);margin-top:14px">
      <div class="score-label" style="color:var(--green)">OVERALL PERFORMANCE</div>
      <div class="score-value" style="color:var(--green)">B+</div>
      <div class="score-sub">80.4% — Above Threshold</div>
    </div>` : '';

  const emptyState = !State.simResults && !State.simRunning ? html`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:180px;color:var(--text-muted)">
      ${svg('play', 44, '#1a3352')}
      <p style="margin-top:12px;font-size:11px">Run a simulation to see results</p>
    </div>` : '';

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 5 — VALIDATION", "Simulation-based validation of risk treatments and emergency operations with performance scoring", "#10b981")}
      <div class="grid-2" style="gap:14px">
        <section class="card card-body" aria-labelledby="sim-heading">
          <h2 id="sim-heading" class="section-label">Simulation Engine</h2>
          <div class="grid-2" style="gap:8px;margin-bottom:16px">${paramsHtml}</div>
          ${progressHtml}
          <button class="btn-primary" id="run-sim-btn" style="width:100%"
            ${State.simRunning ? 'disabled aria-disabled="true"' : ''}
            aria-label="${State.simRunning ? 'Simulation in progress' : 'Run disaster simulation'}">
            ${State.simRunning ? '⟳ SIMULATING...' : '▶ RUN SIMULATION'}
          </button>
        </section>
        <section class="card card-body" aria-labelledby="perf-heading">
          <h2 id="perf-heading" class="section-label">Performance Scoring</h2>
          ${emptyState}
          ${kpisHtml}
          ${overallHtml}
        </section>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: ENHANCEMENT
   ═══════════════════════════════════════════════════════════════════ */
function renderEnhancement() {
  const docsHtml = DOCS.map(d => {
    const ready = d.status === 'Ready';
    return html`
      <div class="doc-item">
        <div class="doc-icon">${svg('fileText', 16, '#f59e0b')}</div>
        <div class="doc-info">
          <div class="doc-name">${esc(d.name)}</div>
          <div class="doc-desc">${esc(d.desc)}</div>
        </div>
        <span class="tag" style="background:${ready ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'};color:${ready ? '#10b981' : '#f59e0b'};border:1px solid ${ready ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}">${esc(d.status)}</span>
        <button class="btn-primary" data-action="generate-doc" data-docname="${esc(d.name)}"
          ${State.generating ? 'disabled' : ''}
          style="font-size:9px;padding:6px 10px"
          aria-label="Generate ${esc(d.name)} with AI">
          ${State.generating ? '⟳' : '⚡ AI GEN'}
        </button>
      </div>`; }).join('');

  let previewHtml;
  if (State.generating && !State.generatedDoc) {
    previewHtml = html`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:280px">
        <div class="spinner"></div>
        <p style="margin-top:14px;font-size:11px;color:var(--text-muted)">AI generating document...</p>
      </div>`;
  } else if (State.generatedDoc) {
    previewHtml = html`
      <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--amber)">${esc(State.generatedDoc.name)}</div>
          <button class="btn-outline btn-sm" id="export-doc-btn" aria-label="Export document">
            ${svg('download', 10, 'currentColor')} EXPORT
          </button>
        </div>
        <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:12px;border:1px solid var(--border);max-height:360px;overflow-y:auto;font-size:11px;line-height:1.8;color:var(--text-primary);white-space:pre-wrap" id="doc-preview-content">${esc(State.generatedDoc.content)}</div>
      </div>`;
  } else {
    previewHtml = html`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:280px;color:var(--text-muted)">
        ${svg('fileText', 44, '#1a3352')}
        <p style="margin-top:12px;font-size:11px">Click ⚡ AI GEN to generate a document</p>
      </div>`;
  }

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 6 — ENHANCEMENT", "AI-assisted generation of DANA, DRRM Plans, Contingency Plans, PSCP & BCP — RA 10121 compliant", "#f59e0b")}
      <div style="display:grid;gap:14px">
        <section class="card card-body" aria-labelledby="docgen-heading">
          <h2 id="docgen-heading" class="section-label">AI Document Generator</h2>
          ${docsHtml}
        </section>
        <section class="card card-body" aria-labelledby="preview-heading" aria-live="polite">
          <h2 id="preview-heading" class="section-label">Generated Document Preview</h2>
          ${previewHtml}
        </section>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: MONITORING
   ═══════════════════════════════════════════════════════════════════ */
function renderMonitoring() {
  const msgsHtml = State.cmdMessages.map(m => html`
    <div class="cmd-msg">
      <div class="cmd-msg-header">
        <span class="cmd-from">${esc(m.from)}</span>
        <span class="cmd-time">${esc(m.time)}</span>
      </div>
      <div class="cmd-text">${esc(m.text)}</div>
    </div>`).join('');

  const participants = ["OCD-NCR", "LDRRMO Cabanatuan", "RDRRMC-V", "DILG Region V", "PHIVOLCS", "PAGASA"];
  const participantsHtml = participants.map((p, i) => html`
    <div class="participant">
      <div class="participant-dot" style="background:${i < 3 ? '#10b981' : '#4a7a9b'}" aria-label="${i < 3 ? 'Online' : 'Offline'}"></div>
      <span class="participant-name" style="color:${i < 3 ? 'var(--text-primary)' : 'var(--text-muted)'}">${esc(p)}</span>
    </div>`).join('');

  const sharedDocs = [
    { name: "MAWAR Sitrep #3", type: "PDF", shared: "14:20" },
    { name: "Evacuation Map Zone A", type: "PNG", shared: "13:40" },
    { name: "DRRM Fund Status", type: "XLSX", shared: "12:15" },
  ];
  const sharedHtml = sharedDocs.map(d => html`
    <div class="shared-doc">
      <div class="doc-type-badge">${esc(d.type)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--text-primary)">${esc(d.name)}</div>
        <div style="font-size:9px;color:var(--text-muted)">${esc(d.shared)}</div>
      </div>
      <button class="btn-outline btn-sm" aria-label="Download ${esc(d.name)}">↓</button>
    </div>`).join('');

  return html`
    <div class="module fade-in">
      ${moduleHeader("PHASE 7 — MONITORING", "Real-time collaborative command center — video conferencing, SMS alerts, chat & document sharing", "#06b6d4")}
      <div style="display:grid;gap:14px">
        <section class="card card-body" aria-labelledby="cmdchat-heading">
          <h2 id="cmdchat-heading" class="section-label">Command Chat</h2>
          <div class="cmd-messages" id="cmd-messages" aria-live="polite" aria-label="Command chat messages">${msgsHtml}</div>
          <div style="display:flex;gap:8px">
            <input class="input-field chat-input" id="cmd-input" type="text" placeholder="Send command message..."
              aria-label="Type a command message" style="flex:1;font-size:11px"/>
            <button class="btn-primary" id="cmd-send-btn" aria-label="Send command message" style="padding:8px 14px">→</button>
          </div>
        </section>

        <div style="display:grid;gap:14px;grid-template-columns:1fr 1fr">
          <section class="card card-body" aria-labelledby="video-heading">
            <h2 id="video-heading" class="section-label">Video Conferencing</h2>
            <div class="video-placeholder" role="img" aria-label="No active video conference">
              ${svg('users', 28, '#1a3352')}
              <span>No active conference</span>
            </div>
            <div class="grid-2" style="gap:8px;margin-bottom:12px">
              <button class="btn-primary" style="font-size:10px" aria-label="Start video call">START CALL</button>
              <button class="btn-outline" style="font-size:10px" aria-label="Schedule video call">SCHEDULE</button>
            </div>
            <div class="section-label">Participants (6)</div>
            ${participantsHtml}
          </section>

          <section class="card card-body" aria-labelledby="sms-heading">
            <h2 id="sms-heading" class="section-label">SMS Mass Alert</h2>
            <div style="margin-bottom:10px">
              <div style="font-size:9px;color:var(--text-muted);margin-bottom:6px">COVERAGE AREA</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                ${["Barangay 1","Barangay 2","Poblacion","San Roque"].map(b =>
                  html`<span class="tag tag-teal">${esc(b)}</span>`).join('')}
              </div>
            </div>
            <textarea class="input-field" id="sms-text" aria-label="SMS alert message"
              style="width:100%;margin-bottom:8px">BABALA: Typhoon Signal #2. Mangyaring lumikas na sa mga ligtas na lugar. -LDRRMO</textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <span style="font-size:10px;color:var(--text-muted)">Recipients: 34,512</span>
              <button class="btn-primary" style="font-size:10px" id="send-sms-btn" aria-label="Send mass SMS alert">SEND ALERT</button>
            </div>
            <div class="sms-delivered">
              <div style="font-size:10px;color:var(--green);margin-bottom:3px">LAST SENT · 14:05</div>
              <div style="font-size:10px;color:var(--text-muted)">Delivered: 31,204 / 34,512 (90.4%)</div>
            </div>
          </section>
        </div>

        <section class="card card-body" aria-labelledby="shared-docs-heading">
          <h2 id="shared-docs-heading" class="section-label">Shared Documents</h2>
          ${sharedHtml}
        </section>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE: LGU REGISTRY
   ═══════════════════════════════════════════════════════════════════ */
function renderLGUs() {
  const filtered = LGUS.filter(l =>
    l.name.toLowerCase().includes(State.lguFilter.toLowerCase()) ||
    l.province.toLowerCase().includes(State.lguFilter.toLowerCase())
  );

  const rowsHtml = filtered.map(l => {
    const cc = COMPLIANCE_COLOR(l.compliance);
    const sc = STATUS_COLOR(l.status);
    return html`
      <tr>
        <td style="font-size:12px;font-weight:600;color:var(--text-primary)">${esc(l.name)}</td>
        <td style="font-size:11px;color:var(--text-muted)">${esc(l.province)}</td>
        <td><span style="width:8px;height:8px;border-radius:50%;background:${esc(sc)};display:inline-block" aria-label="Status: ${esc(l.status)}"></span></td>
        <td><span class="tag tag-cyan">${esc(l.phase)}</span></td>
        <td>
          <div style="font-family:var(--font-display);font-size:13px;font-weight:700;color:${esc(cc)}">${l.compliance}%</div>
          <div style="margin-top:4px">${progressBar(l.compliance, cc)}</div>
        </td>
        <td>
          <div style="display:flex;gap:5px">
            <button class="btn-outline btn-sm" aria-label="View ${esc(l.name)}">VIEW</button>
            <button class="btn-outline btn-sm" aria-label="Edit ${esc(l.name)}">EDIT</button>
          </div>
        </td>
      </tr>`; }).join('');

  const summaryStats = [
    { label: "Total LGUs Onboarded", value: "120+",  color: "#00d4ff" },
    { label: "Average Compliance",   value: "84.6%", color: "#10b981" },
    { label: "Pending Assessments",  value: "14",    color: "#f59e0b" },
  ];

  return html`
    <div class="module fade-in">
      ${moduleHeader("LGU REGISTRY", "Philippine Local Government Unit DRRM compliance tracking — 120+ active LGUs", "#00d4ff")}

      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <div style="position:relative;flex:1;min-width:200px">
          <input class="input-field" id="lgu-search" type="search" value="${esc(State.lguFilter)}"
            placeholder="Search LGU or province..." aria-label="Search LGUs by name or province"
            style="padding-left:32px"/>
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:0.5">
            ${svg('search', 14, '#4a7a9b')}
          </span>
        </div>
        <button class="btn-outline" aria-label="Export LGU data">↓ EXPORT</button>
        <button class="btn-primary" aria-label="Add new LGU">+ ADD LGU</button>
      </div>

      <section class="card" aria-label="LGU compliance table">
        <div class="lgu-table-wrap">
          <table class="lgu-table" aria-label="LGU compliance registry">
            <thead><tr>
              <th>LGU Name</th>
              <th>Province</th>
              <th>Status</th>
              <th>Current Phase</th>
              <th>Compliance</th>
              <th>Actions</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </section>

      <div class="grid-3" style="gap:12px;margin-top:14px">
        ${summaryStats.map(s => html`
          <div class="card card-body" style="text-align:center">
            <div style="font-family:var(--font-display);font-size:24px;font-weight:700;color:${esc(s.color)}">${esc(s.value)}</div>
            <div style="font-size:9px;color:var(--text-muted);margin-top:6px;letter-spacing:1px">${esc(s.label.toUpperCase())}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   ROUTER — render active module
   ═══════════════════════════════════════════════════════════════════ */
const MODULE_RENDERERS = {
  dashboard:   renderDashboard,
  detection:   renderDetection,
  diagnosis:   renderDiagnosis,
  response:    renderResponse,
  integration: renderIntegration,
  validation:  renderValidation,
  enhancement: renderEnhancement,
  monitoring:  renderMonitoring,
  lgus:        renderLGUs,
};

function renderModule() {
  const renderer = MODULE_RENDERERS[State.activeModule] || renderDashboard;
  setInner('#main-content', renderer());
  attachModuleEvents();
  if (State.activeModule === 'detection') startRadar();
}

/* ═══════════════════════════════════════════════════════════════════
   RADAR ANIMATION
   ═══════════════════════════════════════════════════════════════════ */
function startRadar() {
  if (State.radarTimer) clearInterval(State.radarTimer);
  State.radarTimer = setInterval(tickRadar, 50);
}

function tickRadar() {
  State.radarAngle = (State.radarAngle + 3) % 360;
  const a = State.radarAngle;
  const R = 88;
  const cx = 90, cy = 90;
  const toRad = (deg) => (deg - 90) * Math.PI / 180;

  const x1 = cx + R * Math.cos(toRad(a));
  const y1 = cy + R * Math.sin(toRad(a));
  const x2 = cx + R * Math.cos(toRad(a - 60));
  const y2 = cy + R * Math.sin(toRad(a - 60));

  const sweepPath = $('#radar-sweep-path');
  const sweepLine = $('#radar-sweep-line');
  if (sweepPath) {
    sweepPath.setAttribute('d', `M${cx},${cy} L${x1},${y1} A${R},${R} 0 0,0 ${x2},${y2} Z`);
  }
  if (sweepLine) {
    sweepLine.setAttribute('x2', x1);
    sweepLine.setAttribute('y2', y1);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SIMULATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */
function runSimulation() {
  if (State.simRunning) return;
  State.simRunning = true;
  State.simProgress = 0;
  State.simResults = null;
  renderModule();

  State.simTimer = setInterval(() => {
    State.simProgress += Math.random() * 8 + 2;
    if (State.simProgress >= 100) {
      State.simProgress = 100;
      clearInterval(State.simTimer);
      State.simRunning = false;
      State.simResults = true;
      renderModule();
      announce('Simulation complete. Results are now displayed.');
      return;
    }
    const bar = $('#sim-bar');
    const pct = $('#sim-pct');
    if (bar) bar.style.width = State.simProgress + '%';
    if (pct) pct.textContent = Math.floor(State.simProgress) + '%';
  }, 150);
}

/* ═══════════════════════════════════════════════════════════════════
   AI DOCUMENT GENERATOR
   ═══════════════════════════════════════════════════════════════════ */
async function generateDocument(docName) {
  State.generating = true;
  State.generatedDoc = null;
  renderModule();
  announce('Generating document with AI...');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are a Philippine DRRM compliance expert. Generate concise, professional document templates compliant with RA 10121 and relevant DILG standards. Format output as plain text with clear section headers.',
        messages: [{
          role: 'user',
          content: `Generate a brief template outline for: ${docName}. Include key sections and their purpose. Format it professionally with section numbers.`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text || '').join('\n') || 'Unable to generate document at this time.';
    State.generatedDoc = { name: docName, content: text };
  } catch (e) {
    State.generatedDoc = { name: docName, content: 'Document generation requires API connectivity. Please check your network connection and API configuration.' };
  }

  State.generating = false;
  renderModule();
  announce(`Document ${docName} has been generated.`);
}

function exportDocument() {
  if (!State.generatedDoc) return;
  const blob = new Blob([State.generatedDoc.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${State.generatedDoc.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════════
   AI CHAT ASSISTANT
   ═══════════════════════════════════════════════════════════════════ */
function openChat() {
  State.chatOpen = true;
  $('#chat-panel').classList.remove('hidden');
  setTimeout(() => { $('#chat-input')?.focus(); }, 100);
  announce('AI Assistant panel opened');
}

function closeChat() {
  State.chatOpen = false;
  $('#chat-panel').classList.add('hidden');
}

function renderChatMessages() {
  const container = $('#chat-messages');
  if (!container) return;
  container.innerHTML = State.chatHistory.map(m => html`
    <div class="chat-msg ${esc(m.role)}" role="${m.role === 'system' ? 'status' : 'log'}">${esc(m.text)}</div>`
  ).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = $('#chat-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  State.chatHistory.push({ role: 'user', text: msg });

  const typing = { role: 'typing', text: '...' };
  State.chatHistory.push(typing);
  renderChatMessages();

  try {
    const messages = State.chatHistory
      .filter(m => m.role === 'user' || m.role === 'ai')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are DDRiVE-M AI Assistant, an expert in Philippine disaster risk reduction and management (DRRM), RA 10121, ISO 31000, UNDRR MCR2030, and DILG MC 2020-161. You help LGU officials with disaster preparedness, risk assessment, and DRRM compliance. Be concise, authoritative, and practical.',
        messages: [{ role: 'user', content: msg }]
      })
    });
    const data = await res.json();
    const reply = data.content?.map(c => c.text || '').join('\n') || 'Unable to process request.';
    State.chatHistory = State.chatHistory.filter(m => m !== typing);
    State.chatHistory.push({ role: 'ai', text: reply });
  } catch {
    State.chatHistory = State.chatHistory.filter(m => m !== typing);
    State.chatHistory.push({ role: 'ai', text: 'Connecting to AI backend... Please ensure API access is configured.' });
  }

  renderChatMessages();
}

/* ═══════════════════════════════════════════════════════════════════
   COMMAND CENTER CHAT
   ═══════════════════════════════════════════════════════════════════ */
function sendCommandMessage() {
  const input = $('#cmd-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  const now = new Date();
  const time = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  State.cmdMessages.unshift({ from: 'You', text, time });

  const container = $('#cmd-messages');
  if (container) {
    const msgHtml = html`
      <div class="cmd-msg fade-in">
        <div class="cmd-msg-header">
          <span class="cmd-from" style="color:var(--cyan)">You</span>
          <span class="cmd-time">${esc(time)}</span>
        </div>
        <div class="cmd-text">${esc(text)}</div>
      </div>`;
    container.insertAdjacentHTML('afterbegin', msgHtml);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   EVENT DELEGATION — module-level events
   ═══════════════════════════════════════════════════════════════════ */
function attachModuleEvents() {
  const main = $('#main-content');
  if (!main) return;

  /* Phase buttons on dashboard */
  main.querySelectorAll('[data-module]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.module));
  });

  /* Simulation run button */
  const simBtn = $('#run-sim-btn');
  if (simBtn) simBtn.addEventListener('click', runSimulation);

  /* AI Gen buttons */
  main.querySelectorAll('[data-action="generate-doc"]').forEach(btn => {
    btn.addEventListener('click', () => generateDocument(btn.dataset.docname));
  });

  /* Export document */
  const exportBtn = $('#export-doc-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportDocument);

  /* Activate control buttons */
  main.querySelectorAll('[data-action="activate-control"]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = 'ACTIVE';
      btn.style.background = 'rgba(16,185,129,0.15)';
      btn.style.color = '#10b981';
      btn.style.borderColor = 'rgba(16,185,129,0.4)';
      btn.disabled = true;
      announce(`${btn.dataset.item} control activated`);
    });
  });

  /* Command chat send */
  const cmdSend = $('#cmd-send-btn');
  const cmdInput = $('#cmd-input');
  if (cmdSend) cmdSend.addEventListener('click', sendCommandMessage);
  if (cmdInput) cmdInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCommandMessage(); } });

  /* LGU search */
  const lguSearch = $('#lgu-search');
  if (lguSearch) {
    lguSearch.addEventListener('input', e => {
      State.lguFilter = e.target.value;
      const tbody = document.querySelector('.lgu-table tbody');
      if (!tbody) return;
      const filtered = LGUS.filter(l =>
        l.name.toLowerCase().includes(State.lguFilter.toLowerCase()) ||
        l.province.toLowerCase().includes(State.lguFilter.toLowerCase())
      );
      const rowsHtml = filtered.map(l => {
        const cc = COMPLIANCE_COLOR(l.compliance);
        return html`
          <tr>
            <td style="font-size:12px;font-weight:600;color:var(--text-primary)">${esc(l.name)}</td>
            <td style="font-size:11px;color:var(--text-muted)">${esc(l.province)}</td>
            <td><span style="width:8px;height:8px;border-radius:50%;background:${esc(STATUS_COLOR(l.status))};display:inline-block"></span></td>
            <td><span class="tag tag-cyan">${esc(l.phase)}</span></td>
            <td>
              <div style="font-family:var(--font-display);font-size:13px;font-weight:700;color:${esc(cc)}">${l.compliance}%</div>
              <div style="margin-top:4px">${progressBar(l.compliance, cc)}</div>
            </td>
            <td>
              <div style="display:flex;gap:5px">
                <button class="btn-outline btn-sm" aria-label="View ${esc(l.name)}">VIEW</button>
                <button class="btn-outline btn-sm" aria-label="Edit ${esc(l.name)}">EDIT</button>
              </div>
            </td>
          </tr>`; }).join('');
        tbody.innerHTML = rowsHtml;
    });
  }

  /* SMS send */
  const smsBtn = $('#send-sms-btn');
  if (smsBtn) {
    smsBtn.addEventListener('click', () => {
      smsBtn.textContent = '✓ SENT';
      smsBtn.disabled = true;
      setTimeout(() => { smsBtn.textContent = 'SEND ALERT'; smsBtn.disabled = false; }, 3000);
      announce('SMS alert sent to 34,512 recipients');
    });
  }

  /* Alert banner view button */
  const alertView = main.querySelector('.btn-outline[data-module="detection"]');
  if (alertView) alertView.addEventListener('click', () => navigateTo('detection'));
}

/* ═══════════════════════════════════════════════════════════════════
   RENDER SHELL (topbar, sidebar, bottom-nav, chat panel)
   ═══════════════════════════════════════════════════════════════════ */
function renderShell() {
  const sidebarNav = NAV_ITEMS.map(n => html`
    <button class="nav-btn ${State.activeModule === n.id ? 'active' : ''}"
      data-module="${esc(n.id)}"
      aria-label="Navigate to ${esc(n.label)}"
      aria-current="${State.activeModule === n.id ? 'page' : 'false'}">
      <span class="nav-icon">${svg(n.icon, 14, 'currentColor')}</span>
      ${esc(n.label)}
    </button>`).join('');

  const statusItems = [
    { label: "PHIVOLCS API", ok: true },
    { label: "PAGASA Feed",  ok: true },
    { label: "NOAH Data",    ok: true },
    { label: "SMS Gateway",  ok: false },
  ];
  const statusHtml = statusItems.map(s => html`
    <div class="status-item">
      <span class="status-label">${esc(s.label)}</span>
      <span class="status-dot ${s.ok ? '' : 'pulse'}"
        style="background:${s.ok ? '#10b981' : '#f59e0b'}"
        aria-label="${s.ok ? 'Online' : 'Warning'}"></span>
    </div>`).join('');

  const bottomNavHtml = BOTTOM_NAV.map(n => html`
    <button class="bottom-nav-btn ${State.activeModule === n.id ? 'active' : ''}"
      data-module="${esc(n.id)}" aria-label="${esc(n.label)}"
      aria-current="${State.activeModule === n.id ? 'page' : 'false'}">
      ${svg(n.icon, 18, 'currentColor')}
      <span>${esc(n.label)}</span>
    </button>`).join('');

  const badges = ['RA 10121','ISO 31000','UNDRR','DILG'].map(b =>
    html`<span class="tag tag-cyan">${esc(b)}</span>`).join('');

  document.getElementById('app').innerHTML = html`
    <!-- Skip navigation (accessibility) -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- ARIA live region -->
    <div id="aria-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>

    <!-- TOP BAR -->
    <header id="topbar" role="banner">
      <div class="topbar-brand">
        <button class="hamburger" id="hamburger"
          aria-label="Toggle navigation menu" aria-expanded="false"
          aria-controls="sidebar">
          <span></span><span></span><span></span>
        </button>
        <div class="topbar-logo" aria-hidden="true">
          <img
            src="https://ddrive-erm.appimize.app/assets/apps/user_1097/app_12127/draft/icon/app_logo.png?1772401763"
            alt="DDRiVE-M Logo"
            class="logo-img logo-circle-sm"
            width="34" height="34"
            loading="eager"
            decoding="async"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />
          <span class="logo-fallback logo-circle-sm" style="display:none" aria-hidden="true">D</span>
        </div>
        <div class="topbar-title">
          <div class="topbar-name">DDRiVE-M</div>
          <div class="topbar-sub">AI DISASTER RESILIENCE PLATFORM</div>
        </div>
      </div>

      <div class="topbar-badges" aria-label="Compliance standards">${badges}</div>

      <div class="topbar-right">
        <div class="topbar-clock" aria-label="Current Philippines Standard Time">
          <div class="clock-time" id="clock-display" aria-live="off">--:--:--</div>
          <div class="clock-label">Philippines Standard Time</div>
        </div>
        <button class="topbar-bell" id="bell-btn"
          aria-label="${State.alertCount > 0 ? State.alertCount + ' active alerts. Click to dismiss.' : 'No active alerts'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="${State.alertCount > 0 ? '#ff3366' : '#4a7a9b'}"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          ${State.alertCount > 0 ? html`<span class="bell-badge pulse">${State.alertCount}</span>` : ''}
        </button>
        <div class="topbar-avatar" role="button" tabindex="0" aria-label="User profile">
          ${svg('users', 14, '#4a7a9b')}
        </div>
      </div>
    </header>

    <!-- LAYOUT -->
    <div id="layout">
      <!-- Overlay -->
      <div id="sidebar-overlay" role="presentation"></div>

      <!-- SIDEBAR -->
      <nav id="sidebar" aria-label="Main navigation">
        <div class="sidebar-section">
          <div class="sidebar-label">Navigation</div>
          ${sidebarNav}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">System Status</div>
          ${statusHtml}
        </div>
        <div class="sidebar-footer">
          <button class="btn-primary" id="ai-assistant-btn"
            style="width:100%;font-size:10px" aria-label="Open AI Assistant">
            ⚡ AI Assistant
          </button>
        </div>
      </nav>

      <!-- MAIN CONTENT -->
      <main id="main-content" tabindex="-1" aria-label="Main content">
      </main>
    </div>

    <!-- BOTTOM NAV (mobile) -->
    <nav id="bottom-nav" aria-label="Quick navigation">
      ${bottomNavHtml}
    </nav>

    <!-- CHAT PANEL -->
    <aside id="chat-panel" class="hidden" role="complementary" aria-label="AI Assistant">
      <div class="chat-header">
        <div>
          <div class="chat-title">⚡ DDRiVE-M AI ASSISTANT</div>
          <div class="chat-sub">DRRM EXPERT · RA 10121 COMPLIANT</div>
        </div>
        <button class="chat-close" id="chat-close-btn" aria-label="Close AI Assistant">×</button>
      </div>
      <div class="chat-messages" id="chat-messages" role="log" aria-label="Chat messages" aria-live="polite"></div>
      <div class="chat-footer">
        <input class="input-field chat-input" id="chat-input" type="text"
          placeholder="Ask about DRRM, risk assessment..."
          aria-label="Type a message to the AI assistant"/>
        <button class="btn-primary" id="chat-send-btn"
          style="padding:8px 14px" aria-label="Send message">→</button>
      </div>
    </aside>

    <!-- OFFLINE BANNER -->
    <div id="offline-banner" role="alert" aria-live="assertive">
      ⚠ OFFLINE MODE — Limited functionality
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL EVENT LISTENERS
   ═══════════════════════════════════════════════════════════════════ */
function attachGlobalEvents() {
  /* Hamburger */
  document.getElementById('hamburger').addEventListener('click', toggleSidebar);

  /* Sidebar overlay */
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  /* Sidebar nav buttons */
  document.querySelectorAll('#sidebar .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.module));
  });

  /* Bottom nav */
  document.querySelectorAll('#bottom-nav .bottom-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.module));
  });

  /* Bell */
  document.getElementById('bell-btn').addEventListener('click', () => {
    State.alertCount = 0;
    const bell = document.getElementById('bell-btn');
    bell.querySelector('svg').setAttribute('stroke', '#4a7a9b');
    const badge = bell.querySelector('.bell-badge');
    if (badge) badge.remove();
    bell.setAttribute('aria-label', 'No active alerts');
    announce('All alerts dismissed');
  });

  /* AI Assistant open */
  document.getElementById('ai-assistant-btn').addEventListener('click', openChat);

  /* Chat close */
  document.getElementById('chat-close-btn').addEventListener('click', closeChat);

  /* Chat send */
  document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });

  /* Keyboard: close sidebar with Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (State.sidebarOpen) closeSidebar();
      if (State.chatOpen) closeChat();
    }
  });

  /* Handle hash navigation */
  const hash = window.location.hash.replace('#', '');
  if (hash && MODULE_RENDERERS[hash]) navigateTo(hash);

  /* Offline/online detection */
  window.addEventListener('offline', () => {
    document.getElementById('offline-banner').classList.add('visible');
    announce('You are now offline. Some features may be unavailable.');
  });
  window.addEventListener('online', () => {
    document.getElementById('offline-banner').classList.remove('visible');
    announce('Connection restored.');
  });
  if (!navigator.onLine) document.getElementById('offline-banner').classList.add('visible');
}

/* ═══════════════════════════════════════════════════════════════════
   PWA SERVICE WORKER REGISTRATION
   ═══════════════════════════════════════════════════════════════════ */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('DDRiVE-M SW registered:', reg.scope);
    }).catch(err => {
      console.warn('SW registration failed:', err);
    });

    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'SYNC_COMPLETE') console.log('Offline data synced');
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   INITIALISE APPLICATION
   ═══════════════════════════════════════════════════════════════════ */
function init() {
  renderShell();
  attachGlobalEvents();
  renderModule();
  renderChatMessages();
  startClock();
  registerSW();

  /* Progressive progress bar animation on load */
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w; });
    });
  });

  /* Sidebar open by default on desktop */
  if (window.innerWidth >= 1024) {
    document.getElementById('sidebar').classList.add('open');
  }
}

/* Start when DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
