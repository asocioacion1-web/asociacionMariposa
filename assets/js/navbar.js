/* Carga el template /assets/templates/navbar.html en cada página.
   Uso: <div id="navbar-placeholder"></div> donde va el navbar
        <script src="/assets/js/navbar.js"></script> al final del <body>
   (después de bootstrap.bundle y supabase-js). */
(async function () {
  const SOLO_CON_SESION = ["btnGaleria", "btnProducto"];
  const lugar = document.getElementById("navbar-placeholder");
  if (!lugar) return console.error("navbar.js: falta <div id=\"navbar-placeholder\"></div>");
 
  try {
    const r = await fetch("/public/navbar.html");
    if (!r.ok) throw new Error(r.status);
    lugar.outerHTML = await r.text();
  } catch (e) {
    return console.error("navbar.js: no se pudo cargar el template:", e);
  }
 
  const ruta = location.pathname;
  if (ruta === "/" || ruta === "/index.html") {
    document.getElementById("enlaceInicio")?.classList.add("active");
  }
 
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
 
  document.getElementById("btnSalirMenu")?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (cliente) await cliente.auth.signOut();
    location.href = "/public/login.html";
  });
 
  document.dispatchEvent(new Event("navbar:listo"));
})();