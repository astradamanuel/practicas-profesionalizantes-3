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

    function onData(chunk) {
        body += chunk.toString();
    }

    function onEnd() {
        try {
            const params = new URLSearchParams(body);
            const user = params.get('username');
            const pass = params.get('password');
            const group = params.get('group_id') || 3;

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


// =========================================================================
// --- NUEVOS HANDLERS AGREGADOS ---
// =========================================================================

// --- HANDLERS PARA GESTIÓN DE GRUPOS ---

export function createGroupHandler(request, response) {
    let body = '';

    function onData(chunk) {
        body += chunk.toString();
    }

    function onEnd() {
        try {
            const params = new URLSearchParams(body);
            const name = params.get('name');

            const resultado = model.createGroup(name);

            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, message: "Grupo creado", result: resultado }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    }

    request.on('data', onData);
    request.on('end', onEnd);
}

export function deleteGroupHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id = url.searchParams.get('id');

        const res = model.deleteGroup(id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// --- HANDLERS PARA GESTIÓN DE ENDPOINTS ---

export function createEndpointHandler(request, response) {
    let body = '';

    function onData(chunk) {
        body += chunk.toString();
    }

    function onEnd() {
        try {
            const params = new URLSearchParams(body);
            const name = params.get('name');

            const resultado = model.createEndpoint(name);

            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, message: "Endpoint creado", result: resultado }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    }

    request.on('data', onData);
    request.on('end', onEnd);
}

export function deleteEndpointHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id = url.searchParams.get('id');

        const res = model.deleteEndpoint(id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// --- HANDLERS PARA GESTIÓN DE ACCESO (Vincular Grupos y Endpoints) ---

export function assignEndpointToGroupHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id_group = url.searchParams.get('group');
        const id_endpoint = url.searchParams.get('endpoint');

        const res = model.assignEndpointToGroup(id_group, id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, message: "Endpoint vinculado al grupo", result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

export function removeEndpointFromGroupHandler(request, response) {
    try {
        const url = new URL(request.url, `http://localhost`);
        const id_group = url.searchParams.get('group');
        const id_endpoint = url.searchParams.get('endpoint');

        const res = model.removeEndpointFromGroup(id_group, id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, message: "Endpoint desvinculado del grupo", result: res }));
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}