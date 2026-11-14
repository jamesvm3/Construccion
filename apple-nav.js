/* Navegación estilo Apple compartida: barra lateral (escritorio), barra de pestañas (móvil),
   barra superior de cristal y modo oscuro. Lee el catálogo CARDS/MATS de app.js, así que los
   iconos de cada estructura son siempre los mismos SVG del menú. No toca la lógica de cálculo. */
(function () {
  if (typeof CARDS === 'undefined' || typeof MATS === 'undefined') return;
  const $ = id => document.getElementById(id);
  const body = document.body, page = body.dataset.page, toolId = body.dataset.tool || '';
  const matOf = c => c.mat || 'H';
  const SHORT = { 'Cimentaciones superficiales': 'Superficiales', 'Cimentaciones profundas': 'Profundas', 'Muros de contención': 'Muros', 'Estructura': 'Estructura', 'Vigas y soportes': 'Vigas', 'Uniones': 'Uniones', 'Arriostramiento': 'Arriostr.', 'Incendio': 'Incendio' };
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const CHEV = svg('<path d="M15 5l-7 7 7 7"/>');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  let enabled;
  try { const s = JSON.parse($('state').textContent); enabled = new Set(s.enabled); } catch (e) { enabled = new Set(CARDS.map(c => c.id)); }

  const toolCard = CARDS.find(c => c.id === toolId);
  const isMenu = page === 'menu';
  const isPortal = () => page === 'menu' && (location.hash || '').replace('#', '') === '';
  const hashMat = () => { const h = (location.hash || '').replace('#', '').toUpperCase(); return MATS.some(m => m.id === h) ? h : null; };
  const curMat = () => !isMenu ? (body.dataset.mat || (toolCard ? matOf(toolCard) : 'H')) : hashMat();
  const groupsOf = mat => {
    const gs = [];
    CARDS.filter(c => matOf(c) === mat && enabled.has(c.id)).forEach(c => { let g = gs.find(x => x.name === c.group); if (!g) { g = { name: c.group, items: [] }; gs.push(g); } g.items.push(c); });
    return gs;
  };
  const matName = id => (MATS.find(m => m.id === id) || {}).name || '';
  const row = (c, cur) => `<a class="navitem" href="${c.href}"${c.id === cur ? ' aria-current="page"' : ''}><span class="tile">${c.icon}</span><span class="nt"><b style="font-weight:500">${esc(c.title)}</b></span></a>`;

  /* ---------- barra lateral ---------- */
  let listMat = curMat() || 'H';
  const brand = (home) => `<a class="brand" href="${home}"><div class="appicon">${svg('<path d="M6 4h12M6 20h12M12 4v16"/>')}</div><div><b>Construcción</b><span>Portal único · UGR</span></div></a>`;
  function sidebarMenu() {
    if (isPortal()) {
      $('sidebar').innerHTML = brand('#') + '<div class="navgroup"><h4>Inicio</h4><a class="navitem" href="#" aria-current="page"><span class="nt"><b style="font-weight:600">Portada</b></span></a><a class="navitem" href="#P"><span class="nt"><b style="font-weight:600">Predimensionado</b><small>' + CARDS.length + ' calculadoras</small></span></a><a class="navitem" href="detalles.html"><span class="nt"><b style="font-weight:600">Detalle constructivo</b><small>4 detalles</small></span></a></div>';
      return;
    }
    const mat = curMat();
    let h = brand('#') + '<div class="navgroup"><h4>Predimensionado</h4>';
    MATS.forEach(m => {
      const n = CARDS.filter(c => matOf(c) === m.id && enabled.has(c.id)).length;
      h += `<button type="button" class="navitem" data-mat="${m.id}"${mat === m.id ? ' aria-current="page"' : ''}><span class="tile big">${m.icon}</span><span class="nt"><b style="font-weight:600">${m.name}</b><small>${n ? n + (n === 1 ? ' herramienta' : ' herramientas') : 'Próximamente'}</small></span></button>`;
      if (mat === m.id) groupsOf(m.id).forEach(g => { h += `<button type="button" class="navitem sub" data-sec="${esc(g.name)}">${esc(g.name)}</button>`; });
    });
    h += '</div><div class="navgroup"><h4>Más</h4><a class="navitem" href="detalles.html"><span class="nt"><b style="font-weight:600">Detalle constructivo</b><small>Dibujos paso a paso</small></span></a></div>';
    $('sidebar').innerHTML = h;
  }
  function sidebarTool() {
    const sb = $('sidebar');
    if (!sb.dataset.built) {
      sb.innerHTML = brand('index.html') +
        '<div class="seg" id="matseg" role="group" aria-label="Material"><span class="thumb"></span>' +
        MATS.map(m => `<button type="button" data-mat="${m.id}" aria-pressed="${m.id === listMat}">${m.name}</button>`).join('') + '</div><div id="navlist"></div>';
      sb.dataset.built = '1';
      initSeg($('matseg'), b => { listMat = b.dataset.mat; fillList(); });
    }
    fillList();
  }
  function fillList() {
    const gs = groupsOf(listMat);
    $('navlist').innerHTML = gs.length ? gs.map(g => `<div class="navgroup"><h4>${esc(g.name)}</h4>${g.items.map(c => row(c, toolId)).join('')}</div>`).join('') : '<div class="sidefoot">Todavía no hay herramientas activas de este material.</div>';
  }

  /* ---------- barra superior ---------- */
  const SUN = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  const MOON = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg>';
  function navbar() {
    const mat = curMat(); let left = '', title = 'Predimensionado';
    if (!isMenu) {
      left = `<a class="backlink" href="index.html#${mat}">${CHEV}<span>Menú</span></a><span class="sep">/</span><span class="here">${esc(matName(mat))}${page === 'proceso' ? ' · Proceso constructivo' : (toolCard ? ' · ' + esc(toolCard.group) : '')}</span>`;
      title = page === 'proceso' ? document.title.replace(/^Proceso:\s*/i, 'Proceso · ') : (toolCard ? toolCard.title : title);
    } else if (mat) {
      left = `<button type="button" class="backlink" data-home>${CHEV}<span>Materiales</span></button>`;
      title = matName(mat);
    } else if (isMenu && !isPortal()) {
      left = `<a class="backlink" href="#">${CHEV}<span>Inicio</span></a>`;
    } else if (isPortal()) { title = 'Construcción'; }
    $('navbar').innerHTML = `<div class="crumbs">${left}</div><div class="navtitle">${esc(title)}</div><div class="navactions"><button type="button" class="iconbtn" id="themebtn" aria-label="Cambiar entre modo claro y oscuro">${SUN}${MOON}</button></div>`;
  }

  /* ---------- barra de pestañas y hoja (móvil) ---------- */
  const sheet = $('sheet'), scrim = $('scrim');
  function closeSheet() { sheet.classList.remove('show'); scrim.classList.remove('show'); tabbar(); }
  function tabbar() {
    const mat = curMat(); let h = '';
    if (isPortal()) {
      h = '<a class="tbtn" href="#" aria-pressed="true"><span class="ti">' + svg('<path d="M4 11l8-7 8 7v9H4z"/>') + '</span><span>Inicio</span></a><a class="tbtn" href="#P" aria-pressed="false"><span class="ti">' + svg('<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>') + '</span><span>Calcular</span></a><a class="tbtn" href="detalles.html" aria-pressed="false"><span class="ti">' + svg('<path d="M3 20h18M6 20v-5h12v5M9 15V5h6v10"/>') + '</span><span>Detalles</span></a>';
    } else if (page === 'menu') {
      MATS.forEach(m => { h += `<button type="button" class="tbtn" data-mat="${m.id}" aria-pressed="${mat === m.id}"><span class="ti">${m.icon}</span><span>${m.name}</span></button>`; });
    } else {
      groupsOf(mat).forEach((g, i) => {
        const on = g.items.some(c => c.id === toolId) && !sheet.classList.contains('show');
        h += `<button type="button" class="tbtn" data-g="${i}" aria-pressed="${on}"><span class="ti">${g.items[0].icon}</span><span>${esc(SHORT[g.name] || g.name)}</span></button>`;
      });
    }
    $('tabbar').innerHTML = h;
  }
  $('tabbar').addEventListener('click', e => {
    const t = e.target.closest('.tbtn'); if (!t) return;
    if (!t.dataset.mat && !t.dataset.g) return;
    if (page === 'menu') { location.hash = t.dataset.mat; return; }
    const g = groupsOf(curMat())[+t.dataset.g];
    if (sheet.classList.contains('show') && sheet.dataset.g === t.dataset.g) { closeSheet(); return; }
    sheet.dataset.g = t.dataset.g;
    sheet.innerHTML = `<h4>${esc(g.name)}</h4>` + g.items.map(c => row(c, toolId)).join('');
    sheet.classList.add('show'); scrim.classList.add('show');
    document.querySelectorAll('.tbtn').forEach(x => x.setAttribute('aria-pressed', String(x === t)));
  });
  scrim.addEventListener('click', closeSheet);

  /* ---------- acciones del menú (escritorio y barra superior) ---------- */
  document.addEventListener('click', e => {
    const home = e.target.closest('[data-home]');
    if (home && page === 'menu') { e.preventDefault(); location.hash = 'P'; return; }
    const m = e.target.closest('#sidebar [data-mat]');
    if (m && page === 'menu') { location.hash = (hashMat() === m.dataset.mat) ? 'P' : m.dataset.mat; return; }
    const s = e.target.closest('[data-sec]');
    if (s) { const h = [...document.querySelectorAll('#app section h2')].find(x => x.textContent === s.dataset.sec); if (h) h.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    if (e.target.closest('#themebtn')) { dark = !dark; applyTheme(); }
  });

  /* ---------- tema ---------- */
  const root = document.documentElement, mq = matchMedia('(prefers-color-scheme: dark)');
  let saved = null; try { saved = localStorage.getItem('apple-theme'); } catch (e) { /* sin almacenamiento */ }
  let dark = saved ? saved === 'dark' : (root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches);
  function applyTheme() { root.dataset.theme = dark ? 'dark' : 'light'; body.classList.toggle('is-dark', dark); try { localStorage.setItem('apple-theme', dark ? 'dark' : 'light'); } catch (e) { /* sin almacenamiento */ } }
  applyTheme();

  /* ---------- control segmentado ---------- */
  function initSeg(el, onPick) {
    const th = el.querySelector('.thumb'), bs = [...el.querySelectorAll('button')];
    const place = () => { const b = bs.find(x => x.getAttribute('aria-pressed') === 'true') || bs[0]; th.style.width = b.offsetWidth + 'px'; th.style.transform = `translateX(${b.offsetLeft - 2}px)`; };
    bs.forEach(b => b.addEventListener('click', () => { if (onPick && onPick(b) === false) return; bs.forEach(x => x.setAttribute('aria-pressed', String(x === b))); place(); }));
    place(); addEventListener('resize', place); if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* ---------- refresco ---------- */
  function refresh() {
    body.dataset.mat = curMat() || '';
    if (isMenu) sidebarMenu(); else sidebarTool();
    navbar(); tabbar();
  }
  refresh();
  addEventListener('scroll', () => $('navbar').classList.toggle('scrolled', scrollY > 56), { passive: true });
  if (page === 'menu') {
    addEventListener('hashchange', refresh);
    const app = $('app');
    if (app) new MutationObserver(refresh).observe(app, { childList: true });
  }

  /* calculadoras y procesos: respetan las herramientas que el propietario activó en el menú */
  if (!isMenu) {
    try {
      fetch('index.html').then(r => r.ok ? r.text() : '').then(h => {
        const m = h.match(/<script type="application\/json" id="state">([\s\S]*?)<\/script>/);
        if (!m) return;
        const st = JSON.parse(m[1]);
        if (Array.isArray(st.enabled)) { enabled = new Set(st.enabled); refresh(); }
      }).catch(() => { /* sin acceso: se muestran todas */ });
    } catch (e) { /* sin fetch */ }
  }

  /* ---------- solo calculadoras ---------- */
  if ($('viewseg')) initSeg($('viewseg'), b => { $('drawing').dataset.view = b.dataset.view; });
  const main = document.querySelector('main');
  if (page === 'tool' && main) {
    const seen = new WeakMap();
    new MutationObserver(ms => ms.forEach(m => {
      const el = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (!el) return;
      const host = el.closest('.f,.tag,#summary'); if (!host) return;
      const txt = host.textContent; if (seen.get(host) === txt) return;
      const first = !seen.has(host); seen.set(host, txt); if (first) return;
      host.classList.remove('pop'); void host.offsetWidth; host.classList.add('pop');
    })).observe(main, { childList: true, subtree: true, characterData: true });

    /* textos largos plegables: botón "+" (solo calculadoras de predimensionado) */
    const wrapMore = (el, label) => {
      if (!el || el.closest('details.more')) return;
      const d = document.createElement('details'); d.className = 'more';
      const sm = document.createElement('summary');
      sm.innerHTML = '<span class="pm" aria-hidden="true"></span><span>' + label + '</span>';
      el.parentNode.insertBefore(d, el); d.appendChild(sm); d.appendChild(el);
    };
    const collapse = () => {
      document.querySelectorAll('.step-b .why').forEach(e => wrapMore(e, '¿Por qué este paso?'));
      document.querySelectorAll('.step-b .note.extra').forEach(e => wrapMore(e, 'Nota'));
      document.querySelectorAll('aside p.hint').forEach(e => { if (e.textContent.length > 90) wrapMore(e, 'Más información'); });
    };
    collapse();
    new MutationObserver(() => requestAnimationFrame(collapse)).observe(main, { childList: true, subtree: true });
  }
})();
