/* Registro del service worker, instalación como app y avisos de conexión. */
(function () {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const btn = document.getElementById('installBtn');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let deferred = null;
  const show = v => { if (btn) btn.classList.toggle('off', !v); };

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show(!standalone); });
  window.addEventListener('appinstalled', () => { deferred = null; show(false); toast('SICAP quedó instalada en tu teléfono.', { type: 'ok' }); });
  if (btn) btn.addEventListener('click', async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; show(false); return; }
    toast('En iPhone: toca Compartir y luego "Añadir a pantalla de inicio".', { ms: 7000 });
  });
  if (isIOS && !standalone) show(true);

  window.addEventListener('offline', () => toast('Sin conexión. Tus cambios se guardarán al volver a conectarte.', { type: 'warn', ms: 6000 }));
  window.addEventListener('online', () => { toast('Conexión restablecida.', { type: 'ok' }); document.dispatchEvent(new Event('cc:retry')); });
})();
