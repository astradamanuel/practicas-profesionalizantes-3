import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { connect_db } from './db.mjs';
import { default_handler, register_handler } from './handlers.mjs';

// Carga de configuración
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
const db = connect_db(config.database.path);

// Ruteo
const router = new Map();
router.set('/', (req, res) => default_handler(req, res, config));
router.set('/register', (req, res) => register_handler(req, res, db));

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${config.server.ip}`);
    const handler = router.get(url.pathname);

    if (handler && req.method === (url.pathname === '/register' ? 'POST' : 'GET')) {
        await handler(req, res);
    } else {
        res.writeHead(404);
        res.end('Ruta o método no encontrado');
    }
});

server.listen(config.server.port, config.server.ip, () => {
    console.log(`Servidor modularizado corriendo en http://${config.server.ip}:${config.server.port}`);
});