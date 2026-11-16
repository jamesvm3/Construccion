/* Descarga del modelo 3D de la armadura para SketchUp.
   Se carga al final de pilar.html y viga.html. Toma los datos del cálculo que haya en pantalla
   (window.SKP) y ofrece un script de Ruby que, cargado en la consola de SketchUp, dibuja la
   armadura en 3D. Usa la capacidad «downloads» del portal como el PDF. */
(function () {
  'use strict';
  const footer = document.querySelector('main footer') || document.querySelector('footer');
  if (!footer) return;
  const T = { pilar: "# encoding: utf-8\n# Pilar de hormig\u00f3n armado \u2014 despiece 3D (orientativo)\n# Portal de predimensionado \u00b7 Construcci\u00f3n II, ETSIE \u00b7 UGR\n#\n# USO en SketchUp: Extensiones > Ruby Console (o Ventana > Consola de Ruby) y escribir:\n#   load '/ruta/a/pilar_armadura.rb'\n# Cambia los datos de la cabecera para regenerar el modelo. Unidades: metros y mil\u00edmetros.\n\n# ---------------- DATOS (como en la calculadora) ----------------\nA      = @@A@@   # lado a del pilar (m)\nB      = @@B@@   # lado b del pilar (m)\nH      = @@H@@   # altura libre (m)\nN_BAR  = @@N@@      # barras longitudinales (m\u00faltiplo de 4)\nPHI    = @@PHI@@     # \u00d8 barras (mm)\nCANTO  = 0.30   # canto de los forjados (m), solo para dibujarlos\nREC    = 0.03   # recubrimiento al cerco (m)\n# ----------------------------------------------------------------\n\nmm   = 0.001\nphi  = PHI * mm\nphiE = [6, ((PHI / 4.0) / 2.0).ceil * 2].max * mm        # \u00d8 cerco = m\u00e1x(6; \u00d8/4), par\nside = [A, B].min * 100\nst   = [15 * PHI / 10.0, 30, side].min.floor             # separaci\u00f3n de cercos (cm)\ns1   = (0.6 * st).floor                                   # junto a forjados (cm)\nlr   = [[A, B].max, H / 2.0].min                          # longitud de zona reducida (m)\nlb   = 40 * phi                                           # solape 40\u00d8\nquie = 0.05                                               # desplazamiento del quiebro (m)\n\n# posici\u00f3n de barras: esquinas + intermedias por caras\ncb = REC + phiE + phi / 2.0                               # eje de la barra al borde\nxs = [cb, A - cb]; ys = [cb, B - cb]\nm  = (N_BAR / 4.0).round + 1                              # barras por cara\nbar_xy = []\n(0...m).each do |i|\n  t = i / (m - 1.0)\n  [0, 1].each { |w| bar_xy << [cb + (A - 2 * cb) * t, cb + (B - 2 * cb) * w] }\n  next if i == 0 || i == m - 1\n  [0, 1].each { |w| bar_xy << [cb + (A - 2 * cb) * w, cb + (B - 2 * cb) * t] }\nend\nbar_xy.uniq!\n\n# barras \u2460: de la cara inferior del pilar (z=0) a la cara inferior del forjado superior,\n# quiebro hacia dentro dentro del canto del forjado y solape de 40\u00d8 por encima de \u00e9l\ncx, cy = A / 2.0, B / 2.0\nbars = bar_xy.map do |(x, y)|\n  dx = (x < cx ? 1 : (x > cx ? -1 : 0)) * quie\n  dy = (y < cy ? 1 : (y > cy ? -1 : 0)) * quie\n  [[x, y, 0.0], [x, y, H], [x + dx, y + dy, H + CANTO], [x + dx, y + dy, H + CANTO + lb]]\nend\n\n# cercos \u2461: posiciones en z\npos = []\nz = s1 / 200.0\nwhile z <= lr + 1e-9\n  pos << z; z += s1 / 100.0\nend\nnz   = pos.size\nzone = pos.dup\nzT   = H - lr\nlast = pos.last\nnmid = [0, ((zT - last) / (st / 100.0) - 1e-9).ceil].max\nsm   = nmid > 0 ? (zT - last) / nmid : 0\n(1..nmid).each { |k| pos << last + k * sm }\nzone.each { |p| pos << H - p }\npos = pos.map { |p| p.round(4) }.uniq.sort\n\n# trazado del cerco: rect\u00e1ngulo de esquinas redondeadas (radio 3\u00d8) a la altura z\ndef stirrup(a, b, rec, phiE, z)\n  r  = 3 * phiE\n  x0 = rec + phiE / 2.0; x1 = a - rec - phiE / 2.0\n  y0 = rec + phiE / 2.0; y1 = b - rec - phiE / 2.0\n  pts = []\n  arc = lambda do |cxx, cyy, a0|\n    (0..4).each { |i| ang = (a0 + 90.0 * i / 4) * Math::PI / 180; pts << [cxx + r * Math.cos(ang), cyy + r * Math.sin(ang), z] }\n  end\n  arc.call(x1 - r, y0 + r, -90)\n  arc.call(x1 - r, y1 - r, 0)\n  arc.call(x0 + r, y1 - r, 90)\n  arc.call(x0 + r, y0 + r, 180)\n  pts\nend\nstirrups = pos.map { |zz| stirrup(A, B, REC, phiE, zz) }\n\nsummary = \"Pilar #{(A*100).round}x#{(B*100).round} cm, H=#{H} m \u00b7 #{bar_xy.size} \u00d8#{PHI} (long. #{(H + CANTO + lb).round(2)} m) \u00b7 \" \\\n          \"#{stirrups.size} cercos \u00d8#{(phiE/mm).round} (c/#{st} y c/#{s1} en extremos, zona #{lr.round(2)} m) \u00b7 solape #{lb.round(2)} m\"\n\nif defined?(Sketchup)\n  model = Sketchup.active_model\n  model.start_operation('Pilar armado', true)\n  ents = model.active_entities\n  m_ = model.materials\n  mk = lambda do |name, rgb, alpha|\n    mat = m_[name] || m_.add(name)\n    mat.color = Sketchup::Color.new(*rgb); mat.alpha = alpha; mat\n  end\n  mat_hor = mk.call('Hormig\u00f3n', [200, 200, 195], 0.22)\n  mat_for = mk.call('Forjado', [175, 180, 190], 0.45)\n  mat_bar = mk.call('Barras \u2460', [29, 79, 216], 1.0)\n  mat_cer = mk.call('Cercos \u2461', [232, 69, 60], 1.0)\n  pt = lambda { |x, y, z| Geom::Point3d.new(x.m, y.m, z.m) }\n\n  box = lambda do |name, x0, y0, z0, x1, y1, z1, mat|\n    g = ents.add_group; g.name = name\n    f = g.entities.add_face(pt.call(x0, y0, z0), pt.call(x1, y0, z0), pt.call(x1, y1, z0), pt.call(x0, y1, z0))\n    f.reverse! if f.normal.z < 0\n    f.pushpull((z1 - z0).m)\n    g.entities.grep(Sketchup::Face).each { |ff| ff.material = mat; ff.back_material = mat }\n    g\n  end\n\n  tube = lambda do |name, pts, r, mat, closed|\n    g = ents.add_group; g.name = name\n    e = g.entities\n    edges = []\n    pts.each_cons(2) { |a, b| edges.concat(e.add_edges(pt.call(*a), pt.call(*b))) }\n    edges.concat(e.add_edges(pt.call(*pts.last), pt.call(*pts.first))) if closed\n    v  = pt.call(*pts[0]).vector_to(pt.call(*pts[1]))\n    c  = e.add_circle(pt.call(*pts[0]), v, r.m, 12)\n    fc = e.add_face(c)\n    fc.followme(edges)\n    edges.each { |ed| ed.erase! if ed.valid? }\n    e.grep(Sketchup::Face).each { |ff| ff.material = mat; ff.back_material = mat }\n    g\n  end\n\n  box.call('Forjado inferior', -0.10, -0.10, -CANTO, A + 0.10, B + 0.10, 0.0, mat_for)\n  box.call('Forjado superior', -0.10, -0.10, H, A + 0.10, B + 0.10, H + CANTO, mat_for)\n  box.call('Pilar (hormig\u00f3n)', 0.0, 0.0, 0.0, A, B, H, mat_hor)\n  bars.each_with_index { |p, i| tube.call(\"Barra \u2460 #{i + 1}\", p, phi / 2.0, mat_bar, false) }\n  stirrups.each_with_index { |p, i| tube.call(\"Cerco \u2461 #{i + 1}\", p, phiE / 2.0, mat_cer, true) }\n\n  model.commit_operation\n  model.active_view.zoom_extents\n  UI.messagebox(summary)\nelse\n  require 'json'\n  puts summary\n  File.write('/home/claude/skp/geom.json', JSON.dump({ A: A, B: B, H: H, canto: CANTO, phi: phi, phiE: phiE, bars: bars, stirrups: stirrups }))\nend\n", viga: "# encoding: utf-8\n# Viga de hormigón armado — despiece 3D (orientativo)\n# Portal de predimensionado · Construcción II, ETSIE · UGR\n#\n# USO en SketchUp: Extensiones > Ruby Console y escribir:\n#   load '/ruta/a/viga_armadura.rb'\n# Cambia los datos de la cabecera para regenerar el modelo. Unidades: metros y milímetros.\n# Convenio (igual que el despiece de la calculadora): las barras llegan a 10 cm del eje del\n# pilar y rematan con patilla de 0,25 m; el refuerzo de negativos ③ se corta a LR del eje\n# del apoyo y entra en el pilar con patilla; los cercos van a scR junto a los apoyos hasta\n# donde el cortante baja a Vcu (az) y a la separación máxima en el resto.\n\n# ---------------- DATOS ----------------\nL    = @@L@@   # luz entre ejes de pilares (m)\nPW   = @@PW@@   # lado del pilar (m)\nBV   = @@BV@@   # ancho de la viga (m)\nHV   = @@HV@@   # canto de la viga (m)\nNP   = @@NP@@      # barras inferiores ①\nPHIP = @@PHIP@@     # Ø inferiores (mm)\nNN   = @@NN@@      # barras superiores en total (2 corridas ② + refuerzos ③)\nPHIN = @@PHIN@@     # Ø superiores (mm)\nPHIE = @@PHIE@@      # Ø cercos (mm)\nSCR  = @@SCR@@     # separación de cercos junto a apoyos (cm)\nAZ   = @@AZ@@   # longitud de la zona con cercos a SCR, desde la cara del pilar (m)\nX0   = @@X0@@   # punto de momento nulo, desde el eje del apoyo (m)\nLBN  = @@LBN@@   # anclaje neto del refuerzo ③ (m)\nVOL  = @@VOL@@   # 1 = voladizo (empotrado en el pilar izquierdo, L = vuelo desde su eje), 0 = tramo con dos apoyos\nREC  = 0.03   # recubrimiento al cerco (m)\n# ---------------------------------------\n\nmm = 0.001\nphiP = PHIP * mm; phiN = PHIN * mm; phiE = PHIE * mm\nd    = HV - 0.04                                  # canto útil\nsmax = [0.75 * d, 0.60].min                       # separación máxima (m)\nlc   = L - PW                                     # luz libre\nhalf = lc / 2.0\nrc   = PW / 2.0 - 0.10                            # las barras llegan a 10 cm del eje\nPT   = 0.25                                       # patilla\nLR   = X0 + [d, LBN].max                          # corte del refuerzo ③ desde el eje\nnR   = [0, NN - 2].max\n\n# coordenadas: x a lo largo de la viga (eje del pilar izquierdo = 0), y ancho, z canto (0 = cara inferior)\nzb = REC + phiE + phiP / 2.0                      # eje de barras inferiores\nzt = HV - (REC + phiE + phiN / 2.0)               # eje de barras superiores\nys = lambda { |n, dia| a = REC + phiE + dia / 2.0; n == 1 ? [BV / 2.0] : (0...n).map { |i| a + (BV - 2 * a) * i / (n - 1.0) } }\nyb = ys.call(NP, phiP)\nyt = ys.call(NN, phiN)\n\nx_ini = -0.10                                      # 10 cm antes del eje izquierdo\nx_fin = L + 0.10                                   # 10 cm después del eje derecho\n\nbars = []\nif VOL == 1\n  yb.each_with_index { |y, i| bars << { tipo: 1, name: \"① #{i + 1}\", pts: [[x_ini, y, zb + PT], [x_ini, y, zb], [L - 0.03, y, zb]] } }\n  yt.each_with_index { |y, i| bars << { tipo: 2, name: \"② #{i + 1}\", pts: [[x_ini + 0.02, y, zt - PT], [x_ini + 0.02, y, zt], [L - 0.03, y, zt]] } }\nelse\nyb.each_with_index do |y, i|                       # ① inferiores, patillas hacia arriba\n  bars << { tipo: 1, name: \"① #{i + 1}\", pts: [[x_ini, y, zb + PT], [x_ini, y, zb], [x_fin, y, zb], [x_fin, y, zb + PT]] }\nend\nyt.each_with_index do |y, i|\n  if i == 0 || i == NN - 1                          # ② corridas, patillas hacia abajo\n    bars << { tipo: 2, name: \"② #{i == 0 ? 1 : 2}\", pts: [[x_ini + 0.02, y, zt - PT], [x_ini + 0.02, y, zt], [x_fin - 0.02, y, zt], [x_fin - 0.02, y, zt - PT]] }\n  else                                              # ③ refuerzos en ambos apoyos\n    bars << { tipo: 3, name: \"③ izq #{i}\", pts: [[x_ini + 0.04, y, zt - PT], [x_ini + 0.04, y, zt], [LR, y, zt]] }\n    bars << { tipo: 3, name: \"③ der #{i}\", pts: [[x_fin - 0.04, y, zt - PT], [x_fin - 0.04, y, zt], [L - LR, y, zt]] }\n  end\nend\nend\n\n# cercos ④ (posiciones desde la cara del pilar izquierdo)\ns1 = SCR / 100.0\nif VOL == 1\n  lcl = L - PW / 2.0 - 0.05                          # hasta 5 cm del extremo libre\n  xs_cercos = []; x = s1 / 2\n  while x <= [AZ, lcl].min + 1e-9\n    xs_cercos << PW / 2.0 + x; x += s1\n  end\n  xs_cercos << PW / 2.0 + smax / 2 if xs_cercos.empty?\n  last = xs_cercos.last\n  while last + smax <= PW / 2.0 + lcl + 1e-9\n    last += smax; xs_cercos << last\n  end\n  xs_cercos = xs_cercos.map { |p| p.round(4) }\n  s2 = smax\nelse\npos = []; x = s1 / 2\nif AZ > 0\n  while x <= AZ + 1e-9 && x < half - 1e-9\n    pos << x; x += s1\n  end\nend\npos << smax / 2 if pos.empty?\nlast = pos.last\nrem  = half - last\nns   = rem > 1e-6 ? [1, (rem / smax - 1e-9).ceil].max : 0\ns2   = ns > 0 ? rem / ns : smax\n(1..ns).each { |k| pos << last + k * s2 }\nall = (pos + pos.reject { |p| (p - half).abs < 1e-6 }.map { |p| lc - p }).map { |p| p.round(4) }.uniq.sort\nxs_cercos = all.map { |p| PW / 2.0 + p }\nend\n\ndef cerco(x, by, bz, r, rec, phiE)\n  y0 = rec + phiE / 2.0; y1 = by - rec - phiE / 2.0\n  z0 = rec + phiE / 2.0; z1 = bz - rec - phiE / 2.0\n  rr = 3 * phiE\n  pts = []\n  arc = lambda do |cy, cz, a0|\n    (0..4).each { |i| a = (a0 + 90.0 * i / 4) * Math::PI / 180; pts << [x, cy + rr * Math.cos(a), cz + rr * Math.sin(a)] }\n  end\n  arc.call(y1 - rr, z0 + rr, -90)\n  arc.call(y1 - rr, z1 - rr, 0)\n  arc.call(y0 + rr, z1 - rr, 90)\n  arc.call(y0 + rr, z0 + rr, 180)\n  pts\nend\nstirrups = xs_cercos.map { |x| cerco(x, BV, HV, 0, REC, phiE) }\n\nsummary_vol = \"Voladizo #{(BV*100).round}x#{(HV*100).round} cm, vuelo L=#{L} m · ① #{NP} Ø#{PHIP} · ② #{NN} Ø#{PHIN} superiores · #{xs_cercos.size} cercos Ø#{PHIE} (c/#{SCR} en #{AZ.round(2)} m junto al pilar, c/#{(smax * 100).floor} máx. en el resto)\"\nsummary = \"Viga #{(BV*100).round}x#{(HV*100).round} cm, L=#{L} m · ① #{NP} Ø#{PHIP} · ② 2 Ø#{PHIN} · ③ #{nR * 2} Ø#{PHIN} (corte a #{LR.round(2)} m del eje) · \" \\\n          \"#{stirrups.size} cercos Ø#{PHIE} (c/#{SCR} en #{AZ} m junto a apoyos, c/#{(s2 * 100).floor} en el resto)\"\nsummary = summary_vol if VOL == 1\n\nif defined?(Sketchup)\n  model = Sketchup.active_model\n  model.start_operation('Viga armada', true)\n  ents = model.active_entities\n  mats = model.materials\n  mk = lambda do |name, rgb, alpha|\n    mt = mats[name] || mats.add(name); mt.color = Sketchup::Color.new(*rgb); mt.alpha = alpha; mt\n  end\n  m_hor = mk.call('Hormigón', [200, 200, 195], 0.22)\n  m_pil = mk.call('Pilar', [175, 180, 190], 0.45)\n  m_1 = mk.call('Barras ①', [29, 79, 216], 1.0)\n  m_2 = mk.call('Barras ②', [140, 40, 190], 1.0)\n  m_3 = mk.call('Refuerzo ③', [232, 140, 30], 1.0)\n  m_4 = mk.call('Cercos ④', [232, 69, 60], 1.0)\n  pt = lambda { |x, y, z| Geom::Point3d.new(x.m, y.m, z.m) }\n\n  box = lambda do |name, x0, y0, z0, x1, y1, z1, mat|\n    g = ents.add_group; g.name = name\n    f = g.entities.add_face(pt.call(x0, y0, z0), pt.call(x1, y0, z0), pt.call(x1, y1, z0), pt.call(x0, y1, z0))\n    f.reverse! if f.normal.z < 0\n    f.pushpull((z1 - z0).m)\n    g.entities.grep(Sketchup::Face).each { |ff| ff.material = mat; ff.back_material = mat }\n    g\n  end\n\n  tube = lambda do |name, pts, r, mat, closed|\n    g = ents.add_group; g.name = name\n    e = g.entities\n    edges = []\n    pts.each_cons(2) { |a, b| edges.concat(e.add_edges(pt.call(*a), pt.call(*b))) }\n    edges.concat(e.add_edges(pt.call(*pts.last), pt.call(*pts.first))) if closed\n    v  = pt.call(*pts[0]).vector_to(pt.call(*pts[1]))\n    c  = e.add_circle(pt.call(*pts[0]), v, r.m, 12)\n    fc = e.add_face(c)\n    fc.followme(edges)\n    edges.each { |ed| ed.erase! if ed.valid? }\n    e.grep(Sketchup::Face).each { |ff| ff.material = mat; ff.back_material = mat }\n    g\n  end\n\n  py0 = BV / 2.0 - PW / 2.0\n  box.call('Pilar izquierdo', -PW / 2.0, py0, -0.50, PW / 2.0, py0 + PW, HV + 0.50, m_pil)\n  box.call('Pilar derecho', L - PW / 2.0, py0, -0.50, L + PW / 2.0, py0 + PW, HV + 0.50, m_pil) unless VOL == 1\n  box.call('Viga (hormigón)', PW / 2.0, 0.0, 0.0, (VOL == 1 ? L : L - PW / 2.0), BV, HV, m_hor)\n  bars.each { |b| tube.call(\"Barra #{b[:name]}\", b[:pts], (b[:tipo] == 1 ? phiP : phiN) / 2.0, { 1 => m_1, 2 => m_2, 3 => m_3 }[b[:tipo]], false) }\n  stirrups.each_with_index { |p, i| tube.call(\"Cerco ④ #{i + 1}\", p, phiE / 2.0, m_4, true) }\n\n  model.commit_operation\n  model.active_view.zoom_extents\n  UI.messagebox(summary)\nelse\n  require 'json'\n  puts summary\n  File.write('/home/claude/skp/geom_viga.json', JSON.dump({ L: L, PW: PW, B: BV, H: HV, phiP: phiP, phiN: phiN, phiE: phiE, bars: bars, stirrups: stirrups }))\nend\n" };
  const F = { pilar: 'pilar_armadura.rb', viga: 'viga_armadura.rb' };
  const css = document.createElement('style');
  css.textContent = '.skpbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:14px 16px;margin-bottom:14px}.skpbar p{margin:0;flex:1 1 240px;font-size:13.5px;color:var(--muted)}.skpbar button{font-family:var(--sans);font-size:14px;font-weight:600;border:1px solid var(--accent);background:var(--panel);color:var(--accent);padding:9px 16px;border-radius:4px;cursor:pointer}.skpbar button:disabled{opacity:.5;cursor:default}.skpbar .msg{flex-basis:100%;font-size:13px;color:var(--muted)}.skpbar .msg.bad{color:var(--bad)}';
  document.head.appendChild(css);
  const bar = document.createElement('div');
  bar.className = 'skpbar';
  bar.innerHTML = '<p><b>Modelo 3D de la armadura.</b> Descarga un script para SketchUp (Extensiones › Ruby Console › <code>load</code>) que dibuja este despiece con tus datos.</p><button type="button" id="skpbtn">Descargar modelo 3D (.rb)</button><div class="msg" id="skpmsg" role="status"></div>';
  footer.parentNode.insertBefore(bar, footer);
  /* ---- Vista previa 3D (lienzo con giro por arrastre, sin librerías) ---- */
  const pbox = document.createElement('div');
  pbox.className = 'skpview';
  pbox.innerHTML = '<h3 style="margin:0 0 8px">Vista 3D de la armadura</h3><div style="position:relative"><canvas id="skpcv" style="width:100%;height:340px;display:block;touch-action:none;cursor:grab;background:var(--panel);border:1px solid var(--line);border-radius:6px" aria-label="Vista 3D de la armadura"></canvas><button type="button" id="skpzi" aria-label="Acercar" style="top:8px;position:absolute;right:8px;width:34px;height:34px;border:1px solid var(--line);border-radius:6px;background:var(--bg,#fff);color:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0">+</button><button type="button" id="skpzo" aria-label="Alejar" style="top:48px;position:absolute;right:8px;width:34px;height:34px;border:1px solid var(--line);border-radius:6px;background:var(--bg,#fff);color:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0">−</button><button type="button" id="skpzr" aria-label="Restablecer vista" style="top:88px;position:absolute;right:8px;width:34px;height:34px;border:1px solid var(--line);border-radius:6px;background:var(--bg,#fff);color:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0;font-size:15px">⟲</button></div><p class="hint" style="margin:6px 0 0">Arrastra para girar; pellizca, rueda o +/− para ampliar. Barras ① azul, ② morado, ③ naranja y cercos en rojo. Es un esquema orientativo.</p>';
  bar.parentNode.insertBefore(pbox, bar);
  bar.remove(); // sin descarga de .rb: solo vista 3D
  const cv = pbox.querySelector('canvas');
  const rad = Math.PI / 180;
  function geomPilar(S) {
    const A = S.A, B = S.B, H = S.H, PHI = S.PHI, REC = 0.03, CANTO = 0.30;
    const phi = PHI * 0.001, phiE = Math.max(6, Math.ceil((PHI / 4) / 2) * 2) * 0.001;
    const st = Math.floor(Math.min(15 * PHI / 10, 30, Math.min(A, B) * 100)), s1 = Math.floor(0.6 * st);
    const lr = Math.min(Math.max(A, B), H / 2), lb = 40 * phi, cb = REC + phiE + phi / 2;
    const m = Math.round(S.N / 4) + 1, xy = [], key = {};
    for (let i = 0; i < m; i++) {
      const t = i / (m - 1);
      [0, 1].forEach(w => xy.push([cb + (A - 2 * cb) * t, cb + (B - 2 * cb) * w]));
      if (i === 0 || i === m - 1) continue;
      [0, 1].forEach(w => xy.push([cb + (A - 2 * cb) * w, cb + (B - 2 * cb) * t]));
    }
    const lines = [], boxes = [];
    xy.filter(p => { const k = p.join(); if (key[k]) return false; key[k] = 1; return true; }).forEach(([x, y]) => {
      const dx = (x < A / 2 ? 1 : (x > A / 2 ? -1 : 0)) * 0.05, dy = (y < B / 2 ? 1 : (y > B / 2 ? -1 : 0)) * 0.05;
      lines.push({ pts: [[x, y, 0], [x, y, H], [x + dx, y + dy, H + CANTO], [x + dx, y + dy, H + CANTO + lb]], w: phi, c: '#1d4fd8' });
    });
    const pos = []; let z = s1 / 200;
    while (z <= lr + 1e-9) { pos.push(z); z += s1 / 100; }
    const zone = pos.slice(), zT = H - lr, last = pos[pos.length - 1];
    const nmid = Math.max(0, Math.ceil((zT - last) / (st / 100) - 1e-9)), sm = nmid > 0 ? (zT - last) / nmid : 0;
    for (let k = 1; k <= nmid; k++) pos.push(last + k * sm);
    zone.forEach(p => pos.push(H - p));
    const all = Array.from(new Set(pos.map(p => Math.round(p * 1e4) / 1e4))).sort((a, b) => a - b);
    all.forEach(zz => lines.push({ pts: stirrupXY(A, B, REC, phiE, zz), w: phiE, c: '#e8453c', closed: true }));
    boxes.push({ b: [-0.1, -0.1, -CANTO, A + 0.1, B + 0.1, 0], a: 0.18 }, { b: [-0.1, -0.1, H, A + 0.1, B + 0.1, H + CANTO], a: 0.18 }, { b: [0, 0, 0, A, B, H], a: 0.07 });
    return { lines, boxes };
  }
  function stirrupXY(a, b, rec, phiE, z) {
    const r = 3 * phiE, x0 = rec + phiE / 2, x1 = a - rec - phiE / 2, y0 = rec + phiE / 2, y1 = b - rec - phiE / 2, pts = [];
    const arc = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const g = (a0 + 90 * i / 4) * rad; pts.push([cx + r * Math.cos(g), cy + r * Math.sin(g), z]); } };
    arc(x1 - r, y0 + r, -90); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, 90); arc(x0 + r, y0 + r, 180);
    return pts;
  }
  function stirrupYZ(x, by, bz, rec, phiE) {
    const r = 3 * phiE, y0 = rec + phiE / 2, y1 = by - rec - phiE / 2, z0 = rec + phiE / 2, z1 = bz - rec - phiE / 2, pts = [];
    const arc = (cy, cz, a0) => { for (let i = 0; i <= 4; i++) { const g = (a0 + 90 * i / 4) * rad; pts.push([x, cy + r * Math.cos(g), cz + r * Math.sin(g)]); } };
    arc(y1 - r, z0 + r, -90); arc(y1 - r, z1 - r, 0); arc(y0 + r, z1 - r, 90); arc(y0 + r, z0 + r, 180);
    return pts;
  }
  function geomViga(S) {
    const L = S.L, PW = S.PW, BV = S.BV, HV = S.HV, REC = 0.03, mm = 0.001;
    const phiP = S.PHIP * mm, phiN = S.PHIN * mm, phiE = S.PHIE * mm, d = HV - 0.04, smax = Math.min(0.75 * d, 0.6);
    const lc = L - PW, half = lc / 2, PT = 0.25, LR = S.X0 + Math.max(d, S.LBN);
    const zb = REC + phiE + phiP / 2, zt = HV - (REC + phiE + phiN / 2);
    const ys = (n, dia) => { const a = REC + phiE + dia / 2; return n === 1 ? [BV / 2] : Array.from({ length: n }, (_, i) => a + (BV - 2 * a) * i / (n - 1)); };
    if (S.VOL) {
      const xi0 = -0.10, xe = L - 0.03, lines = [], boxes = [], s1 = Math.max(S.SCR, 3) / 100, lcl = L - PW / 2 - 0.05, pos = [];
      ys(S.NP, phiP).forEach(y => lines.push({ pts: [[xi0, y, zb + PT], [xi0, y, zb], [xe, y, zb]], w: phiP, c: '#1d4fd8' }));
      ys(S.NN, phiN).forEach(y => lines.push({ pts: [[xi0 + 0.02, y, zt - PT], [xi0 + 0.02, y, zt], [xe, y, zt]], w: phiN, c: '#8c28be' }));
      let x = s1 / 2; while (x <= Math.min(S.AZ, lcl) + 1e-9) { pos.push(x); x += s1; }
      if (!pos.length) pos.push(smax / 2);
      let last = pos[pos.length - 1]; while (last + smax <= lcl + 1e-9) { last += smax; pos.push(last); }
      pos.forEach(p => lines.push({ pts: stirrupYZ(PW / 2 + p, BV, HV, REC, phiE), w: phiE, c: '#e8453c', closed: true }));
      const py0 = BV / 2 - PW / 2;
      boxes.push({ b: [-PW / 2, py0, -0.5, PW / 2, py0 + PW, HV + 0.5], a: 0.18 }, { b: [PW / 2, 0, 0, L, BV, HV], a: 0.07 });
      return { lines, boxes };
    }
    const xi = -0.10, xf = L + 0.10, lines = [], boxes = [];
    ys(S.NP, phiP).forEach(y => lines.push({ pts: [[xi, y, zb + PT], [xi, y, zb], [xf, y, zb], [xf, y, zb + PT]], w: phiP, c: '#1d4fd8' }));
    const yt = ys(S.NN, phiN);
    yt.forEach((y, i) => {
      if (i === 0 || i === S.NN - 1) lines.push({ pts: [[xi + 0.02, y, zt - PT], [xi + 0.02, y, zt], [xf - 0.02, y, zt], [xf - 0.02, y, zt - PT]], w: phiN, c: '#8c28be' });
      else {
        lines.push({ pts: [[xi + 0.04, y, zt - PT], [xi + 0.04, y, zt], [LR, y, zt]], w: phiN, c: '#e88c1e' });
        lines.push({ pts: [[xf - 0.04, y, zt - PT], [xf - 0.04, y, zt], [L - LR, y, zt]], w: phiN, c: '#e88c1e' });
      }
    });
    const s1 = Math.max(S.SCR, 3) / 100, pos = []; let x = s1 / 2;
    if (S.AZ > 0) while (x <= S.AZ + 1e-9 && x < half - 1e-9) { pos.push(x); x += s1; }
    if (!pos.length) pos.push(smax / 2);
    const last = pos[pos.length - 1], rem = half - last, ns = rem > 1e-6 ? Math.max(1, Math.ceil(rem / smax - 1e-9)) : 0, s2 = ns > 0 ? rem / ns : smax;
    for (let k = 1; k <= ns; k++) pos.push(last + k * s2);
    const all = Array.from(new Set(pos.concat(pos.filter(p => Math.abs(p - half) >= 1e-6).map(p => lc - p)).map(p => Math.round(p * 1e4) / 1e4))).sort((a, b) => a - b);
    all.forEach(p => lines.push({ pts: stirrupYZ(PW / 2 + p, BV, HV, REC, phiE), w: phiE, c: '#e8453c', closed: true }));
    const py = BV / 2 - PW / 2;
    boxes.push({ b: [-PW / 2, py, -0.5, PW / 2, py + PW, HV + 0.5], a: 0.18 }, { b: [L - PW / 2, py, -0.5, L + PW / 2, py + PW, HV + 0.5], a: 0.18 }, { b: [PW / 2, 0, 0, L - PW / 2, BV, HV], a: 0.07 });
    return { lines, boxes };
  }
  let yaw = -35, pitch = 22, G = null, zm = 1, px = 0, py = 0;
  function draw() {
    const S = window.SKP, ctx = cv.getContext('2d');
    if (!S) { pbox.style.display = 'none'; return; }
    pbox.style.display = '';
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, Hh = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
    if (!G || G.S !== S) G = Object.assign({ S }, S.kind === 'pilar' ? geomPilar(S) : geomViga(S));
    const all = []; G.boxes.forEach(b => { const q = b.b; for (let i = 0; i < 8; i++) all.push([q[i & 1 ? 3 : 0], q[i & 2 ? 4 : 1], q[i & 4 ? 5 : 2]]); });
    G.lines.forEach(l => l.pts.forEach(p => all.push(p)));
    const mn = [0, 1, 2].map(k => Math.min(...all.map(p => p[k]))), mx = [0, 1, 2].map(k => Math.max(...all.map(p => p[k])));
    const c = [0, 1, 2].map(k => (mn[k] + mx[k]) / 2), cy = Math.cos(yaw * rad), sy = Math.sin(yaw * rad), cp = Math.cos(pitch * rad), sp = Math.sin(pitch * rad);
    const pr = p => { const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2], x1 = cy * dx - sy * dy, y1 = sy * dx + cy * dy; return [x1, -(dz * cp + y1 * sp), y1 * cp - dz * sp]; };
    const P = all.map(pr), xa = P.map(p => p[0]), ya = P.map(p => p[1]);
    const ew = Math.max(...xa) - Math.min(...xa), eh = Math.max(...ya) - Math.min(...ya);
    const k = Math.min(W / ew, Hh / eh) * 0.9 * zm, ox = W / 2 + px - k * (Math.max(...xa) + Math.min(...xa)) / 2, oy = Hh / 2 + py - k * (Math.max(...ya) + Math.min(...ya)) / 2;
    const sc = p => { const q = pr(p); return [ox + k * q[0], oy + k * q[1]]; };
    const F = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
    G.boxes.forEach(b => {
      const q = b.b, V = []; for (let i = 0; i < 8; i++) V.push([q[i & 1 ? 3 : 0], q[i & 2 ? 4 : 1], q[i & 4 ? 5 : 2]]);
      F.forEach(f => { ctx.beginPath(); f.forEach((i, j) => { const s = sc(V[i]); j ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath(); ctx.fillStyle = 'rgba(120,128,140,' + b.a + ')'; ctx.fill(); ctx.strokeStyle = 'rgba(90,95,105,.55)'; ctx.lineWidth = 0.8; ctx.stroke(); });
    });
    const order = G.lines.map(l => ({ l, z: l.pts.reduce((s, p) => s + pr(p)[2], 0) / l.pts.length })).sort((a, b) => b.z - a.z);
    order.forEach(({ l }) => {
      ctx.beginPath(); l.pts.forEach((p, j) => { const s = sc(p); j ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); });
      if (l.closed) ctx.closePath();
      ctx.strokeStyle = l.c; ctx.lineWidth = Math.max(l.closed ? 1.1 : 2, l.w * k * 1.0); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    });
  }
  let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  let cur = window.SKP; Object.defineProperty(window, 'SKP', { configurable: true, get: () => cur, set: v => { cur = v; G = null; redraw(); } });
  const ptrs = new Map(); let last2 = null;
  const clampZ = () => { zm = Math.max(0.6, Math.min(10, zm)); if (zm <= 1.001) { px *= 0.0; py *= 0.0; } };
  const meas = () => { const a = [...ptrs.values()]; return { d: Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1, cx: (a[0][0] + a[1][0]) / 2, cy: (a[0][1] + a[1][1]) / 2 }; };
  cv.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; last2 = ptrs.size === 2 ? meas() : null; });
  cv.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const o = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) { const m = meas(); if (last2) { zm *= m.d / last2.d; px += m.cx - last2.cx; py += m.cy - last2.cy; clampZ(); } last2 = m; }
    else if (ptrs.size === 1) { yaw += (e.clientX - o[0]) * 0.5; pitch = Math.max(-80, Math.min(85, pitch + (e.clientY - o[1]) * 0.4)); }
    redraw();
  });
  const up = e => { ptrs.delete(e.pointerId); last2 = null; if (!ptrs.size) cv.style.cursor = 'grab'; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); zm *= Math.exp(-e.deltaY * 0.0015); clampZ(); redraw(); }, { passive: false });
  const zb = (id, f) => pbox.querySelector(id).addEventListener('click', () => { f(); clampZ(); redraw(); });
  zb('#skpzi', () => { zm *= 1.3; }); zb('#skpzo', () => { zm /= 1.3; });
  zb('#skpzr', () => { zm = 1; px = 0; py = 0; yaw = -35; pitch = 22; });
  window.addEventListener('resize', redraw);
  redraw();
  const btn = bar.querySelector('#skpbtn'), msg = bar.querySelector('#skpmsg');
  const say = (t, bad) => { msg.textContent = t; msg.className = 'msg' + (bad ? ' bad' : ''); };
  let inFrame = false; try { inFrame = window.top !== window.self; } catch (e) { inFrame = true; }
  const IN_CLAUDE = inFrame || !!window.claude;
  let dl = null;
  const getDl = () => (dl || (dl = (window.claude && typeof window.claude.use === 'function') ? Promise.resolve(window.claude.use('downloads')).catch(() => null) : Promise.resolve(null)));
  getDl();
  const num = (x, d) => (+x).toFixed(d == null ? 4 : d).replace(/0+$/, '').replace(/\.$/, '.0');
  function build(S) {
    let t = T[S.kind];
    const put = (k, v) => { t = t.split('@@' + k + '@@').join(v); };
    if (S.kind === 'pilar') {
      put('A', num(S.A, 3)); put('B', num(S.B, 3)); put('H', num(S.H, 2)); put('N', String(S.N)); put('PHI', String(S.PHI));
    } else {
      put('L', num(S.L, 2)); put('PW', num(S.PW, 2)); put('BV', num(S.BV, 3)); put('HV', num(S.HV, 3));
      put('NP', String(S.NP)); put('PHIP', String(S.PHIP)); put('NN', String(S.NN)); put('PHIN', String(S.PHIN));
      put('PHIE', String(S.PHIE)); put('SCR', String(S.SCR)); put('AZ', num(S.AZ, 3)); put('X0', num(S.X0, 3)); put('LBN', num(S.LBN, 3)); put('VOL', S.VOL ? '1' : '0');
    }
    return t;
  }
  function browserSave(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  btn.addEventListener('click', async () => {
    const S = window.SKP;
    if (!S) { say(document.getElementById('alz') && !document.getElementById('alz').innerHTML ? 'Este caso no tiene modelo 3D. Revisa los datos.' : 'Introduce primero los datos del ejercicio.', true); return; }
    btn.disabled = true;
    const blob = new Blob([build(S)], { type: 'text/plain;charset=utf-8' });
    const name = F[S.kind];
    const d = await getDl();
    try {
      if (d) { await d.save({ filename: name, data: blob }); say('Guardado: ' + name + '. En SketchUp: Extensiones › Ruby Console y load \'ruta/' + name + '\'.'); }
      else if (!IN_CLAUDE) { browserSave(blob, name); say('Descargado: ' + name); }
      else say('Desde esta vista no se puede descargar. Usa la versión web del portal.', true);
    } catch (e) {
      if (e && e.code === 'declined') say('Guardado cancelado.');
      else if (!IN_CLAUDE) { try { browserSave(blob, name); say('Descargado: ' + name); } catch (e2) { say('No se ha podido guardar el archivo.', true); } }
      else say('Desde esta vista no se puede descargar. Usa la versión web del portal.', true);
    }
    btn.disabled = false;
  });
})();
