import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// --- 1. CONFIGURACIÓN ---
function default_config() {
    return {
        server: {
            ip: '127.0.0.1',
            port: 8080,
            default_path: ''
        },
        database: {
            path: './db.sqlite3'
        }
    };
}

function generarHash(password) {
    return createHash('sha256').update(password).digest('hex');
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
    const passwordHasheada = generarHash(password);
    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";
    const stmt = db.prepare(sql);
    const row = stmt.get(username, passwordHasheada);
    return (row.total >= 1);
}

function authorize(username, endpointPath) {
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
        const row = stmt.get(username, cleanPath);
        return row.total > 0;
    } catch (err) {
        return false;
    }
}

// --- 4. MANEJADORES (HANDLERS) ---
// SE ELIMINÓ DEFAULT_HANDLER PORQUE EL BACKEND YA NO SIRVE HTML

async function login_handler(request, response) {
    let body = '';
    request.on('data', function (chunk) { 
        body += chunk.toString(); 
    });
    
    request.on('end', function () {
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

async function register_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const user = url.searchParams.get('username');
    const pass = url.searchParams.get('password');

    if (!user || !pass) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: "Faltan datos de usuario o contraseña" }));
        return;
    }

    try {
        const passwordHasheada = generarHash(pass);
        const sqlUser = "INSERT INTO user (username, password) VALUES (?, ?)";
        const stmtUser = db.prepare(sqlUser);
        const result = stmtUser.run(user, passwordHasheada);
        
        const nuevoUserId = result.lastInsertRowid;

        const sqlMember = "INSERT INTO members (id_user, id_group) VALUES (?, 1)";
        const stmtMember = db.prepare(sqlMember);
        stmtMember.run(nuevoUserId);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: "Usuario creado con éxito de forma segura." }));
    } catch (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: "El usuario ya existe o error de DB" }));
    }
}

async function test_endpoint_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: `Acción satisfactoria en ${path}` }));
}

// --- 5. RUTEADOR Y DESPACHADOR CENTRAL ---
let router = new Map();
// YA NO SE REGISTRA LA RUTA "/" AQUÍ
router.set('/login', login_handler);
router.set('/register', register_handler);
router.set('/print', test_endpoint_handler);
router.set('/log', test_endpoint_handler);
router.set('/help', test_endpoint_handler);
router.set('/sayHello', test_endpoint_handler);
router.set('/sayBye', test_endpoint_handler);

let publicRoutes = new Set(['/login', '/register']);

const server = createServer(async function (req, res) {
    // 💡 ACTUALIZADO: Agregamos 'x-user-id' a las cabeceras permitidas por CORS como pide el profe
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

    // Si el navegador manda una petición de pre-vuelo (OPTIONS), respondemos OK directo (204)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (!handler) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada en la API');
        return;
    }

    if (publicRoutes.has(path)) {
        return await handler(req, res);
    }

    // 💡 SOLUCIÓN A LA CONSIGNA: Consumimos el usuario desde las cabeceras del request
    // Nota: Node.js convierte automáticamente todas las cabeceras entrantes a minúsculas
    const user = req.headers['x-user-id']; 

    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "No se proporcionó la cabecera de seguridad 'x-user-id'." }));
        return;
    }

    // El filtro corre usando el usuario recuperado de la cabecera HTTP
    if (authorize(user, path)) {
        return await handler(req, res);
    } else {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Acceso denegado globalmente a ${path}` }));
    }
});

server.listen(config.server.port, config.server.ip, function () {
    console.log(`WebAPI (Backend) corriendo en http://${config.server.ip}:${config.server.port}`);
});