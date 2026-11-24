(function () {
  'use strict';
  const { run, esc, f1, G, PAL } = window.Calc;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const Q = n => 'Q ' + (+n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const CAB_OPTS = (() => { let k = 0; return G.map(([g, a]) => `<optgroup label="${esc(g)}">` + a.map(([n]) => `<option value="${k++}">${esc(n)}</option>`).join('') + '</optgroup>').join(''); })();
  const mk = n => ({ n: 'Tramo ' + n, L: 45, m: 'PVC', xb: 0, rows: [{ i: 1, q: 4 }], cv: [{ d: 90, q: 2 }] });

  /* ---------- Estado ---------- */
  let T_ = [mk(1)], prices = {}, ivaOn = false, mats = [], res = [], loading = false;
  let sb = null, UID = null, PID = null, saveT = null, saving = false, lastSaved = '', idleT = null;
  const IDLE_MS = 30 * 60 * 1000;
  const EMP = { n: 'Conéctate', nit: '5646-6948', em: 'redtecnologiasanjuan@gmail.com', tel: '', dir: '', logo: null };
  try { Object.assign(EMP, JSON.parse(localStorage.getItem('cc_emp') || '{}')); } catch (e) {}
  const FO = 'CC-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + (Math.floor(Math.random() * 900) + 100);

  /* ---------- Editor de tramos ---------- */
  function ed() {
    $('#trs').innerHTML = T_.map((t, k) => `
    <section class="card">
      <div class="tramo-head">
        <input type="text" value="${esc(t.n)}" data-t="${k}" data-f="n" aria-label="Nombre del tramo">
        <button class="btn icon sm" data-dup="${k}" title="Duplicar" type="button">⧉</button>
        <button class="btn icon sm" data-del="${k}" title="Quitar" type="button">×</button>
      </div>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>Tubería</label>
          <div class="seg-tube">${['PVC', 'EMT'].map(m => `<label><input type="radio" name="m${k}" value="${m}" data-t="${k}" data-f="m" ${t.m == m ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div></div>
        <div class="field"><label>Longitud (m)</label><input type="number" min="0" step="0.5" value="${t.L}" data-t="${k}" data-f="L"></div>
      </div>
      <div class="sub-label">Cables</div>
      ${t.rows.map((r, j) => `<div class="cable-row">
        <select data-t="${k}" data-r="${j}" data-f="i" aria-label="Tipo de cable">${CAB_OPTS}</select>
        <input type="number" min="1" value="${r.q}" data-t="${k}" data-r="${j}" data-f="q" aria-label="Cantidad">
        <button class="btn icon sm" data-rm="${k}.${j}" type="button" aria-label="Quitar cable">×</button></div>`).join('')}
      <button class="btn sm ghost" data-addr="${k}" type="button" style="padding-left:0">+ Otro tipo de cable</button>
      <div class="sub-label">Cajas extra</div>
      <div class="inline">
        <input type="number" min="0" max="20" step="1" value="${t.xb || 0}" data-t="${k}" data-f="xb" aria-label="Cajas extra">
        <span class="note" id="xs${k}">Completa longitud y cables</span>
      </div>
      <div class="sub-label">Curvas</div>
      <div class="inline" style="grid-template-columns:1fr 80px auto">
        <select class="cd" aria-label="Ángulo">${[15, 30, 45, 60, 90].map(d => `<option ${d == 90 ? 'selected' : ''}>${d}</option>`).join('')}</select>
        <input type="number" class="cq" min="1" value="1" aria-label="Cantidad de curvas">
        <button class="btn sm" data-addk="${k}" type="button">Agregar</button>
      </div>
      <div class="chips">${t.cv.map((c, j) => `<span class="chip">${c.q} × ${c.d}°<button data-c="${k}.${j}" type="button" aria-label="Quitar curva">×</button></span>`).join('') || '<span class="note">Tramo recto, sin curvas.</span>'}</div>
    </section>`).join('');
    $$('#trs select[data-r]').forEach(s => s.value = T_[s.dataset.t].rows[s.dataset.r].i);
  }
  $('#trs').addEventListener('input', e => {
    const t = e.target, k = t.dataset.t; if (k == null) return;
    const o = T_[k], f = t.dataset.f;
    if (t.dataset.r != null) o.rows[t.dataset.r][f] = f == 'i' ? +t.value : +t.value;
    else o[f] = (f == 'L' || f == 'xb') ? +t.value : t.value;
    calc();
  });
  $('#trs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.del != null) { if (T_.length < 2) return; T_.splice(d.del, 1); }
    else if (d.dup != null) { const c = JSON.parse(JSON.stringify(T_[d.dup])); c.n += ' (copia)'; T_.splice(+d.dup + 1, 0, c); }
    else if (d.rm != null) { const [k, j] = d.rm.split('.'); if (T_[k].rows.length < 2) return; T_[k].rows.splice(j, 1); }
    else if (d.addr != null) T_[d.addr].rows.push({ i: 0, q: 1 });
    else if (d.addk != null) {
      const c = b.closest('.card'), a = +c.querySelector('.cd').value, q = Math.max(1, +c.querySelector('.cq').value || 1), o = T_[d.addk];
      const x = o.cv.find(v => v.d == a); x ? x.q += q : o.cv.push({ d: a, q });
    }
    else if (d.c != null) { const [k, j] = d.c.split('.'); T_[k].cv.splice(j, 1); }
    else return;
    ed(); calc();
  });
  $('#addt').onclick = () => { T_.push(mk(T_.length + 1)); ed(); calc(); };
  ['#pj', '#nor', '#des', '#rp', '#ct'].forEach(s => $(s).addEventListener('input', calc));

  /* ---------- Resultados ---------- */
  function calc() {
    const nor = $('#nor').value, des = Math.max(0, +$('#des').value || 0) / 100;
    $('#mn').textContent = nor == 'EST' ? 'TIA-569 (estructurado)' : 'NEC / NFPA 70';
    const out = run(T_, nor, des);
    res = out.res; mats = out.mats;
    T_.forEach((t, k) => {
      const r = res.find(x => x.t === t), e = $('#xs' + k);
      if (e) e.textContent = r ? (r.xb ? `Medida ${r.bs} · +${r.xb * 2 * r.P} conectores` : `Medida sugerida ${r.bs}`) : 'Completa longitud y cables';
    });
    queueSave();
    if (!res.length) { $('#out').innerHTML = '<section class="card"><h2>Resultado</h2><p class="note mt">Ingresa la longitud y al menos un cable en un tramo para ver el listado.</p></section>'; return; }
    renderResults(nor);
  }
  function renderResults(nor) {
    const sumg = g => mats.filter(m => m.g == g).reduce((s, m) => s + m.q, 0);
    const LT = res.reduce((s, r) => s + r.L, 0);
    $('#out').innerHTML = `
    <section class="card">
      <div class="card-head"><div><h2>Estimación de materiales</h2><p class="note">${esc($('#pj').value || 'Proyecto sin nombre')} · Folio ${FO} · ${new Date().toLocaleDateString('es-GT')}</p></div></div>
      <div class="kpis">
        <div class="kpi hero"><small>Tramos calculados</small><strong>${res.length}</strong></div>
        <div class="kpi"><small>Longitud total</small><strong>${f1(LT)} m</strong></div>
        <div class="kpi"><small>Tubos</small><strong>${sumg(0)}</strong></div>
        <div class="kpi"><small>Cajas de registro</small><strong>${sumg(2)}</strong></div>
      </div>
      <div class="res-grid">${res.map(r => `
        <div class="res-card">
          <h2>${esc(r.t.n)}</h2>
          <div class="tag"><span><b>${r.mat} ${r.sz}${r.P > 1 ? ' × ' + r.P : ''}</b></span><span><b>${f1(r.fill)}%</b> de ${Math.round(r.limP * 100)}% permitido</span></div>
          <div class="bar"><i style="width:${Math.min(100, r.fill / r.limP)}%;background:${r.ok ? 'var(--ok)' : 'var(--warn)'}"></i></div>
          <div class="diagram">${r.svg}</div>
          <ul class="legend">${r.lg}</ul>
          ${r.xb ? `<p class="note mt">+${r.xb} caja(s) extra de ${r.bs} · +${r.xb * 2 * r.P} conectores</p>` : ''}
          <p class="note mt">Ø interior ${f1(r.Ri)} mm · ${f1(r.L)} m · ${r.deg}° de curvas · ${r.bb} caja(s) por norma${r.P > 1 ? ' <span class="warn">Se reparte en ' + r.P + ' tubos.</span>' : ''}${r.warnFit ? ' <span class="warn">Dibujo referencial.</span>' : ''}</p>
          <ul class="mini">${r.ln.filter(l => l.g < 7 && l.g != 3 && l.q).map(l => `<li><b>${l.q}</b> ${esc(l.n)}</li>`).join('')}</ul>
        </div>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Listado total y precios</h2><span class="note">Precios unitarios en quetzales</span></div>
      <div class="tw"><table>
        <thead><tr><th>Material</th><th class="n">Cant.</th><th>Unidad</th><th class="n">Precio unit.</th><th class="n">Subtotal</th></tr></thead>
        <tbody>${mats.map((m, i) => `<tr>
          <td><b>${esc(m.n)}</b><small>${esc(m.r)}${res.length > 1 ? ' · ' + esc(m.tr.join(', ')) : ''}</small></td>
          <td class="n">${m.q}</td><td>${esc(m.u)}</td>
          <td class="n"><input class="pin" type="number" min="0" step="0.01" data-i="${i}" value="${esc(prices[m.n] ?? '')}" placeholder="0.00" aria-label="Precio unitario de ${esc(m.n)}"></td>
          <td class="n" id="s${i}">${Q(0)}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="totals">
        <div><span class="muted">Subtotal</span><b id="st">${Q(0)}</b></div>
        <div><label class="check" style="margin:0"><input type="checkbox" id="iva" ${ivaOn ? 'checked' : ''}> IVA 12%</label><b id="iv">${Q(0)}</b></div>
        <div class="gt"><span>Total</span><span id="gt">${Q(0)}</span></div>
      </div>
      <p class="note mt">Cálculo de referencia (NEC capítulo 9: 53 %, 31 %, 40 %). Valida con el ingeniero responsable y la normativa del proyecto.</p>
      <div class="actions-row">
        <div class="field" style="min-width:220px"><label for="wa">WhatsApp (opcional)</label><input id="wa" type="text" inputmode="tel" placeholder="502XXXXXXXX"></div>
        <button class="btn primary" id="pr" type="button">Imprimir</button>
        <button class="btn accent" id="ws" type="button">Enviar por WhatsApp</button>
        <button class="btn" id="cp" type="button">Copiar listado</button>
      </div>
      <p class="note" id="msg" style="margin-top:10px"></p>
    </section>`;
    $$('#out .pin').forEach(el => el.addEventListener('input', () => { prices[mats[el.dataset.i].n] = el.value; tot(); queueSave(); }));
    $('#iva').onchange = () => { ivaOn = $('#iva').checked; tot(); queueSave(); };
    $('#pr').onclick = () => window.print();
    $('#ws').onclick = () => {
      const d = $('#wa').value.replace(/\D/g, '');
      const w = window.open('https://wa.me/' + d + '?text=' + encodeURIComponent(txt()), '_blank', 'noopener');
      if (!w) copy();
    };
    $('#cp').onclick = copy;
    tot();
  }
  function tot() {
    let st = 0;
    mats.forEach((m, i) => { const s = (parseFloat(prices[m.n]) || 0) * m.q; st += s; const e = $('#s' + i); if (e) e.textContent = Q(s); });
    const iv = ivaOn ? st * .12 : 0;
    $('#st').textContent = Q(st); $('#iv').textContent = Q(iv); $('#gt').textContent = Q(st + iv);
  }
  function txt() {
    let st = 0;
    const l = mats.map(m => { const p = parseFloat(prices[m.n]) || 0; st += p * m.q; return `• ${m.n}: ${m.q} ${m.u}${p ? ' × ' + Q(p) + ' = ' + Q(p * m.q) : ''}`; });
    const iv = ivaOn ? st * .12 : 0;
    return `*${$('#pj').value || 'Listado de materiales'}* · Folio ${FO}\n${res.map(r => `${r.t.n}: ${r.mat} ${r.sz}, ${f1(r.L)} m, ocupación ${f1(r.fill)}%`).join('\n')}\n\n${l.join('\n')}${st ? `\n\nSubtotal: ${Q(st)}${iv ? '\nIVA 12%: ' + Q(iv) : ''}\n*Total: ${Q(st + iv)}*` : ''}`;
  }
  function copy() {
    const m = $('#msg');
    navigator.clipboard.writeText(txt()).then(() => m.textContent = 'Listado copiado.', () => m.textContent = 'No se pudo copiar; usa Imprimir.');
  }

  /* ---------- Supabase: proyectos ---------- */
  const setSt = t => { $('#stt').textContent = t; };
  const snap = () => ({ T: T_, prices, ivaOn, pj: $('#pj').value, nor: $('#nor').value, des: $('#des').value, rp: $('#rp').value, ct: $('#ct').value });
  function aplicar(d) {
    loading = true; d = d || {};
    T_ = d.T && d.T.length ? d.T : [mk(1)];
    prices = d.prices || {}; ivaOn = !!d.ivaOn;
    $('#pj').value = d.pj || ''; $('#nor').value = d.nor || 'ELE'; $('#des').value = d.des ?? 5;
    $('#rp').value = d.rp || ''; $('#ct').value = d.ct || '';
    ed(); calc(); loading = false;
  }
  async function listP() {
    const r = await sb.from('proyectos').select('id,nombre,updated_at').order('updated_at', { ascending: false });
    if (r.error) { setSt('No se pudieron cargar tus proyectos.'); return null; }
    $('#ps').innerHTML = r.data.map(p => `<option value="${esc(p.id)}">${esc(p.nombre)} · ${new Date(p.updated_at).toLocaleDateString('es-GT')}</option>`).join('') || '<option value="">Sin proyectos guardados</option>';
    if (PID) $('#ps').value = PID;
    return r.data;
  }
  async function openP(id) {
    const r = await sb.from('proyectos').select('datos').eq('id', id).single();
    if (r.error) { setSt('No se pudo abrir el proyecto.'); return; }
    PID = id; aplicar(r.data.datos); lastSaved = JSON.stringify(snap()) + ($('#pj').value.trim() || 'Sin nombre');
    $('#ps').value = id; setSt('Proyecto abierto.');
  }
  function queueSave() {
    if (!sb || !UID || loading) return;
    setSt('Guardando…'); clearTimeout(saveT); saveT = setTimeout(save, 1200);
  }
  async function save() {
    if (!sb || !UID) return;
    if (saving) { queueSave(); return; }
    const n = $('#pj').value.trim() || 'Sin nombre', d = snap(), key = JSON.stringify(d) + n;
    if (key == lastSaved) { setSt('Guardado'); return; }
    saving = true;
    try {
      const row = { nombre: n, datos: d };
      const r = PID
        ? await sb.from('proyectos').update(row).eq('id', PID).select('id').single()
        : await sb.from('proyectos').insert(row).select('id').single();
      if (r.error) throw r.error;
      PID = r.data.id; lastSaved = key;
      setSt('Guardado ' + new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }));
      await listP();
    } catch (e) { setSt('No se pudo guardar. Revisa tu conexión.'); }
    saving = false;
  }
  document.addEventListener('input', e => { if (!e.target.closest('#ps,.auth-screen,#md,header')) queueSave(); }, true);
  $('#ps').addEventListener('change', e => { if (e.target.value) openP(e.target.value); });
  $('#pn').onclick = async () => { PID = null; aplicar({ pj: 'Proyecto nuevo' }); lastSaved = ''; await save(); };
  $('#pd').onclick = async () => {
    if (!PID || !confirm('¿Eliminar este proyecto? No se puede deshacer.')) return;
    await sb.from('proyectos').delete().eq('id', PID);
    PID = null; lastSaved = '';
    const l = await listP();
    if (l && l.length) openP(l[0].id); else { aplicar({}); setSt('Proyecto eliminado.'); }
  };

  /* ---------- Sesión ---------- */
  function resetIdle() { clearTimeout(idleT); if (UID) idleT = setTimeout(() => logout('Sesión cerrada por inactividad.'), IDLE_MS); }
  ['click', 'keydown', 'input'].forEach(ev => document.addEventListener(ev, resetIdle, true));

  async function enter(u) {
    UID = u.id; $('#who').textContent = u.email || '';
    document.body.classList.remove('auth');
    ed(); calc(); tick(); qReset(); resetIdle();
    if (!sb) { aplicar({}); setSt('Modo demostración: los datos no se guardan en la nube.'); return; }
    const l = await listP();
    if (l && l.length) await openP(l[0].id); else { aplicar({}); setSt('Empieza a trabajar; tu proyecto se guardará solo.'); }
  }
  async function logout(msg) {
    clearTimeout(saveT); clearTimeout(idleT);
    if (sb) { try { await sb.auth.signOut(); } catch (e) {} }
    UID = null; PID = null; lastSaved = '';
    aplicar({}); qReset();
    try { localStorage.removeItem('cc_ql'); } catch (e) {}
    $('#p').value = ''; erm(msg || '');
    $('#md').hidden = true;
    document.body.classList.add('auth');
  }
  $('#out2').onclick = () => logout('');

  $('#eye').onclick = () => {
    const p = $('#p'), show = p.type == 'password';
    p.type = show ? 'text' : 'password'; $('#eye').textContent = show ? 'Ocultar' : 'Ver';
  };
  let MODE = 'in';
  const erm = (t, ok) => { const e = $('#err'); e.style.color = ok ? 'var(--ok)' : ''; e.textContent = t; };
  $$('input[name=mode]').forEach(r => r.addEventListener('change', () => {
    MODE = r.value; const up = MODE == 'up';
    $('#cfw').classList.toggle('off', !up); $('#fg').classList.toggle('off', up);
    $('.go').textContent = up ? 'Crear cuenta' : 'Iniciar sesión';
    $('#authTitle').textContent = up ? 'Crear tu cuenta' : 'Acceso al sistema';
    $('#p').autocomplete = up ? 'new-password' : 'current-password';
    erm('');
  }));

  $('#lf').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#u').value.trim(), pass = $('#p').value;
    if (!sb) { if (window.CC && window.CC.url && !/PEGA|TU-PROYECTO/.test(window.CC.url)) erm('No se pudo conectar. Revisa tu conexión.'); else enter({ id: 'demo', email: 'demostración' }); return; }
    if (!email || !pass) { erm('Completa correo y contraseña.'); return; }
    if (MODE == 'up') { await doSignUp(email, pass); return; }
    const go = $('.go'); go.disabled = true;
    let r; try { r = await sb.auth.signInWithPassword({ email, password: pass }); } catch (x) { r = { error: x }; }
    go.disabled = false;
    if (r.error) { erm('Correo o contraseña incorrectos.'); return; }
    $('#p').value = ''; erm(''); enter(r.data.user);
  });
  function friendlyErr(e) {
    const m = (e && e.message) || '';
    if (/registered|already/i.test(m)) return 'Ese correo ya está registrado. Inicia sesión.';
    if (/rate limit|429/i.test(m)) return 'Se alcanzó el límite de correos de confirmación. Intenta de nuevo en una hora.';
    if (/invalid.*email|email.*invalid/i.test(m)) return 'El correo no es válido. Revísalo e intenta de nuevo.';
    if (/password/i.test(m)) return m;
    return 'No se pudo crear la cuenta: ' + m;
  }
  const PAGES = { c: ['Cálculo de canalización', 'Estimación de tubería, cajas y materiales por tramo'], q: ['Presupuestos', 'Cotizaciones para clientes con PDF profesional'] };
  function setPage(v) {
    $('#pageTitle').textContent = PAGES[v][0]; $('#pageSub').textContent = PAGES[v][1];
    document.title = 'SICAP · ' + PAGES[v][0];
  }
  async function doSignUp(email, pass) {
    if (pass.length < 8) { erm('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (pass != $('#p2').value) { erm('Las contraseñas no coinciden.'); return; }
    const go = $('.go'); go.disabled = true;
    let r; try { r = await sb.auth.signUp({ email, password: pass, options: { emailRedirectTo: location.origin + location.pathname } }); } catch (x) { r = { error: x }; }
    go.disabled = false;
    if (r.error) { erm(friendlyErr(r.error)); return; }
    if (r.data.user && r.data.user.identities && !r.data.user.identities.length) { erm('Ese correo ya está registrado. Inicia sesión.'); return; }
    if (r.data.session) { enter(r.data.user); return; }
    erm('Cuenta creada. Revisa tu correo y confirma tu cuenta para entrar.', true);
  }
  $('#gg').onclick = async () => {
    if (!sb) { erm('Google no está disponible en modo demostración.'); return; }
    let r; try { r = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } }); } catch (x) { r = { error: x }; }
    if (r.error) erm('No se pudo iniciar con Google.');
  };
  $('#fg').onclick = async () => {
    const e = $('#u').value.trim();
    if (!sb) { erm('No disponible en modo demostración.'); return; }
    if (!e) { erm('Escribe tu correo arriba y vuelve a tocar el enlace.'); $('#u').focus(); return; }
    let r; try { r = await sb.auth.resetPasswordForEmail(e, { redirectTo: location.origin + location.pathname }); } catch (x) { r = { error: x }; }
    r.error ? erm('No se pudo enviar el correo.') : erm('Si el correo existe, recibirás un enlace para restablecer tu contraseña.', true);
  };
  if (sb) sb.auth.onAuthStateChange(ev => {
    if (ev == 'PASSWORD_RECOVERY') setTimeout(() => { $('#mm').textContent = 'Escribe tu nueva contraseña.'; $('#md').hidden = false; $('#np').focus(); }, 500);
  });

  $('#ac').onclick = () => { $('#mm').textContent = ''; $('#md').hidden = false; $('#np').focus(); };
  $('#cl').onclick = () => { $('#md').hidden = true; };
  $('#sv').onclick = async () => {
    const p = $('#np').value, m = $('#mm');
    if (!sb) { m.textContent = 'No disponible en modo demostración.'; return; }
    if (p.length < 8) { m.textContent = 'La contraseña debe tener al menos 8 caracteres.'; return; }
    if (p != $('#nc').value) { m.textContent = 'Las contraseñas no coinciden.'; return; }
    const r = await sb.auth.updateUser({ password: p });
    m.textContent = r.error ? 'No se pudo actualizar la contraseña.' : 'Contraseña actualizada.';
    if (!r.error) { $('#np').value = $('#nc').value = ''; }
  };

  /* ---------- Presupuestos ---------- */
  let Qs = null, QH = [];
  const qNum = n => n ? 'COT-' + String(n).padStart(5, '0') : 'Automático al generar';
  const qDate = i => new Date(i || Date.now()).toLocaleString('es-GT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  const qNew = () => ({ id: null, numero: null, fecha: null, c: '', d: '', e: '', w: '', may: false, cost: false, iva: false, obs: 'Validez de la oferta: 15 días. Precios en quetzales (Q).', it: [{ d: '', q: 1, pu: '', pm: '', c: '' }] });
  const lt = it => (+it.q || 0) * (Qs.may && +it.pm > 0 ? +it.pm : (+it.pu || 0));
  const qMsg = t => { $('#qm2').textContent = t; };
  const cloud = () => sb && UID && UID != 'demo';
  const qLocal = () => { try { return JSON.parse(localStorage.getItem('cc_ql') || '[]'); } catch (e) { return []; } };

  function qTot() {
    const sub = Qs.it.reduce((a, it) => a + lt(it), 0), iv = Qs.iva ? sub * .12 : 0;
    const cs = Qs.it.reduce((a, it) => a + (+it.q || 0) * (+it.c || 0), 0);
    $('#qsub').textContent = Q(sub); $('#qiv').textContent = Q(iv); $('#qtot').textContent = Q(sub + iv);
    $('#qivr').classList.toggle('off', !Qs.iva);
    $('#qcs').classList.toggle('off', !Qs.cost);
    $('#qcs').textContent = `Costo interno ${Q(cs)} · Ganancia estimada ${Q(sub - cs)} (no aparece en el PDF)`;
    Qs.it.forEach((it, i) => { const e = $('#ql' + i); if (e) e.textContent = Q(lt(it)); });
    return { sub, iv, tot: sub + iv };
  }
  function qDraw() {
    $('#qc').value = Qs.c; $('#qd').value = Qs.d; $('#qe').value = Qs.e; $('#qw').value = Qs.w; $('#qo').value = Qs.obs;
    $('#qm').checked = Qs.may; $('#qk').checked = Qs.cost; $('#qv').checked = Qs.iva;
    $('#qn').textContent = qNum(Qs.numero); $('#qf').textContent = qDate(Qs.fecha);
    $('#qhead').innerHTML = `<tr><th>Descripción del producto o servicio</th><th class="n">Cant.</th><th class="n">P. unitario</th>${Qs.may ? '<th class="n">P. mayorista</th>' : ''}${Qs.cost ? '<th class="n">Costo</th>' : ''}<th class="n">Total</th><th></th></tr>`;
    const num = (i, f, v) => `<td class="num"><input type="number" min="0" step="any" data-i="${i}" data-f="${f}" value="${esc(v)}"></td>`;
    $('#qbody').innerHTML = Qs.it.map((it, i) => `<tr>
      <td class="desc"><textarea data-i="${i}" data-f="d" rows="2" placeholder="Describe el producto o servicio. Arrastra la esquina para agrandar.">${esc(it.d)}</textarea></td>
      ${num(i, 'q', it.q)}${num(i, 'pu', it.pu)}${Qs.may ? num(i, 'pm', it.pm) : ''}${Qs.cost ? num(i, 'c', it.c) : ''}
      <td class="tot" id="ql${i}"></td>
      <td><button class="btn icon sm" data-rm="${i}" type="button" aria-label="Quitar partida">×</button></td></tr>`).join('');
    qTot();
  }
  async function qHist() {
    let L = [];
    if (cloud()) { const r = await sb.from('cotizaciones').select('id,numero,cliente,fecha,datos').order('numero', { ascending: false }).limit(30); if (!r.error) L = r.data; }
    else L = qLocal();
    QH = L;
    $('#qh').innerHTML = L.length ? L.map((x, i) => `<tr><td><b>${qNum(x.numero)}</b></td><td>${esc(x.cliente || 'Sin cliente')}</td><td>${qDate(x.fecha)}</td><td class="n">${Q(x.datos.tot || 0)}</td><td class="n"><button class="btn sm" data-open="${i}" type="button">Abrir</button></td></tr>`).join('')
      : '<tr><td colspan="5" class="note">Aún no hay presupuestos guardados.</td></tr>';
  }
  function qReset() { Qs = qNew(); qDraw(); $('#qp').classList.add('off'); qMsg('Al generar el PDF se asigna el número y se guarda la fecha y hora.'); qHist(); }
  function qOpen(x) {
    if (!x) return;
    const d = x.datos;
    Qs = { ...qNew(), id: x.id, numero: x.numero, fecha: x.fecha, c: x.cliente || '', d: d.d || '', e: d.e || '', w: d.w || '', may: !!d.may, cost: !!d.cost, iva: !!d.iva, obs: d.obs ?? '', it: d.it && d.it.length ? d.it : qNew().it };
    qDraw(); $('#qp').classList.add('off'); qMsg('Presupuesto abierto. Al regenerarlo conserva su número.'); scrollTo(0, 0);
  }
  async function qSave() {
    const T = qTot();
    const datos = { it: Qs.it, may: Qs.may, cost: Qs.cost, iva: Qs.iva, obs: Qs.obs, d: Qs.d, e: Qs.e, w: Qs.w, tot: T.tot };
    const row = { cliente: Qs.c.trim(), datos };
    if (cloud()) {
      const r = Qs.id
        ? await sb.from('cotizaciones').update(row).eq('id', Qs.id).select('id,numero,fecha').single()
        : await sb.from('cotizaciones').insert(row).select('id,numero,fecha').single();
      if (r.error) throw r.error;
      Object.assign(Qs, { id: r.data.id, numero: r.data.numero, fecha: r.data.fecha });
    } else {
      const L = qLocal();
      if (!Qs.numero) { let n = 1; try { n = (+localStorage.getItem('cc_qn') || 0) + 1; localStorage.setItem('cc_qn', n); } catch (e) { n = L.length + 1; } Qs.numero = n; Qs.fecha = new Date().toISOString(); Qs.id = 'l' + n; }
      const rec = { id: Qs.id, numero: Qs.numero, cliente: row.cliente, fecha: Qs.fecha, datos };
      const i = L.findIndex(x => x.id == Qs.id); i < 0 ? L.unshift(rec) : L[i] = rec;
      try { localStorage.setItem('cc_ql', JSON.stringify(L.slice(0, 60))); } catch (e) {}
    }
    $('#qn').textContent = qNum(Qs.numero); $('#qf').textContent = qDate(Qs.fecha);
    qHist();
  }
  const imgInfo = (src, r) => new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const sx = r ? r[0] : 0, sy = r ? r[1] : 0, sw = r ? r[2] : im.width, sh = r ? r[3] : im.height;
      const k = Math.min(1, 900 / sw), c = document.createElement('canvas');
      c.width = Math.round(sw * k); c.height = Math.round(sh * k);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
      res({ u: c.toDataURL('image/png'), w: c.width, h: c.height });
    };
    im.onerror = () => res(null); im.src = src;
  });
  async function buildPdf() {
    if (!window.jspdf) { qMsg('No se cargó el generador de PDF. Revisa tu conexión.'); return null; }
    try { await qSave(); } catch (e) { qMsg('No se pudo guardar el presupuesto. Intenta de nuevo.'); return null; }
    const T = qTot();
    const logo = EMP.logo ? await imgInfo(EMP.logo, null) : (window.LOGO ? await imgInfo(window.LOGO, null) : null);
    const doc = window.PDF.build({
      num: qNum(Qs.numero), fecha: qDate(Qs.fecha), cliente: Qs.c, dir: Qs.d, email: Qs.e, tel: Qs.w,
      rows: Qs.it.filter(it => it.d || +it.q).map(it => ({ desc: it.d, q: +it.q || 0, pu: +it.pu || 0, pm: +it.pm || 0, total: lt(it) })),
      may: Qs.may, iva: Qs.iva, sub: T.sub, ivaAmt: T.iv, tot: T.tot, obs: Qs.obs,
      emisor: EMP, logo
    });
    return { doc, name: `Presupuesto-${qNum(Qs.numero)}.pdf` };
  }
  async function qShare(k) {
    const r = await buildPdf(); if (!r) return;
    const file = new File([r.doc.output('blob')], r.name, { type: 'application/pdf' });
    const txt = `Presupuesto ${qNum(Qs.numero)} - ${EMP.n}\nCliente: ${Qs.c || '—'}\nTotal: ${Q(qTot().tot)}`;
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: r.name, text: txt }); qMsg('PDF compartido.'); return; }
    } catch (e) { if (e && e.name == 'AbortError') return; }
    r.doc.save(r.name);
    if (k == 'w') {
      const d = Qs.w.replace(/\D/g, '');
      window.open('https://wa.me/' + d + '?text=' + encodeURIComponent(txt + '\n(Adjunto el PDF descargado)'), '_blank', 'noopener');
      qMsg('Se descargó el PDF. Adjúntalo en WhatsApp.');
    } else {
      location.href = 'mailto:' + encodeURIComponent(Qs.e.trim()) + '?subject=' + encodeURIComponent('Presupuesto ' + qNum(Qs.numero) + ' - ' + EMP.n) + '&body=' + encodeURIComponent(txt + '\n\nAdjunto el PDF.');
      qMsg('Se descargó el PDF. Adjúntalo en tu correo.');
    }
  }

  const QM = { qc: 'c', qd: 'd', qe: 'e', qw: 'w', qo: 'obs' }, QF = { qm: 'may', qk: 'cost', qv: 'iva' };
  $('#v-quo').addEventListener('input', e => {
    const t = e.target;
    if (QM[t.id]) { Qs[QM[t.id]] = t.value; return; }
    if (t.dataset.i != null) { Qs.it[t.dataset.i][t.dataset.f] = t.value; qTot(); }
  });
  $('#v-quo').addEventListener('change', e => { const t = e.target; if (QF[t.id]) { Qs[QF[t.id]] = t.checked; qDraw(); } });
  $('#v-quo').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.rm != null) { if (Qs.it.length > 1) { Qs.it.splice(d.rm, 1); qDraw(); } }
    else if (b.id == 'qa') { Qs.it.push({ d: '', q: 1, pu: '', pm: '', c: '' }); qDraw(); }
    else if (d.open != null) qOpen(QH[d.open]);
  });
  $('#qgen').onclick = async () => {
    const r = await buildPdf(); if (!r) return;
    $('#qfr').src = r.doc.output('bloburl'); $('#qp').classList.remove('off');
    qMsg('PDF generado: ' + qNum(Qs.numero) + '.');
  };
  $('#qdl').onclick = async () => { const r = await buildPdf(); if (r) { r.doc.save(r.name); qMsg('PDF descargado: ' + qNum(Qs.numero) + '.'); } };
  $('#qwa').onclick = () => qShare('w');
  $('#qma').onclick = () => qShare('m');
  $('#qnw').onclick = qReset;

  /* Datos de empresa */
  const EF = { emn: 'n', emi: 'nit', eme: 'em', emt: 'tel', emd: 'dir' };
  const saveEmp = () => { try { localStorage.setItem('cc_emp', JSON.stringify(EMP)); } catch (e) {} };
  Object.entries(EF).forEach(([id, k]) => { const el = $('#' + id); el.value = EMP[k] || ''; el.addEventListener('input', () => { EMP[k] = el.value; saveEmp(); }); });
  const logoTxt = () => { $('#emlt').textContent = EMP.logo ? 'Logo personalizado activo.' : 'Usando el logo de Conéctate.'; };
  logoTxt();
  $('#eml').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { $('#emlt').textContent = 'Usa PNG, JPG o WEBP.'; return; }
    if (f.size > 1500000) { $('#emlt').textContent = 'La imagen pesa más de 1.5 MB.'; return; }
    const r = new FileReader(); r.onload = () => { EMP.logo = r.result; saveEmp(); logoTxt(); }; r.readAsDataURL(f);
  });
  $('#emx').onclick = () => { EMP.logo = null; $('#eml').value = ''; saveEmp(); logoTxt(); };

  $$('.tabs button').forEach(b => b.onclick = () => {
    $$('.tabs button').forEach(x => x.classList.toggle('on', x == b));
    $('#v-calc').classList.toggle('off', b.dataset.v != 'c');
    $('#v-quo').classList.toggle('off', b.dataset.v != 'q'); setPage(b.dataset.v);
    scrollTo(0, 0);
  });

  /* ---------- Reloj, clima y logos ---------- */
  function tick() {
    const d = new Date();
    $('#fd').textContent = d.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#clock').textContent = d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });
    $('#clockDate').textContent = d.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  async function wx() {
    const WC = c => c == 0 ? ['☀️', 'Despejado'] : c < 3 ? ['⛅', 'Parcialmente nublado'] : c == 3 ? ['☁️', 'Nublado'] : c < 50 ? ['🌫️', 'Neblina'] : c < 70 || (c > 79 && c < 83) ? ['🌧️', 'Lluvia'] : c > 94 ? ['⛈️', 'Tormenta'] : ['🌦️', 'Variable'];
    let w = null;
    try {
      const a = new AbortController(); setTimeout(() => a.abort(), 5000);
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=14.63&longitude=-90.51&current=temperature_2m,weather_code&timezone=America%2FGuatemala', { signal: a.signal });
      const j = await r.json(); w = { t: Math.round(j.current.temperature_2m), c: j.current.weather_code };
    } catch (e) {}
    const [i, l] = w ? WC(w.c) : ['⛅', 'Clima no disponible'];
    $('#wxIcon').textContent = i;
    $('#wxTemp').textContent = w ? w.t + '°C' : '--°C';
    $('#wxTxt').textContent = l + ' · Ciudad de Guatemala';
  }

  /* ---------- Arranque ---------- */
  document.querySelectorAll('img[data-logo]').forEach(i => i.src = window.LOGO || '');
  FO_set();
  function FO_set() { $('#fo').textContent = FO; }
  setPage('c');
  tick(); setInterval(tick, 30000);
  wx(); setInterval(wx, 600000);
  Qs = qNew(); qDraw();

  const cfg = window.CC || {};
  const configured = cfg.url && !/TU-PROYECTO|PEGA/.test(cfg.url) && cfg.key && !/TU_CLAVE|PEGA/.test(cfg.key);
  try { if (configured && window.supabase) sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } }); } catch (e) {}

  (async () => {
    if (!sb) {
      if (configured) erm('No se pudo cargar Supabase. Revisa tu conexión.');
      else { $('#u').required = $('#p').required = false; $('#demo').hidden = false; $('.go').textContent = 'Entrar (modo demostración)'; }
      return;
    }
    let r = null; try { r = await sb.auth.getSession(); } catch (e) {}
    if (r && r.data && r.data.session) {
      try { if (/access_token|code=|error/.test(location.hash + location.search)) history.replaceState(null, '', location.pathname); } catch (e) {}
      enter(r.data.session.user);
    } else $('#u').focus();
  })();
})();
