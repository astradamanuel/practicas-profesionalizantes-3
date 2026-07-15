import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { 
    default_handler, 
    createUserHandler, 
    deleteUserHandler,
    assignGroupHandler,
    // --- Nuevos imports de grupos, endpoints y accesos ---
    createGroupHandler,
    deleteGroupHandler,
    createEndpointHandler,
    deleteEndpointHandler,
    assignEndpointToGroupHandler,
    removeEndpointFromGroupHandler
} from './handlers.mjs';

// 1. Carga de configuración inicial
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// 2. Definición del Ruteador Estricto (Sin flechas, pasamos funciones directas)
const router = new Map();
router.set('/', default_handler);

// Rutas de Usuarios
router.set('/user/create', createUserHandler);
router.set('/user/delete', deleteUserHandler);
router.set('/user/assign', assignGroupHandler);

// Rutas de Grupos
router.set('/group/create', createGroupHandler);
router.set('/group/delete', deleteGroupHandler);

// Rutas de Endpoints (Acciones)
router.set('/endpoint/create', createEndpointHandler);
router.set('/endpoint/delete', deleteEndpointHandler);

// Rutas de Accesos (Asociar Endpoint a Grupo)
router.set('/access/assign', assignEndpointToGroupHandler);
router.set('/access/remove', removeEndpointFromGroupHandler);

// 3. Request Dispatcher Explícito (Como el ejemplo original de la cátedra)
function request_dispatcher(req, res) {
    const url = new URL(req.url, `http://${config.server.ip}`);
    const handler = router.get(url.pathname);

    if (handler) {
        // --- VALIDACIONES DE MÉTODOS ---

        // Rutas que únicamente aceptan POST (creación y envío de datos en el cuerpo)
        const isPostRoute = 
            url.pathname === '/user/create' || 
            url.pathname === '/group/create' || 
            url.pathname === '/endpoint/create';

        if (isPostRoute && req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end('Metodo no permitido. Usa POST.');
        }
        
        // Rutas que únicamente aceptan GET (bajas y asignaciones por URL query params)
        const isGetRoute = 
            url.pathname === '/user/delete' || 
            url.pathname === '/user/assign' ||
            url.pathname === '/group/delete' ||
            url.pathname === '/endpoint/delete' ||
            url.pathname === '/access/assign' ||
            url.pathname === '/access/remove';

        if (isGetRoute && req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end('Metodo no permitido. Usa GET.');
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