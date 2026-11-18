/* Menú unificado de Desplaze Fibra Óptica
   Muestra nombre de usuario, foto y correo desde la tabla profiles (igual que la página de inicio).
   Cierra sesión con el botón de la página si existe; si no, cierra y regresa al inicio. */
(function () {
  const SUPABASE_URL = "https://msolmlaqpdjxiiclfgky.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_55-c2uJqIb0LukOzgCiAIQ_NcC2Cgef";
  if (!window.supabase) return;
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const all = sel => document.querySelectorAll(sel);

  function pintar(nombre, email, foto, inicial) {
    all("[data-am-name]").forEach(el => el.textContent = nombre);
    all("[data-mh-name]").forEach(el => el.textContent = nombre);
    all("[data-mh-email]").forEach(el => el.textContent = email);
    all("[data-am-initial]").forEach(el => { el.textContent = inicial; el.hidden = !!foto; });
    all("[data-am-img]").forEach(img => {
      if (foto) { img.src = foto; img.hidden = false; } else { img.hidden = true; }
    });
  }

  sb.auth.getSession().then(async ({ data }) => {
    const u = data?.session?.user;
    if (!u) return;
    const { data: p } = await sb.from("profiles")
      .select("username, avatar_path, updated_at")
      .eq("id", u.id).maybeSingle();
    const foto = p && p.avatar_path
      ? sb.storage.from("avatars").getPublicUrl(p.avatar_path).data.publicUrl + "?v=" + encodeURIComponent(p.updated_at || "")
      : "";
    const nombre = (p && p.username) || "Sin nombre de usuario";
    const inicial = ((p && p.username) || u.email).charAt(0).toUpperCase();
    pintar(nombre, u.email || "", foto, inicial);
  });

  all("#menu-logout").forEach(btn => btn.addEventListener("click", async () => {
    const original = document.getElementById("logout");
    if (original) return original.click();
    await sb.auth.signOut();
    location.href = "index.html";
  }));
})();
