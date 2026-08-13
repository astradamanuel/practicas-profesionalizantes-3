/**
 * Muestra una vista específica y oculta las demás
 * Las vistas son divs con IDs: vista-login, vista-registro, vista-dashboard
 * 
 * @param {string} idVista - ID de la vista a mostrar
 */
export function mostrarVista(idVista) {
    const ids = ['vista-login', 'vista-registro', 'vista-dashboard'];
    
    // Ocultar todas las vistas
    ids.forEach(function ocultar(id) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('hidden');
        }
    });
    
    // Mostrar la vista solicitada
    const vistaActiva = document.getElementById(idVista);
    if (vistaActiva) {
        vistaActiva.classList.remove('hidden');
    }
}