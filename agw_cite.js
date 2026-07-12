/* agw_cite.js — citation export for the AGW Tagungsband chapters
 * ────────────────────────────────────────────────────────────────────────────
 * Every chapter in VOLUME_CHAPTERS can be exported as Chicago (notes-bibliography),
 * Harvard (author–date), or BibTeX. A whole volume, or a whole member's AGW record,
 * can be exported as a .bib file.
 *
 * All the metadata needed lives in the two arrays this module reads:
 *   VOLUME_CHAPTERS  authors, title, page range, volume
 *   VOLUME_META      year, editors, ISBN, DOI, volume title
 * VOLUME_META exists because PUBLICATIONS has year:null for 31 of 43 volumes; its
 * year/editors come from the publisher's own citation block. Do not substitute
 * PUBLICATIONS.year here — it is absent more often than not.
 *
 * No backend: the .bib download is a Blob + object URL, and the clipboard write
 * falls back to a hidden textarea where the async Clipboard API is unavailable
 * (it requires a secure context, and some in-app browsers do not grant it).
 */
(function () {
  'use strict';

  var D = window.AGW_DATA || {};
  var CH = D.VOLUME_CHAPTERS || [];
  var VM = D.VOLUME_META || [];

  var META = {};
  VM.forEach(function (v) { META[v.vol] = v; });

  var SERIES  = 'Studien zur Entwicklung der \u00f6konomischen Theorie';
  var SERIES2 = 'Schriften des Vereins f\u00fcr Socialpolitik';
  var PUB     = 'Duncker & Humblot';
  var PLACE   = 'Berlin';

  function t(key, fallback) {
    var S = (window.AGW && window.AGW.S) || {};
    var lang = (window.AGW && window.AGW.lang) || document.documentElement.lang || 'de';
    var e = S[key];
    return (e && (e[lang] || e.de)) || fallback || key;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── names ────────────────────────────────────────────────────────────────
   * The corpus stores authors as "Vorname Nachname", separated by " / ". Citation
   * styles need them inverted. Nobiliary particles stay with the surname: "Johann
   * Heinrich von Th\u00fcnen" -> "von Th\u00fcnen, Johann Heinrich", not "Th\u00fcnen, Johann Heinrich von". */
  var PARTICLES = ['von', 'van', 'de', 'del', 'della', 'di', 'du', 'la', 'le', 'ter', 'zu', 'zur', 'den'];

  function splitAuthors(s) {
    return String(s || '').split(/\s*\/\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function invert(name) {
    var w = name.split(/\s+/);
    if (w.length < 2) return name;
    var i = w.length - 1;
    while (i > 1 && PARTICLES.indexOf(w[i - 1].toLowerCase()) !== -1) i--;
    return w.slice(i).join(' ') + ', ' + w.slice(0, i).join(' ');
  }
  function initials(name) {
    var inv = invert(name), parts = inv.split(', ');
    if (parts.length < 2) return inv;
    var ini = parts[1].split(/\s+/).map(function (x) { return x.charAt(0) + '.'; }).join(' ');
    return parts[0] + ', ' + ini;
  }
  /* Chicago: first author inverted, the rest in natural order. */
  function chicagoNames(list) {
    if (!list.length) return '';
    var out = [invert(list[0])].concat(list.slice(1));
    if (out.length === 1) return out[0];
    if (out.length === 2) return out[0] + ' and ' + out[1];
    return out.slice(0, -1).join(', ') + ', and ' + out[out.length - 1];
  }
  function harvardNames(list) {
    var out = list.map(initials);
    if (out.length <= 1) return out[0] || '';
    return out.slice(0, -1).join(', ') + ' and ' + out[out.length - 1];
  }

  /* ── the three styles ─────────────────────────────────────────────────────
   * The volume title, series, publisher and place are German-language facts about a
   * German book; they are NOT translated in EN mode (same rule as speaker names and
   * venues elsewhere on the site). Only the connective words differ by style. */
  function volumeOf(c) { return META[c.vol] || {}; }

  /* "Bieri, David S." + "." would give a double stop. */
  function dot(s) { return /\.$/.test(s) ? s : s + '.'; }

  /* The publisher gives editors APA-style ("Neumark, F."). Harvard wants exactly that;
   * Chicago wants natural order ("F. Neumark"). Un-invert for Chicago. */
  function uninvert(s) {
    return String(s || '').split(/;\s*/).map(function (one) {
      var p = one.split(/,\s*/);
      return p.length === 2 ? p[1] + ' ' + p[0] : one;
    }).join(' and ');
  }

  function chicago(c) {
    var v = volumeOf(c), A = splitAuthors(c.authors);
    var s = dot(chicagoNames(A)) + ' ';
    s += '\u201c' + dot(c.title) + '\u201d ';
    s += 'In ' + (v.title || '') + ', ';
    if (v.editors) s += 'edited by ' + uninvert(v.editors) + ', ';
    if (c.pages) s += c.pages.replace(/\u2013/g, '\u2013') + '. ';
    s += SERIES + ' ' + c.vol + '. ';
    s += PLACE + ': ' + PUB + ', ' + (v.year || 'n.d.') + '.';
    return s.replace(/\.\./g, '.');
  }

  function harvard(c) {
    var v = volumeOf(c), A = splitAuthors(c.authors);
    var s = harvardNames(A) + ' (' + (v.year || 'n.d.') + ') \u2018' + c.title + '\u2019, ';
    s += 'in ' + (v.editors ? v.editors + ' (ed.), ' : '') + (v.title || '') + '. ';
    s += SERIES + ' ' + c.vol + '. ';
    s += PLACE + ': ' + PUB + (c.pages ? ', pp. ' + c.pages : '') + '.';
    return s;
  }

  /* BibTeX. Titles are brace-protected so BibTeX does not down-case German nouns.
   * UTF-8 is emitted directly (biblatex/biber handle it; so does modern bibtex with
   * inputenc). Page ranges use the BibTeX double hyphen, not an en dash. */
  function bibkey(c) {
    var v = volumeOf(c), A = splitAuthors(c.authors);
    var sur = A.length ? invert(A[0]).split(',')[0].replace(/\s+/g, '') : 'Anon';
    sur = sur.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z]/g, '');
    return sur + (v.year || '') + c.vol;
  }
  function bibtex(c) {
    var v = volumeOf(c), A = splitAuthors(c.authors);
    var L = ['@incollection{' + bibkey(c) + ','];
    L.push('  author    = {' + A.join(' and ') + '},');
    L.push('  title     = {' + c.title + '},');
    L.push('  booktitle = {' + (v.title || '') + '},');
    if (v.editors) L.push('  editor    = {' + v.editors + '},');
    L.push('  series    = {' + SERIES + '},');
    L.push('  volume    = {' + c.vol + '},');
    L.push('  publisher = {' + PUB + '},');
    L.push('  address   = {' + PLACE + '},');
    if (v.year) L.push('  year      = {' + v.year + '},');
    if (c.pages) L.push('  pages     = {' + c.pages.replace(/\u2013/g, '--') + '},');
    if (v.isbn) L.push('  isbn      = {' + v.isbn + '},');
    if (v.doi) L.push('  doi       = {' + v.doi + '},');
    if (c.url) L.push('  url       = {' + c.url + '},');
    L.push('  note      = {' + SERIES2 + ' 115/' + c.vol + '}');
    L.push('}');
    return L.join('\n');
  }

  /* ── clipboard + download, no backend ─────────────────────────────────────── */
  function copy(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = t('cite_copied', 'Kopiert');
      btn.classList.add('cite-ok');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('cite-ok'); }, 1400);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else {
      fallback(text, done);   /* Clipboard API needs a secure context; in-app browsers often refuse */
    }
  }
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* nothing else to try */ }
    document.body.removeChild(ta);
  }
  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/x-bibtex;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ── the popover ──────────────────────────────────────────────────────────── */
  var pop = null;
  function closePop() {
    if (pop) { pop.remove(); pop = null; }
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { closePop(); } }

  function openPop(anchor, c) {
    closePop();
    var forms = [
      ['Chicago', chicago(c)],
      ['Harvard', harvard(c)],
      ['BibTeX', bibtex(c)]
    ];
    pop = document.createElement('div');
    pop.className = 'cite-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', t('cite_title', 'Zitieren'));
    pop.innerHTML =
      '<div class="cite-head">' + esc(t('cite_title', 'Zitieren')) +
        '<button class="cite-x" aria-label="' + esc(t('cite_close', 'Schlie\u00dfen')) + '">\u00d7</button>' +
      '</div>' +
      forms.map(function (f, i) {
        return '<div class="cite-block">' +
                 '<div class="cite-lbl">' + f[0] + '</div>' +
                 '<' + (i === 2 ? 'pre' : 'div') + ' class="cite-txt" data-i="' + i + '">' + esc(f[1]) +
                 '</' + (i === 2 ? 'pre' : 'div') + '>' +
                 '<button class="cite-copy" data-i="' + i + '">' + esc(t('cite_copy', 'Kopieren')) + '</button>' +
               '</div>';
      }).join('') +
      '<div class="cite-foot"><button class="cite-dl">' +
        esc(t('cite_bib_dl', '.bib herunterladen')) + '</button></div>';

    document.body.appendChild(pop);

    /* Position under the trigger, clamped to the viewport (the same failure the
     * gaze-map tooltips had: a fixed element near the right edge runs off-screen). */
    var r = anchor.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    var top = (r.bottom + h + 8 > window.innerHeight && r.top - h - 8 > 0)
      ? r.top - h - 8 : r.bottom + 8;
    pop.style.left = left + 'px';
    pop.style.top = Math.max(8, top) + 'px';

    pop.querySelector('.cite-x').addEventListener('click', closePop);
    pop.querySelectorAll('.cite-copy').forEach(function (b) {
      b.addEventListener('click', function () { copy(forms[+b.dataset.i][1], b); });
    });
    pop.querySelector('.cite-dl').addEventListener('click', function () {
      download(bibkey(c) + '.bib', bibtex(c) + '\n');
    });
    document.addEventListener('keydown', onKey, true);
    pop.querySelector('.cite-x').focus();
  }

  /* ── wiring ───────────────────────────────────────────────────────────────
   * Event delegation on document, because both the volume ToCs (archive.html) and
   * the member cards (publications-members.html) re-render on every language toggle:
   * handlers bound directly to rows would be lost on the next setLang(). */
  function find(volN, pages) {
    return CH.filter(function (c) {
      return String(c.volN) === String(volN) && c.pages === pages;
    })[0];
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-cite]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();       /* the row itself may be a toggle */
      var parts = btn.getAttribute('data-cite').split('|');
      var c = find(parts[0], parts[1]);
      if (c) openPop(btn, c);
      return;
    }
    var all = e.target.closest && e.target.closest('[data-cite-all]');
    if (all) {
      e.preventDefault();
      e.stopPropagation();
      var spec = all.getAttribute('data-cite-all');   /* "vol:XXIII" | "mid:schefold-bertram" */
      var kind = spec.split(':')[0], key = spec.slice(kind.length + 1);
      var set = (kind === 'vol')
        ? CH.filter(function (c) { return c.vol === key; })
        : CH.filter(function (c) { return (c.mids || []).indexOf(key) !== -1; });
      if (!set.length) return;
      download('agw-' + key.replace(/[^\w-]/g, '') + '.bib',
               set.map(bibtex).join('\n\n') + '\n');
      return;
    }
    if (pop && !pop.contains(e.target)) closePop();
  }, true);

  window.addEventListener('resize', closePop);

  window.AGW = window.AGW || {};
  window.AGW.cite = { chicago: chicago, harvard: harvard, bibtex: bibtex, download: download };
})();
