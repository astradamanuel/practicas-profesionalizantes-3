class WCLoginFormView extends HTMLElement {
    constructor() {
        super();
        
        // 1. Clono el template 
        var template = document.getElementById('tpl-login');
        var contenido = template.content.cloneNode(true);
        this.appendChild(contenido);

        // 2. Guardo referencias a los elementos en variables de la clase
        this.btnLogin = this.querySelector('#btn-login');
        this.btnLinkRegistro = this.querySelector('#link-ir-registro');
        this.inputUser = this.querySelector('#input-login-user');
        this.inputPass = this.querySelector('#input-login-pass');
    }

    connectedCallback() {
        // SÓLO asigno eventos usando .bind(this)
        if (this.btnLogin) {
            this.btnLogin.onclick = this.onLoginClick.bind(this);
        }
        if (this.btnLinkRegistro) {
            this.btnLinkRegistro.onclick = this.onRegistroClick.bind(this);
        }
    }

    disconnectedCallback() {
        // SÓLO remuevo eventos
        if (this.btnLogin) {
            this.btnLogin.onclick = null;
        }
        if (this.btnLinkRegistro) {
            this.btnLinkRegistro.onclick = null;
        }
    }

    // Métodos de clase para manejar la lógica
    onLoginClick(event) {
        var u = this.inputUser.value;
        var p = this.inputPass.value;
        this.dispatchEvent(new CustomEvent('on-intentar-login', { detail: { user: u, pass: p } }));
    }

    onRegistroClick(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('on-ir-registro'));
    }
}

// Registro del WebComponent
customElements.define('wc-login-form-view', WCLoginFormView);