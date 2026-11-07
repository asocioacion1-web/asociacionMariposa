(async function () {
  const SOLO_CON_SESION = [];
  const lugar = document.getElementById("navbar-placeholder");
  if (!lugar) return console.error('navbar.js: falta <div id="navbar-placeholder"></div>');
 
  try {
    const r = await fetch("/public/navbar.html");
    if (!r.ok) throw new Error(r.status);
    lugar.outerHTML = await r.text();
  } catch (e) {
    return console.error("navbar.js: no se pudo cargar el template:", e);
  }
 
  document.querySelectorAll("#navbar .nav-link").forEach((a) => {
    if (a.pathname === location.pathname) a.classList.add("active");
  });
 
  let logueado = false, cliente = null;
  try {
    if (typeof supabase === "undefined") throw new Error("falta supabase-js");
    const config = await (await fetch("/api/config")).json();
    cliente = supabase.createClient(config.url, config.anonKey);
    logueado = !!(await cliente.auth.getSession()).data.session;
  } catch (e) { console.error("navbar.js: sesión:", e); }
 
  const t = (id, ocultar) => document.getElementById(id)?.classList.toggle("d-none", ocultar);
  t("linkMiSesion", !logueado);
  t("btnSalirMenu", !logueado);
  t("btnIniciarSesion", logueado);
  SOLO_CON_SESION.forEach((id) => t(id, !logueado));

  let esAdmin = false;
  try {
    const { data: { user } } = await cliente.auth.getUser();
   if (user) {
     const { data } = await cliente.from("admin").select("id").eq("user_id", user.id).maybeSingle();
     esAdmin = !!data;
   }
  } catch (e) { console.error("navbar.js: admin:", e); }
  const enIndex = location.pathname === "/" || location.pathname === "/index.html";
  t("btnCrearNoticiaNav", !(esAdmin && enIndex));;
 
  const persona = document.getElementById("btnPersona");
  persona?.classList.toggle("conectado", logueado);
  persona?.setAttribute("title", logueado ? "Sesión iniciada" : "Sin sesión");
 
  document.getElementById("btnSalirMenu")?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (cliente) await cliente.auth.signOut();
    location.href = "/public/login.html";
  });
 
  document.dispatchEvent(new Event("navbar:listo"));
})();