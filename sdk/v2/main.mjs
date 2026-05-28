import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { connect_db } from './db.mjs';
import { 
    default_handler, 
    createUserHandler, 
    deleteUserHandler,
    assignGroupHandler // <--- Agregado
} from './handlers.mjs';

// 1. Carga de configuración
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
const db = connect_db(config.database.path);

// 2. Definición del Ruteo (Router)
const router = new Map();

router.set('/', (req, res) => default_handler(req, res, config));
router.set('/user/create', (req, res) => createUserHandler(req, res, db)); // ALTA
router.set('/user/delete', (req, res) => deleteUserHandler(req, res, db)); // BAJA
router.set('/user/assign', (req, res) => assignGroupHandler(req, res, db)); // MODIFICACIÓN (Nuevo)

// 3. Creación del Servidor
const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${config.server.ip}`);
    const handler = router.get(url.pathname);

    if (handler) {
        // Validación de Métodos consistentemente
        if (url.pathname === '/user/create' && req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end('Método no permitido. Usa POST para crear usuarios.');
        }
        
        // Permitimos GET para borrar y para asignar por simplicidad en las pruebas
        if ((url.pathname === '/user/delete' || url.pathname === '/user/assign') && req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            return res.end(`Método no permitido. Usa GET para ${url.pathname}.`);
        }

        // Ejecutar el handler correspondiente
        try {
            await handler(req, res);
        } catch (error) {
            console.error("Error en el handler:", error);
            res.writeHead(500);
            res.end("Error interno del servidor");
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
});

// 4. Encendido del servidor
server.listen(config.server.port, config.server.ip, () => {
    console.log(`--- SDK V2 ---`);
    console.log(`Servidor corriendo en http://${config.server.ip}:${config.server.port}`);
    console.log(`Base de datos conectada: ${config.database.path}`);
});