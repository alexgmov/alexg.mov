import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './analytics.js';

window.React = React;
window.ReactDOM = { createRoot };

function isAnalyticsPath() {
  return location.pathname.replace(/[/.]+$/, '') === '/analytics';
}

async function renderDashboardFallback() {
  try {
    const response = await fetch('/analytics-dashboard', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Dashboard returned ${response.status}`);
    const html = await response.text();
    document.open();
    document.write(html);
    document.close();
  } catch (error) {
    console.error(error);
    const rootNode = document.getElementById('root');
    if (rootNode) {
      rootNode.innerHTML = '<main class="route-state"><div class="wrap"><p>Analytics dashboard failed to load. Refresh and try again.</p></div></main>';
    }
  }
}

async function boot() {
  const rootNode = document.getElementById('root');
  if (!rootNode) return;
  if (isAnalyticsPath()) {
    await renderDashboardFallback();
    return;
  }

  await import('./travel.js');
  await import('./product-data.js');
  await import('./seo.jsx');
  await import('./visuals.jsx');
  await import('./chrome.jsx');
  const { App } = await import('./app.jsx');

  const qs = new URLSearchParams(location.search);
  const initial = qs.get('page') || 'home';
  const embedded = qs.get('embedded') === '1';

  document.documentElement.setAttribute('data-theme', 'dark');
  createRoot(rootNode).render(<App initialPage={initial} embedded={embedded} />);
}

boot().catch(error => {
  console.error(error);
  const rootNode = document.getElementById('root');
  if (rootNode) {
    rootNode.innerHTML = '<main class="route-state"><div class="wrap"><p>Something went wrong starting the site. Refresh and try again.</p></div></main>';
  }
});
