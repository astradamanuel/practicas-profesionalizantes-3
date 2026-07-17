// WCRegisterFormView.js

class WCRegisterFormView extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: "open" });
        
        var plantilla = document.getElementById("template-register-form");
        if (plantilla) {
            var clon = plantilla.content.cloneNode(true);
            this.shadowRoot.appendChild(clon);
        }

        this.formulario = this.shadowRoot.querySelector("form");
        this.contenedorError = this.shadowRoot.querySelector(".mensaje-error");

        // Bindeo estricto en el constructor para evitar funciones flecha
        this.alEnviarRegistroBindeado = this.alEnviarRegistro.bind(this);
        this.alRegistroExitosoBindeado = this.alRegistroExitoso.bind(this);
        this.alManejarErrorBindeado = this.alManejarError.bind(this);
    }

    connectedCallback() {
        if (this.formulario) {
            this.formulario.addEventListener("submit", this.alEnviarRegistroBindeado);
        }
    }

    disconnectedCallback() {
        if (this.formulario) {
            this.formulario.removeEventListener("submit", this.alEnviarRegistroBindeado);
        }
    }

    alEnviarRegistro(evento) {
        evento.preventDefault();
        
        var campos = this.formulario.elements;
        var datos = {
            email: campos.email.value,
            password: campos.password.value,
            notificaciones: campos.subscribe ? campos.subscribe.checked : false
        };

        RPCWebAPIFetch("register", datos)
            .then(this.alRegistroExitosoBindeado)
            .catch(this.alManejarErrorBindeado);
    }

    alRegistroExitoso(respuesta) {
        var eventoExito = new CustomEvent("registro-exitoso", {
            detail: respuesta,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(eventoExito);
    }

    alManejarError(error) {
        if (this.contenedorError) {
            this.contenedorError.textContent = error.message;
            this.contenedorError.style.display = "block";
        } else {
            alert(error.message);
        }
    }
}

customElements.define("wc-register-form-view", WCRegisterFormView);