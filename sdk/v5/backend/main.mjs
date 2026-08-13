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
const userSessions = new Map();

class UserSession {
    constructor(username) {
        this.username = username;
        this.status = 'enabled';
        this.createdAt = Date.now();
    }
}

// --- 3. FUNCIONES DE VALIDACIÓN ---

/**
 * Valida que las credenciales (usuario + password) sean correctas contra la DB.
 * Se usa SOLO en el handler de login.
 */
function validarAutenticacion(username, password) {
    const passwordHasheada = generarHash(password);
    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";
    const stmt = db.prepare(sql);
    const row = stmt.get(username, passwordHasheada);
    return row.total >= 1;
}

/**
 * Valida que exista una sesión activa en el Map para el usuario dado.
 * Se usa en endpoints protegidos.
 */
function validarSesion(username) {
    if (!userSessions.has(username)) {
        return false;
    }
    const session = userSessions.get(username);
    return session.status === 'enabled';
}

/**
 * Valida que el usuario tenga permiso en el endpoint solicitado.
 * Cruza las tablas access, members, user, endpoint.
 */
function validarAutorizacion(username, endpointPath) {
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
        console.error('[validarAutorizacion] Error:', err);
        return false;
    }
}

// --- 4. HANDLERS ---

async function login_handler(request, response) {
    let body = '';
    request.on('data', function (chunk) { body += chunk.toString(); });
    request.on('end', function () {
        try {
            const { username, password } = JSON.parse(body);
            
            if (!username || !password) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    exception: 'InvalidSpecification', 
                    detail: ['Faltan los campos obligatorios username o password en el JSON.'] 
                }));
                return;
            }

            if (validarAutenticacion(username, password)) {
                const session = new UserSession(username);
                userSessions.set(username, session);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    status: 'enabled', 
                    user: username,
                    message: 'Login exitoso'
                }));
            } else {
                response.writeHead(401, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    exception: 'UnauthorizedException', 
                    detail: ['El usuario o la contraseña ingresados son inválidos.'] 
                }));
            }
        } catch (e) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ 
                exception: 'MalformedJson', 
                detail: ['El cuerpo de la petición no contiene un formato JSON válido.'] 
            }));
        }
    });
}

async function register_handler(request, response) {
    let body = '';
    request.on('data', function (chunk) { body += chunk.toString(); });
    request.on('end', function () {
        try {
            const { username, password } = JSON.parse(body);

            if (!username || !password) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    exception: 'InvalidSpecification', 
                    detail: ['Se requiere username y password dentro del objeto JSON.'] 
                }));
                return;
            }

            try {
                const passwordHasheada = generarHash(password);
                const sqlUser = "INSERT INTO user (username, password) VALUES (?, ?)";
                const stmtUser = db.prepare(sqlUser);
                const result = stmtUser.run(username, passwordHasheada);
                const nuevoUserId = result.lastInsertRowid;

                const sqlMember = "INSERT INTO members (id_user, id_group) VALUES (?, 1)";
                const stmtMember = db.prepare(sqlMember);
                stmtMember.run(nuevoUserId);

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    message: "Usuario creado con éxito de forma segura.",
                    user: username
                }));
            } catch (err) {
                response.writeHead(422, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    exception: 'DomainException', 
                    detail: ['El nombre de usuario ya se encuentra registrado en el sistema.'] 
                }));
            }
        } catch (e) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ 
                exception: 'MalformedJson', 
                detail: ['El cuerpo de la petición no contiene un formato JSON válido.'] 
            }));
        }
    });
}

/**
 * Handler de logout: invalida la sesión del Map para el usuario dado.
 */
async function logout_handler(request, response) {
    const username = request.headers['x-user-id'];
    
    if (!username || username.trim() === '') {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
            exception: 'MissingAuthorization', 
            detail: ["No se proporcionó la cabecera de seguridad mandatoria 'x-user-id'."] 
        }));
        return;
    }
    
    // Borramos la sesión del Map (si existe)
    userSessions.delete(username);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ 
        message: 'Sesión cerrada exitosamente',
        user: username
    }));
}

async function log_action_handler(request, response) {
    const username = request.headers['x-user-id'];
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ 
        message: `Acción /logAction ejecutada satisfactoriamente por ${username}`,
        timestamp: new Date().toISOString()
    }));
}

async function say_hello_handler(request, response) {
    const username = request.headers['x-user-id'];
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ 
        message: `Hola ${username}, el endpoint /sayHelloAction responde correctamente`,
        timestamp: new Date().toISOString()
    }));
}

// --- 5. RUTEADOR Y DESPACHADOR CENTRAL ---
const router = new Map();
router.set('/loginUser', login_handler);
router.set('/registerUser', register_handler);
router.set('/logout', logout_handler);
router.set('/logAction', log_action_handler);
router.set('/sayHelloAction', say_hello_handler);

const publicRoutes = new Set(['/loginUser', '/registerUser', '/logout']);

const server = createServer(async function (req, res) {
    // CORS Headers (incluye Authorization para el paso 2)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, Authorization, X-API-Version, x-api-key');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://' + config.server.ip);
    const path = url.pathname;

    if (req.method !== 'POST') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'MethodNotAllowed', 
            detail: ['La especificación exige el uso exclusivo de POST para invocar procedimientos.'] 
        }));
        return;
    }

    const handler = router.get(path);

    if (!handler) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'ProcedureNotFound', 
            detail: [`El procedimiento solicitado [${path}] no existe.`] 
        }));
        return;
    }

    const apiVersion = req.headers['x-api-version'];
    if (apiVersion !== '1.0') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'InvalidApiVersion', 
            detail: ['Se requiere especificar explícitamente la cabecera X-API-Version: 1.0'] 
        }));
        return;
    }

    // Rutas públicas: login y register
    if (publicRoutes.has(path)) {
        return await handler(req, res);
    }

    // --- RUTAS PROTEGIDAS: secuencia de validación ---
    const username = req.headers['x-user-id'];

    // 1. Validar presencia de credencial
    if (!username || username.trim() === '') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'MissingAuthorization', 
            detail: ["No se proporcionó la cabecera de seguridad mandatoria 'x-user-id'."] 
        }));
        return;
    }

    // 2. Validar sesión activa en el Map
    if (!validarSesion(username)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'SessionExpiredException', 
            detail: [`La sesión del usuario [${username}] no existe o ha expirado.`] 
        }));
        return;
    }

    // 3. Validar autorización sobre el endpoint específico
    if (!validarAutorizacion(username, path)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'AccessDeniedException', 
            detail: [`El usuario [${username}] no cuenta con privilegios para ejecutar el procedimiento [${path}].`] 
        }));
        return;
    }

    // Todo OK: ejecutar handler
    return await handler(req, res);
});

server.listen(config.server.port, config.server.ip, function () {
    console.log(`WebAPI RPC (Backend) corriendo en http://${config.server.ip}:${config.server.port}`);
});