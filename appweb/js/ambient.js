/* Música ambiente generada en el navegador (sin archivos externos).
   Se activa y desactiva con el botón. Los navegadores exigen un clic para iniciar audio. */
(function () {
  const btn = document.getElementById('music'), txt = document.getElementById('musicTxt');
  if (!btn) return;
  // Progresión suave: Cmaj7 · Am7 · Fmaj7 · G
  const CHORDS = [[130.81, 164.81, 196.00, 246.94], [110.00, 130.81, 164.81, 196.00], [87.31, 110.00, 130.81, 164.81], [98.00, 123.47, 146.83, 196.00]];
  let ctx = null, master = null, voices = [], timer = null, idx = 0, on = false;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = .4;
    master.connect(lp); lp.connect(ctx.destination);
    CHORDS[0].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = .12;
      const lfo = ctx.createOscillator(); lfo.frequency.value = .05 + i * .02;
      const lg = ctx.createGain(); lg.gain.value = .03;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      o.connect(g); g.connect(master); o.start();
      voices.push(o);
    });
  }
  function setChord(i) {
    const t = ctx.currentTime;
    voices.forEach((o, k) => o.frequency.setTargetAtTime(CHORDS[i][k], t, 1.6));
  }
  function setUI(state) {
    on = state;
    btn.setAttribute('aria-pressed', String(state));
    txt.textContent = state ? 'Música: desactivar' : 'Música: activar';
    try { localStorage.setItem('cc_music', state ? '1' : '0'); } catch (e) {}
  }
  function start() {
    if (!ctx) build();
    ctx.resume();
    master.gain.setTargetAtTime(.22, ctx.currentTime, 1.5);
    setChord(idx);
    clearInterval(timer);
    timer = setInterval(() => { idx = (idx + 1) % CHORDS.length; setChord(idx); }, 9000);
    setUI(true);
  }
  function stop() {
    clearInterval(timer);
    if (master) master.gain.setTargetAtTime(0, ctx.currentTime, .5);
    setUI(false);
  }
  btn.addEventListener('click', () => (on ? stop() : start()));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });
  setUI(false); // siempre inicia apagada; el usuario decide
})();
