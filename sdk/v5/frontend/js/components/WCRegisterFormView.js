import { RPCWebAPIFetch } from '../api-client.js';

/**
 * WCRegisterFormView - WebComponent para el formulario de Registro
 * Encapsula el HORIZONTAL FORM de w3admin/forms.html usando createElement()
 */
export class WCRegisterFormView extends HTMLElement {
    constructor() {
        super();
        
        // Solo crea estructura
        this._crearEstructura();
    }
    
    /**
     * Crea toda la estructura con createElement
     */
    _crearEstructura() {
        const wrapper = document.createElement('div');
        wrapper.className = 'w3-padding-32';
        
        const centered = document.createElement('div');
        centered.className = 'w3-auto';
        centered.style.width = '640px';
        
        const card = document.createElement('div');
        card.className = 'w3-white w3-round w3-margin-bottom w3-border';
        
        // Header del HORIZONTAL FORM de w3admin
        const header = document.createElement('header');
        header.className = 'w3-padding-large w3-large w3-border-bottom';
        header.style.fontWeight = '500';
        header.textContent = 'HORIZONTAL FORM';
        
        const form = document.createElement('div');
        form.className = 'w3-padding-large';
        
        // Fila: Usuario
        const filaUser = this._crearFila('Usuario', 'text', 'Enter Your Username');
        this._inputUsername = filaUser.input;
        
        // Fila: Contraseña
        const filaPass = this._crearFila('Contraseña', 'password', 'Choose Password');
        this._inputPassword = filaPass.input;
        
        // Fila: Confirmar contraseña
        const filaConfirm = this._crearFila('Confirmar', 'password', 'Confirm Password');
        this._inputConfirm = filaConfirm.input;
        
        // Fila: checkbox de términos
        const filaCheck = document.createElement('div');
        filaCheck.className = 'w3-row w3-margin-bottom';
        
        const espacioCheck = document.createElement('div');
        espacioCheck.className = 'w3-col l2';
        espacioCheck.textContent = '\u00A0';
        
        const contCheck = document.createElement('div');
        contCheck.className = 'w3-col l10';
        
        const labelCheck = document.createElement('label');
        this._checkboxTerms = document.createElement('input');
        this._checkboxTerms.type = 'checkbox';
        this._checkboxTerms.className = 'w3-check';
        labelCheck.appendChild(this._checkboxTerms);
        labelCheck.appendChild(document.createTextNode(' I Agree Terms & Conditions'));
        
        contCheck.appendChild(labelCheck);
        filaCheck.appendChild(espacioCheck);
        filaCheck.appendChild(contCheck);
        
        // Fila: botones
        const filaBotones = document.createElement('div');
        filaBotones.className = 'w3-row w3-margin-bottom';
        
        const espacioBotones = document.createElement('div');
        espacioBotones.className = 'w3-col l2';
        espacioBotones.textContent = '\u00A0';
        
        const contBotones = document.createElement('div');
        contBotones.className = 'w3-col l10';
        
        this._btnRegister = document.createElement('button');
        this._btnRegister.type = 'button';
        this._btnRegister.className = 'w3-button w3-primary w3-round';
        const iconoLock = document.createElement('i');
        iconoLock.className = 'fa fa-fw fa-lock';
        this._btnRegister.appendChild(iconoLock);
        this._btnRegister.appendChild(document.createTextNode(' Register'));
        
        this._btnBack = document.createElement('button');
        this._btnBack.type = 'button';
        this._btnBack.className = 'w3-button w3-round w3-margin-left';
        const iconoBack = document.createElement('i');
        iconoBack.className = 'fa fa-arrow-left';
        this._btnBack.appendChild(iconoBack);
        this._btnBack.appendChild(document.createTextNode(' Volver'));
        
        contBotones.appendChild(this._btnRegister);
        contBotones.appendChild(this._btnBack);
        filaBotones.appendChild(espacioBotones);
        filaBotones.appendChild(contBotones);
        
        // Ensamblar
        form.appendChild(filaUser.row);
        form.appendChild(filaPass.row);
        form.appendChild(filaConfirm.row);
        form.appendChild(filaCheck);
        form.appendChild(filaBotones);
        
        card.appendChild(header);
        card.appendChild(form);
        centered.appendChild(card);
        wrapper.appendChild(centered);
        
        this.appendChild(wrapper);
    }
    
    /**
     * Helper: crea una fila horizontal (label l2 + input l10) como w3admin
     */
    _crearFila(textoLabel, tipoInput, placeholder) {
        const row = document.createElement('div');
        row.className = 'w3-row w3-margin-bottom';
        
        const label = document.createElement('label');
        label.className = 'w3-col l2';
        label.textContent = textoLabel;
        
        const inputWrap = document.createElement('div');
        inputWrap.className = 'w3-col l10';
        
        const input = document.createElement('input');
        input.type = tipoInput;
        input.className = 'w3-input w3-border w3-round';
        input.placeholder = placeholder;
        
        inputWrap.appendChild(input);
        row.appendChild(label);
        row.appendChild(inputWrap);
        
        return { row: row, input: input };
    }
    
    connectedCallback() {
        // CONNECTED: asignar eventos con .bind(this)
        this._btnRegister.onclick = this._onRegisterClick.bind(this);
        this._btnBack.onclick = this._onBackClick.bind(this);
    }
    
    disconnectedCallback() {
        // DISCONNECTED: desasignar eventos
        this._btnRegister.onclick = null;
        this._btnBack.onclick = null;
    }
    
    /**
     * Maneja el click en Register
     */
    async _onRegisterClick() {
        const username = this._inputUsername.value.trim();
        const password = this._inputPassword.value;
        const confirm = this._inputConfirm.value;
        
        if (!username || !password) {
            alert('Completá usuario y contraseña.');
            return;
        }
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        if (!this._checkboxTerms.checked) {
            alert('Debés aceptar los términos y condiciones.');
            return;
        }
        
        try {
            const response = await RPCWebAPIFetch('/registerUser', {
                username: username,
                password: password
            });
            
            alert('Usuario registrado con éxito. Ahora iniciá sesión.');
            const customEvent = new CustomEvent('show-login-view', {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(customEvent);
            
        } catch (error) {
            console.error('[WCRegisterFormView] Error en registro:', error);
            alert('Error al registrar: ' + error.detail);
        }
    }
    
    /**
     * Maneja el click en Volver
     */
    _onBackClick() {
        const customEvent = new CustomEvent('show-login-view', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(customEvent);
    }
}

// Registrar el WebComponent
customElements.define('wc-register-form-view', WCRegisterFormView);