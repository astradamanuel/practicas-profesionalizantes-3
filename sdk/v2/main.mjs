import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { 
    default_handler, 
    createUserHandler, 
    deleteUserHandler,
    assignGroupHandler 
} from './handlers.mjs';

// 1. Carga de configuración inicial
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// 2. Definición del Ruteador Estricto (Sin flechas, pasamos funciones directas)
const router = new Map();
router.set('/', default_handler);
router.set('/user/create', createUserHandler);
router.set('/user/delete', deleteUserHandler);
router.set('/user/assign', assignGroupHandler);

// 3. Request Dispatcher Explícito (Como el ejemplo original de la cátedra)
function request_dispatcher(req, res) {
    const url = new URL(req.url, `http://${config.server.ip}`);
    const handler = router.get(url.pathname);

    if (handler) {
        // Validaciones de métodos según la ruta
        if (url.pathname === '/user/create' && req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end('Método no permitido. Usa POST.');
        }
        
        if ((url.pathname === '/user/delete' || url.pathname === '/user/assign') && req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end('Método no permitido. Usa GET.');
        }

        // Se ejecuta pasándole estrictamente 2 parámetros
        handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
}

// 4. Servidor y Escucha
const server = createServer(request_dispatcher);

function onServerStart() {
    console.log(`--- SDK V2 Arquitectura Limpia ---`);
    console.log(`Servidor corriendo en http://${config.server.ip}:${config.server.port}`);
}

server.listen(config.server.port, config.server.ip, onServerStart);