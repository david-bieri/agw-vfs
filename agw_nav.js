/* agw_nav.js — Shared header rendering for all AGW pages
 * ─────────────────────────────────────────────────────────────
 * Each page contains <div id="nav-mount"></div> and calls
 *   AGW.renderNav('conference' | 'archive' | 'committee' | 'analytics' | 'guide')
 * after the foundation scripts (agw_strings.js, agw_data.js) have loaded.
 *
 * Highlights the active page, supports the existing data-i18n
 * translation system, and preserves search + DE/EN toggle.
 */

(function () {
  'use strict';
  window.AGW = window.AGW || {};

  /** Render the shared nav into #nav-mount. */
  window.AGW.renderNav = function (active) {
    var mount = document.getElementById('nav-mount');
    if (!mount) return;

    // Which page each top-level nav item belongs to
    var pageActive = function (page) {
      return active === page ? ' nav-active' : '';
    };

    mount.innerHTML =
      '<nav class="nav" role="navigation">' +
        '<div class="nav-inner">' +
          '<a class="nav-brand" href="index.html">' +
            '<span class="nav-brand-primary">AGW</span>' +
            '<span class="nav-brand-sep"></span>' +
            '<span class="nav-brand-sub" data-i18n="nav_brand_sub">Verein für Socialpolitik</span>' +
          '</a>' +
          '<ul class="nav-links">' +

            '<li class="nav-item' + pageActive('conference') + '">' +
              '<a href="index.html#tagungsprogramm">' +
                '<span data-i18n="nav_conference">Jahrestagung 2026</span>' +
                '<span class="caret">▾</span>' +
              '</a>' +
              '<div class="dropdown">' +
                '<a href="index.html#tagungsprogramm"><span data-i18n="nav_programme">Tagungsprogramm</span></a>' +
                '<a href="index.html#rahmenprogramm"><span data-i18n="nav_social">Rahmenprogramm</span></a>' +
                '<a href="index.html#logistik"><span data-i18n="nav_travel">Anreise &amp; Logistik</span></a>' +
              '</div>' +
            '</li>' +

            '<li class="nav-item' + pageActive('archive') + '">' +
              '<a href="archive.html">' +
                '<span data-i18n="nav_archive">Archiv</span>' +
                '<span class="caret">▾</span>' +
              '</a>' +
              '<div class="dropdown">' +
                '<a href="archive.html#archiv"><span data-i18n="nav_archive">Archiv</span></a>' +
                '<a href="archive.html#publikationen"><span data-i18n="nav_publications">Publikationen</span></a>' +
              '</div>' +
            '</li>' +

            '<li class="nav-item' + pageActive('committee') + '">' +
              '<a href="committee.html">' +
                '<span data-i18n="nav_about_group">Über den AGW</span>' +
                '<span class="caret">▾</span>' +
              '</a>' +
              '<div class="dropdown">' +
                '<a href="committee.html#ueber"><span data-i18n="nav_about">Über den Ausschuss</span></a>' +
                '<a href="committee.html#geschichte"><span data-i18n="nav_history">Geschichte des AGW</span></a>' +
                '<div class="dropdown-sep"></div>' +
                '<a href="committee.html#mitglieder"><span data-i18n="nav_members">Mitgliederliste</span></a>' +
                '<a href="committee.html#satzung"><span data-i18n="nav_satzung">Satzung</span></a>' +
              '</div>' +
            '</li>' +

            '<li class="nav-item' + pageActive('analytics') + '">' +
              '<a href="analytics.html">' +
                '<span data-i18n="nav_analytics">Analyse</span>' +
              '</a>' +
            '</li>' +

          '</ul>' +
          '<div class="nav-actions">' +
            '<button onclick="openSearch()" class="nav-search-btn" ' +
              'title="Suchen (Ctrl+K)" aria-label="Search">🔍</button>' +
            '<div class="lang-toggle" role="group" aria-label="Language">' +
              '<button class="lang-btn active" id="btn-de" onclick="setLang(\'de\')">DE</button>' +
              '<button class="lang-btn" id="btn-en" onclick="setLang(\'en\')">EN</button>' +
            '</div>' +
            '<a href="https://www.socialpolitik.de/de" target="_blank" rel="noopener" ' +
              'class="nav-vfs">VfS ↗</a>' +
            '<button class="nav-hamburger" onclick="toggleMobileMenu()" aria-label="Menu">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</nav>';

    // Re-apply language to the freshly-injected nav
    if (window.AGW && window.AGW.applyLang) {
      window.AGW.applyLang(window.AGW.getLang ? window.AGW.getLang() : 'de');
    }
  };

  /** Render a small shared footer into #footer-mount. */
  window.AGW.renderFooter = function () {
    var mount = document.getElementById('footer-mount');
    if (!mount) return;
    mount.innerHTML =
      '<footer class="footer">' +
        '<div class="footer-inner">' +
          '<div class="footer-col">' +
            '<div class="footer-brand">AGW</div>' +
            '<div class="footer-desc" data-i18n-html="footer_desc">' +
              'Ausschuss für die Geschichte der Wirtschaftswissenschaften · ' +
              'Verein für Socialpolitik' +
            '</div>' +
          '</div>' +
          '<div class="footer-col">' +
            '<div class="footer-col-title" data-i18n="footer_col_conf">Jahrestagung 2026</div>' +
            '<a href="index.html#tagungsprogramm" data-i18n="nav_programme">Tagungsprogramm</a>' +
            '<a href="index.html#rahmenprogramm" data-i18n="nav_social">Rahmenprogramm</a>' +
            '<a href="index.html#logistik" data-i18n="nav_travel">Anreise &amp; Logistik</a>' +
          '</div>' +
          '<div class="footer-col">' +
            '<div class="footer-col-title" data-i18n="footer_col_about">Über</div>' +
            '<a href="archive.html" data-i18n="nav_archive">Archiv</a>' +
            '<a href="archive.html#publikationen" data-i18n="nav_publications">Publikationen</a>' +
            '<a href="committee.html" data-i18n="nav_about">Über den AGW</a>' +
            '<a href="analytics.html" data-i18n="nav_analytics">Analyse</a>' +
          '</div>' +
          '<div class="footer-col">' +
            '<div class="footer-col-title">Kontakt</div>' +
            '<a href="mailto:bieri@vt.edu">bieri@vt.edu</a>' +
            '<a href="https://www.socialpolitik.de/de" target="_blank" rel="noopener">' +
              'socialpolitik.de ↗</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span data-i18n="footer_hosted">Gehostet am Steger Center for International Scholarship, Virginia Tech</span>' +
          ' · <span data-i18n="footer_updated">Aktualisiert Juni 2026</span>' +
        '</div>' +
      '</footer>';

    if (window.AGW && window.AGW.applyLang) {
      window.AGW.applyLang(window.AGW.getLang ? window.AGW.getLang() : 'de');
    }
  };

})();
