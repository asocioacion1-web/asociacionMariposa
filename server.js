const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "api", "config", ".env") });
const express = require("express");
const cors = require("cors");
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

app.use(express.static(path.join(__dirname, "/")));

app.get("/:pagina.html", (req, res, next) => {
  if (!paginas.includes(req.params.pagina)) return next();
  res.sendFile(path.join(__dirname, `${req.params.pagina}.html`));
});


if (require.main === module) {
  app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
}

module.exports = app;