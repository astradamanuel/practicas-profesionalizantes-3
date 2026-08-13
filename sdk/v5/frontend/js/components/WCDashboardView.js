import { RPCWebAPIFetch, limpiarCredenciales } from '../api-client.js';

/**
 * WCDashboardView - WebComponent del panel post-login
 * Layout flex: barra superior + (barra lateral | contenido)
 */
export class WCDashboardView extends HTMLElement {
    constructor() {
        super();
        
        this._usuario = '';
        
        // CONSTRUCTOR: crea estructura
        this._crearEstructura();
    }
    
    _crearEstructura() {
        // ===== BARRA SUPERIOR =====
        const topBar = document.createElement('div');
        topBar.className = 'w3-top w3-card';
        topBar.style.height = '54px';
        
        const bar = document.createElement('div');
        bar.className = 'w3-bar w3-blue';
        
        const logoLink = document.createElement('a');
        logoLink.href = '#';
        logoLink.className = 'w3-bar-item w3-button';
        logoLink.style.height = '54px';
        
        const logoImg = document.createElement('img');
        logoImg.src = 'assets/logo-isft151.png';
        logoImg.alt = 'ISFT 151';
        logoImg.style.height = '30px';
        logoImg.style.verticalAlign = 'middle';
        
        const logoText = document.createElement('span');
        logoText.textContent = ' ISFT 151';
        logoText.style.fontWeight = 'bold';
        
        logoLink.appendChild(logoImg);
        logoLink.appendChild(logoText);
        
        this._btnLogout = document.createElement('button');
        this._btnLogout.type = 'button';
        this._btnLogout.className = 'w3-bar-item w3-button w3-right';
        this._btnLogout.style.height = '54px';
        
        const iconLogout = document.createElement('i');
        iconLogout.className = 'fa fa-sign-out';
        
        this._btnLogout.appendChild(iconLogout);
        this._btnLogout.appendChild(document.createTextNode(' Salir'));
        
        bar.appendChild(logoLink);
        bar.appendChild(this._btnLogout);
        topBar.appendChild(bar);
        
        // ===== CONTENEDOR FLEX: sidebar + contenido =====
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.marginTop = '54px';
        flexContainer.style.minHeight = 'calc(100vh - 54px)';
        
        // ----- Barra lateral (columna normal, SIN position fixed) -----
        const sidebar = document.createElement('nav');
        sidebar.className = 'w3-bar-block w3-white w3-border-right';
        sidebar.style.width = '230px';
        sidebar.style.minWidth = '230px';
        sidebar.style.paddingTop = '8px';
        
        const sidebarTitle = document.createElement('span');
        sidebarTitle.className = 'w3-bar-item w3-small w3-opacity';
        sidebarTitle.textContent = 'MENÚ PRINCIPAL';
        
        const linkUsers = document.createElement('a');
        linkUsers.href = '#';
        linkUsers.className = 'w3-bar-item w3-button';
        const iconUsers = document.createElement('i');
        iconUsers.className = 'fa fa-fw fa-users';
        linkUsers.appendChild(iconUsers);
        linkUsers.appendChild(document.createTextNode(' Gestión de usuarios y grupos'));
        
        const linkAccess = document.createElement('a');
        linkAccess.href = '#';
        linkAccess.className = 'w3-bar-item w3-button';
        const iconAccess = document.createElement('i');
        iconAccess.className = 'fa fa-fw fa-lock';
        linkAccess.appendChild(iconAccess);
        linkAccess.appendChild(document.createTextNode(' Control de accesos'));
        
        sidebar.appendChild(sidebarTitle);
        sidebar.appendChild(linkUsers);
        sidebar.appendChild(linkAccess);
        
        // ----- Contenido principal -----
        const main = document.createElement('div');
        main.style.flex = '1';
        main.style.padding = '16px 32px';
        
        const card = document.createElement('div');
        card.className = 'w3-white w3-round w3-border w3-margin-bottom';
        
        const cardHeader = document.createElement('header');
        cardHeader.className = 'w3-padding-large w3-large w3-border-bottom';
        cardHeader.style.fontWeight = '500';
        const iconDash = document.createElement('i');
        iconDash.className = 'fa fa-dashboard';
        cardHeader.appendChild(iconDash);
        cardHeader.appendChild(document.createTextNode(' Panel de Control'));
        
        const cardContent = document.createElement('div');
        cardContent.className = 'w3-padding-large';
        
        const welcome = document.createElement('h3');
        welcome.appendChild(document.createTextNode('Hola '));
        this._userNameSpan = document.createElement('span');
        this._userNameSpan.textContent = this._usuario;
        welcome.appendChild(this._userNameSpan);
        
        const description = document.createElement('p');
        description.className = 'w3-text-grey';
        description.textContent = 'Has ingresado correctamente al sistema. Probá ejecutar acciones según tus permisos:';
        
        this._btnLog = document.createElement('button');
        this._btnLog.type = 'button';
        this._btnLog.className = 'w3-button w3-blue w3-round w3-margin-right';
        const iconLog = document.createElement('i');
        iconLog.className = 'fa fa-terminal';
        this._btnLog.appendChild(iconLog);
        this._btnLog.appendChild(document.createTextNode(' Ejecutar /logAction'));
        
        this._btnHello = document.createElement('button');
        this._btnHello.type = 'button';
        this._btnHello.className = 'w3-button w3-red w3-round';
        const iconHello = document.createElement('i');
        iconHello.className = 'fa fa-comment';
        this._btnHello.appendChild(iconHello);
        this._btnHello.appendChild(document.createTextNode(' Ejecutar /sayHelloAction'));
        
        this._statusArea = document.createElement('div');
        this._statusArea.className = 'w3-margin-top w3-padding w3-light-grey w3-round';
        this._statusArea.textContent = 'Esperando acción...';
        
        cardContent.appendChild(welcome);
        cardContent.appendChild(description);
        cardContent.appendChild(this._btnLog);
        cardContent.appendChild(this._btnHello);
        cardContent.appendChild(this._statusArea);
        
        card.appendChild(cardHeader);
        card.appendChild(cardContent);
        main.appendChild(card);
        
        flexContainer.appendChild(sidebar);
        flexContainer.appendChild(main);
        
        this.appendChild(topBar);
        this.appendChild(flexContainer);
    }
    
    setUsuario(nombre) {
        this._usuario = nombre;
        this._userNameSpan.textContent = nombre;
    }
    
    connectedCallback() {
        this._btnLog.onclick = this._onLogClick.bind(this);
        this._btnHello.onclick = this._onHelloClick.bind(this);
        this._btnLogout.onclick = this._onLogoutClick.bind(this);
    }
    
    disconnectedCallback() {
        this._btnLog.onclick = null;
        this._btnHello.onclick = null;
        this._btnLogout.onclick = null;
    }
    
    async _onLogClick() {
        await this._probarEndpoint('/logAction');
    }
    
    async _onHelloClick() {
        await this._probarEndpoint('/sayHelloAction');
    }
    
    async _probarEndpoint(endpoint) {
        this._statusArea.textContent = 'Consultando autorizador RPC...';
        this._statusArea.style.color = 'black';
        
        try {
            const response = await RPCWebAPIFetch(endpoint, {});
            this._statusArea.style.color = 'green';
            this._statusArea.textContent = 'Satisfecho: ' + response.message;
        } catch (error) {
            this._manejarErrorEndpoint(error);
        }
    }
    
    _manejarErrorEndpoint(error) {
        console.error('[WCDashboardView] Error en endpoint:', error);
        
        // Acceso denegado: mostrar y MANTENER sesión
        if (error.type === 'AccessDeniedException') {
            this._statusArea.style.color = 'red';
            this._statusArea.textContent = 'Denegado: ' + error.detail;
            return;
        }
        
        // Sesión inválida/expirada: limpiar credenciales y volver al login
        if (error.type === 'SessionExpiredException' ||
            error.type === 'MissingAuthorization' ||
            error.type === 'UnauthorizedException') {
            this._statusArea.style.color = 'red';
            this._statusArea.textContent = 'Sesión inválida: ' + error.detail;
            limpiarCredenciales();
            const customEvent = new CustomEvent('show-login-view', {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(customEvent);
            return;
        }
        
        this._statusArea.style.color = 'red';
        this._statusArea.textContent = 'Error: ' + error.detail;
    }
    
    async _onLogoutClick() {
        try {
            await RPCWebAPIFetch('/logout', {});
        } catch (error) {
            console.error('[WCDashboardView] Error al cerrar sesión:', error);
        }
        
        limpiarCredenciales();
        const customEvent = new CustomEvent('show-login-view', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(customEvent);
    }
}

customElements.define('wc-dashboard-view', WCDashboardView);