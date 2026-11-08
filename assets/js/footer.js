(async function () {
  const lugar = document.getElementById("footer-placeholder");
  if (!lugar) return console.error('footer.js: falta <div id="footer-placeholder"></div>');
 
  try {
    const r = await fetch("/public/footer.html");
    if (!r.ok) throw new Error(r.status);
    lugar.outerHTML = await r.text();
  } catch (e) {
    return console.error("footer.js: no se pudo cargar el template:", e);
  }
 
  document.querySelectorAll("#footer .nav-link").forEach((a) => {
    if (a.pathname === location.pathname) a.classList.add("active");
  });

  document.dispatchEvent(new Event("footer:listo"));
})();