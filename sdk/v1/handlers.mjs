import { readFileSync } from 'node:fs';
import { URLSearchParams } from 'node:url';
import { insertarUsuario } from './db.mjs';

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

export function register_handler(request, response, db) {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', async () => {
        try {
            const params = new URLSearchParams(body);
            const user = params.get('username');
            const pass = params.get('password');
            
            const resultado = await insertarUsuario(db, user, pass);
            
            console.log(`Usuario ${user} registrado con éxito.`); // Ahora sí verás el log en la terminal
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, result: resultado }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    });
}