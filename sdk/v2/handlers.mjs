import { readFileSync } from 'node:fs';
import { URLSearchParams } from 'node:url';
import * as model from './model.mjs';

export function default_handler(request, response) {
    try {
        const html = readFileSync('./default.html', 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } catch (error) {
        response.writeHead(500);
        response.end('Error: No se encontró el HTML');
    }
}

// Handler para ALTA de usuario (2 parámetros, 0 flechas)
export function createUserHandler(request, response) {
    let body = '';

    // Funciones tradicionales para los eventos del stream
    function onData(chunk) {
        body += chunk.toString();
    }

    function onEnd() {
        try {
            const params = new URLSearchParams(body);
            const user = params.get('username');
            const pass = params.get('password');
            const group = params.get('group_id') || 3;

            // Inserción sincrónica usando el modelo
            const resultado = model.createUser(user, pass);
            model.addUserToGroup(resultado.id, group);

            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, message: "Usuario creado y asignado" }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    }

    request.on('data', onData);
    request.on('end', onEnd);
}

// Handler para BAJA de usuario (2 parámetros, 0 flechas)
export function deleteUserHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id = url.searchParams.get('id');

        const res = model.deleteUser(id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Handler para MODIFICACIÓN de permisos (2 parámetros, 0 flechas)
export function assignGroupHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id_user = url.searchParams.get('user');
        const id_group = url.searchParams.get('group');

        const res = model.assignGroup(id_user, id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, message: "Permisos actualizados", result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}