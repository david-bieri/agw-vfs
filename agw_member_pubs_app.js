/* agw_member_pubs_app.js — Members' Publications hub (browse by theme or member)
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads window.AGW_DATA.PUB_THEMES and window.AGW_DATA.MEMBER_PUBS (from
 * agw_member_pubs.js) plus the site's MEMBERS list (from agw_data.js) and renders
 * a browsable hub with two modes:
 *   • "By theme"  — publications grouped under thematic headings + theme chips
 *   • "By member" — alphabetical, expandable member cards with a jump bar
 *
 * Reuses the site's `lang` variable, AGW.t() strings, and CSS classes. Search is
 * shared across both views. Re-renders on the `agw-lang-change` event.
 * ───────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var THEMES  = (window.AGW_DATA && window.AGW_DATA.PUB_THEMES)  || [];
  var PUBS    = (window.AGW_DATA && window.AGW_DATA.MEMBER_PUBS) || [];
  var MEMBERS = window.MEMBERS || (window.AGW_DATA && window.AGW_DATA.MEMBERS) || [];

  // Quick lookup of member metadata by name (institution + focus).
  var MEMBER_BY_NAME = {};
  MEMBERS.forEach(function (m) { MEMBER_BY_NAME[m.name] = m; });

  var state = { view: 'theme', theme: 'all', q: '', openMember: null };

  function curLang() {
    if (typeof lang !== 'undefined') return lang;
    return (window.AGW && window.AGW.getLang) ? window.AGW.getLang() : 'de';
  }
  function t(key) {
    var l = curLang();
    if (window.AGW && window.AGW.t) return window.AGW.t(key, l);
    return key;
  }
  function themeLabel(id) {
    var l = curLang();
    var th = THEMES.filter(function (x) { return x.id === id; })[0];
    return th ? (l === 'en' ? th.en : th.de) : id;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function attr(s) { return esc(s).replace(/"/g, '&quot;'); }

  /* Return publications matching the current search; if ignoreTheme, skip theme filter. */
  function matching(ignoreTheme) {
    var q = state.q.trim().toLowerCase();
    return PUBS.filter(function (p) {
      if (!ignoreTheme && state.view === 'theme' && state.theme !== 'all' &&
          (p.themes || []).indexOf(state.theme) === -1) return false;
      if (q) {
        var hay = (p.title + ' ' + (p.authors || '') + ' ' + (p.venue || '') + ' ' +
                   (p.member || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* One publication row (reuses .pub-item visual language). */
  function pubRow(p) {
    var link = '';
    if (p.doi) {
      link = '<a class="pub-link" href="https://doi.org/' + attr(p.doi) +
             '" target="_blank" rel="noopener">' + esc(t('mpub_doi_link')) +
             ' <span class="ico ico-ext" aria-hidden="true"></span></a>';
    } else if (p.url) {
      link = '<a class="pub-link" href="' + attr(p.url) +
             '" target="_blank" rel="noopener">' + esc(t('mpub_link')) +
             ' <span class="ico ico-ext" aria-hidden="true"></span></a>';
    }
    var authors = p.authors ? esc(p.authors) : esc(p.member);
    var venue   = p.venue ? '<em>' + esc(p.venue) + '</em>' : '';
    var yr      = p.year ? ' · ' + p.year : '';
    return '<div class="pub-item-wrap"><div class="pub-item" style="grid-template-columns:1fr auto;cursor:default;">' +
             '<div>' +
               '<div class="pub-title">' + esc(p.title) + '</div>' +
               '<div class="pub-meta">' + authors + (venue ? ' · ' + venue : '') + yr + '</div>' +
             '</div>' +
             '<div class="pub-actions">' + link + '</div>' +
           '</div></div>';
  }

  function themeHeading(label, count) {
    return '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px;">' +
             '<h3 style="font-family:\'EB Garamond\',serif;font-size:1.3rem;font-weight:500;color:var(--navy);margin:0;">' +
               esc(label) + '</h3>' +
             '<span style="font-size:12px;color:var(--text-faint);">' + count + '</span>' +
           '</div>';
  }

  /* ── THEME VIEW ─────────────────────────────────────────────────────────── */
  function renderThemeFilters() {
    var host = document.getElementById('mpub-theme-filters');
    if (!host) return;
    var counts = {};
    matching(true).forEach(function (p) {
      (p.themes || []).forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
    });
    var sorted = THEMES.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
    var html = '<button class="btn btn-sm btn-outline pub-filter-btn' +
               (state.theme === 'all' ? ' active' : '') +
               '" onclick="mpubSetTheme(\'all\', this)">' + esc(t('mpub_filter_all')) + '</button>';
    sorted.forEach(function (th) {
      if (!counts[th.id]) return;
      html += '<button class="btn btn-sm btn-outline pub-filter-btn' +
              (state.theme === th.id ? ' active' : '') +
              '" onclick="mpubSetTheme(\'' + th.id + '\', this)">' +
              esc(curLang() === 'en' ? th.en : th.de) +
              ' <span style="opacity:.6;font-weight:400;">' + counts[th.id] + '</span></button>';
    });
    host.innerHTML = html;
  }

  function renderThemeView(list) {
    var l = curLang();
    var html = '';
    if (state.theme === 'all') {
      var sorted = THEMES.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
      sorted.forEach(function (th) {
        var inTheme = list.filter(function (p) { return (p.themes || []).indexOf(th.id) !== -1; });
        if (!inTheme.length) return;
        inTheme.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
        html += '<div class="mpub-theme-block" style="margin-bottom:36px;">' +
                  themeHeading(l === 'en' ? th.en : th.de, inTheme.length) +
                  '<div class="pub-list-inner">' + inTheme.map(pubRow).join('') + '</div>' +
                '</div>';
      });
    } else {
      var flat = list.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      html = '<div class="mpub-theme-block" style="margin-bottom:36px;">' +
               themeHeading(themeLabel(state.theme), flat.length) +
               '<div class="pub-list-inner">' + flat.map(pubRow).join('') + '</div>' +
             '</div>';
    }
    return html;
  }

  /* ── MEMBER VIEW ────────────────────────────────────────────────────────── */
  // Group matching publications by member name.
  function groupByMember(list) {
    var map = {};
    list.forEach(function (p) {
      var name = p.member || '—';
      (map[name] = map[name] || []).push(p);
    });
    return map;
  }

  // Surname for alphabetical sort (last whitespace-separated token).
  function sortKey(name) {
    var parts = String(name).trim().split(/\s+/);
    return (parts[parts.length - 1] + ' ' + name).toLowerCase();
  }

  function renderMemberJump(names) {
    var bar = document.getElementById('mpub-member-jump');
    if (!bar) return;
    if (!names.length) { bar.innerHTML = ''; return; }
    bar.className = 'mpub-jumpbar';
    var html = '<span style="color:var(--text-faint);margin-right:4px;">' + esc(t('mpub_jump')) + ':</span>';
    names.forEach(function (n) {
      var anchor = 'm-' + n.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      html += '<a href="#' + anchor + '" onclick="mpubOpenMember(\'' + attr(n).replace(/'/g, "\\'") + '\');">' +
              esc(n) + '</a>';
    });
    bar.innerHTML = html;
  }

  function renderMemberView(list) {
    var l = curLang();
    var groups = groupByMember(list);
    var names = Object.keys(groups).sort(function (a, b) {
      return sortKey(a) < sortKey(b) ? -1 : (sortKey(a) > sortKey(b) ? 1 : 0);
    });
    renderMemberJump(names);

    var html = '';
    names.forEach(function (name) {
      var pubs = groups[name].slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      var meta = MEMBER_BY_NAME[name];
      var focus = meta ? (l === 'en' ? meta.focus_en : meta.focus_de) : '';
      var inst  = meta ? meta.inst : '';
      var anchor = 'm-' + name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      var isOpen = (state.openMember === name) || (state.q.trim() !== '');
      var n = pubs.length;
      var countWord = n === 1 ? t('mpub_one_pub') : t('mpub_count');
      var profile = '<a class="mpub-member-profilelink" href="committee.html#mitglieder" ' +
                    'onclick="event.stopPropagation();">' + esc(t('mpub_profile')) + ' ›</a>';
      html += '<div class="mpub-member-card' + (isOpen ? ' open' : '') + '" id="' + anchor + '">' +
                '<div class="mpub-member-head" onclick="mpubToggleMember(\'' + attr(name).replace(/'/g, "\\'") + '\')">' +
                  '<span class="mpub-member-chevron">▶</span>' +
                  '<span class="mpub-member-name">' + esc(name) + '</span>' +
                  (focus ? '<span class="mpub-member-focus">· ' + esc(focus) + '</span>' : '') +
                  '<span class="mpub-member-pubcount">' + n + ' ' + esc(countWord) +
                    (inst ? ' · ' + esc(inst) : '') + '&nbsp;&nbsp;' + profile + '</span>' +
                '</div>' +
                '<div class="mpub-member-body"><div class="pub-list-inner">' +
                  pubs.map(pubRow).join('') +
                '</div></div>' +
              '</div>';
    });
    return html;
  }

  /* ── Main render dispatch ───────────────────────────────────────────────── */
  function render() {
    var host = document.getElementById('mpub-list');
    if (!host) return;
    var list = matching(false);

    // Toggle which secondary control is visible
    var chips = document.getElementById('mpub-theme-filters');
    var jump  = document.getElementById('mpub-member-jump');
    if (chips) chips.style.display = (state.view === 'theme') ? 'flex' : 'none';
    if (jump)  jump.style.display  = (state.view === 'member') ? 'flex' : 'none';

    // Count note
    var note = document.getElementById('mpub-count-note');
    if (note) {
      if (state.view === 'member') {
        var memberCount = Object.keys(groupByMember(list)).length;
        note.textContent = list.length + ' ' + t('mpub_count') + ' · ' +
                           memberCount + ' ' + t('mpub_members_count');
      } else {
        note.textContent = list.length + ' ' + t('mpub_count');
      }
    }

    if (!list.length) {
      host.innerHTML = '<div class="pub-toc-placeholder" style="padding:24px 0;">' +
                       esc(t('mpub_no_results')) + '</div>';
      return;
    }

    host.innerHTML = (state.view === 'member') ? renderMemberView(list) : renderThemeView(list);
  }

  /* ── Public handlers ────────────────────────────────────────────────────── */
  window.mpubSetView = function (view) {
    state.view = view;
    ['theme', 'member'].forEach(function (v) {
      var b = document.getElementById('mpub-vt-' + v);
      if (b) b.classList.toggle('active', v === view);
    });
    if (view === 'theme') renderThemeFilters();
    render();
  };

  window.mpubSetTheme = function (id, btn) {
    state.theme = id;
    var host = document.getElementById('mpub-theme-filters');
    if (host) host.querySelectorAll('.pub-filter-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    render();
  };

  window.mpubToggleMember = function (name) {
    state.openMember = (state.openMember === name) ? null : name;
    render();
  };

  // Used by the jump bar: ensure target is open, then let the anchor scroll.
  window.mpubOpenMember = function (name) {
    state.openMember = name;
    render();
  };

  window.mpubSearch = function (val) {
    state.q = val || '';
    if (state.view === 'theme') renderThemeFilters();
    render();
  };

  function renderAll() {
    renderThemeFilters();
    render();
    var s = document.getElementById('mpub-search');
    if (s) s.placeholder = t('mpub_search_ph');
  }

  window.addEventListener('agw-lang-change', function () { renderAll(); });

  renderAll();
})();
