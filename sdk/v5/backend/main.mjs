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
    // Quitamos la barra inicial para cruzarlo con el campo 'path' de la DB
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

async function login_handler(request, response) {
    let body = '';
    request.on('data', function (chunk) { 
        body += chunk.toString(); 
    });
    
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

            if (authenticate(username, password)) {
                let session = new UserSession();
                userSessions.set(username, session);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ status: 'enabled', user: username }));
            } else {
                // Regla RPC: Código 401 y estructura estricta de excepción
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
    request.on('data', function (chunk) { 
        body += chunk.toString(); 
    });

    request.on('end', function () {
        try {
            // Regla RPC: Extraemos los datos del body JSON y ya no de searchParams
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
                response.end(JSON.stringify({ message: "Usuario creado con éxito de forma segura." }));
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

async function test_endpoint_handler(request, response) {
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: `Acción satisfactoria ejecutada en el procedimiento ${path}` }));
}

// --- 5. RUTEADOR Y DESPACHADOR CENTRAL ---
let router = new Map();
router.set('/loginUser', login_handler);
router.set('/registerUser', register_handler);
router.set('/logAction', test_endpoint_handler);
router.set('/sayHelloAction', test_endpoint_handler);

let publicRoutes = new Set(['/loginUser', '/registerUser']);

const server = createServer(async function (req, res) {
    // Volvemos a habilitar 'x-user-id' en los headers de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, X-API-Version');

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

    if (publicRoutes.has(path)) {
        return await handler(req, res);
    }

    // 💡 REFACTORIZADO POR CONSIGNA: Conservamos 'x-user-id' del punto 2
    const user = req.headers['x-user-id']; 

    if (!user || user.trim() === "") {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'MissingAuthorization', 
            detail: ["No se proporcionó la cabecera de seguridad mandatoria 'x-user-id'."] 
        }));
        return;
    }

    if (authorize(user, path)) {
        return await handler(req, res);
    } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            exception: 'AccessDeniedException', 
            detail: [`El usuario [${user}] no cuenta con privilegios para ejecutar el procedimiento [${path}].`] 
        }));
    }
});

server.listen(config.server.port, config.server.ip, function () {
    console.log(`WebAPI RPC (Backend) corriendo en http://${config.server.ip}:${config.server.port}`);
});