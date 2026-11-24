/* Motor de cálculo. Sin acceso al DOM. */
window.Calc = (function () {
  const G = [
    ['Eléctricos (Cu THHN/THWN-2)', [['THHN #14 AWG',2.82],['THHN #12 AWG',3.31],['THHN #10 AWG',4.16],['THHN #8 AWG',5.48],['THHN #6 AWG',6.45],['THHN #4 AWG',8.23],['THHN #2 AWG',9.75],['THHN 1/0 AWG',12.34],['THHN 2/0 AWG',13.51],['THHN 3/0 AWG',14.84],['THHN 4/0 AWG',16.31]]],
    ['Datos (UTP)', [['UTP Cat5e',5.2],['UTP Cat6',6.0],['UTP Cat6A',7.5]]],
    ['Coaxial', [['Coaxial RG6',6.9],['Coaxial RG59',6.1]]],
    ['Fibra óptica', [['Fibra óptica 12 hilos interior',6.0],['Fibra óptica 24 hilos exterior',9.5]]]
  ];
  const CAB = [];
  G.forEach(([g, a]) => a.forEach(([n, d]) => CAB.push({ g, n, d })));
  const EMT = [['1/2″',196],['3/4″',343],['1″',557],['1-1/4″',965],['1-1/2″',1313],['2″',2165],['2-1/2″',3779],['3″',5707],['4″',9518]];
  const PVC = [['1/2″',184],['3/4″',328],['1″',537],['1-1/4″',937],['1-1/2″',1281],['2″',2123],['2-1/2″',3029],['3″',4689],['4″',8099]];
  const TS = [.5,.75,1,1.25,1.5,2,2.5,3,4];
  const BX = [[10,10,6],[15,15,8],[20,20,10],[30,30,15],[40,40,20],[50,50,20],[60,60,25],[80,80,30]];
  const PAL = ['#ef4444','#f59e0b','#3b82f6','#10b981','#8b5cf6','#f97316','#94a3b8'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const f1 = n => (Math.round(n * 10) / 10).toLocaleString('es-GT');

  function pack(list, R) {
    const arr = []; list.forEach((it, k) => { for (let j = 0; j < it.q; j++) arr.push({ r: it.d / 2, k }); });
    arr.sort((a, b) => b.r - a.r);
    const cs = [], st = R / 32;
    for (const c of arr.slice(0, 160)) {
      const m = R - c.r; let b = null;
      for (let y = m; y >= -m && !b; y -= st) for (let x = -m; x <= m; x += st) {
        if (x * x + y * y > m * m) continue;
        if (cs.some(o => (o.x - x) ** 2 + (o.y - y) ** 2 < (o.r + c.r) ** 2 * .995)) continue;
        if (!b || Math.abs(x) < Math.abs(b.x)) b = { r: c.r, k: c.k, x, y };
      }
      if (b) cs.push(b);
    }
    return cs;
  }

  function calcT(t, nor, des) {
    const items = t.rows.filter(r => r.q > 0 && CAB[r.i]).map(r => ({ ...CAB[r.i], q: r.q }));
    const N = items.reduce((s, r) => s + r.q, 0), L = Math.max(0, +t.L || 0);
    if (!L || !N) return null;
    const ar = d => Math.PI * d * d / 4;
    const sum = items.reduce((s, r) => s + r.q * ar(r.d), 0);
    const lim = N == 1 ? .53 : N == 2 ? .31 : .4;
    const mat = t.m, Tb = mat == 'EMT' ? EMT : PVC;
    let ix = Tb.findIndex(x => sum <= x[1] * lim), P = 1;
    if (ix < 0) { ix = Tb.length - 1; P = Math.ceil(sum / (Tb[ix][1] * .4)); }
    const A = Tb[ix][1], sz = Tb[ix][0], fill = sum / P / A * 100;
    const limP = P > 1 ? .4 : lim, Lt = mat == 'EMT' ? 3.05 : 3, maxD = nor == 'EST' ? 180 : 360, maxL = 30;
    const deg = t.cv.reduce((s, c) => s + c.d * c.q, 0);
    const bb = Math.max(0, Math.ceil(L / maxL) - 1, Math.ceil(deg / maxD) - 1);
    const xb = Math.max(0, Math.min(20, Math.floor(+t.xb || 0)));
    const boxes = bb + xb, seg = boxes + 1;
    const tp = Math.ceil(L * (1 + des) / Lt), tubes = tp * P, uni = Math.max(0, tp - seg) * P, con = seg * 2 * P;
    let sp = mat == 'EMT' ? 3 : (ix <= 2 ? .9 : ix <= 5 ? 1.5 : ix <= 7 ? 1.8 : 2.1);
    if (nor == 'EST') sp = Math.min(sp, 1.5);
    const abr = (seg * (Math.ceil(L / seg / sp) + 1) + Math.ceil(deg / 90)) * P;
    const need = TS[ix] * 25.4 * 8, bx = BX.find(b => b[0] * 10 >= need) || BX[BX.length - 1];
    const bs = `${bx[0]}×${bx[1]}×${bx[2]} cm`, ref = mat == 'EMT' ? 'NEC 358' : 'NEC 352';
    const ln = [{ g: 0, n: `Tubo ${mat} ${sz}`, r: `Tramos de ${String(Lt).replace('.', ',')} m, con ${Math.round(des * 100)}% de desperdicio`, q: tubes, u: 'tubos' }];
    t.cv.forEach(c => ln.push({ g: 1, n: mat == 'PVC' ? `Curva PVC ${c.d}° ${sz}` : `Doblez EMT ${c.d}° ${sz}`, r: mat == 'PVC' ? 'Prefabricada, una por cada giro' : 'Se hace en obra con dobladora', q: c.q * P, u: mat == 'PVC' ? 'pzas' : 'dobleces' }));
    ln.push({ g: 2, n: `Caja de registro ${bs}`, r: `Máx. ${maxL} m y ${maxD}° entre cajas (${nor == 'EST' ? 'TIA-569' : ref + '.26'}); lado ≥ 8 × diámetro`, q: boxes, u: 'cajas' },
      { g: 3, n: 'Cajas terminales o de salida', r: 'Una al inicio y otra al final de cada tramo', q: 2, u: 'cajas' },
      { g: 4, n: mat == 'EMT' ? `Conector EMT a caja ${sz}` : `Adaptador terminal PVC ${sz}`, r: 'Uno por cada extremo de tubo que llega a una caja', q: con, u: 'pzas' },
      { g: 5, n: `Unión ${mat} ${sz}`, r: 'Una entre cada par de tubos consecutivos', q: uni, u: 'pzas' },
      { g: 6, n: `Abrazadera ${mat == 'EMT' ? 'EMT de uña' : 'para PVC'} ${sz}`, r: `Cada ${f1(sp)} m y a ≤ 0,9 m de cajas y curvas (${nor == 'EST' ? 'estructurado' : ref + '.30'})`, q: abr, u: 'pzas' });
    items.forEach(it => ln.push({ g: 7, n: it.n, r: 'Longitud del tramo más 1 m de holgura por caja y extremo', q: Math.ceil(it.q * (L + boxes + 2)), u: 'm' }));

    const per = items.map(i => ({ ...i, q: Math.ceil(i.q / P) }));
    const R = Math.sqrt(4 * A / Math.PI) / 2, cs = pack(per, R), V = R * 1.2, np = per.reduce((s, r) => s + r.q, 0);
    const svg = `<svg viewBox="${-V} ${-V} ${2 * V} ${2 * V}" role="img" aria-label="Sección de la tubería"><circle r="${R * 1.08}" fill="none" stroke="#1d3f78" stroke-width="${R * .14}"/><circle r="${R}" fill="#f1f5f9"/><circle r="${R * Math.sqrt(limP)}" fill="none" stroke="#8fb60f" stroke-width="${R * .022}" stroke-dasharray="${R * .06} ${R * .05}"/>${cs.map(c => `<circle cx="${c.x}" cy="${c.y}" r="${c.r}" fill="${PAL[c.k % 7]}" stroke="rgba(0,0,0,.4)" stroke-width="${R * .012}"/>`).join('')}</svg>`;
    const lg = per.map((it, k) => `<li><i style="background:${PAL[k % 7]}"></i>${it.q} × ${esc(it.n)} (Ø ${f1(it.d)} mm)</li>`).join('');
    return { t, mat, sz, P, fill, limP, Lt, L, deg, boxes, bb, xb, bs, con, ln, svg, lg, Ri: R * 2, warnFit: cs.length < np && np <= 160, ok: fill <= limP * 100 + .01 };
  }

  /* Devuelve resultados por tramo y listado agregado */
  function run(T, nor, des) {
    const res = T.map(t => calcT(t, nor, des)).filter(Boolean);
    const ag = {};
    res.forEach(r => r.ln.forEach(l => {
      const a = ag[l.n] || (ag[l.n] = { ...l, q: 0, tr: [] });
      a.q += l.q; if (!a.tr.includes(r.t.n)) a.tr.push(r.t.n);
    }));
    const mats = Object.values(ag).sort((a, b) => a.g - b.g);
    return { res, mats };
  }

  return { CAB, G, PAL, run, esc, f1 };
})();
