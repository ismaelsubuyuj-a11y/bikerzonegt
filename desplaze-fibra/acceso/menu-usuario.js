/* Menú unificado de Desplaze Fibra Óptica
   - Llena nombre y correo de la cuenta en la cabecera del menú.
   - Cierra sesión usando el botón de la página si existe; si no, cierra y regresa al inicio.
   No cambia la lógica de las páginas: mapa y simulación abren su propio menú. */
(function () {
  const SUPABASE_URL = "https://msolmlaqpdjxiiclfgky.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_55-c2uJqIb0LukOzgCiAIQ_NcC2Cgef";
  if (!window.supabase) return;
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const nombreDesde = u => (u?.user_metadata?.username || u?.user_metadata?.nombre || (u?.email || "").split("@")[0] || "Cuenta");

  sb.auth.getSession().then(({ data }) => {
    const u = data?.session?.user;
    if (!u) return;
    document.querySelectorAll("[data-mh-name]").forEach(el => el.textContent = nombreDesde(u));
    document.querySelectorAll("[data-mh-email]").forEach(el => el.textContent = u.email || "");
  });

  document.querySelectorAll("#menu-logout").forEach(btn => btn.addEventListener("click", async () => {
    const original = document.getElementById("logout");
    if (original) return original.click();
    await sb.auth.signOut();
    location.href = "index.html";
  }));
})();
