const { denyNonLocal } = require('../lib/analytics-dashboard-auth');

module.exports = async function handler(req, res) {
  if (denyNonLocal(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(renderDashboard());
};

function renderDashboard() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>alexg.mov Analytics Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f3ee;
      --panel: #fffefa;
      --panel-2: #f9f7f1;
      --ink: #171713;
      --muted: #66645b;
      --soft: #d8d3c5;
      --line: #e5dfd0;
      --accent: #2f6f63;
      --accent-2: #bd4b35;
      --accent-3: #3f5b8f;
      --warn: #9c6a18;
      --bad: #a43d34;
      --good: #2f6f63;
      --shadow: 0 18px 42px rgba(31, 28, 22, .08);
      --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      --sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: var(--sans);
      font-size: 14px;
      line-height: 1.45;
    }

    button, select {
      font: inherit;
    }

    .shell {
      width: min(1480px, calc(100vw - 40px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }

    .topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: end;
      margin-bottom: 18px;
    }

    .eyebrow {
      margin: 0 0 6px;
      color: var(--muted);
      font: 700 11px/1 var(--mono);
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 52px);
      line-height: .95;
      letter-spacing: 0;
      font-weight: 760;
    }

    .subtitle {
      margin: 10px 0 0;
      color: var(--muted);
      max-width: 760px;
    }

    .controls {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .control, .btn {
      min-height: 38px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--ink);
      padding: 0 12px;
      box-shadow: 0 1px 0 rgba(255,255,255,.65) inset;
    }

    .btn {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
    }

    .btn:hover { border-color: #c9c0ad; }

    .grid {
      display: grid;
      gap: 12px;
    }

    .kpis {
      grid-template-columns: repeat(9, minmax(0, 1fr));
      margin-bottom: 12px;
    }

    .layout {
      grid-template-columns: minmax(0, 1.5fr) minmax(360px, .85fr);
      align-items: start;
    }

    .two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .panel, .kpi {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    .panel {
      min-width: 0;
      padding: 16px;
      overflow: hidden;
    }

    .panel + .panel { margin-top: 12px; }

    .kpi {
      padding: 14px 14px 13px;
      min-height: 104px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: none;
    }

    .kpi .label, .panel-label {
      color: var(--muted);
      font: 700 10px/1.1 var(--mono);
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .kpi .value {
      font-size: clamp(22px, 2.4vw, 34px);
      line-height: 1;
      font-weight: 780;
      letter-spacing: 0;
      white-space: nowrap;
    }

    .kpi .hint {
      color: var(--muted);
      font-size: 12px;
      min-height: 18px;
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: baseline;
      margin-bottom: 14px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1.1;
      letter-spacing: 0;
    }

    .muted { color: var(--muted); }
    .mono { font-family: var(--mono); }

    .chart {
      min-height: 230px;
      border-radius: 8px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      padding: 10px;
      overflow: hidden;
    }

    .traffic-svg {
      width: 100%;
      height: 246px;
      display: block;
    }

    .bar-list {
      display: grid;
      gap: 9px;
    }

    .bar-row {
      display: grid;
      grid-template-columns: minmax(110px, .48fr) minmax(120px, 1fr) 54px;
      gap: 10px;
      align-items: center;
      min-height: 28px;
    }

    .bar-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink);
    }

    .bar-track {
      position: relative;
      height: 10px;
      border-radius: 999px;
      background: #ebe5d7;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--accent);
      min-width: 2px;
    }

    .bar-value {
      text-align: right;
      color: var(--muted);
      font-family: var(--mono);
      font-size: 12px;
    }

    .funnel {
      display: grid;
      gap: 10px;
    }

    .funnel-row {
      display: grid;
      grid-template-columns: 190px minmax(0, 1fr) 76px 64px;
      gap: 12px;
      align-items: center;
      min-height: 34px;
    }

    .funnel-bar {
      height: 18px;
      border-radius: 5px;
      background: #e9e1d1;
      overflow: hidden;
      position: relative;
    }

    .funnel-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #7d8f54);
      min-width: 2px;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel-2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 720px;
    }

    th, td {
      padding: 10px 11px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }

    th {
      color: var(--muted);
      font: 700 10px/1.1 var(--mono);
      letter-spacing: .08em;
      text-transform: uppercase;
      background: rgba(255,255,255,.55);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    td {
      font-size: 13px;
    }

    tr:last-child td { border-bottom: 0; }

    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 3px 7px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      color: var(--muted);
      font: 700 11px/1 var(--mono);
      margin: 0 4px 4px 0;
      white-space: nowrap;
    }

    .tag.good { color: var(--good); border-color: rgba(47,111,99,.3); background: rgba(47,111,99,.08); }
    .tag.warn { color: var(--warn); border-color: rgba(156,106,24,.28); background: rgba(156,106,24,.08); }
    .tag.bad { color: var(--bad); border-color: rgba(164,61,52,.28); background: rgba(164,61,52,.08); }

    .session-list {
      display: grid;
      gap: 10px;
    }

    .session-card {
      border: 1px solid var(--line);
      background: var(--panel-2);
      border-radius: 8px;
      padding: 12px;
    }

    .session-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      margin-bottom: 8px;
    }

    .path {
      color: var(--ink);
      overflow-wrap: anywhere;
    }

    .empty {
      border: 1px dashed var(--soft);
      border-radius: 8px;
      padding: 18px;
      color: var(--muted);
      background: rgba(255,255,255,.45);
    }

    .note {
      padding: 11px 12px;
      border-radius: 8px;
      background: rgba(63,91,143,.08);
      border: 1px solid rgba(63,91,143,.2);
      color: #38466b;
      font-size: 13px;
    }

    .status-line {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      color: var(--muted);
      font-size: 12px;
      margin-top: 9px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent);
      display: inline-block;
    }

    .loading {
      min-height: 460px;
      display: grid;
      place-items: center;
      color: var(--muted);
      font: 700 12px/1 var(--mono);
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .error {
      color: var(--bad);
      border-color: rgba(164,61,52,.25);
      background: rgba(164,61,52,.08);
    }

    @media (max-width: 1220px) {
      .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 760px) {
      .shell { width: min(100vw - 24px, 1480px); padding-top: 18px; }
      .topbar { grid-template-columns: 1fr; }
      .controls { justify-content: flex-start; }
      .kpis, .two { grid-template-columns: 1fr 1fr; }
      .funnel-row { grid-template-columns: 1fr; gap: 5px; }
      .bar-row { grid-template-columns: 1fr; gap: 5px; }
      .bar-value { text-align: left; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Local analytics dashboard</p>
        <h1>Revenue, traffic, and bottlenecks</h1>
        <p class="subtitle">First-party GET/request logging, page attention, buyer persona sequences, funnel health, local checkout events, and real Stripe Checkout lifecycle data in one place.</p>
        <div class="status-line">
          <span><span class="dot"></span> Local-only route</span>
          <span id="generated-at">Waiting for data</span>
          <span id="stripe-status">Stripe status unknown</span>
        </div>
      </div>
      <div class="controls">
        <select class="control" id="range">
          <option value="24h">Last 24 hours</option>
          <option value="7d" selected>Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All local data</option>
        </select>
        <button class="btn" id="refresh" type="button">Refresh</button>
      </div>
    </header>

    <section class="grid kpis" id="kpis"></section>

    <section class="grid layout">
      <div>
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Conversion flow</p>
              <h2>Funnel health</h2>
            </div>
            <span class="muted mono" id="funnel-note"></span>
          </div>
          <div id="funnel" class="funnel"></div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Traffic over time</p>
              <h2>Views, GETs, resources, and buy clicks</h2>
            </div>
          </div>
          <div class="chart" id="traffic-chart"></div>
        </section>

        <section class="grid two">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="panel-label">Personas</p>
                <h2>Buyer categories</h2>
              </div>
            </div>
            <div id="personas" class="bar-list"></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="panel-label">Friction</p>
                <h2>Bottleneck patterns</h2>
              </div>
            </div>
            <div id="bottlenecks" class="bar-list"></div>
          </section>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Page attention</p>
              <h2>Time on page and exit behavior</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table id="page-table"></table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Speed</p>
              <h2>Load, server, and heavy resources</h2>
            </div>
          </div>
          <div class="grid two">
            <div class="table-wrap"><table id="speed-table"></table></div>
            <div class="table-wrap"><table id="resource-table"></table></div>
          </div>
        </section>
      </div>

      <aside>
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Stripe</p>
              <h2>Checkout lifecycle</h2>
            </div>
            <span class="tag" id="stripe-configured">Checking</span>
          </div>
          <div id="stripe-summary" class="grid two"></div>
          <div class="note" id="stripe-note" style="margin-top:12px"></div>
          <div class="table-wrap" style="margin-top:12px">
            <table id="stripe-table"></table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Session journeys</p>
              <h2>Recent customer paths</h2>
            </div>
          </div>
          <div id="sessions" class="session-list"></div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Common paths</p>
              <h2>Journey routes</h2>
            </div>
          </div>
          <div id="journeys" class="bar-list"></div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="panel-label">Notes</p>
              <h2>What this layer can see</h2>
            </div>
          </div>
          <div id="notes" class="grid"></div>
        </section>
      </aside>
    </section>
  </main>

  <script>
    var state = { data: null, loading: false };
    var rangeEl = document.getElementById('range');
    var refreshEl = document.getElementById('refresh');

    rangeEl.addEventListener('change', loadData);
    refreshEl.addEventListener('click', loadData);
    loadData();

    async function loadData() {
      state.loading = true;
      refreshEl.disabled = true;
      refreshEl.textContent = 'Refreshing';
      showLoading();

      try {
        var response = await fetch('/api/analytics-dashboard-data?range=' + encodeURIComponent(rangeEl.value) + '&limit=100000', { cache: 'no-store' });
        if (!response.ok) throw new Error('Dashboard data returned ' + response.status);
        state.data = await response.json();
        render(state.data);
      } catch (error) {
        showError(error);
      } finally {
        state.loading = false;
        refreshEl.disabled = false;
        refreshEl.textContent = 'Refresh';
      }
    }

    function render(data) {
      var analytics = data.analytics || {};
      var overview = analytics.overview || {};
      var stripe = data.stripe || {};
      var stripeSummary = stripe.summary || {};
      document.getElementById('generated-at').textContent = 'Updated ' + dateTime(data.generatedAt);
      document.getElementById('stripe-status').textContent = stripe.configured ? 'Stripe connected' : 'Stripe key missing';

      renderKpis(overview, stripeSummary, analytics.diagnostics || {});
      renderFunnel(analytics.funnel || [], stripeSummary);
      renderTraffic(analytics.trafficSeries || []);
      renderBarList('personas', analytics.personas || [], analytics.personaDefinitions || {});
      renderBarList('bottlenecks', analytics.bottlenecks || [], analytics.sequenceDefinitions || {});
      renderPageTable(analytics.pageStats || []);
      renderSpeedTables(analytics.speed || {});
      renderResourceTable(analytics.resources || []);
      renderStripe(stripe);
      renderSessions(analytics.recentSessions || []);
      renderJourneys(analytics.journeys || []);
      renderNotes(data.notes || []);
    }

    function renderKpis(overview, stripeSummary, diagnostics) {
      var pagePerf = (((state.data || {}).analytics || {}).speed || {}).pagePerformance || [];
      var medianLoad = pagePerf.length ? Math.round(pagePerf.reduce(function(sum, row) { return sum + (row.medianLoadMs || 0); }, 0) / pagePerf.length) : 0;
      var cards = [
        ['Revenue', money(stripeSummary.revenue || 0), 'Stripe paid volume'],
        ['Paid orders', fmt(stripeSummary.paid || 0), 'Completed payments'],
        ['Visit sessions', fmt(overview.sessions || 0), fmt(overview.technicalOnlySessions || diagnostics.technicalOnlySessions || 0) + ' technical excluded'],
        ['Visitors', fmt(overview.visitors || 0), fmt(overview.pageViews || 0) + ' page views'],
        ['GET requests', fmt(overview.getRequests || 0), fmt(overview.resourceGets || 0) + ' browser resources'],
        ['Buy clicks', fmt(overview.buyClicks || 0), fmt(overview.checkoutSessionsCreated || 0) + ' checkouts created'],
        ['Success views', fmt(overview.checkoutSuccessViews || 0), fmt(overview.downloads || 0) + ' downloads'],
        ['Median attention', duration((overview.medianActiveSeconds || 0) * 1000), 'Per session'],
        ['Median load', medianLoad ? duration(medianLoad) : 'n/a', 'Client page performance'],
      ];

      document.getElementById('kpis').innerHTML = cards.map(function(card) {
        return '<article class="kpi"><div class="label">' + esc(card[0]) + '</div><div class="value">' + esc(card[1]) + '</div><div class="hint">' + esc(card[2]) + '</div></article>';
      }).join('');
    }

    function renderFunnel(funnel, stripeSummary) {
      var stages = funnel.slice();
      if (stripeSummary && (stripeSummary.sessions || stripeSummary.paid || stripeSummary.expired)) {
        stages.splice(Math.max(0, stages.length - 2), 0,
          { key: 'stripeSessions', label: 'Stripe sessions found', count: stripeSummary.sessions || 0 },
          { key: 'stripePaid', label: 'Stripe paid orders', count: stripeSummary.paid || 0 }
        );
      }

      var max = Math.max.apply(null, stages.map(function(row) { return row.count || 0; }).concat([1]));
      document.getElementById('funnel-note').textContent = stages.length ? 'Session-based counts' : '';
      document.getElementById('funnel').innerHTML = stages.length ? stages.map(function(row, index) {
        var previous = index ? Math.max(1, stages[index - 1].count || 0) : Math.max(1, row.count || 0);
        var fromPrev = index ? pct((row.count || 0) / previous) : '100%';
        var width = Math.max(1, Math.round(((row.count || 0) / max) * 100));
        return '<div class="funnel-row">' +
          '<div class="bar-label">' + esc(row.label) + '</div>' +
          '<div class="funnel-bar"><div class="funnel-fill" style="width:' + width + '%"></div></div>' +
          '<div class="bar-value">' + fmt(row.count || 0) + '</div>' +
          '<div class="bar-value">' + fromPrev + '</div>' +
        '</div>';
      }).join('') : empty('No funnel events yet.');
    }

    function renderTraffic(series) {
      var el = document.getElementById('traffic-chart');
      if (!series.length) {
        el.innerHTML = empty('No traffic events in this range yet.');
        return;
      }

      var w = 920;
      var h = 246;
      var pad = { top: 14, right: 18, bottom: 30, left: 38 };
      var plotW = w - pad.left - pad.right;
      var plotH = h - pad.top - pad.bottom;
      var max = Math.max.apply(null, series.map(function(row) {
        return Math.max(row.pageViews || 0, row.getRequests || 0, row.resources || 0, row.buyClicks || 0);
      }).concat([1]));
      var bw = Math.max(2, plotW / series.length * .62);
      var step = plotW / Math.max(1, series.length - 1);

      var grid = [0, .25, .5, .75, 1].map(function(tick) {
        var y = pad.top + plotH - tick * plotH;
        return '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (w - pad.right) + '" y2="' + y + '" stroke="#e0d8c7"/>' +
          '<text x="6" y="' + (y + 4) + '" fill="#777166" font-size="11" font-family="monospace">' + Math.round(tick * max) + '</text>';
      }).join('');

      var bars = series.map(function(row, index) {
        var x = pad.left + index * step - bw / 2;
        var y1 = pad.top + plotH - ((row.pageViews || 0) / max) * plotH;
        var y2 = pad.top + plotH - ((row.getRequests || 0) / max) * plotH;
        var y3 = pad.top + plotH - ((row.resources || 0) / max) * plotH;
        return '<rect x="' + x + '" y="' + y2 + '" width="' + bw + '" height="' + (pad.top + plotH - y2) + '" rx="3" fill="#d4c6ad"/>' +
          '<rect x="' + (x + bw * .18) + '" y="' + y3 + '" width="' + (bw * .64) + '" height="' + (pad.top + plotH - y3) + '" rx="3" fill="#9aa176" opacity=".65"/>' +
          '<rect x="' + (x + bw * .34) + '" y="' + y1 + '" width="' + (bw * .32) + '" height="' + (pad.top + plotH - y1) + '" rx="3" fill="#2f6f63"/>';
      }).join('');

      var points = series.map(function(row, index) {
        var x = pad.left + index * step;
        var y = pad.top + plotH - ((row.buyClicks || 0) / max) * plotH;
        return x + ',' + y;
      }).join(' ');

      var labels = series.map(function(row, index) {
        if (series.length > 18 && index % Math.ceil(series.length / 8) !== 0 && index !== series.length - 1) return '';
        var x = pad.left + index * step;
        return '<text x="' + x + '" y="' + (h - 8) + '" text-anchor="middle" fill="#777166" font-size="10" font-family="monospace">' + esc(row.label || '') + '</text>';
      }).join('');

      el.innerHTML = '<svg class="traffic-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Traffic chart">' +
        grid + bars +
        '<polyline points="' + points + '" fill="none" stroke="#bd4b35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        labels +
        '<g transform="translate(' + (w - 330) + ' 12)" font-family="monospace" font-size="11" fill="#66645b">' +
          '<rect x="0" y="-8" width="10" height="10" rx="2" fill="#2f6f63"/><text x="16" y="1">views</text>' +
          '<rect x="76" y="-8" width="10" height="10" rx="2" fill="#d4c6ad"/><text x="92" y="1">GETs</text>' +
          '<rect x="146" y="-8" width="10" height="10" rx="2" fill="#9aa176"/><text x="162" y="1">resources</text>' +
          '<line x1="242" y1="-3" x2="258" y2="-3" stroke="#bd4b35" stroke-width="3"/><text x="264" y="1">buy clicks</text>' +
        '</g>' +
      '</svg>';
    }

    function renderBarList(id, rows, definitions) {
      var el = document.getElementById(id);
      if (!rows.length) {
        el.innerHTML = empty('No classified sessions yet.');
        return;
      }
      var max = Math.max.apply(null, rows.map(function(row) { return row.count || 0; }).concat([1]));
      el.innerHTML = rows.slice(0, 12).map(function(row) {
        var key = row.key || 'unknown';
        var title = definitions[key] ? ' title="' + escAttr(definitions[key]) + '"' : '';
        return '<div class="bar-row"' + title + '>' +
          '<div class="bar-label">' + esc(labelize(key)) + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(2, Math.round(((row.count || 0) / max) * 100)) + '%"></div></div>' +
          '<div class="bar-value">' + fmt(row.count || 0) + '</div>' +
        '</div>';
      }).join('');
    }

    function renderPageTable(rows) {
      var table = document.getElementById('page-table');
      if (!rows.length) {
        table.innerHTML = '<tbody><tr><td>' + empty('No page timing data yet. Spend a few seconds on a page, then refresh this dashboard.') + '</td></tr></tbody>';
        return;
      }
      table.innerHTML = '<thead><tr><th>Page</th><th>Views</th><th>Median attention</th><th>P90 attention</th><th>Scroll</th><th>Exit rate</th><th>CTA</th><th>Buy</th></tr></thead>' +
        '<tbody>' + rows.slice(0, 24).map(function(row) {
          return '<tr>' +
            '<td class="mono">' + esc(row.page) + '</td>' +
            '<td>' + fmt(row.views || 0) + '</td>' +
            '<td>' + duration(row.medianActiveMs || 0) + '</td>' +
            '<td>' + duration(row.p90ActiveMs || 0) + '</td>' +
            '<td>' + fmt(row.medianScrollDepth || 0) + '%</td>' +
            '<td>' + pct((row.exitRate || 0) / 100) + '</td>' +
            '<td>' + fmt(row.productCtaClicks || 0) + '</td>' +
            '<td>' + fmt(row.buyClicks || 0) + '</td>' +
          '</tr>';
        }).join('') + '</tbody>';
    }

    function renderSpeedTables(speed) {
      var pageRows = speed.pagePerformance || [];
      var serverRows = speed.serverRequests || [];
      var speedTable = document.getElementById('speed-table');

      if (!pageRows.length && !serverRows.length) {
        speedTable.innerHTML = '<tbody><tr><td>' + empty('No speed samples yet. Client performance events begin on the next page load.') + '</td></tr></tbody>';
        return;
      }

      speedTable.innerHTML = '<thead><tr><th>Page</th><th>Load</th><th>P90</th><th>TTFB</th><th>FCP</th><th>KB</th></tr></thead>' +
        '<tbody>' + pageRows.slice(0, 16).map(function(row) {
          return '<tr>' +
            '<td class="mono">' + esc(row.page) + '</td>' +
            '<td>' + duration(row.medianLoadMs || 0) + '</td>' +
            '<td>' + duration(row.p90LoadMs || 0) + '</td>' +
            '<td>' + duration(row.medianTtfbMs || 0) + '</td>' +
            '<td>' + duration(row.medianFcpMs || 0) + '</td>' +
            '<td>' + fmt(row.medianTransferKb || 0) + '</td>' +
          '</tr>';
        }).join('') + '</tbody>';

      var resourceTable = document.getElementById('resource-table');
      resourceTable.innerHTML = '<thead><tr><th>GET path</th><th>Req</th><th>P90</th><th>Err</th><th>KB</th></tr></thead>' +
        '<tbody>' + serverRows.slice(0, 16).map(function(row) {
          return '<tr>' +
            '<td class="mono">' + esc(shortPath(row.path || '')) + '</td>' +
            '<td>' + fmt(row.requests || 0) + '</td>' +
            '<td>' + duration(row.p90DurationMs || 0) + '</td>' +
            '<td>' + fmt(row.errorCount || 0) + '</td>' +
            '<td>' + fmt(row.medianKb || 0) + '</td>' +
          '</tr>';
        }).join('') + '</tbody>';
    }

    function renderResourceTable(rows) {
      var table = document.getElementById('resource-table');
      if (!rows.length) return;
      table.innerHTML = '<thead><tr><th>Resource</th><th>Type</th><th>Count</th><th>P90</th><th>Total KB</th></tr></thead>' +
        '<tbody>' + rows.slice(0, 16).map(function(row) {
          return '<tr>' +
            '<td class="mono">' + esc(shortPath(row.path || '')) + '</td>' +
            '<td>' + esc(row.initiatorType || '') + '</td>' +
            '<td>' + fmt(row.count || 0) + '</td>' +
            '<td>' + duration(row.p90DurationMs || 0) + '</td>' +
            '<td>' + fmt(row.totalTransferKb || 0) + '</td>' +
          '</tr>';
        }).join('') + '</tbody>';
    }

    function renderStripe(stripe) {
      var summary = stripe.summary || {};
      var configuredEl = document.getElementById('stripe-configured');
      configuredEl.textContent = stripe.configured ? 'Connected' : 'Missing key';
      configuredEl.className = 'tag ' + (stripe.configured ? 'good' : 'warn');

      document.getElementById('stripe-summary').innerHTML = [
        ['Sessions', fmt(summary.sessions || 0), 'Created in Stripe'],
        ['Paid', fmt(summary.paid || 0), 'payment_status=paid'],
        ['Open', fmt(summary.open || 0), 'Still pending'],
        ['Expired', fmt(summary.expired || 0), 'Did not finish'],
        ['AOV', money(summary.averageOrderValue || 0), 'Average paid order'],
        ['Median complete', summary.medianLifecycleSeconds ? duration(summary.medianLifecycleSeconds * 1000) : 'n/a', 'Created to completed'],
      ].map(function(card) {
        return '<article class="kpi"><div class="label">' + esc(card[0]) + '</div><div class="value">' + esc(card[1]) + '</div><div class="hint">' + esc(card[2]) + '</div></article>';
      }).join('');

      var note = stripe.error ? stripe.error : stripe.lifecycleNote || '';
      document.getElementById('stripe-note').textContent = note;
      document.getElementById('stripe-note').className = 'note' + (stripe.error ? ' error' : '');

      var table = document.getElementById('stripe-table');
      var sessions = stripe.sessions || [];
      if (!sessions.length) {
        table.innerHTML = '<tbody><tr><td>' + empty(stripe.configured ? 'No Stripe checkout sessions in this range.' : 'Add STRIPE_SECRET_KEY to .env.local to load real checkout sessions.') + '</td></tr></tbody>';
        return;
      }

      table.innerHTML = '<thead><tr><th>Created</th><th>Product</th><th>Status</th><th>Paid</th><th>Value</th><th>Time</th></tr></thead>' +
        '<tbody>' + sessions.slice(0, 16).map(function(session) {
          return '<tr>' +
            '<td>' + dateTime(session.createdAt) + '</td>' +
            '<td class="mono">' + esc(session.productId || 'unknown') + '</td>' +
            '<td>' + statusTag(session.status) + '</td>' +
            '<td>' + statusTag(session.paymentStatus) + '</td>' +
            '<td>' + money(session.value || 0, session.currency) + '</td>' +
            '<td>' + (session.lifecycleSeconds ? duration(session.lifecycleSeconds * 1000) : 'n/a') + '</td>' +
          '</tr>';
        }).join('') + '</tbody>';
    }

    function renderSessions(sessions) {
      var el = document.getElementById('sessions');
      if (!sessions.length) {
        el.innerHTML = empty('No sessions yet.');
        return;
      }
      el.innerHTML = sessions.slice(0, 16).map(function(session) {
        var tags = [session.persona, session.stage].concat(session.sequenceTags || []).filter(Boolean).slice(0, 5);
        var bottlenecks = (session.bottlenecks || []).slice(0, 3);
        return '<article class="session-card">' +
          '<div class="session-top">' +
            '<div><strong>' + esc(labelize(session.persona || 'unknown')) + '</strong><div class="muted">' + dateTime(session.lastAt) + ' · ' + duration((session.activeSeconds || 0) * 1000) + ' active</div></div>' +
            '<span class="tag ' + (session.stage && session.stage.indexOf('Purchase') >= 0 ? 'good' : session.stage === 'Early bounce' ? 'bad' : 'warn') + '">' + esc(session.stage || 'Browsing') + '</span>' +
          '</div>' +
          '<div class="path mono">' + esc((session.pages || []).join(' -> ') || 'unknown') + '</div>' +
          '<div style="margin-top:9px">' + tags.map(function(tag) { return '<span class="tag">' + esc(labelize(tag)) + '</span>'; }).join('') + bottlenecks.map(function(tag) { return '<span class="tag bad">' + esc(labelize(tag)) + '</span>'; }).join('') + '</div>' +
        '</article>';
      }).join('');
    }

    function renderJourneys(rows) {
      var el = document.getElementById('journeys');
      if (!rows.length) {
        el.innerHTML = empty('No repeated journey routes yet.');
        return;
      }
      var max = Math.max.apply(null, rows.map(function(row) { return row.count || 0; }).concat([1]));
      el.innerHTML = rows.slice(0, 10).map(function(row) {
        return '<div class="bar-row">' +
          '<div class="bar-label mono" title="' + escAttr(row.path || '') + '">' + esc(row.path || '') + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(2, Math.round(((row.count || 0) / max) * 100)) + '%"></div></div>' +
          '<div class="bar-value">' + fmt(row.count || 0) + '</div>' +
        '</div>';
      }).join('');
    }

    function renderNotes(notes) {
      var el = document.getElementById('notes');
      el.innerHTML = notes.length ? notes.map(function(note) {
        return '<div class="note">' + esc(note) + '</div>';
      }).join('') : empty('No notes.');
    }

    function showLoading() {
      if (state.data) return;
      document.getElementById('kpis').innerHTML = '<div class="loading" style="grid-column:1/-1">Loading analytics</div>';
    }

    function showError(error) {
      document.getElementById('kpis').innerHTML = '<div class="note error" style="grid-column:1/-1">' + esc(error.message || String(error)) + '</div>';
    }

    function statusTag(value) {
      var text = String(value || 'unknown');
      var cls = text === 'paid' || text === 'complete' ? 'good' : text === 'expired' || text === 'unpaid' ? 'bad' : 'warn';
      return '<span class="tag ' + cls + '">' + esc(text) + '</span>';
    }

    function empty(text) {
      return '<div class="empty">' + esc(text) + '</div>';
    }

    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function escAttr(value) {
      return esc(value).replace(/\\n/g, ' ');
    }

    function labelize(value) {
      return String(value || 'unknown').replace(/[_:]/g, ' ').replace(/\\b\\w/g, function(letter) { return letter.toUpperCase(); });
    }

    function shortPath(value) {
      var text = String(value || '');
      if (text.length <= 58) return text;
      return text.slice(0, 24) + '...' + text.slice(-28);
    }

    function fmt(value) {
      return new Intl.NumberFormat('en-US').format(Math.round(Number(value || 0)));
    }

    function money(value, currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: String(currency || 'USD').toUpperCase(),
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    }

    function pct(value) {
      if (!isFinite(value)) return '0%';
      return Math.round(value * 1000) / 10 + '%';
    }

    function duration(ms) {
      var value = Number(ms || 0);
      if (!value) return '0s';
      if (value < 1000) return Math.round(value) + 'ms';
      var seconds = Math.round(value / 1000);
      if (seconds < 60) return seconds + 's';
      var minutes = Math.floor(seconds / 60);
      var rest = seconds % 60;
      if (minutes < 60) return minutes + 'm ' + rest + 's';
      var hours = Math.floor(minutes / 60);
      return hours + 'h ' + (minutes % 60) + 'm';
    }

    function dateTime(value) {
      if (!value) return 'n/a';
      var date = new Date(value);
      if (isNaN(date.getTime())) return 'n/a';
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  </script>
</body>
</html>`;
}
