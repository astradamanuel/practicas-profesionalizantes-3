import sqlite3 from 'sqlite3';
import { resolve } from 'node:path';

export function connect_db(path) {
    const dbPath = resolve(path);
    return new sqlite3.Database(dbPath, (err) => {
        if (err) console.error("Error al conectar DB:", err.message);
    });
}

// --- ALTA ---
export function createUser(db, username, password) {
    const sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [username, password], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, username });
        });
    });
}

// --- BAJA ---
export function deleteUser(db, id) {
    const sql = `DELETE FROM user WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [id], function (err) {
            if (err) return reject(err);
            resolve({ deletedID: id });
        });
    });
}

// --- MODIFICACIÓN ---
export function updateUserPassword(db, id, newPassword) {
    const sql = `UPDATE user SET password = ? WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [newPassword, id], function (err) {
            if (err) return reject(err);
            resolve({ updatedID: id });
        });
    });
}

// --- GESTIÓN DE PERMISOS (Asignar a Grupo) ---
export function addUserToGroup(db, id_user, id_group) {
    const sql = `INSERT INTO members (id_user, id_group) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [id_user, id_group], (err) => {
            if (err) return reject(err);
            resolve({ status: "assigned", id_user, id_group });
        });
    });
}

// --- GESTIÓN DE PERMISOS (Asignar/Cambiar de Grupo) ---
export function assignGroup(db, id_user, id_group) {
    // Usamos INSERT OR REPLACE para que si ya tiene un grupo, lo actualice
    const sql = `INSERT OR REPLACE INTO members (id_user, id_group) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [id_user, id_group], function (err) {
            if (err) return reject(err);
            resolve({ status: "success", id_user, id_group });
        });
    });
}