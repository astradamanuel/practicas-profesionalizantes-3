import sqlite3 from 'sqlite3';
import { resolve } from 'node:path';

export function connect_db(path) {
    const dbPath = resolve(path);
    return new sqlite3.Database(dbPath, (err) => {
        if (err) console.error("Error al conectar DB:", err.message);
    });
}

export function insertarUsuario(db, username, password) {
    const sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [username, password], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, username });
        });
    });
}