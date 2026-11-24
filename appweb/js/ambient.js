/* Música ambiente: pad suave generado en el navegador (sin archivos externos). */
(function () {
  const btn = document.getElementById('music'), txt = document.getElementById('musicTxt');
  if (!btn) return;
  // Progresión en registro medio y bajo, para un sonido cálido: Cmaj7 · Am7 · Fmaj7 · G
  const CHORDS = [[130.81, 164.81, 196.00], [110.00, 130.81, 164.81], [87.31, 110.00, 130.81], [98.00, 123.47, 146.83]];
  let ctx = null, master = null, voices = [], timer = null, idx = 0, on = false;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = .2;
    master.connect(lp); lp.connect(ctx.destination);
    // Dos osciladores senoidales por nota, ligeramente desafinados para dar profundidad
    CHORDS[0].forEach(f => [-5, 5].forEach(cents => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = cents;
      const g = ctx.createGain(); g.gain.value = .5;
      o.connect(g); g.connect(master); o.start();
      voices.push({ o, note: CHORDS[0].indexOf(f) });
    }));
  }
  function setChord(i) {
    const t = ctx.currentTime;
    voices.forEach(v => v.o.frequency.setTargetAtTime(CHORDS[i][v.note], t, 3));
  }
  function setUI(state) {
    on = state;
    btn.setAttribute('aria-pressed', String(state));
    txt.textContent = state ? 'Música activa' : 'Música';
    try { localStorage.setItem('cc_music', state ? '1' : '0'); } catch (e) {}
  }
  function start() {
    if (!ctx) build();
    ctx.resume();
    master.gain.setTargetAtTime(.07, ctx.currentTime, 2);
    setChord(idx);
    clearInterval(timer);
    timer = setInterval(() => { idx = (idx + 1) % CHORDS.length; setChord(idx); }, 12000);
    setUI(true);
  }
  function stop() {
    clearInterval(timer);
    if (master) master.gain.setTargetAtTime(0, ctx.currentTime, .6);
    setUI(false);
  }
  btn.addEventListener('click', () => (on ? stop() : start()));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });
  setUI(false);
})();
