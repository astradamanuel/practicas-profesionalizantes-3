/**
 * Excepción personalizada para errores de la WebAPI RPC
 */
export class RPCWebAPIException extends Error {
    constructor(tipo, detalle) {
        super(detalle);
        this.name = 'RPCWebAPIException';
        this.type = tipo;
        this.detail = detalle;
    }
}

// Configuración
const HOST = 'http://127.0.0.1:8080';
const VERSION_API = '1.0';

// Estado de credenciales (variables de módulo)
let usuarioActual = null;
let claveHashActual = null;

/**
 * Establece las credenciales del usuario logueado
 */
export function establecerCredenciales(usuario, hash) {
    usuarioActual = usuario;
    claveHashActual = hash;
}

/**
 * Limpia las credenciales del usuario
 */
export function limpiarCredenciales() {
    usuarioActual = null;
    claveHashActual = null;
}

/**
 * Calcula el hash SHA-256 de una cadena (para el token de autorización)
 */
export async function calcularHashSHA256(cadena) {
    const encoder = new TextEncoder();
    const data = encoder.encode(cadena);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(function aHex(byte) {
        return byte.toString(16).padStart(2, '0');
    }).join('');
    return hashHex;
}

/**
 * Genera las cabeceras globales para todas las peticiones
 */
function cabecerasGlobales() {
    return {
        'Content-Type': 'application/json',
        'x-user-id': usuarioActual || '',
        'x-api-key': claveHashActual || '',
        'Authorization': 'Bearer ' + (claveHashActual || ''),
        'x-api-version': VERSION_API
    };
}

/**
 * Extrae el detalle de error del cuerpo de la respuesta
 */
function detalleDe(cuerpo) {
    if (cuerpo && cuerpo.detail) {
        if (Array.isArray(cuerpo.detail)) return cuerpo.detail.join(', ');
        return cuerpo.detail;
    }
    if (cuerpo && cuerpo.exception) return cuerpo.exception;
    return 'Error inesperado del servidor.';
}

/**
 * RPCWebAPIFetch - Encapsula todas las peticiones a la WebAPI
 * 
 * Siempre POST, siempre JSON.
 * Si responde 200: retorna el JSON parseado.
 * Si responde cualquier otro código: lanza RPCWebAPIException.
 * 
 * @param {string} name - Nombre del endpoint (ej: '/loginUser')
 * @param {object} content - Datos a enviar en el body JSON
 * @returns {Promise<any>} - Respuesta del servidor
 */
export async function RPCWebAPIFetch(name, content) {
    let response;
    try {
        response = await fetch(HOST + name, {
            method: 'POST',
            headers: cabecerasGlobales(),
            body: JSON.stringify(content)
        });
    } catch (errorRed) {
        throw new RPCWebAPIException('NetworkError', 'Sin conexión con el servidor.');
    }

    // Si es 200, retornamos el JSON parseado
    if (response.status === 200) {
        return response.json();
    }

    // Para cualquier otro código, intentamos parsear el cuerpo para extraer el detalle
    let cuerpo = null;
    try {
        cuerpo = await response.json();
    } catch (errorParse) {
        cuerpo = null;
    }

    // Lanzamos excepción según el código HTTP
    if (response.status === 400) {
        throw new RPCWebAPIException('SpecificationError', detalleDe(cuerpo));
    }
    if (response.status === 401) {
        const tipo = (cuerpo !== null && cuerpo.exception) ? cuerpo.exception : 'UnauthorizedError';
        throw new RPCWebAPIException(tipo, detalleDe(cuerpo));
    }
    if (response.status === 422) {
        throw new RPCWebAPIException('DomainError', detalleDe(cuerpo));
    }
    if (response.status === 500) {
        throw new RPCWebAPIException('ProgramError', detalleDe(cuerpo));
    }
    
    throw new RPCWebAPIException('UnknownError', 'HTTP ' + response.status);
}