/* Guardar el ejercicio en PDF.
   Se carga al final de cada calculadora. Añade un botón antes del pie, captura la página
   bloque a bloque (cabecera, datos, resumen, dibujos y cada paso) con html2canvas, la monta en
   A4 con jsPDF y la ofrece al alumno con la capacidad «downloads» del portal. Dentro de Claude nunca
   descarga directamente (el marco no lo permite y se perderían los datos); fuera de Claude
   (versión web) usa la descarga normal del navegador. */
(function () {
  'use strict';
  const LIBS = [
    'lib/html2canvas.min.js',
    'lib/jspdf.umd.min.js'
  ];
  const footer = document.querySelector('main footer') || document.querySelector('footer');
  if (!footer) return;

  const css = document.createElement('style');
  css.textContent =
    '.pdfbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:14px 16px}' +
    '.pdfbar p{margin:0;flex:1 1 240px;font-size:13.5px;color:var(--muted)}' +
    '.pdfbar button{font-family:var(--sans);font-size:14px;font-weight:600;border:1px solid var(--accent);background:var(--accent);color:var(--panel);padding:9px 16px;border-radius:4px;cursor:pointer}' +
    '.pdfbar button:disabled{opacity:.5;cursor:wait}' +
    '.pdfbar .msg{flex-basis:100%;font-size:13px;margin:0}' +
    '.pdfbar .msg.bad{color:var(--bad)}' +
    '.pdfbar .webbtn,.pdfbar .sharebtn{display:inline-block;margin-top:10px;font:600 14px var(--sans);color:var(--panel);background:var(--ink);border:1px solid var(--ink);border-radius:4px;padding:9px 16px;text-decoration:none;cursor:pointer}' +
    /* Modo captura: una columna de ancho fijo, sin elementos de interfaz */
    '.pdfcap{max-width:820px!important;width:820px!important}' +
    '.pdfcap .grid{grid-template-columns:1fr!important}' +
    '.pdfcap aside{position:static!important}' +
    '.pdfcap .mode,.pdfcap .hint,.pdfcap #clear,.pdfcap details,.pdfcap .pdfbar,.pdfcap a[href^="index.html"]{display:none!important}';
  document.head.appendChild(css);

  const bar = document.createElement('div');
  bar.className = 'pdfbar';
  bar.innerHTML = '<p>Guarda tu predimensionado con los datos, todos los pasos y los dibujos en un PDF para consultarlo o entregarlo.</p>' +
    '<button type="button" id="pdfbtn">Guardar el ejercicio en PDF</button><p class="msg" id="pdfmsg" role="status"></p>';
  footer.parentNode.insertBefore(bar, footer);
  /* Conserva los datos escritos durante la sesión de esta pestaña: si la página se recarga,
     se recuperan. Se borran al cerrar la pestaña y con «Limpiar datos». */
  const KEY = 'predim:' + location.pathname;
  const fields = () => Array.from(document.querySelectorAll('input[id],select[id]')).filter(el => el.id !== 'practica' && el.type !== 'file');
  function store() {
    try { const o = {}; fields().forEach(el => { o[el.id] = el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value; }); sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ }
  }
  (function restore() {
    let o = null;
    const m = /^#d=(.*)$/.exec(location.hash || '');
    if (m) { try { o = JSON.parse(decodeURIComponent(m[1])); } catch (e) { o = null; } try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
    if (!o) { try { o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { o = null; } }
    if (!o) return;
    let any = false;
    fields().forEach(el => { if (!(el.id in o)) return; if (el.type === 'checkbox') el.checked = o[el.id] === '1'; else el.value = o[el.id]; any = true; });
    if (any) { const el = fields().find(x => x.value !== '') || fields()[0]; if (el) el.dispatchEvent(new Event('input', { bubbles: true })); fields().forEach(x => x.dispatchEvent(new Event('change', { bubbles: true }))); }
  })();
  document.addEventListener('input', store, true);
  document.addEventListener('change', store, true);
  const clr = document.getElementById('clear');
  if (clr) clr.addEventListener('click', () => { setTimeout(() => { try { sessionStorage.removeItem(KEY); } catch (e) {} }, 0); });

  const btn = bar.querySelector('#pdfbtn'), msg = bar.querySelector('#pdfmsg');
  const say = (t, bad) => { msg.textContent = t; msg.className = 'msg' + (bad ? ' bad' : ''); };

  /* Dirección de la versión web del portal (GitHub Pages). Si se rellena, se ofrece cuando
     la descarga no está permitida dentro de Claude (alumnos fuera de la organización). */
  const WEB_URL = 'https://jamesvm3.github.io/Construccion/';
  let inFrame = false; try { inFrame = window.top !== window.self; } catch (e) { inFrame = true; }
  const IN_CLAUDE = inFrame || !!window.claude;
  let dlPromise = null;
  function getDownloads() {
    if (!dlPromise) {
      dlPromise = (window.claude && typeof window.claude.use === 'function')
        ? Promise.resolve(window.claude.use('downloads')).catch(() => null)
        : Promise.resolve(null);
    }
    return dlPromise;
  }
  getDownloads();
  function webLink() {
    const o = {}; fields().forEach(el => { const v = el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value; if (v !== '') o[el.id] = v; });
    const page = (location.pathname.replace(/^.*\//, '') || 'index.html');
    return WEB_URL + page + '#d=' + encodeURIComponent(JSON.stringify(o));
  }
  function noDownload() {
    msg.className = 'msg';
    msg.innerHTML = 'Desde aquí no se puede guardar el archivo (Claude solo permite descargas a los miembros de la organización). Ábrelo en la versión web: se abre con tus datos ya escritos y allí pulsas de nuevo «Guardar el ejercicio en PDF».' +
      '<br><a class="webbtn" href="' + webLink() + '" target="_blank" rel="noopener">Abrir este ejercicio en la versión web</a>';
  }

  function load(src) {
    return new Promise((ok, ko) => {
      if (document.querySelector('script[src="' + src + '"]')) return ok();
      const s = document.createElement('script');
      const t = setTimeout(() => { s.remove(); ko(new Error('Tiempo agotado: ' + src)); }, 20000);
      s.src = src; s.onload = () => { clearTimeout(t); ok(); }; s.onerror = () => { clearTimeout(t); s.remove(); ko(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(s);
    });
  }

  function slug(t) {
    return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/^predimensionado (de |del )?/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ejercicio';
  }

  async function makePdf() {
    for (const s of LIBS) await load(s);
    const { jsPDF } = window.jspdf;
    const wrap = document.querySelector('.wrap');
    const root = document.documentElement;
    const prevTheme = root.getAttribute('data-theme');
    const hadPractice = wrap.classList.contains('practice');
    root.setAttribute('data-theme', 'light');
    wrap.classList.remove('practice');
    wrap.classList.add('pdfcap');
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 120));
    try {
      const blocks = [];
      const head = wrap.querySelector('header'); if (head) blocks.push(head);
      wrap.querySelectorAll('aside > .box').forEach(b => blocks.push(b));
      const sum = wrap.querySelector('#summary'); if (sum) blocks.push(sum);
      const dr = wrap.querySelector('.drawing'); if (dr) blocks.push(dr);
      wrap.querySelectorAll('main article.step').forEach(b => { if (b.offsetParent !== null) blocks.push(b); });
      blocks.push(footer);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const PW = 210, PH = 297, M = 12, W = PW - 2 * M, TOP = M, BOT = PH - M - 6;
      let y = TOP;
      const h1 = wrap.querySelector('h1'); let title = document.title;
      if (h1) { const c = h1.cloneNode(true); c.querySelectorAll('small').forEach(x => x.remove()); title = c.textContent.trim() || title; }
      const fecha = new Date().toLocaleDateString('es-ES');
      for (const el of blocks) {
        const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        const ratio = W / canvas.width;              // mm por px
        let hmm = canvas.height * ratio;
        if (hmm <= BOT - TOP) {
          if (y + hmm > BOT) { pdf.addPage(); y = TOP; }
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', M, y, W, hmm);
          y += hmm + 4;
        } else {
          /* bloque más alto que una página: se corta en trozos */
          if (y > TOP) { pdf.addPage(); y = TOP; }
          const sliceH = Math.floor((BOT - TOP) / ratio);
          for (let sy = 0; sy < canvas.height; sy += sliceH) {
            const h = Math.min(sliceH, canvas.height - sy);
            const c = document.createElement('canvas'); c.width = canvas.width; c.height = h;
            c.getContext('2d').drawImage(canvas, 0, sy, canvas.width, h, 0, 0, canvas.width, h);
            if (sy > 0) { pdf.addPage(); y = TOP; }
            pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', M, y, W, h * ratio);
            y += h * ratio + 4;
          }
        }
      }
      const n = pdf.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8); pdf.setTextColor(110);
        pdf.text('Predimensionado de estructuras · ' + title + ' · ' + fecha, M, PH - 7);
        pdf.text(i + ' / ' + n, PW - M, PH - 7, { align: 'right' });
      }
      const name = slug(title) + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
      return { blob: pdf.output('blob'), name };
    } finally {
      wrap.classList.remove('pdfcap');
      if (hadPractice) wrap.classList.add('practice');
      if (prevTheme === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', prevTheme);
    }
  }

  function browserSave(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  btn.addEventListener('click', async () => {
    const sm = document.getElementById('summary');
    if (sm && /Sin datos/i.test(sm.textContent)) { say('Introduce primero los datos del ejercicio.', true); return; }
    btn.disabled = true; say('Preparando el PDF…');
    let out;
    try { out = await makePdf(); }
    catch (e) { btn.disabled = false; say('No se ha podido generar el PDF. Comprueba la conexión y vuelve a intentarlo.', true); return; }
    const downloads = await getDownloads();
    try {
      if (downloads) {
        await downloads.save({ filename: out.name, data: out.blob });
        say('PDF guardado: ' + out.name);
      } else if (!IN_CLAUDE) {
        let file = null; try { file = new File([out.blob], out.name, { type: 'application/pdf' }); } catch (e) { file = null; }
        const mobile = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
        if (mobile && file && navigator.canShare && navigator.canShare({ files: [file] })) {
          msg.className = 'msg';
          msg.innerHTML = 'PDF listo: ' + out.name + '<br><button type="button" class="sharebtn" id="pdfshare">Enviar o guardar el PDF</button> <button type="button" class="sharebtn" id="pdfdl" style="background:transparent;color:var(--ink)">Descargar</button>';
          document.getElementById('pdfshare').addEventListener('click', async () => {
            try { await navigator.share({ files: [file], title: out.name }); }
            catch (e2) { if (!e2 || e2.name !== 'AbortError') { browserSave(out.blob, out.name); } }
          });
          document.getElementById('pdfdl').addEventListener('click', () => browserSave(out.blob, out.name));
        } else {
          browserSave(out.blob, out.name);
          say('PDF generado: ' + out.name);
        }
      } else {
        noDownload();
      }
    } catch (e) {
      const c = e && e.code;
      if (c === 'declined') say('Guardado cancelado.');
      else if (c === 'rate_limited') say('Ya hay una descarga pendiente de confirmar.', true);
      else if (!IN_CLAUDE) { try { browserSave(out.blob, out.name); say('PDF generado: ' + out.name); } catch (e2) { say('No se ha podido guardar el PDF en este navegador.', true); } }
      else noDownload();
    }
    btn.disabled = false;
  });
})();
