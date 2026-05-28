import { readFileSync } from 'node:fs';
import { URLSearchParams } from 'node:url';
import * as dbManager from './db.mjs';

export function default_handler(request, response, config) {
    try {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } catch (error) {
        response.writeHead(500);
        response.end('Error: No se encontró el HTML');
    }
}

// Handler para ALTA de usuario
export function createUserHandler(request, response, db) {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', async () => {
        try {
            const params = new URLSearchParams(body);
            const user = params.get('username');
            const pass = params.get('password');
            const group = params.get('group_id') || 3; // Por defecto 'guest' o similar

            const resultado = await dbManager.createUser(db, user, pass);
            // Automáticamente lo asignamos a un grupo (Gestión de Permisos)
            await dbManager.addUserToGroup(db, resultado.id, group);

            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, message: "Usuario creado y asignado" }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    });
}

// Handler para BAJA de usuario
export function deleteUserHandler(request, response, db) {
    const url = new URL(request.url, `http://localhost`);
    const id = url.searchParams.get('id');

    dbManager.deleteUser(db, id)
        .then(res => {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, result: res }));
        })
        .catch(err => {
            response.writeHead(500);
            response.end(JSON.stringify({ error: err.message }));
        });
}

// Handler para MODIFICACIÓN de permisos
export function assignGroupHandler(request, response, db) {
    const url = new URL(request.url, `http://localhost`);
    const id_user = url.searchParams.get('user');
    const id_group = url.searchParams.get('group');

    dbManager.assignGroup(db, id_user, id_group)
        .then(res => {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, message: "Permisos actualizados", result: res }));
        })
        .catch(err => {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: err.message }));
        });
}