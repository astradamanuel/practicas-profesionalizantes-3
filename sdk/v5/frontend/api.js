// api.js

// Almacenamos el usuario que inició sesión para las cabeceras RPC
var usuarioSesionActual = "";

/**
 * Función central de abstracción RPC para peticiones WebAPI
 * Garantiza POST, formato JSON y control estricto de excepciones no-200.
 */
async function RPCWebAPIFetch(name, content) {
    var baseUrl = 'http://127.0.0.1:8080';
    
    // Configuración de cabeceras requeridas por la arquitectura
    var headers = { 
        'Content-Type': 'application/json',
        'X-API-Version': '1.0'
    };

    // Si el usuario ya está autenticado, inyectamos su identificador en la cabecera
    if (usuarioSesionActual) {
        headers['x-user-id'] = usuarioSesionActual;
    }

    var opciones = {
        method: 'POST',
        headers: headers
    };

    // Si se envía contenido, lo serializamos obligatoriamente a formato JSON
    if (content) {
        opciones.body = JSON.stringify(content);
    }

    var response = await fetch(baseUrl + name, opciones);
    
    var data;
    try {
        data = await response.json();
    } catch (e) {
        // Excepción si el servidor no responde con un JSON válido
        throw { 
            status: response.status,
            exception: "Error en el formato de respuesta del servidor." 
        };
    }

    // A excepción de la categoría 200 (rango 200-299), todas las demás lanzan excepciones
    if (!response.ok) {
        throw {
            status: response.status,
            exception: data ? data.exception : "Acceso denegado",
            detail: data ? data.detail : []
        };
    }

    // Si todo salió bien (categoría 200), retornamos los datos limpios
    return data;
}