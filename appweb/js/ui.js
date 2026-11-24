/* Menú flotante de cuenta: iniciales y apertura/cierre. */
(function () {
  const btn = document.getElementById('userBtn'), menu = document.getElementById('userMenu');
  if (!btn || !menu) return;
  const close = () => { menu.classList.add('off'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.toggle('off') === false;
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  menu.addEventListener('click', e => { if (e.target.closest('button')) close(); });

  const who = document.getElementById('who'), ini = document.getElementById('initials');
  const upd = () => {
    const t = (who.textContent || '').trim();
    ini.textContent = t ? t.slice(0, 2).toUpperCase() : '··';
  };
  new MutationObserver(upd).observe(who, { childList: true, characterData: true, subtree: true });
  upd();
})();
