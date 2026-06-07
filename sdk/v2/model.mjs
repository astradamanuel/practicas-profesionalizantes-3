import { db } from './db.mjs';

// --- 1. ALTA DE USUARIO ---
export function createUser(username, password) {
    const sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
    const stmt = db.prepare(sql); // Preparamos la sentencia
    const result = stmt.run(username, password); // La ejecutamos
    return { id: result.lastInsertRowid, username }; // Retornamos el ID generado
}

// --- 2. BAJA DE USUARIO ---
export function deleteUser(id) {
    // 1. Primero borramos los permisos del usuario en la tabla members
    const sqlMembers = `DELETE FROM members WHERE id_user = ?`;
    const stmtMembers = db.prepare(sqlMembers);
    stmtMembers.run(id);

    // 2. Ahora que no hay restricciones, borramos al usuario en la tabla user
    const sqlUser = `DELETE FROM user WHERE id = ?`;
    const stmtUser = db.prepare(sqlUser);
    stmtUser.run(id);

    return { deletedID: id };
}

// --- 3. MODIFICACIÓN DE PASSWORD ---
export function updateUserPassword(id, newPassword) {
    const sql = `UPDATE user SET password = ? WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(newPassword, id);
    return { updatedID: id };
}

// --- 4. GESTIÓN DE PERMISOS (Asignar a Grupo) ---
export function addUserToGroup(id_user, id_group) {
    const sql = `INSERT INTO members (id_user, id_group) VALUES (?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(id_user, id_group);
    return { status: "assigned", id_user, id_group };
}

// --- 5. GESTIÓN DE PERMISOS (Cambiar Grupo) ---
export function assignGroup(id_user, id_group) {
    const sql = `INSERT OR REPLACE INTO members (id_user, id_group) VALUES (?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(id_user, id_group);
    return { status: "success", id_user, id_group };
}