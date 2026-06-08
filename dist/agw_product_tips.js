/**
 * agw_product_tips.js — Light-touch contextual tips for the Analytics section
 * ──────────────────────────────────────────────────────────────────────────────
 * Instead of a heavy overlay tour, this module adds:
 * 1. Small ⓘ info icons next to each sub-tab with hover tooltips
 * 2. A pulsing "NEW" badge on recently added features (Pathways, Temporal, School Compare)
 * 3. A "Show Tips" toggle in the nav that enables/disables contextual hints
 * 4. First-visit welcome banner that auto-dismisses after 8 seconds
 *
 * Design philosophy: non-intrusive, discoverable, dismissible.
 */

(function () {
  'use strict';

  const TIPS_KEY = 'agw-tips-dismissed';
  const WELCOME_KEY = 'agw-welcome-seen';

  // ── Tip definitions (bilingual) ──────────────────────────────────────
  const TIPS = {
    'sub-ego': {
      de: 'Wählen Sie eine Figur und erkunden Sie ihr Co-Zitations-Netzwerk. Klicken Sie auf Knoten für Details.',
      en: 'Select a figure and explore their co-citation network. Click nodes for details.'
    },
    'sub-lineage': {
      de: 'Intellektuelle Stammbäume: Lehrer-Schüler-Beziehungen über Generationen hinweg.',
      en: 'Intellectual family trees: teacher-student relationships across generations.'
    },
    'sub-sankey': {
      de: 'Schulübergänge zwischen Jahrzehnten — wohin fließt die intellektuelle Aufmerksamkeit?',
      en: 'School transitions between decades — where does intellectual attention flow?'
    },
    'sub-pathways': {
      de: 'NEU: Finden Sie den kürzesten intellektuellen Pfad zwischen zwei Denkern.',
      en: 'NEW: Find the shortest intellectual path between any two thinkers.',
      isNew: true
    },
    'sub-temporal': {
      de: 'NEU: Beobachten Sie das Netzwerk wachsen — Jahrzehnt für Jahrzehnt animiert.',
      en: 'NEW: Watch the network grow — animated decade by decade.',
      isNew: true
    },
    'sub-analysis-main': {
      de: 'Fünf analytische Perspektiven: Strömungen, Konstellationen, Aufsteiger, Reichweite, Säulen.',
      en: 'Five analytical perspectives: Tides, Constellations, Rising/Fading, Reach, Pillars.'
    },
    'sub-school-compare': {
      de: 'NEU: Vergleichen Sie 2–3 Denkschulen über 6 Dimensionen im Radardiagramm.',
      en: 'NEW: Compare 2–3 schools across 6 dimensions in a radar chart.',
      isNew: true
    },
    'sub-stream': {
      de: 'Intellektuelle Strömungen als Streamgraph — die Aufmerksamkeitsverteilung über 40 Jahre.',
      en: 'Intellectual currents as a streamgraph — attention distribution over 40 years.'
    },
    'sub-themen': {
      de: 'Themenanalyse: Welche Figuren sind mit welchen Themen assoziiert?',
      en: 'Topic analysis: Which figures are associated with which themes?'
    }
  };

  const WELCOME = {
    de: 'Willkommen bei den AGW-Analysen! Fahren Sie mit der Maus über die ⓘ-Symbole neben den Tabs für Erklärungen.',
    en: 'Welcome to AGW Analytics! Hover over the ⓘ icons next to tabs for explanations.'
  };

  // ── Inject CSS ──────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Tip icon */
    .agw-tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(58, 107, 175, 0.15);
      color: var(--accent, #3A6BAF);
      font-size: 10px;
      font-weight: 700;
      font-family: 'Source Sans 3', sans-serif;
      cursor: help;
      margin-left: 4px;
      position: relative;
      vertical-align: middle;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }
    .agw-tip-icon:hover {
      background: rgba(58, 107, 175, 0.3);
      transform: scale(1.2);
    }

    /* Tooltip */
    .agw-tip-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--navy-dark, #122852);
      color: #fff;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.45;
      padding: 8px 12px;
      border-radius: 6px;
      white-space: nowrap;
      max-width: 280px;
      white-space: normal;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .agw-tip-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--navy-dark, #122852);
    }
    .agw-tip-icon:hover .agw-tip-tooltip {
      opacity: 1;
    }

    /* NEW badge (pulsing) */
    .agw-new-badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--gold, #B8860B);
      color: #fff;
      padding: 1px 5px;
      border-radius: 8px;
      margin-left: 5px;
      animation: agw-pulse 2s ease-in-out infinite;
      vertical-align: middle;
    }
    @keyframes agw-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }

    /* Welcome banner */
    .agw-welcome-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--navy-dark, #122852);
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-family: 'Source Sans 3', sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 500px;
      animation: agw-slide-up 0.4s ease-out;
    }
    @keyframes agw-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .agw-welcome-banner button {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
      font-family: inherit;
    }
    .agw-welcome-banner button:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Tips toggle in nav */
    .agw-tips-toggle {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.12);
      background: none;
      font-family: 'Source Sans 3', sans-serif;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .agw-tips-toggle:hover {
      color: rgba(255,255,255,0.8);
      border-color: rgba(255,255,255,0.3);
    }
    .agw-tips-toggle.active {
      color: var(--gold, #B8860B);
      border-color: var(--gold, #B8860B);
    }

    /* Hide tips when disabled */
    body.agw-tips-off .agw-tip-icon,
    body.agw-tips-off .agw-new-badge {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // ── Utility ──────────────────────────────────────────────────────────
  function getLang() {
    return (window.AGW && window.AGW.getLang) ? window.AGW.getLang() : 'de';
  }

  // ── Add tip icons to sub-tabs ────────────────────────────────────────
  function attachTips() {
    const lang = getLang();
    Object.keys(TIPS).forEach(tabId => {
      const btn = document.getElementById(tabId);
      if (!btn) return;
      // Don't add twice
      if (btn.querySelector('.agw-tip-icon')) return;

      const tip = TIPS[tabId];
      const text = lang === 'en' ? tip.en : tip.de;

      // Info icon with tooltip
      const icon = document.createElement('span');
      icon.className = 'agw-tip-icon';
      icon.innerHTML = 'i';
      const tooltip = document.createElement('span');
      tooltip.className = 'agw-tip-tooltip';
      tooltip.textContent = text;
      icon.appendChild(tooltip);
      btn.appendChild(icon);

      // NEW badge for new features
      if (tip.isNew && !btn.querySelector('.agw-new-badge')) {
        const badge = document.createElement('span');
        badge.className = 'agw-new-badge';
        badge.textContent = 'NEW';
        btn.insertBefore(badge, icon);
      }
    });
  }

  // ── Tips toggle button in nav ────────────────────────────────────────
  function addTipsToggle() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || navActions.querySelector('.agw-tips-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'agw-tips-toggle active';
    btn.textContent = '💡 Tips';
    btn.title = 'Toggle contextual tips';

    const dismissed = localStorage.getItem(TIPS_KEY) === '1';
    if (dismissed) {
      btn.classList.remove('active');
      document.body.classList.add('agw-tips-off');
    }

    btn.addEventListener('click', () => {
      const isOff = document.body.classList.toggle('agw-tips-off');
      btn.classList.toggle('active', !isOff);
      localStorage.setItem(TIPS_KEY, isOff ? '1' : '0');
    });

    navActions.insertBefore(btn, navActions.firstChild);
  }

  // ── Welcome banner (first visit only) ────────────────────────────────
  function showWelcome() {
    if (localStorage.getItem(WELCOME_KEY) === '1') return;

    const lang = getLang();
    const banner = document.createElement('div');
    banner.className = 'agw-welcome-banner';
    banner.innerHTML = `
      <span>${lang === 'en' ? WELCOME.en : WELCOME.de}</span>
      <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(banner);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (banner.parentElement) {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.4s';
        setTimeout(() => banner.remove(), 400);
      }
    }, 8000);

    localStorage.setItem(WELCOME_KEY, '1');
  }

  // ── Update tips text on language change ──────────────────────────────
  function updateTipsLang() {
    const lang = getLang();
    Object.keys(TIPS).forEach(tabId => {
      const btn = document.getElementById(tabId);
      if (!btn) return;
      const tooltip = btn.querySelector('.agw-tip-tooltip');
      if (tooltip) {
        const tip = TIPS[tabId];
        tooltip.textContent = lang === 'en' ? tip.en : tip.de;
      }
    });
  }

  // ── Initialize ───────────────────────────────────────────────────────
  function init() {
    addTipsToggle();
    attachTips();
    showWelcome();

    // Re-attach when sub-tabs become visible (lazy rendering)
    const observer = new MutationObserver(() => {
      attachTips();
    });
    const subtabContainers = document.querySelectorAll('.sub-tabs');
    subtabContainers.forEach(el => {
      observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    });

    // Listen for language changes
    document.addEventListener('agw-lang-change', updateTipsLang);
    // Also hook into setLang if available
    if (window.AGW && window.AGW.setLang) {
      const origSetLang = window.AGW.setLang;
      window.AGW.setLang = function (lang) {
        origSetLang(lang);
        updateTipsLang();
      };
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
