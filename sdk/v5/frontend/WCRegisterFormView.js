class WCRegisterFormView extends HTMLElement {
  constructor() {
    super();

    // Contenedor principal del Formulario Horizontal (Tarjeta)
    this.container = document.createElement('div');
    this.container.className = 'w3-white w3-round w3-margin-bottom w3-border';

    // Encabezado
    var header = document.createElement('header');
    header.className = 'w3-padding-large w3-large w3-border-bottom';
    header.style.fontWeight = '500';
    header.textContent = 'HORIZONTAL FORM';
    this.container.appendChild(header);

    var wrapper = document.createElement('div');
    wrapper.className = 'w3-padding-large';

    // Formulario Nativo
    this.formulario = document.createElement('form');

    // 1. Campo Name
    var rowName = document.createElement('div');
    rowName.className = 'w3-row w3-margin-bottom';
    
    var labelName = document.createElement('label');
    labelName.className = 'w3-col l2';
    labelName.textContent = 'Name';
    
    var colName = document.createElement('div');
    colName.className = 'w3-col l10';
    
    this.inputName = document.createElement('input');
    this.inputName.type = 'text';
    this.inputName.className = 'w3-input w3-border w3-round';
    this.inputName.placeholder = 'Enter Your Name';
    this.inputName.required = true;
    
    colName.appendChild(this.inputName);
    rowName.appendChild(labelName);
    rowName.appendChild(colName);
    this.formulario.appendChild(rowName);

    // 2. Campo Email
    var rowEmail = document.createElement('div');
    rowEmail.className = 'w3-row w3-margin-bottom';
    
    var labelEmail = document.createElement('label');
    labelEmail.className = 'w3-col l2';
    labelEmail.textContent = 'Email';
    
    var colEmail = document.createElement('div');
    colEmail.className = 'w3-col l10';
    
    this.inputEmail = document.createElement('input');
    this.inputEmail.type = 'email';
    this.inputEmail.className = 'w3-input w3-border w3-round';
    this.inputEmail.placeholder = 'Enter Your Email Address';
    this.inputEmail.required = true;
    
    colEmail.appendChild(this.inputEmail);
    rowEmail.appendChild(labelEmail);
    rowEmail.appendChild(colEmail);
    this.formulario.appendChild(rowEmail);

    // 3. Campo Mobile Number
    var rowMobile = document.createElement('div');
    rowMobile.className = 'w3-row w3-margin-bottom';
    
    var labelMobile = document.createElement('label');
    labelMobile.className = 'w3-col l2';
    labelMobile.textContent = 'Mobile Number';
    
    var colMobile = document.createElement('div');
    colMobile.className = 'w3-col l10';
    
    this.inputMobile = document.createElement('input');
    this.inputMobile.type = 'text';
    this.inputMobile.className = 'w3-input w3-border w3-round';
    this.inputMobile.placeholder = 'Enter Your Mobile Number';
    this.inputMobile.required = true;
    
    colMobile.appendChild(this.inputMobile);
    rowMobile.appendChild(labelMobile);
    rowMobile.appendChild(colMobile);
    this.formulario.appendChild(rowMobile);

    // 4. Campo Password
    var rowPass = document.createElement('div');
    rowPass.className = 'w3-row w3-margin-bottom';
    
    var labelPass = document.createElement('label');
    labelPass.className = 'w3-col l2';
    labelPass.textContent = 'Password';
    
    var colPass = document.createElement('div');
    colPass.className = 'w3-col l10';
    
    this.inputPassword = document.createElement('input');
    this.inputPassword.type = 'password';
    this.inputPassword.className = 'w3-input w3-border w3-round';
    this.inputPassword.placeholder = 'Enter Password';
    this.inputPassword.required = true;
    
    colPass.appendChild(this.inputPassword);
    rowPass.appendChild(labelPass);
    rowPass.appendChild(colPass);
    this.formulario.appendChild(rowPass);

    // 5. Campo Confirm Password
    var rowConfirm = document.createElement('div');
    rowConfirm.className = 'w3-row w3-margin-bottom';
    
    var labelConfirm = document.createElement('label');
    labelConfirm.className = 'w3-col l2';
    labelConfirm.textContent = 'Confirm Password';
    
    var colConfirm = document.createElement('div');
    colConfirm.className = 'w3-col l10';
    
    this.inputConfirm = document.createElement('input');
    this.inputConfirm.type = 'password';
    this.inputConfirm.className = 'w3-input w3-border w3-round';
    this.inputConfirm.placeholder = 'Confirm Password';
    this.inputConfirm.required = true;
    
    colConfirm.appendChild(this.inputConfirm);
    rowConfirm.appendChild(labelConfirm);
    rowConfirm.appendChild(colConfirm);
    this.formulario.appendChild(rowConfirm);

    // 6. Checkbox de Términos
    var rowCheck = document.createElement('div');
    rowCheck.className = 'w3-row w3-margin-bottom';
    
    var colCheckOffset = document.createElement('div');
    colCheckOffset.className = 'w3-col l2';
    // Espacio en blanco puro usando nodo de texto Unicode (reemplaza &nbsp;)
    colCheckOffset.appendChild(document.createTextNode('\u00A0'));
    
    var colCheck = document.createElement('div');
    colCheck.className = 'w3-col l10';
    
    var checkLabel = document.createElement('label');
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.className = 'w3-check';
    this.checkbox.checked = true;
    
    checkLabel.appendChild(this.checkbox);
    checkLabel.appendChild(document.createTextNode(' I Agree Terms & Conditions '));
    
    colCheck.appendChild(checkLabel);
    rowCheck.appendChild(colCheckOffset);
    rowCheck.appendChild(colCheck);
    this.formulario.appendChild(rowCheck);

    // 7. Botón de Registro
    var rowBtn = document.createElement('div');
    rowBtn.className = 'w3-row w3-margin-bottom';
    
    var colBtnOffset = document.createElement('div');
    colBtnOffset.className = 'w3-col l2';
    // Espacio en blanco puro usando nodo de texto Unicode
    colBtnOffset.appendChild(document.createTextNode('\u00A0'));
    
    var colBtn = document.createElement('div');
    colBtn.className = 'w3-col l10';
    
    this.btnSubmit = document.createElement('button');
    this.btnSubmit.type = 'submit';
    this.btnSubmit.className = 'w3-button w3-primary w3-round';
    
    var btnIcon = document.createElement('i');
    btnIcon.className = 'fa fa-fw fa-lock';
    
    this.btnSubmit.appendChild(btnIcon);
    this.btnSubmit.appendChild(document.createTextNode(' Register'));
    
    colBtn.appendChild(this.btnSubmit);
    rowBtn.appendChild(colBtnOffset);
    rowBtn.appendChild(colBtn);
    this.formulario.appendChild(rowBtn);

    wrapper.appendChild(this.formulario);
    this.container.appendChild(wrapper);

    // Inyectamos todo en el elemento
    this.appendChild(this.container);

    // Bindeo clásico para evitar funciones flecha
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

    // Verificamos contraseñas coincidentes
    if (this.inputPassword.value !== this.inputConfirm.value) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    var eventoRegister = new CustomEvent('register-submit', {
      detail: {
        username: this.inputName.value,
        email: this.inputEmail.value,
        phone: this.inputMobile.value,
        password: this.inputPassword.value
      },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoRegister);
  }
}

customElements.define('wc-register-form-view', WCRegisterFormView);