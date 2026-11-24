/* Notificaciones breves con acción opcional (p. ej. "Deshacer"). */
(function () {
  let host = null;
  function ensure() {
    if (!host) {
      host = document.createElement('div');
      host.className = 'toasts';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    return host;
  }
  window.toast = function (msg, opt) {
    opt = opt || {};
    const ms = opt.ms || (opt.label ? 6000 : 3200);
    const el = document.createElement('div');
    el.className = 'toast ' + (opt.type || '');
    const span = document.createElement('span');
    span.textContent = msg;
    el.appendChild(span);
    if (opt.label && opt.fn) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = opt.label;
      b.onclick = () => { opt.fn(); el.remove(); };
      el.appendChild(b);
    }
    ensure().appendChild(el);
    setTimeout(() => el.classList.add('hide'), ms);
    setTimeout(() => el.remove(), ms + 400);
  };
})();
