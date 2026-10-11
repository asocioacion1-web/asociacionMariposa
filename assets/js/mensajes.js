export function mostrarMensaje(mensajes, tipo = "danger") {
  const lista = Array.isArray(mensajes) ? mensajes : [mensajes];

  // Crea el contenedor la primera vez, no hace falta tocar el HTML
  let contenedor = document.getElementById("contenedor-toasts");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "contenedor-toasts";
    contenedor.className = "toast-container position-fixed top-0 end-0 p-3";
    contenedor.style.zIndex = "1100";
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${tipo} border-0`;
  toast.setAttribute("role", "alert");

  const fila = document.createElement("div");
  fila.className = "d-flex";

  const cuerpo = document.createElement("div");
  cuerpo.className = "toast-body";
  lista.forEach((texto) => {
    const linea = document.createElement("div");
    linea.textContent = texto; // textContent: nunca interpreta HTML
    cuerpo.appendChild(linea);
  });

  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = `btn-close ${tipo === "warning" ? "" : "btn-close-white"} me-2 m-auto`;
  cerrar.setAttribute("data-bs-dismiss", "toast");
  cerrar.setAttribute("aria-label", "Cerrar");

  fila.append(cuerpo, cerrar);
  toast.appendChild(fila);
  contenedor.appendChild(toast);

  toast.addEventListener("hidden.bs.toast", () => toast.remove());
  new bootstrap.Toast(toast, { delay: tipo === "danger" ? 6000 : 3500 }).show();
}