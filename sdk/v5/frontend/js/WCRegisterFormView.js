class WCRegisterFormView extends HTMLElement {
    constructor() {
        super();
        
        // Clono el template
        var template = document.getElementById('tpl-register');
        var contenido = template.content.cloneNode(true);
        this.appendChild(contenido);

        // Guardo referencias
        this.btnRegister = this.querySelector('#btn-register');
        this.btnVolver = this.querySelector('#btn-volver-login');
        this.inputUser = this.querySelector('#input-reg-user');
        this.inputPass = this.querySelector('#input-reg-pass');
    }

    connectedCallback() {
        if (this.btnRegister) {
            this.btnRegister.onclick = this.onRegisterClick.bind(this);
        }
        if (this.btnVolver) {
            this.btnVolver.onclick = this.onVolverClick.bind(this);
        }
    }

    disconnectedCallback() {
        if (this.btnRegister) {
            this.btnRegister.onclick = null;
        }
        if (this.btnVolver) {
            this.btnVolver.onclick = null;
        }
    }

    onRegisterClick(event) {
        var u = this.inputUser.value;
        var p = this.inputPass.value;
        this.dispatchEvent(new CustomEvent('on-intentar-registro', { detail: { user: u, pass: p } }));
    }

    onVolverClick(event) {
        this.dispatchEvent(new CustomEvent('on-volver-login'));
    }
}

customElements.define('wc-register-form-view', WCRegisterFormView);