const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./stock.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Conectado a SQLite");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    tipo_unidad TEXT NOT NULL,
    cantidad REAL NOT NULL CHECK (cantidad >= 0)
  )
`);

module.exports = db;