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

  // Lookup of member metadata by stable id slug (primary) and by display name
  // (legacy fallback, so a hand-added entry keyed on `member` still resolves).
  var MEMBER_BY_ID = {}, MEMBER_BY_NAME = {};
  MEMBERS.forEach(function (m) {
    if (m.id) MEMBER_BY_ID[m.id] = m;
    MEMBER_BY_NAME[m.name] = m;
  });

  // Resolve the member record a publication belongs to.
  function memberOf(p) {
    if (p.mid && MEMBER_BY_ID[p.mid]) return MEMBER_BY_ID[p.mid];
    if (p.member && MEMBER_BY_NAME[p.member]) return MEMBER_BY_NAME[p.member];
    return null;
  }
  // Display name for a publication's member; degrades gracefully if unresolved.
  function memberName(p) {
    var m = memberOf(p);
    return m ? m.name : (p.member || p.mid || '—');
  }
  // Grouping key: prefer the stable id.
  function memberKey(p) {
    var m = memberOf(p);
    return (m && m.id) ? m.id : ('name:' + memberName(p));
  }

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
                   memberName(p)).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* Publication-type badge. Books and edited volumes must not read like articles. */
  function typeBadge(type) {
    if (!type) return '';
    var key = 'mpub_type_' + type;
    var label = t(key);
    if (!label || label === key) return '';
    return '<span style="display:inline-block;margin-left:8px;padding:1px 6px;border-radius:3px;' +
           'font-family:\'Source Sans 3\',sans-serif;font-size:10px;font-weight:600;letter-spacing:.06em;' +
           'text-transform:uppercase;vertical-align:middle;color:var(--navy);' +
           'background:rgba(27,58,107,.08);border:1px solid rgba(27,58,107,.15);">' + esc(label) + '</span>';
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
    var authors = p.authors ? esc(p.authors) : esc(memberName(p));
    var venue   = p.venue ? '<em>' + esc(p.venue) + '</em>' : '';
    var yr      = p.year ? ' · ' + p.year : '';
    return '<div class="pub-item-wrap"><div class="pub-item" style="grid-template-columns:1fr auto;cursor:default;">' +
             '<div>' +
               '<div class="pub-title">' + esc(p.title) + typeBadge(p.type) + '</div>' +
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
  // Group matching publications by stable member key (id where available).
  function groupByMember(list) {
    var map = {};
    list.forEach(function (p) {
      var k = memberKey(p);
      (map[k] = map[k] || []).push(p);
    });
    return map;
  }

  // Surname for alphabetical sort (last whitespace-separated token).
  function sortKey(name) {
    var parts = String(name).trim().split(/\s+/);
    return (parts[parts.length - 1] + ' ' + name).toLowerCase();
  }

  function anchorFor(key) {
    return 'm-' + String(key).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  }
  function jsq(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  function renderMemberJump(keys, labels) {
    var bar = document.getElementById('mpub-member-jump');
    if (!bar) return;
    if (!keys.length) { bar.innerHTML = ''; return; }
    bar.className = 'mpub-jumpbar';
    var html = '<span style="color:var(--text-faint);margin-right:4px;">' + esc(t('mpub_jump')) + ':</span>';
    keys.forEach(function (k) {
      html += '<a href="#' + anchorFor(k) + '" onclick="mpubOpenMember(\'' + jsq(k) + '\');">' +
              esc(labels[k]) + '</a>';
    });
    bar.innerHTML = html;
  }

  /* External profile links for a member: ORCID and institutional homepage
   * are optional and opt-in — they render only when present in MEMBERS. */
  function memberLinks(m) {
    var out = '';
    if (!m) return out;
    if (m.orcid) {
      out += '<a class="mpub-member-profilelink" href="https://orcid.org/' + attr(m.orcid) +
             '" target="_blank" rel="noopener" onclick="event.stopPropagation();">ORCID ' +
             '<span class="ico ico-ext" aria-hidden="true"></span></a>';
    }
    if (m.homepage) {
      out += '<a class="mpub-member-profilelink" href="' + attr(m.homepage) +
             '" target="_blank" rel="noopener" onclick="event.stopPropagation();">' +
             esc(t('mpub_homepage')) + ' <span class="ico ico-ext" aria-hidden="true"></span></a>';
    }
    return out;
  }

  function renderMemberView(list) {
    var l = curLang();
    var groups = groupByMember(list);

    // Display name per group key, derived from the first publication in it.
    var labels = {};
    Object.keys(groups).forEach(function (k) { labels[k] = memberName(groups[k][0]); });

    var keys = Object.keys(groups).sort(function (a, b) {
      var ka = sortKey(labels[a]), kb = sortKey(labels[b]);
      return ka < kb ? -1 : (ka > kb ? 1 : 0);
    });
    renderMemberJump(keys, labels);

    var html = '';
    keys.forEach(function (key) {
      var pubs = groups[key].slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      var meta = memberOf(pubs[0]);
      var name = labels[key];
      var focus = meta ? (l === 'en' ? meta.focus_en : meta.focus_de) : '';
      var inst  = meta ? meta.inst : '';
      var anchor = anchorFor(key);
      var isOpen = (state.openMember === key) || (state.q.trim() !== '');
      var n = pubs.length;
      var countWord = n === 1 ? t('mpub_one_pub') : t('mpub_count');
      var profile = '<a class="mpub-member-profilelink" href="committee.html#mitglieder" ' +
                    'onclick="event.stopPropagation();">' + esc(t('mpub_profile')) + ' \u203a</a>';
      html += '<div class="mpub-member-card' + (isOpen ? ' open' : '') + '" id="' + anchor + '">' +
                '<div class="mpub-member-head" onclick="mpubToggleMember(\'' + jsq(key) + '\')">' +
                  '<span class="mpub-member-chevron">\u25be</span>' +
                  '<span class="mpub-member-name">' + esc(name) + '</span>' +
                  (focus ? '<span class="mpub-member-focus">\u00b7 ' + esc(focus) + '</span>' : '') +
                  '<span class="mpub-member-pubcount">' + n + ' ' + esc(countWord) +
                    (inst ? ' \u00b7 ' + esc(inst) : '') + '&nbsp;&nbsp;' +
                    memberLinks(meta) + profile + '</span>' +
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

  window.mpubToggleMember = function (key) {
    state.openMember = (state.openMember === key) ? null : key;
    render();
  };

  // Used by the jump bar: ensure target is open, then let the anchor scroll.
  window.mpubOpenMember = function (key) {
    state.openMember = key;
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
