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


// =========================================================================
// --- NUEVAS FUNCIONES AGREGADAS ---
// =========================================================================

// --- 6. GESTIÓN DE GRUPOS (Crear, Modificar, Eliminar) ---

export function createGroup(name) {
    const sql = `INSERT INTO "group" (name) VALUES (?)`;
    const stmt = db.prepare(sql);
    const result = stmt.run(name);
    return { id: result.lastInsertRowid, name };
}

export function updateGroupName(id, newName) {
    const sql = `UPDATE "group" SET name = ? WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(newName, id);
    return { updatedGroupID: id, newName };
}

export function deleteGroup(id) {
    const sqlMembers = `DELETE FROM members WHERE id_group = ?`;
    const stmtMembers = db.prepare(sqlMembers);
    stmtMembers.run(id);

    const sqlAccess = `DELETE FROM access WHERE id_group = ?`;
    const stmtAccess = db.prepare(sqlAccess);
    stmtAccess.run(id);

    const sqlGroup = `DELETE FROM "group" WHERE id = ?`;
    const stmtGroup = db.prepare(sqlGroup);
    stmtGroup.run(id);

    return { deletedGroupID: id };
}

// --- 7. GESTIÓN DE ENDPOINTS/ACCIONES (Crear, Eliminar) ---

export function createEndpoint(name) {
    const sql = `INSERT INTO endpoint (name) VALUES (?)`;
    const stmt = db.prepare(sql);
    const result = stmt.run(name);
    return { id: result.lastInsertRowid, name };
}

export function deleteEndpoint(id) {
    const sqlAccess = `DELETE FROM access WHERE id_endpoint = ?`;
    const stmtAccess = db.prepare(sqlAccess);
    stmtAccess.run(id);

    const sqlEndpoint = `DELETE FROM endpoint WHERE id = ?`;
    const stmtEndpoint = db.prepare(sqlEndpoint);
    stmtEndpoint.run(id);

    return { deletedEndpointID: id };
}

// --- 8. GESTIÓN DE ACCESOS (Asignar Endpoint a Grupo) ---

export function assignEndpointToGroup(id_group, id_endpoint) {
    const sql = `INSERT OR REPLACE INTO access (id_group, id_endpoint) VALUES (?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(id_group, id_endpoint);
    return { status: "access_assigned", id_group, id_endpoint };
}

export function removeEndpointFromGroup(id_group, id_endpoint) {
    const sql = `DELETE FROM access WHERE id_group = ? AND id_endpoint = ?`;
    const stmt = db.prepare(sql);
    stmt.run(id_group, id_endpoint);
    return { status: "access_removed", id_group, id_endpoint };
}