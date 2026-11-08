/* Portal «Predimensionado de estructuras».
   Primer nivel: material (H hormigón, A acero, M madera), elegido con #H, #A o #M en la dirección.
   Cada herramienta lleva mat (por defecto H).
   Un solo archivo con tres piezas: el catálogo de herramientas (CARDS), la plantilla de la
   página (buildDoc) y el comportamiento. La configuración (qué herramientas ve el alumnado)
   vive en el bloque JSON #state de index.html y la guarda el propietario republicando la página.
   Para añadir una herramienta nueva: añadir una entrada a CARDS y subir su .html. Nace oculta. */

const MATS = [
  { id: 'H', name: 'Hormigón', icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="40" y="12" width="60" height="76"/><g fill="var(--ink)"><circle cx="50" cy="22" r="3.2"/><circle cx="90" cy="22" r="3.2"/><circle cx="50" cy="78" r="3.6"/><circle cx="63" cy="78" r="3.6"/><circle cx="77" cy="78" r="3.6"/><circle cx="90" cy="78" r="3.6"/></g><rect x="45" y="17" width="50" height="66" fill="none" stroke="var(--ink)" stroke-width="1.2"/></svg>' },
  { id: 'A', name: 'Acero', icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><path class="ic-a" d="M38 12 H102 V22 H75 V78 H102 V88 H38 V78 H65 V22 H38 Z"/></svg>' },
  { id: 'M', name: 'Madera', icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-m" x="44" y="10" width="52" height="80"/><g fill="none" stroke="var(--wood-edge)" stroke-width="1.1"><path d="M44 30 Q70 22 96 32"/><path d="M44 48 Q70 40 96 50"/><path d="M44 66 Q70 58 96 68"/><ellipse cx="62" cy="57" rx="4" ry="2.5"/></g></svg>' }
];

const CODES={zapata:'ZC',medianera:'ZM',esquina:'ZE',combinada:'ZCb',centradora:'VC',atado:'VAT',losa:'LC','losa-ampliacion':'LC+',pilotes:'PI',encepado:'EN',muro:'MS',contencion:'MC',unidireccional:'FU',reticular:'FR',viga:'VH',pilar:'PH','viga-acero':'VA','pilar-acero':'SA',basa:'BA',soldadura:'SO',tirante:'TA','viga-madera':'VM','pilar-madera':'SM','fuego-madera':'FM',pantalla:'MP'};
const BAND={H:'var(--band-h)',A:'var(--band-a)',M:'var(--band-m)'}, CODEBG={H:'#c9c9c9',A:'#6d9bd1',M:'#d9a784'};
const CARDS = [
  { id: 'zapata', group: 'Cimentaciones superficiales', title: 'Zapata centrada', href: 'zapata.html', proceso: 'proceso-zapata.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="54" y="14" width="14" height="40"/><rect class="ic-c" x="21" y="54" width="80" height="20"/><g transform="translate(96 5) scale(1.3)"><rect x="0" y="0" width="28" height="28" fill="none" stroke="var(--concrete-edge)" stroke-width="1" stroke-dasharray="2 2"/><rect class="ic-c" x="4" y="4" width="20" height="20"/><rect x="11" y="11" width="6" height="6" fill="var(--ink)"/></g></svg>' },
  { id: 'medianera', group: 'Cimentaciones superficiales', title: 'Zapata de medianera', href: 'medianera.html', proceso: 'proceso-medianera.html#medianera',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="29" y="14" width="14" height="40"/><rect class="ic-c" x="29" y="54" width="66" height="20"/><g transform="translate(96 5) scale(1.3)"><rect x="0" y="0" width="28" height="28" fill="none" stroke="var(--concrete-edge)" stroke-width="1" stroke-dasharray="2 2"/><line x1="3" y1="2" x2="3" y2="26" stroke="var(--ink)" stroke-width="2"/><rect class="ic-c" x="4" y="2" width="14" height="24"/><rect x="4" y="11" width="6" height="6" fill="var(--ink)"/></g></svg>' },
  { id: 'esquina', group: 'Cimentaciones superficiales', title: 'Zapata de esquina', href: 'esquina.html', proceso: 'proceso-medianera.html#esquina',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="29" y="14" width="14" height="40"/><rect class="ic-c" x="29" y="54" width="66" height="20"/><g transform="translate(96 5) scale(1.3)"><rect x="0" y="0" width="28" height="28" fill="none" stroke="var(--concrete-edge)" stroke-width="1" stroke-dasharray="2 2"/><path d="M3 2 V25 H26" fill="none" stroke="var(--ink)" stroke-width="2"/><rect class="ic-c" x="4" y="6" width="19" height="19"/><rect x="4" y="19" width="6" height="6" fill="var(--ink)"/></g></svg>' },
  { id: 'combinada', group: 'Cimentaciones superficiales', title: 'Zapata combinada', href: 'combinada.html', proceso: 'proceso-combinada.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="33" y="14" width="14" height="40"/><rect class="ic-c" x="75" y="14" width="14" height="40"/><rect class="ic-c" x="14" y="54" width="94" height="20"/><g transform="translate(96 5) scale(1.3)"><rect x="0" y="0" width="28" height="28" fill="none" stroke="var(--concrete-edge)" stroke-width="1" stroke-dasharray="2 2"/><rect class="ic-c" x="2" y="8" width="24" height="12"/><rect x="6" y="11" width="5" height="5" fill="var(--ink)"/><rect x="17" y="11" width="5" height="5" fill="var(--ink)"/></g></svg>' },
  { id: 'centradora', group: 'Cimentaciones superficiales', title: 'Viga centradora', href: 'centradora.html', proceso: 'proceso-vigas.html#centradora',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="16" y="14" width="14" height="40"/><rect class="ic-c" x="16" y="54" width="38" height="20"/><rect class="ic-c" x="97" y="14" width="14" height="40"/><rect class="ic-c" x="85" y="54" width="38" height="20"/><rect class="ic-c" x="54" y="54" width="31" height="12"/></svg>' },
  { id: 'atado', group: 'Cimentaciones superficiales', title: 'Viga de atado', href: 'atado.html', proceso: 'proceso-vigas.html#atado',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="28" y="14" width="14" height="40"/><rect class="ic-c" x="16" y="54" width="38" height="20"/><rect class="ic-c" x="97" y="14" width="14" height="40"/><rect class="ic-c" x="85" y="54" width="38" height="20"/><rect class="ic-c" x="54" y="56" width="31" height="8"/></svg>' },
  { id: 'losa', group: 'Cimentaciones superficiales', title: 'Losa de cimentación', href: 'losa.html', proceso: 'proceso-losa.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="24" y="14" width="14" height="40"/><rect class="ic-c" x="63" y="14" width="14" height="40"/><rect class="ic-c" x="102" y="14" width="14" height="40"/><rect class="ic-c" x="10" y="54" width="120" height="16"/></svg>' },
  { id: 'losa-ampliacion', group: 'Cimentaciones superficiales', title: 'Losa (ampliación)', href: 'losa-ampliacion.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="24" y="14" width="14" height="40"/><rect class="ic-c" x="63" y="14" width="14" height="40"/><rect class="ic-c" x="102" y="14" width="14" height="40"/><path class="ic-c" d="M10 54 H130 V70 H120 L116 78 H102 L98 70 H81 L77 78 H63 L59 70 H42 L38 78 H24 L20 70 H10 Z"/></svg>' },
  { id: 'pilotes', group: 'Cimentaciones profundas', title: 'Pilotes', href: 'pilotes.html', proceso: 'proceso-pilotes.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-s" x="10" y="36" width="120" height="56"/><rect class="ic-c" x="63" y="36" width="14" height="56"/><line x1="66" y1="40" x2="66" y2="88" stroke="var(--concrete-edge)" stroke-dasharray="3 2"/><line x1="74" y1="40" x2="74" y2="88" stroke="var(--concrete-edge)" stroke-dasharray="3 2"/><rect class="ic-c" x="50" y="20" width="40" height="16"/></svg>' },
  { id: 'encepado', group: 'Cimentaciones profundas', title: 'Encepado', href: 'encepado.html', proceso: 'proceso-pilotes.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-s" x="10" y="56" width="120" height="36"/><rect class="ic-c" x="63" y="14" width="14" height="22"/><rect class="ic-c" x="24" y="36" width="92" height="20"/><rect class="ic-c" x="36" y="56" width="14" height="36"/><rect class="ic-c" x="90" y="56" width="14" height="36"/></svg>' },
  { id: 'muro', group: 'Muros de contención', title: 'Muro de sótano', href: 'muro.html', proceso: 'proceso-muro.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-s" x="60" y="20" width="64" height="52"/><rect class="ic-c" x="14" y="12" width="46" height="8"/><rect class="ic-c" x="44" y="20" width="16" height="52"/><rect class="ic-c" x="30" y="72" width="64" height="14"/></svg>' },
  { id: 'contencion', group: 'Muros de contención', title: 'Muro de contención', href: 'contencion.html', proceso: 'proceso-contencion.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-s" x="58" y="26" width="66" height="46"/><rect class="ic-c" x="44" y="14" width="14" height="58"/><rect class="ic-c" x="22" y="72" width="100" height="14"/></svg>' },
  { id: 'pantalla', group: 'Muros de contención', title: 'Muro pantalla', href: 'pantalla.html', proceso: 'proceso-pantalla.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-s" x="58" y="12" width="68" height="84"/><rect class="ic-s" x="14" y="72" width="36" height="24"/><line x1="58" y1="26" x2="104" y2="49" stroke="var(--steel-edge)" stroke-width="1.8"/><ellipse cx="108" cy="51" rx="9" ry="3.6" transform="rotate(26 108 51)" fill="var(--concrete)" stroke="var(--concrete-edge)" stroke-width="1.2"/><rect class="ic-c" x="50" y="10" width="8" height="86"/><rect class="ic-c" x="47.5" y="6" width="13" height="7"/><rect x="43" y="23.5" width="7" height="5" fill="var(--steel)" stroke="var(--steel-edge)" stroke-width="1"/></svg>' },
  { id: 'unidireccional', group: 'Estructura', title: 'Forjado unidireccional', href: 'unidireccional.html', proceso: 'proceso-unidireccional.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="14" y="16" width="112" height="68"/><rect x="14" y="10" width="112" height="10" fill="var(--concrete-edge)" fill-opacity=".6" stroke="var(--concrete-edge)"/><rect x="14" y="80" width="112" height="10" fill="var(--concrete-edge)" fill-opacity=".6" stroke="var(--concrete-edge)"/><rect x="24.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><rect x="40.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><rect x="56.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><rect x="72.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><rect x="88.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><rect x="104.5" y="22" width="11" height="56" fill="var(--soil)" stroke="var(--soil-edge)" stroke-width=".8"/><line x1="22" y1="20" x2="22" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="38" y1="20" x2="38" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="54" y1="20" x2="54" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="70" y1="20" x2="70" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="86" y1="20" x2="86" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="102" y1="20" x2="102" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><line x1="118" y1="20" x2="118" y2="80" stroke="var(--concrete-edge)" stroke-width="2.4"/><rect x="14" y="8" width="12" height="14" fill="var(--ink)"/><rect x="14" y="78" width="12" height="14" fill="var(--ink)"/><rect x="116" y="8" width="12" height="14" fill="var(--ink)"/><rect x="116" y="78" width="12" height="14" fill="var(--ink)"/></svg>' },
  { id: 'reticular', group: 'Estructura', title: 'Forjado reticular', href: 'reticular.html', proceso: 'proceso-reticular.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="18" y="8" width="104" height="84"/><rect x="22" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="22" y="28" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="22" y="44" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="22" y="60" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="22" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="39" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="39" y="28" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="39" y="44" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="39" y="60" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="39" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="56" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="56" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="73" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="73" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="90" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="90" y="28" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="90" y="44" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="90" y="60" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="90" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="107" y="12" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="107" y="28" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="107" y="44" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="107" y="60" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="107" y="76" width="13" height="12" fill="var(--soft)" fill-opacity=".55" stroke="var(--concrete-edge)" stroke-width="1"/><rect x="62" y="44" width="16" height="12" fill="var(--ink)"/></svg>' },
  { id: 'viga', group: 'Estructura', title: 'Viga', href: 'viga.html', proceso: 'proceso-viga.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect x="10" y="28" width="120" height="18" fill="var(--concrete-edge)" fill-opacity=".6" stroke="var(--concrete-edge)" stroke-width="1.2"/><rect class="ic-c" x="22" y="46" width="14" height="46"/><rect class="ic-c" x="104" y="46" width="14" height="46"/></svg>' },
  { id: 'pilar', group: 'Estructura', title: 'Pilar', href: 'pilar.html', proceso: 'proceso-pilar.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="38" y="14" width="64" height="10"/><rect x="63" y="24" width="14" height="56" fill="var(--concrete-edge)" fill-opacity=".6" stroke="var(--concrete-edge)" stroke-width="1.2"/><rect class="ic-c" x="38" y="80" width="64" height="10"/></svg>' },
  { id: 'viga-acero', mat: 'A', group: 'Vigas y soportes', title: 'Viga', href: 'viga-acero.html', proceso: 'proceso-acero.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-a" x="14" y="40" width="112" height="22"/><line x1="14" y1="44" x2="126" y2="44" stroke="var(--steel-edge)" stroke-width="1"/><line x1="14" y1="58" x2="126" y2="58" stroke="var(--steel-edge)" stroke-width="1"/><path d="M24 62 l-8 13 h16 z M116 62 l-8 13 h16 z" fill="none" stroke="var(--ink)" stroke-width="1.4"/><g stroke="var(--steel-edge)" stroke-width="1.1"><line x1="30" y1="22" x2="30" y2="36"/><line x1="55" y1="22" x2="55" y2="36"/><line x1="80" y1="22" x2="80" y2="36"/><line x1="105" y1="22" x2="105" y2="36"/><line x1="22" y1="22" x2="118" y2="22"/></g></svg>' },
  { id: 'pilar-acero', mat: 'A', group: 'Vigas y soportes', title: 'Soporte (pandeo)', href: 'pilar-acero.html', proceso: 'proceso-acero.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><path class="ic-a" d="M50 10 H90 V16 H73 V84 H90 V90 H50 V84 H67 V16 H50 Z"/><path d="M104 12 Q122 50 104 88" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-dasharray="5 3"/></svg>' },
  { id: 'basa', mat: 'A', group: 'Uniones', title: 'Basa', href: 'basa.html', proceso: 'proceso-acero.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-c" x="20" y="66" width="100" height="24"/><rect class="ic-a" x="34" y="58" width="72" height="8"/><path class="ic-a" d="M54 12 H86 V17 H72 V58 H68 V17 H54 Z"/><g stroke="var(--ink)" stroke-width="2"><line x1="42" y1="52" x2="42" y2="86"/><line x1="98" y1="52" x2="98" y2="86"/></g></svg>' },
  { id: 'soldadura', mat: 'A', group: 'Uniones', title: 'Soldadura', href: 'soldadura.html', proceso: 'proceso-acero.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-a" x="18" y="64" width="104" height="14"/><rect class="ic-a" x="62" y="14" width="16" height="50"/><path d="M78 64 L94 64 L78 48 Z M62 64 L46 64 L62 48 Z" fill="var(--warn)" stroke="var(--warn)" stroke-width="1"/></svg>' },
  { id: 'tirante', mat: 'A', group: 'Arriostramiento', title: 'Tirante', href: 'tirante.html', proceso: 'proceso-acero.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-a" x="24" y="14" width="8" height="76"/><rect class="ic-a" x="108" y="14" width="8" height="76"/><rect class="ic-a" x="24" y="12" width="92" height="7"/><line x1="32" y1="19" x2="108" y2="88" stroke="var(--accent)" stroke-width="3"/><line x1="108" y1="19" x2="32" y2="88" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/></svg>' },
  { id: 'viga-madera', mat: 'M', group: 'Vigas y soportes', title: 'Viga', href: 'viga-madera.html', proceso: 'proceso-madera.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-m" x="14" y="38" width="112" height="24"/><g fill="none" stroke="var(--wood-edge)" stroke-width=".9" opacity=".7"><path d="M14 46 Q60 42 126 47"/><path d="M14 54 Q70 50 126 55"/></g><path d="M24 62 l-8 13 h16 z M116 62 l-8 13 h16 z" fill="none" stroke="var(--ink)" stroke-width="1.4"/><g stroke="var(--wood-edge)" stroke-width="1.1"><line x1="30" y1="20" x2="30" y2="34"/><line x1="55" y1="20" x2="55" y2="34"/><line x1="80" y1="20" x2="80" y2="34"/><line x1="105" y1="20" x2="105" y2="34"/><line x1="22" y1="20" x2="118" y2="20"/></g></svg>' },
  { id: 'pilar-madera', mat: 'M', group: 'Vigas y soportes', title: 'Soporte', href: 'pilar-madera.html', proceso: 'proceso-madera.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect class="ic-m" x="58" y="10" width="24" height="80"/><g fill="none" stroke="var(--wood-edge)" stroke-width=".9" opacity=".7"><path d="M64 10 Q62 50 65 90"/><path d="M74 10 Q77 50 74 90"/></g><path d="M100 12 Q118 50 100 88" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-dasharray="5 3"/></svg>' },
  { id: 'fuego-madera', mat: 'M', group: 'Incendio', title: 'Resistencia al fuego', href: 'fuego-madera.html', proceso: 'proceso-madera.html',
    icon: '<svg viewBox="0 0 140 100" aria-hidden="true" focusable="false"><rect x="40" y="18" width="60" height="70" fill="var(--char,#3b3330)" opacity=".85"/><rect class="ic-m" x="50" y="18" width="40" height="60"/><rect class="ic-c" x="28" y="10" width="84" height="8"/><path d="M58 96 q-6 -10 2 -16 q-1 7 5 9 q0 -8 6 -12 q-1 8 5 12 q4 -4 3 -9 q7 7 1 16 z" fill="var(--bad)" opacity=".85"/></svg>' }
];

const RESET = ':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';

const CSS = `
/* Layout: cabecera + rejilla de fichas agrupadas por tema; el propietario ve además una barra de configuración. */
:root{
  --bg:#eef0ee; --panel:#ffffff; --ink:#1d2428; --muted:#5b666b; --line:#cfd5d3;
  --soft:#f5f7f6; --accent:#1f5f7a; --accent-soft:#e1edf2; --warn:#a86608; --warn-soft:#fbefd9;
  --ok:#2f7a45; --ok-soft:#e3f1e7; --bad:#b0392b; --bad-soft:#f8e3e0;
  --concrete:#d9dcd8; --concrete-edge:#8e9692; --soil:#e8dcc3; --soil-edge:#b9a77d;
  --steel:#c3ccd4; --steel-edge:#5d6b77; --wood:#e6cc9f; --wood-edge:#a07a48;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  --sans:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --cond:"IBM Plex Sans Condensed","IBM Plex Sans",system-ui,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    color-scheme:dark;
    --bg:#141a1d; --panel:#1c2427; --ink:#e4e9e7; --muted:#9aa6a8; --line:#34403f;
    --soft:#222c2f; --accent:#6db3d1; --accent-soft:#1d3642; --warn:#e3a849; --warn-soft:#3a2d15;
    --ok:#6cc488; --ok-soft:#1c3325; --bad:#e5705f; --bad-soft:#3d1f1b;
    --concrete:#3a4446; --concrete-edge:#6e7b7d; --soil:#3b3626; --soil-edge:#7a6a46; --steel:#46525c; --steel-edge:#8a99a6; --wood:#4d3b25; --wood-edge:#9b7a50;
  }
}
:root[data-theme="dark"]{
  color-scheme:dark;
  --bg:#141a1d; --panel:#1c2427; --ink:#e4e9e7; --muted:#9aa6a8; --line:#34403f;
  --soft:#222c2f; --accent:#6db3d1; --accent-soft:#1d3642; --warn:#e3a849; --warn-soft:#3a2d15;
  --ok:#6cc488; --ok-soft:#1c3325; --bad:#e5705f; --bad-soft:#3d1f1b;
  --concrete:#3a4446; --concrete-edge:#6e7b7d; --soil:#3b3626; --soil-edge:#7a6a46; --steel:#46525c; --steel-edge:#8a99a6; --wood:#4d3b25; --wood-edge:#9b7a50;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.5;margin:0;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wrap{max-width:980px;margin:0 auto;padding-block:28px 60px}
header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 20px;border-bottom:2px solid var(--ink);padding-bottom:14px;margin-bottom:26px}
header>div{min-width:0}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
h1{font-family:var(--cond);font-weight:700;font-size:clamp(30px,5vw,44px);line-height:1.05;margin:4px 0 8px;text-wrap:balance;letter-spacing:-.01em}
.lead{margin:0;color:var(--muted);max-width:62ch;font-size:14.5px}
button{font-family:var(--sans);font-size:13px;border:1px solid var(--accent);background:var(--accent);color:var(--panel);padding:7px 14px;border-radius:4px;cursor:pointer}
button.ghost{background:transparent;color:var(--accent)}
button:disabled{opacity:.45;cursor:not-allowed}
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.adminbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:var(--warn-soft);border:1px solid var(--warn);border-radius:6px;padding:12px 14px;margin-bottom:22px}
.adminbar p{margin:0;font-size:13.5px;flex:1 1 260px;min-width:0}
.adminbar .btns{display:flex;gap:8px;flex-wrap:wrap}
.status{flex-basis:100%;font-size:13px;margin:0}
.status.bad{color:var(--bad)}
section{margin-bottom:28px}
h2{font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
.card{display:flex;flex-direction:column;gap:10px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px;color:inherit;text-decoration:none}
a.card:hover{border-color:var(--accent)}
a.card:focus-visible{outline-offset:3px}
.card h3{font-family:var(--cond);font-size:19px;line-height:1.15;margin:0;font-weight:700;text-align:center;text-wrap:balance}
.ico{background:var(--soft);border-radius:4px;padding:8px}
.ico svg{display:block;width:100%;height:auto}
.ic-c{fill:var(--concrete);stroke:var(--concrete-edge);stroke-width:1.2}
.ic-s{fill:var(--soil);stroke:var(--soil-edge);stroke-width:1.2}
.ic-a{fill:var(--steel);stroke:var(--steel-edge);stroke-width:1.2}
.ic-m{fill:var(--wood);stroke:var(--wood-edge);stroke-width:1.2}
.mats{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:28px}
.mat{display:flex;flex-direction:column;gap:10px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:14px;color:inherit;text-decoration:none}
a.mat:hover{border-color:var(--accent)}
a.mat:hover .ico{background:var(--accent-soft)}
.mat h3{font-family:var(--cond);font-size:24px;line-height:1.1;margin:0;font-weight:700;text-align:center}
.mat h3 .l{font-family:var(--mono);font-size:15px;color:var(--accent);margin-left:6px}
.mat .n{font-family:var(--mono);font-size:12.5px;color:var(--muted);text-align:center}
.mat.soon{background:transparent;border-style:dashed}
.mat.soon .ico,.mat.soon h3{opacity:.55}
.crumb{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:-8px 0 22px}
.crumb{align-items:center!important}
.crumb a{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:14px;font-weight:600;color:var(--panel);background:var(--accent);border:1px solid var(--accent);border-radius:20px;padding:6px 14px 6px 11px;text-decoration:none}
.crumb a:hover{filter:brightness(1.12)}
.crumb b{font-family:var(--cond);font-size:22px}
.crumb b span{font-family:var(--mono);font-size:14px;color:var(--accent);margin-left:4px}
a.card:hover .ico{background:var(--accent-soft)}
.cardwrap{display:flex;flex-direction:column;gap:6px;min-width:0}
.cardwrap>a.card{flex:1}
.cardwrap>.go,.card .go.pr{font-family:var(--sans);font-size:12.5px;color:var(--ink);font-weight:600;text-decoration:none;text-align:center;border:1px solid var(--ink);border-radius:4px;padding:5px 10px}
.cardwrap>.go:hover,.card .go.pr:hover{background:var(--ink);color:#fff}
.card .go{font-family:var(--mono);font-size:12.5px;color:var(--accent);font-weight:500;text-decoration:none;text-align:center}
.card.off{background:transparent;border-style:dashed}
.card.off h3,.card.off .ico{opacity:.55}
.toggle{display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:500;padding-bottom:8px;border-bottom:1px solid var(--line);cursor:pointer}
.toggle input{width:20px;height:20px;accent-color:var(--accent);flex:none;margin:0}
.badge{font-family:var(--mono);font-size:11px;border-radius:20px;padding:2px 8px;margin-left:auto;white-space:nowrap}
.badge.on{background:var(--ok-soft);color:var(--ok)}
.badge.off{background:var(--bad-soft);color:var(--bad)}
.empty{background:var(--panel);border:1px dashed var(--line);border-radius:6px;padding:22px;color:var(--muted);font-size:14.5px}
footer{margin-top:10px;font-size:12.5px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}

/* Estética inspirada en las fichas de «Cálculo rápido de estructuras» (S. Mute): franjas de color por material, códigos en recuadro y barras negras. */
:root{--band-h:#dedede;--band-a:#b9cde5;--band-m:#e9cdb6;--beige:#efede4;--bar:#111;
  --sans:"Open Sans",system-ui,-apple-system,"Segoe UI",sans-serif;--cond:"Open Sans",system-ui,sans-serif;--mono:"Open Sans",system-ui,sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--band-h:#3a3f42;--band-a:#2c3d52;--band-m:#4a3a2c;--beige:#2a2a24;--bar:#000}}
:root[data-theme="dark"]{--band-h:#3a3f42;--band-a:#2c3d52;--band-m:#4a3a2c;--beige:#2a2a24;--bar:#000}
body{background:var(--panel)}
.wrap{padding-top:0}
header{display:block;border:0;margin:0 calc(50% - 50vw) 22px;padding:26px calc(50vw - 50% + 0px) 20px;background:var(--band-cur,var(--band-h))}
header>div{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.badge-big{flex:none;width:86px;height:86px;border:5px solid var(--ink);border-radius:16px;background:var(--accent-mute,#6d9bd1);display:grid;place-items:center;font:800 38px/1 var(--sans);color:var(--ink);letter-spacing:-.02em}
.htxt{min-width:0}
.eyebrow{font:400 14px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:right;margin-bottom:6px}
h1{font:800 clamp(28px,5vw,46px)/1.02 var(--sans);text-transform:uppercase;letter-spacing:-.01em;margin:0}
h1 small{display:block;font-weight:400;font-size:.6em;letter-spacing:0;margin-bottom:2px}
.lead{margin-top:10px;color:var(--ink);font-size:14.5px}
#btn-config{margin-top:12px}
section{margin-bottom:26px}
h2{background:var(--bar);color:#fff;font:700 15px var(--sans);letter-spacing:.04em;text-align:center;padding:6px 10px;margin:0 0 14px;border-radius:0}
.card{border:1px solid var(--line);border-radius:4px;padding:0;overflow:hidden;gap:0;background:var(--panel)}
.card .ch{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--band-cur,var(--band-h))}
.code{flex:none;min-width:34px;padding:0 4px;height:34px;border:2.5px solid var(--ink);border-radius:8px;display:grid;place-items:center;font:800 13.5px/1 var(--sans);background:var(--code-bg,#c9c9c9);color:var(--ink)}
.card h3{font:700 12.5px/1.15 var(--sans);min-width:0;overflow-wrap:normal;word-break:normal;hyphens:manual;text-align:left;text-transform:uppercase;letter-spacing:.01em}
.card .ico{border-radius:0;background:var(--panel);padding:10px 12px}
a.card:hover .ico{background:var(--beige)}
a.card:hover{border-color:var(--ink)}
.card .go{padding:0 0 10px}
.card .toggle{padding:8px 10px}
.crumb a{border-radius:6px}
.crumb b{font:800 22px var(--sans);text-transform:uppercase}
.mats{gap:14px}
.mat{padding:0;overflow:hidden;border-radius:4px;border:1px solid var(--line);gap:0}
.mat .mh{display:flex;align-items:center;gap:12px;padding:14px;background:var(--band-x)}
.mat .mh .code{width:52px;height:52px;border-width:4px;border-radius:12px;font-size:24px;background:var(--code-x)}
.mat h3{text-align:left;font:800 22px var(--sans);text-transform:uppercase}
.mat .ico{border-radius:0;background:var(--panel)}
.mat .n{padding:8px 0 12px;font-family:var(--sans)}
.mat.soon{background:var(--panel)}
.crumb a{background:var(--ink)!important;border-color:var(--ink)!important;color:var(--panel)!important;border-radius:6px}
@media (max-width:560px){.cards{grid-template-columns:1fr 1fr}.card .ch{padding:6px 7px;gap:7px}.card .ch .code{min-width:28px;height:28px;font-size:11.5px;border-width:2px;border-radius:6px}.card h3{font-size:11.5px}.badge-big{width:64px;height:64px;font-size:28px;border-width:4px;border-radius:12px}}
footer{background:var(--beige);border:0;padding:12px 14px;border-radius:2px;color:var(--ink)}
`;

function jsonForScript(state) {
  return JSON.stringify(state).replace(/</g, '\\u003c');
}

/* Documento del menú con el diseño Apple (lo que se publica al guardar la configuración). */
function inner(state) {
  return '<div class="shell">\n' +
    '  <nav class="sidebar glass" id="sidebar" aria-label="Materiales y herramientas"></nav>\n' +
    '  <div class="content">\n    <header class="navbar glass" id="navbar"></header>\n    <div class="wrap" id="app"></div>\n  </div>\n</div>\n' +
    '<nav class="tabbar glass" id="tabbar" aria-label="Materiales"></nav>\n<div class="scrim" id="scrim"></div>\n' +
    '<div class="sheet glass" id="sheet" role="dialog" aria-label="Herramientas"></div>\n' +
    '<script type="application/json" id="state">' + jsonForScript(state) + '</script>\n' +
    '<script src="app.js"></script>\n<script src="apple-nav.js"></script>\n';
}

function buildDoc(state) {
  return '<!DOCTYPE html>\n<html lang="es"><head><meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
    '<meta name="color-scheme" content="light dark">\n<title>Predimensionado</title>\n' +
    '<link rel="stylesheet" href="apple.css">\n</head><body data-page="menu">\n' + inner(state) + '</body></html>\n';
}

if (typeof module !== 'undefined') module.exports = { CARDS, inner, buildDoc };

(function () {
  if (typeof document === 'undefined') return;
  const app = document.getElementById('app');
  if (!app) return;

  function readState() {
    try {
      const s = JSON.parse(document.getElementById('state').textContent);
      if (s && Array.isArray(s.enabled)) return { enabled: s.enabled.filter(x => typeof x === 'string'), details: Array.isArray(s.details) ? s.details.filter(x => typeof x === 'string') : null };
    } catch (e) { /* se usa el valor por defecto */ }
    return { enabled: CARDS.map(c => c.id) };
  }

  let state = readState();
  let admin = false, canAdmin = false, art = null, busy = false;
  let draft = new Set(state.enabled);
  let msg = '', msgBad = false;
  const matOf = c => c.mat || 'H';
  function curMat() {
    let h = '';
    try { h = (location.hash || '').replace('#', '').toUpperCase(); } catch (e) { /* sin hash */ }
    return MATS.some(m => m.id === h) ? h : null;
  }
  function goMat(id) {
    try { location.hash = id || 'P'; } catch (e) { /* ignorar */ }
    render(); window.scrollTo(0, 0);
  }
  /* Portada: sin hash. #P = predimensionado (materiales), #H/#A/#M = un material */
  function isPortal() {
    try { return (location.hash || '').replace('#', '') === ''; } catch (e) { return true; }
  }
  function renderPortal() {
    const hero = el('header', 'phero');
    hero.append(el('div', 'eyebrow', 'Construcción · ETSIE y ETSA · Universidad de Granada'),
      el('h1', null, 'Herramientas de apoyo'),
      el('p', 'lead', 'Elige por dónde empezar: dimensionar un elemento o ver cómo se construye en obra.'));
    const cards = el('div', 'pcards');
    const mk = (cls, href, icon, title, text, cta) => {
      const a = el('a', 'pcard ' + cls); a.href = href;
      const i = el('div', 'pico'); i.innerHTML = icon;
      a.append(i, el('h2', null, title), el('p', null, text), el('span', 'pgo', cta));
      return a;
    };
    cards.append(
      mk('p-calc', '#P', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 7.5h7M8.5 12h2M13.5 12h2M8.5 16h2M13.5 16h2"/></svg>',
        'Predimensionado', 'Calculadoras con el paso a paso y la normativa: cimentaciones, muros y estructura. Incluye el proceso constructivo de cada elemento.', 'Calcular →'),
      mk('p-det', 'detalles.html', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 20v-5h12v5M9 15V5h6v10"/><path d="M5 11h3M16 11h3" /></svg>',
        'Detalle constructivo', 'Dibujos para recorrer paso a paso, pulsar cada elemento y autoevaluarte: armado, juntas, impermeabilización y drenaje.', 'Ver detalles →'));
    app.append(hero, cards);
    app.append(el('footer', null, '© 2026 Jaime Vergara Muñoz · Universidad de Granada. Material docente de apoyo; no sustituye al CTE ni al proyecto.'));
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  // Al entrar desde otra herramienta o al volver atrás, empezar siempre arriba
  try { history.scrollRestoration = 'manual'; } catch (e) { /* sin soporte */ }
  window.addEventListener('pageshow', () => window.scrollTo(0, 0));

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function changed() {
    const a = new Set(state.enabled);
    if (a.size !== draft.size) return true;
    for (const id of draft) if (!a.has(id)) return true;
    return false;
  }

  function cardBody(c) {
    const i = el('div', 'ico'); i.innerHTML = c.icon;
    const h = el('div', 'ch'); const k = el('span', 'code', CODES[c.id] || '··');
    const m = c.mat || 'H'; h.style.setProperty('--band-cur', BAND[m]); k.style.setProperty('--code-bg', CODEBG[m]);
    h.append(k, el('h3', null, c.title));
    return [h, i];
  }

  function render() {
    app.textContent = '';
    document.body.classList.toggle('portal', isPortal());
    if (isPortal()) { renderPortal(); return; }
    const head = el('header');
    const left = el('div');
    const bb = el('div', 'badge-big', curMat() || 'PE');
    const mm = curMat(); if (mm) { head.style.setProperty('--band-cur', BAND[mm]); bb.style.background = CODEBG[mm]; }
    const t1 = el('h1'); t1.innerHTML = '<small>Construcción · ETSIE y ETSA · UGR</small>Predimensionado de estructuras';
    const tx = el('div', 'htxt'); tx.append(t1,
      el('p', 'lead', curMat() ? 'Pulsa el elemento que vas a calcular. Cada herramienta te guía paso a paso y puedes volver a este menú desde la parte superior de cada una.' : 'Elige primero el material y después el elemento que vas a calcular.'));
    left.append(bb, tx);
    head.append(left);
    if (canAdmin && !admin) {
      const b = el('button', 'ghost', 'Configurar herramientas');
      b.id = 'btn-config';
      b.addEventListener('click', () => { admin = true; draft = new Set(state.enabled); msg = ''; render(); });
      head.append(b);
    }
    app.append(head);

    if (admin) {
      const bar = el('div', 'adminbar');
      bar.append(el('p', null, 'Modo configuración. Marca las herramientas que debe ver el alumnado y pulsa Guardar. Las herramientas nuevas empiezan ocultas.'));
      const btns = el('div', 'btns');
      const save = el('button', null, busy ? 'Guardando…' : 'Guardar cambios');
      save.id = 'btn-save'; save.disabled = busy || !changed();
      save.addEventListener('click', doSave);
      const cancel = el('button', 'ghost', 'Cancelar');
      cancel.id = 'btn-cancel'; cancel.disabled = busy;
      cancel.addEventListener('click', () => { admin = false; draft = new Set(state.enabled); msg = ''; render(); });
      btns.append(save, cancel);
      bar.append(btns);
      if (msg) { const s = el('p', 'status' + (msgBad ? ' bad' : ''), msg); s.setAttribute('role', 'status'); bar.append(s); }
      app.append(bar);
    }

    const active = new Set(admin ? draft : state.enabled);
    const mat = curMat();
    if (!mat) {
      const box = el('div', 'mats');
      MATS.forEach(m => {
        const all = CARDS.filter(c => matOf(c) === m.id);
        const n = all.filter(c => active.has(c.id)).length;
        const open = admin || n > 0;
        const card = el(open ? 'a' : 'div', 'mat' + (n ? '' : ' soon'));
        if (open) { card.href = '#' + m.id; card.addEventListener('click', ev => { ev.preventDefault(); goMat(m.id); }); }
        const i = el('div', 'ico'); i.innerHTML = m.icon;
        const h = el('div', 'mh'); h.style.setProperty('--band-x', BAND[m.id]);
        const k = el('span', 'code', m.id); k.style.setProperty('--code-x', CODEBG[m.id]);
        h.append(k, el('h3', null, m.name));
        const txt = admin ? (n + ' de ' + all.length + ' visibles') : (n ? (n === 1 ? '1 herramienta' : n + ' herramientas') : 'Próximamente');
        card.append(h, i, el('div', 'n', txt));
        box.append(card);
      });
      app.append(box);
    } else {
    const m = MATS.find(x => x.id === mat);
    const crumb = el('div', 'crumb');
    const back = el('a', null, '← Materiales'); back.href = '#';
    back.addEventListener('click', ev => { ev.preventDefault(); goMat(null); });
    const t = el('b', null, m.name); t.append(el('span', null, '(' + m.id + ')'));
    crumb.append(back, t);
    app.append(crumb);
    const groups = [];
    CARDS.filter(c => matOf(c) === mat).forEach(c => { let g = groups.find(x => x.name === c.group); if (!g) { g = { name: c.group, items: [] }; groups.push(g); } g.items.push(c); });

    let shown = 0;
    groups.forEach(g => {
      const items = admin ? g.items : g.items.filter(c => active.has(c.id));
      if (!items.length) return;
      const sec = el('section');
      sec.append(el('h2', null, g.name));
      const grid = el('div', 'cards');
      items.forEach(c => {
        shown++;
        const on = active.has(c.id);
        if (!admin) {
          const a = el('a', 'card'); a.href = c.href;
          a.append(...cardBody(c));
          if (c.proceso) {
            const w = el('div', 'cardwrap');
            const p = el('a', 'go', 'Proceso constructivo'); p.href = c.proceso;
            w.append(a, p); grid.append(w);
          } else grid.append(a);
        } else {
          const d = el('div', 'card' + (on ? '' : ' off'));
          const lab = el('label', 'toggle');
          const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'on-' + c.id; cb.checked = on;
          cb.addEventListener('change', () => { cb.checked ? draft.add(c.id) : draft.delete(c.id); msg = ''; render(); const n = document.getElementById('on-' + c.id); if (n) n.focus(); });
          const t = el('span', null, 'Visible para el alumnado');
          const bd = el('span', 'badge ' + (on ? 'on' : 'off'), on ? 'Activa' : 'Oculta');
          lab.append(cb, t, bd);
          const open = el('a', 'go', 'Probar →'); open.href = c.href;
          d.append(lab, ...cardBody(c), open);
          if (c.proceso) { const p2 = el('a', 'go pr', 'Proceso constructivo'); p2.href = c.proceso; d.append(p2); }
          grid.append(d);
        }
      });
      sec.append(grid);
      app.append(sec);
    });

    if (!shown) app.append(el('div', 'empty', admin ? 'Todavía no hay herramientas de este material.' : 'Todavía no hay herramientas activas de este material. Se irán habilitando a medida que se expliquen en clase.'));
    }

    const foot = el('footer');
    foot.innerHTML = '<p style="margin:0"><b>Predimensionado de estructuras</b> · Herramienta de trabajo de las asignaturas de Construcción de la ETSIE y la ETSA (Universidad de Granada). Profesor responsable: Jaime Vergara. ' +
      'Procedimientos basados en <em>Números gordos en el proyecto de estructuras</em> (J. C. Arroyo) y <em>Cálculo rápido de estructuras</em> (S. Mute), con la Guía de aplicación del Código Estructural, el DB SE-C y el DB SE-A. ' +
      'Son cálculos aproximados y con fines didácticos, para aprender los procedimientos de predimensionado. No sustituyen al cálculo detallado que se desarrolla en las asignaturas de Estructuras ni sirven para un proyecto real. ' +
      'Para errores o sugerencias: <a href="mailto:jaimevergara@ugr.es">jaimevergara@ugr.es</a>.' +
      ' © 2026 Jaime Vergara Muñoz, Universidad de Granada. Obra con licencia <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="noopener license">CC BY-NC-ND 4.0</a>: puede compartirse citando la autoría, sin uso comercial ni obras derivadas.</p>';
    app.append(foot);
  }

  async function doSave() {
    if (busy || !art) return;
    const next = { enabled: CARDS.filter(c => draft.has(c.id)).map(c => c.id) };
    if (state.details) next.details = state.details;
    busy = true; msg = ''; render();
    try {
      await art.publish(buildDoc(next));
      /* la plataforma recarga esta vista con la versión nueva */
      msg = 'Guardado.'; msgBad = false;
    } catch (e) {
      busy = false;
      const code = e && e.code;
      if (code === 'conflict') { return; }
      msgBad = true;
      if (code === 'not_writer' || code === 'not_granted') msg = 'No se puede guardar desde esta cuenta. Abre el enlace con la cuenta propietaria.';
      else if (code === 'rate_limited') msg = 'Demasiados guardados seguidos. Espera un momento y vuelve a probar.';
      else msg = 'No se ha podido guardar. Vuelve a intentarlo en unos segundos.';
      render();
      return;
    }
    busy = false; render();
  }

  render();

  (async function init() {
    try {
      if (!window.claude || !window.claude.use) return;
      const user = await window.claude.use('user');
      if (!user || !(await user.isOwner())) return;
      art = await window.claude.use('artifact');
      if (!art) return;
      canAdmin = true;
      render();
    } catch (e) { /* sin capacidades: la página funciona igual para el alumnado */ }
  })();
})();
