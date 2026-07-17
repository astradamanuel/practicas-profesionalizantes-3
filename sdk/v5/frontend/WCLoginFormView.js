class WCLoginFormView extends HTMLElement {
  constructor() {
    super();

    // Contenedor del Login (Tarjeta Principal)
    this.container = document.createElement('div');
    this.container.className = 'w3-white w3-round w3-margin-bottom w3-border';

    var wrapper = document.createElement('div');
    wrapper.className = 'w3-padding-large';

    // Sección de Encabezado (Logo y Título)
    var header = document.createElement('div');
    header.className = 'w3-center w3-padding-16';

    var logo = document.createElement('img');
    logo.src = './assets/admin-logo.png';
    logo.alt = 'w3mix';
    logo.className = 'w3-image';

    var pText = document.createElement('p');
    pText.textContent = 'SIGN IN';

    header.appendChild(logo);
    header.appendChild(pText);
    wrapper.appendChild(header);

    // Formulario Nativo
    this.formulario = document.createElement('form');

    // Input Usuario
    var userGroup = document.createElement('div');
    userGroup.className = 'w3-margin-bottom';
    this.inputUsuario = document.createElement('input');
    this.inputUsuario.type = 'text';
    this.inputUsuario.className = 'w3-input w3-round w3-border';
    this.inputUsuario.placeholder = 'Enter Username';
    this.inputUsuario.required = true;
    userGroup.appendChild(this.inputUsuario);
    this.formulario.appendChild(userGroup);

    // Input Password
    var passGroup = document.createElement('div');
    passGroup.className = 'w3-margin-bottom';
    this.inputPassword = document.createElement('input');
    this.inputPassword.type = 'password';
    this.inputPassword.className = 'w3-input w3-round w3-border';
    this.inputPassword.placeholder = 'Enter Password';
    this.inputPassword.required = true;
    passGroup.appendChild(this.inputPassword);
    this.formulario.appendChild(passGroup);

    // Checkbox de Términos
    var checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'w3-margin-bottom';

    var checkContainer = document.createElement('div');
    checkContainer.className = 'icheck-material-white';

    this.checkbox = document.createElement('input');
    this.checkbox.id = 'user-checkbox';
    this.checkbox.className = 'w3-check';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = true;

    var labelCheck = document.createElement('label');
    labelCheck.htmlFor = 'user-checkbox';
    labelCheck.textContent = 'I AGREE WITH TERMS & CONDITIONS';

    checkContainer.appendChild(this.checkbox);
    checkContainer.appendChild(labelCheck);
    checkboxGroup.appendChild(checkContainer);
    this.formulario.appendChild(checkboxGroup);

    // Botón de Enviar (Instanciado en Constructor)
    this.btnSubmit = document.createElement('button');
    this.btnSubmit.type = 'submit';
    this.btnSubmit.className = 'w3-button w3-round w3-margin-bottom w3-primary w3-block';
    this.btnSubmit.textContent = 'Sign In';
    this.formulario.appendChild(this.btnSubmit);

    // Elementos Extras de redes sociales
    var socialText = document.createElement('div');
    socialText.className = 'w3-center w3-margin-bottom w3-opacity';
    socialText.textContent = 'Sign In With';
    this.formulario.appendChild(socialText);

    // Fila Redes Sociales
    var rowSocial = document.createElement('div');
    rowSocial.className = 'w3-row-padding w3-stretch';

    // Columna Facebook
    var colFb = document.createElement('div');
    colFb.className = 'w3-col m6';
    var btnFb = document.createElement('button');
    btnFb.type = 'button';
    btnFb.className = 'w3-button w3-round w3-margin-bottom bg-facebook w3-text-white w3-block';
    
    var iconFb = document.createElement('i');
    iconFb.className = 'fa fa-facebook-square';
    btnFb.appendChild(iconFb);
    btnFb.appendChild(document.createTextNode(' Facebook'));
    colFb.appendChild(btnFb);

    // Columna Twitter
    var colTw = document.createElement('div');
    colTw.className = 'w3-col m6 text-right';
    var btnTw = document.createElement('button');
    btnTw.type = 'button';
    btnTw.className = 'w3-button w3-round w3-margin-bottom bg-twitter w3-text-white w3-block';
    
    var iconTw = document.createElement('i');
    iconTw.className = 'fa fa-twitter-square';
    btnTw.appendChild(iconTw);
    btnTw.appendChild(document.createTextNode(' Twitter'));
    colTw.appendChild(btnTw);

    rowSocial.appendChild(colFb);
    rowSocial.appendChild(colTw);
    this.formulario.appendChild(rowSocial);

    wrapper.appendChild(this.formulario);
    this.container.appendChild(wrapper);

    // Footer de la Tarjeta (Link de Registro)
    var cardFooter = document.createElement('div');
    cardFooter.className = 'w3-center w3-border-top';

    var pFooter = document.createElement('p');
    pFooter.className = 'w3-margin';

    var spanText = document.createElement('span');
    spanText.className = 'w3-text-warning';
    spanText.textContent = 'Do not have an account?';

    var linkSignUp = document.createElement('a');
    linkSignUp.href = 'register.html';
    linkSignUp.textContent = ' Sign Up here';

    pFooter.appendChild(spanText);
    pFooter.appendChild(linkSignUp);
    cardFooter.appendChild(pFooter);
    this.container.appendChild(cardFooter);

    // Renderizado en el DOM del Custom Element (No usamos Shadow DOM para heredar la cascada global de CSS)
    this.appendChild(this.container);

    // Enlace de contexto manual para evitar funciones flecha
    this.manejarSubmit = this.manejarSubmit.bind(this);
  }

  connectedCallback() {
    this.formulario.addEventListener('submit', this.manejarSubmit);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener('submit', this.manejarSubmit);
  }

  manejarSubmit(event) {
    event.preventDefault();

    var eventoLogin = new CustomEvent('login-submit', {
      detail: {
        username: this.inputUsuario.value,
        password: this.inputPassword.value
      },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoLogin);
  }
}

customElements.define('wc-login-form-view', WCLoginFormView);