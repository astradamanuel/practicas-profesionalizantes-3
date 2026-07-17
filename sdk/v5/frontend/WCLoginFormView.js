// WCLoginFormView.js

class WCLoginFormView extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: "open" });
        
        var plantilla = document.getElementById("template-login-form");
        if (plantilla) {
            var clon = plantilla.content.cloneNode(true);
            this.shadowRoot.appendChild(clon);
        }

        this.formulario = this.shadowRoot.querySelector("form");
        this.contenedorError = this.shadowRoot.querySelector(".mensaje-error");

        // Bindeo estricto en el constructor para evitar funciones flecha
        this.alEnviarFormularioBindeado = this.alEnviarFormulario.bind(this);
        this.alIniciarSesionExitosoBindeado = this.alIniciarSesionExitoso.bind(this);
        this.alManejarErrorBindeado = this.alManejarError.bind(this);
    }

    connectedCallback() {
        if (this.formulario) {
            this.formulario.addEventListener("submit", this.alEnviarFormularioBindeado);
        }
    }

    disconnectedCallback() {
        if (this.formulario) {
            this.formulario.removeEventListener("submit", this.alEnviarFormularioBindeado);
        }
    }

    alEnviarFormulario(evento) {
        evento.preventDefault();
        
        var campos = this.formulario.elements;
        var datos = {
            usuario: campos.username.value,
            clave: campos.password.value
        };

        RPCWebAPIFetch("login", datos)
            .then(this.alIniciarSesionExitosoBindeado)
            .catch(this.alManejarErrorBindeado);
    }

    alIniciarSesionExitoso(respuesta) {
        var eventoExito = new CustomEvent("login-exitoso", {
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

customElements.define("wc-login-form-view", WCLoginFormView);