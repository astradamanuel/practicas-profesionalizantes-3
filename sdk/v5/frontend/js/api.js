// Variable global temporal para la sesión
var usuarioActual = "";

async function RPCWebAPIFetch(name, content) {
    var dataToSend = content || {};
    var host = 'http://127.0.0.1:8080'; 

    var headersConfig = {
        'Content-Type': 'application/json'
    };

    if (usuarioActual !== "") {
        headersConfig['x-user-id'] = usuarioActual;
    }

    var response = await fetch(host + name, {
        method: 'POST', 
        headers: headersConfig,
        body: JSON.stringify(dataToSend)
    });

    var data;
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    // Excepción obligatoria si no es categoría 200
    if (!response.ok) {
        var errorMsg = data.exception || "Error genérico de servidor";
        throw new Error(errorMsg);
    }

    return data; 
}