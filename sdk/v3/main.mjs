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
            port: 3000,
            default_path: './default.html'
        },
        database: {
            path: './db.sqlite3'
        }
    };
}

// Función auxiliar para pasar la clave a SHA-256
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
    // Hasheamos la contraseña que ingresa el usuario para poder compararla con la de la DB
    const passwordHasheada = generarHash(password);

    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";
    const stmt = db.prepare(sql);
    // Usamos 'passwordHasheada' en lugar del texto plano
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
        console.log(`Autorizador Global: Usuario [${username}] -> Path [${cleanPath}]. Resultado: ${row.total > 0}`);
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
        // Ciframos la contraseña con SHA-256 antes de guardarla
        const passwordHasheada = generarHash(pass);

        // 1. Insertamos el usuario con la contraseña cifrada
        const sqlUser = "INSERT INTO user (username, password) VALUES (?, ?)";
        const stmtUser = db.prepare(sqlUser);
        const result = stmtUser.run(user, passwordHasheada); // <--- Guardamos el hash
        
        const nuevoUserId = result.lastInsertRowid;

        // 2. Lo vinculamos automáticamente al grupo 1
        const sqlMember = "INSERT INTO members (id_user, id_group) VALUES (?, 1)";
        const stmtMember = db.prepare(sqlMember);
        stmtMember.run(nuevoUserId);

        console.log(`Registro Seguro: Usuario [${user}] creado con ID [${nuevoUserId}] y clave cifrada.`);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: "Usuario creado con éxito de forma segura." }));
    } catch (err) {
        console.error("Error en registro:", err);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: "El usuario ya existe o error de DB" }));
    }
}

// Al ser la validación global, este handler sólo responde el éxito
async function test_endpoint_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: `Acción satisfactoria en ${path}` }));
}

// --- 5. RUTEADOR Y DESPACHADOR CENTRAL ---

let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/register', register_handler);

// Endpoints protegidos
router.set('/print', test_endpoint_handler);
router.set('/log', test_endpoint_handler);
router.set('/help', test_endpoint_handler);
router.set('/sayHello', test_endpoint_handler);
router.set('/sayBye', test_endpoint_handler);

// Definimos qué rutas saltan el control de seguridad de forma explícita
let publicRoutes = new Set(['/', '/login', '/register']);

const server = createServer(async function (req, res) {
    const url = new URL(req.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    // 1. Si la ruta no existe, cortamos acá (404)
    if (!handler) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
        return;
    }

    // 2. Si es una ruta pública, se ejecuta el handler directo (ignora la seguridad)
    if (publicRoutes.has(path)) {
        return await handler(req, res);
    }

    // 3. LOGICA GLOBAL DE AUTORIZACIÓN (Para endpoints protegidos)
    const user = url.searchParams.get('user'); 

    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "No se proporcionó el parámetro 'user' para la validación global." }));
        return;
    }

    // El filtro corre antes de invocar al handler
    if (authorize(user, path)) {
        // Si tiene acceso, recién acá se despacha el handler
        return await handler(req, res);
    } else {
        // Si no está autorizado, se frena acá de forma centralizada
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Acceso denegado globalmente a ${path}` }));
    }
});

server.listen(config.server.port, config.server.ip, function () {
    console.log(`Servidor corriendo en http://${config.server.ip}:${config.server.port}`);
});

