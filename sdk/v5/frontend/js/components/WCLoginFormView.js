import { 
    RPCWebAPIFetch, 
    establecerCredenciales, 
    calcularHashSHA256 
} from '../api-client.js';

/**
 * WCLoginFormView - WebComponent para el formulario de Login
 * Encapsula el diseño de w3admin/login.html usando createElement()
 */
export class WCLoginFormView extends HTMLElement {
    constructor() {
        super();
        
        // CONSTRUCTOR: crea estructura
        this._crearEstructura();
    }
    
    /**
     * Crea toda la estructura del componente con createElement
     */
    _crearEstructura() {
        // Contenedor principal
        const container = document.createElement('div');
        container.className = 'w3-padding-32';
        
        // Centrado
        const centered = document.createElement('div');
        centered.className = 'w3-auto';
        centered.style.width = '380px';
        
        // Tarjeta blanca
        const card = document.createElement('div');
        card.className = 'w3-white w3-round w3-margin-bottom w3-border';
        
        // Contenido de la tarjeta
        const cardContent = document.createElement('div');
        cardContent.className = 'w3-padding-large';
        
        // Logo centrado
        const logoContainer = document.createElement('div');
        logoContainer.className = 'w3-center w3-padding-16';
        
        const logo = document.createElement('img');
        logo.src = 'assets/logo-isft151.png';        logo.alt = 'ISFT 151';
        logo.className = 'w3-image';
        logo.style.maxWidth = '100px';
        
        const title = document.createElement('p');
        title.className = 'w3-large';
        title.textContent = 'INICIAR SESIÓN';
        
        logoContainer.appendChild(logo);
        logoContainer.appendChild(title);
        
        // Input Usuario
        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'w3-margin-bottom';
        
        this._inputUsername = document.createElement('input');
        this._inputUsername.type = 'text';
        this._inputUsername.className = 'w3-input w3-round w3-border';
        this._inputUsername.placeholder = 'Usuario';
        
        usernameDiv.appendChild(this._inputUsername);
        
        // Input Password
        const passwordDiv = document.createElement('div');
        passwordDiv.className = 'w3-margin-bottom';
        
        this._inputPassword = document.createElement('input');
        this._inputPassword.type = 'password';
        this._inputPassword.className = 'w3-input w3-round w3-border';
        this._inputPassword.placeholder = 'Contraseña';
        
        passwordDiv.appendChild(this._inputPassword);
        
        // Botón Ingresar
        this._btnSignIn = document.createElement('button');
        this._btnSignIn.type = 'button';
        this._btnSignIn.className = 'w3-button w3-round w3-margin-bottom w3-primary w3-block';
        
        const iconSignIn = document.createElement('i');
        iconSignIn.className = 'fa fa-sign-in';
        
        this._btnSignIn.appendChild(iconSignIn);
        this._btnSignIn.appendChild(document.createTextNode(' Ingresar'));
        
        // Pie con enlace a registro
        const footer = document.createElement('div');
        footer.className = 'w3-center w3-border-top';
        
        const footerContent = document.createElement('p');
        footerContent.className = 'w3-margin';
        
        const warningText = document.createElement('span');
        warningText.className = 'w3-text-warning';
        warningText.textContent = '¿No tienes cuenta?';
        
        this._linkRegister = document.createElement('a');
        this._linkRegister.href = '#';
        this._linkRegister.textContent = ' Regístrate aquí';
        
        footerContent.appendChild(warningText);
        footerContent.appendChild(this._linkRegister);
        footer.appendChild(footerContent);
        
        // Ensamblar todo
        cardContent.appendChild(logoContainer);
        cardContent.appendChild(usernameDiv);
        cardContent.appendChild(passwordDiv);
        cardContent.appendChild(this._btnSignIn);
        
        card.appendChild(cardContent);
        card.appendChild(footer);
        
        centered.appendChild(card);
        container.appendChild(centered);
        
        this.appendChild(container);
    }
    
    connectedCallback() {
        // CONNECTED: asignar eventos con .bind(this)
        this._btnSignIn.onclick = this._onSignInClick.bind(this);
        this._linkRegister.onclick = this._onRegisterClick.bind(this);
    }
    
    disconnectedCallback() {
        // DISCONNECTED: desasignar eventos
        this._btnSignIn.onclick = null;
        this._linkRegister.onclick = null;
    }
    
    /**
     * Maneja el click en el botón de Ingresar
     */
    async _onSignInClick() {
        const username = this._inputUsername.value.trim();
        const password = this._inputPassword.value;
        
        if (!username || !password) {
            alert('Por favor ingresa usuario y contraseña');
            return;
        }
        
        try {
            const response = await RPCWebAPIFetch('/loginUser', { 
                username: username, 
                password: password 
            });
            
            this._onLoginSuccess(response);
            
        } catch (error) {
            this._onLoginError(error);
        }
    }
    
    /**
     * Callback de éxito en login
     */
    _onLoginSuccess(response) {
        console.log('[WCLoginFormView] Login exitoso:', response);
        
        // Calcular hash y establecer credenciales
        calcularHashSHA256(response.user).then(function(hash) {
            establecerCredenciales(response.user, hash);
            
            // Disparar evento para que la app principal muestre el dashboard
            const event = new CustomEvent('login-success', {
                detail: response,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }.bind(this));
    }
    
    /**
     * Callback de error en login
     */
    _onLoginError(error) {
        console.error('[WCLoginFormView] Error en login:', error);
        alert('Error: ' + error.detail);
    }
    
    /**
     * Maneja el click en el link de registro
     */
        _onRegisterClick(event) {
        event.preventDefault();
        
        // Disparar evento para cambiar a la vista de registro
        const customEvent = new CustomEvent('show-register-view', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(customEvent);
    }
}

// Registrar el WebComponent
customElements.define('wc-login-form-view', WCLoginFormView);