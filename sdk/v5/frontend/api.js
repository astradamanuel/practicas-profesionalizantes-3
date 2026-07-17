// api.js

/**
 * Realiza una petición RPC hacia la WebAPI.
 * @param {string} name - Nombre del endpoint o acción a ejecutar.
 * @param {Object} content - Objeto con los datos que se enviarán en el cuerpo.
 * @returns {Promise<Object>} Promesa con la respuesta JSON del servidor.
 */
async function RPCWebAPIFetch(name, content) {
    var url = "./api/" + name; 

    var opciones = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(content)
    };

    var respuesta = await fetch(url, opciones);
    var datos;

    try {
        datos = await respuesta.json();
    } catch (errorNoJson) {
        datos = null;
    }

    // A excepción de la categoría 200 (200-299), todas las demás lanzan excepciones.
    if (respuesta.status < 200 || respuesta.status >= 300) {
        var mensajeError = "Error con código de estado " + respuesta.status;
        
        if (datos && datos.message) {
            mensajeError = datos.message;
        } else if (!datos) {
            mensajeError = "Error inesperado en el servidor.";
        }
        
        throw new Error(mensajeError);
    }

    return datos;
}