import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

// --- 1. CONFIGURACIÓN ---
function default_config() {
    return {
        server: {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './default.html'
        },
        database: {
            path: './db.sqlite3' // Ajustado al nombre de tu archivo real
        }
    };
}

function load_config() {
    try {
        const data = readFileSync('./config.json', 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return default_config();
    }
}

const config = load_config();
const db = new DatabaseSync(resolve(config.database.path));

// --- 2. GESTIÓN DE SESIONES ---
let userSessions = new Map();

class UserSession {
    constructor() {
       this.status = 'enabled';
    }
}

// --- 3. LÓGICA DE BASE DE DATOS ---

function authenticate(username, password) {
    // Buscamos si existe la combinación exacta de usuario y clave
    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";
    const stmt = db.prepare(sql);
    const row = stmt.get(username, password);
    return (row.total >= 1); // Verificamos que al menos exista uno
}

function authorize(username, endpointPath) {
    // Quitamos la barra inicial si existe para que coincida con "log" o "sayHello" en la DB
    const cleanPath = endpointPath.startsWith('/') ? endpointPath.slice(1) : endpointPath;

    const sql = `
        SELECT count(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN user u ON m.id_user = u.id
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? 
          AND e.path = ?
    `;
    try {
        const stmt = db.prepare(sql);
        // Usamos cleanPath en lugar de endpointPath
        const row = stmt.get(username, cleanPath);
        console.log(`Autorizador: Usuario [${username}] -> Path [${cleanPath}]. Resultado: ${row.total > 0}`);
        return row.total > 0;
    } catch (err) {
        console.error("Error en autorizador:", err);
        return false;
    }
}

// --- 4. MANEJADORES (HANDLERS) ---

function default_handler(request, response) {
    try {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } catch (error) {
        response.writeHead(500);
        response.end('Error: No se encontró el archivo HTML.');
    }
}

// Handler para LOGIN (Botón Azul)
async function login_handler(request, response) {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', () => {
        const { username, password } = JSON.parse(body);
        
        if (authenticate(username, password)) {
            let session = new UserSession();
            userSessions.set(username, session);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: 'enabled', user: username }));
        } else {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: "Credenciales inválidas" }));
        }
    });
}

// Handler para REGISTRO (Botón Gris)
async function register_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const user = url.searchParams.get('username');
    const pass = url.searchParams.get('password');

    try {
        const sql = "INSERT INTO user (username, password) VALUES (?, ?)";
        const stmt = db.prepare(sql);
        stmt.run(user, pass);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: "Usuario creado con éxito" }));
    } catch (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: "El usuario ya existe o error de DB" }));
    }
}

// Handler para las pruebas de autorización (/log, /sayHello, etc.)
async function test_endpoint_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const user = url.searchParams.get('user'); 
    const path = url.pathname;

    if (authorize(user, path)) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: `Acción satisfactoria en ${path}` }));
    } else {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: `Acceso denegado a ${path}` }));
    }
}

// --- 5. RUTEADOR Y SERVIDOR ---

let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/register', register_handler);

// Endpoints protegidos (Los 5 que pide la consigna)
router.set('/print', test_endpoint_handler);
router.set('/log', test_endpoint_handler);
router.set('/help', test_endpoint_handler);
router.set('/sayHello', test_endpoint_handler);
router.set('/sayBye', test_endpoint_handler);

const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (handler) {
        return await handler(req, res);
    } else {
        res.writeHead(404);
        res.end('Ruta no encontrada');
    }
});

server.listen(config.server.port, config.server.ip, () => {
    console.log(`Servidor corriendo en http://${config.server.ip}:${config.server.port}`);
});