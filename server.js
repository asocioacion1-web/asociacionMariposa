const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "api", "config", ".env") });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const paginas = ["login", "noticia", "noticias", "perfil", "registro"];
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/config", (req, res) => {
  res.json({
    url: process.env.supabase_URL,
    anonKey: process.env.supabase_ANON_KEY,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const paginasAdmin = {
  noticia: path.join(__dirname, "private", "noticia.html"),
  editar: path.join(__dirname, "private", "editarNoticia.html"),
};

async function esAdmin(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return false;

  const cabeceras = {
    apikey: process.env.supabase_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };

  const rUsuario = await fetch(`${process.env.supabase_URL}/auth/v1/user`, { headers: cabeceras });
  if (!rUsuario.ok) return false;
  const usuario = await rUsuario.json();

  const rAdmin = await fetch(
    `${process.env.supabase_URL}/rest/v1/admin?select=id&user_id=eq.${encodeURIComponent(usuario.id)}`,
    { headers: cabeceras }
  );
  if (!rAdmin.ok) return false;
  const filas = await rAdmin.json();
  return filas.length > 0;
}

function servirPaginaAdmin(archivo) {
  return async (req, res) => {
    try {
      if (!(await esAdmin(req))) return res.status(403).json({ error: "No autorizado" });
      res.type("html").send(fs.readFileSync(archivo, "utf8"));
    } catch (error) {
      console.error("Error sirviendo página de admin:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };
}

app.get("/api/admin/noticia", servirPaginaAdmin(paginasAdmin.noticia));
app.get("/api/admin/editar-noticia", servirPaginaAdmin(paginasAdmin.editar));

const paginasUsuario = {
  galeria: path.join(__dirname, "private", "galeria.html"),
  productos: path.join(__dirname, "private", "productos.html"),
  historias: path.join(__dirname, "private", "historias.html"),
};

// Solo comprueba que el token sea de un usuario válido (no hace falta ser admin)
async function haySesion(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return false;

  const respuesta = await fetch(`${process.env.supabase_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.supabase_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  return respuesta.ok;
}

function servirPaginaUsuario(archivo) {
  return async (req, res) => {
    try {
      if (!(await haySesion(req))) return res.status(403).json({ error: "No autorizado" });
      res.type("html").send(fs.readFileSync(archivo, "utf8"));
    } catch (error) {
      console.error("Error sirviendo página de usuario:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };
}

app.get("/api/usuario/galeria", servirPaginaUsuario(paginasUsuario.galeria));
app.get("/api/usuario/productos", servirPaginaUsuario(paginasUsuario.productos));
app.get("/api/usuario/historias", servirPaginaUsuario(paginasUsuario.historias));

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


if (require.main === module) {
  app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
}

module.exports = app;