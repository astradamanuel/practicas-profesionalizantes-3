const express = require("express"); /* Importas Express (framework) */
const cors = require("cors"); /* Importas una librería */
const db = require("./db"); /* traigo la config. de mi db */

const app = express(); /* Creas una instancia de la aplicación */

app.use(cors());
app.use(express.json());

/* =========================
   ENDPOINT: OBTENER MATERIALES
========================= */
app.get("/materiales", (req, res) => {
  db.all("SELECT * FROM stock", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json(rows);
  });
});

/* =========================
   ENDPOINT: CREAR MATERIAL
========================= */
app.post("/materiales", (req, res) => {
  const { nombre, tipo_unidad, cantidad } = req.body;

  if (!nombre || !tipo_unidad || cantidad == null) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  db.run(
    "INSERT INTO stock (nombre, tipo_unidad, cantidad) VALUES (?, ?, ?)",
    [nombre, tipo_unidad, cantidad],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

/* =========================
    ENDPOINT: COMPRAR MATERIALES
========================= */
app.put("/materiales/:id/compra", (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  if (cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  db.run(
    "UPDATE stock SET cantidad = cantidad + ? WHERE id = ?",
    [cantidad, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ mensaje: "Compra registrada" });
    }
  );
});

/* =========================
   ENDPOINT: VENDER MATERIAL
========================= */
app.put("/materiales/:id/venta", (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  if (cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  // 1. Obtener stock actual
  db.get("SELECT cantidad FROM stock WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Material no encontrado" });
    }

    // 2. Validar stock suficiente
    if (row.cantidad < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // 3. Restar stock
    db.run(
      "UPDATE stock SET cantidad = cantidad - ? WHERE id = ?",
      [cantidad, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: "Venta registrada" });
      }
    );
  });
});

/* =========================
   SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
