# SDK v5

Se sigue escalando lo realizado en `sdk/v4`, ahora con los puntos 1 y 2 de la consigna.
Esta versión inicia la refactorización progresiva que converge hacia la integración final.

## Punto 1: RPCWebAPIFetch

En `frontend/js/api-client.js` quedó la función `async RPCWebAPIFetch(name, content)`, que centraliza todas las peticiones a la WebAPI:

- Envía **siempre por POST** con cuerpo **JSON**.
- Incluye las cabeceras: `Content-Type`, `x-user-id`, `Authorization: Bearer <hash>`, `x-api-key` y `x-api-version`.
- Si la respuesta es **200**, retorna el JSON parseado.
- Cualquier otro código (400, 401, 422, 500) lanza una `RPCWebAPIException` con `type` y `detail` extraídos del cuerpo de la respuesta, para que cada componente tome decisiones visuales.

Ningún componente hace `fetch` directo: toda comunicación con la API pasa por esta función.

## Punto 2: WebComponents (plantilla w3admin)

Tomando como base la plantilla del repositorio https://github.com/w3mix/w3admin, se construyeron:

- **`WCLoginFormView`**: encapsula el formulario **LOGIN** de `login.html` (tarjeta blanca, logo centrado, inputs, botón azul, pie con enlace a registro).
- **`WCRegisterFormView`**: encapsula el **HORIZONTAL FORM** de `forms.html` (header, filas label + input, checkbox de términos, botón Register).
- **`WCDashboardView`**: panel post-login con los botones `/logAction` y `/sayHelloAction` para probar el autorizador, barra lateral (Gestión de usuarios y grupos / Control de accesos) y cierre de sesión en la barra superior.

## Comportamiento ante errores

- **`AccessDeniedException`** (401 de autorización): el detalle se muestra en el área de resultados y **se mantiene la sesión activa**.
- **`SessionExpiredException` / `MissingAuthorization`** (401 de sesión): se vacían las credenciales y se vuelve a la pantalla de login.
- **Logout real**: el frontend llama a `/logout`, el backend elimina la sesión del Map, y el frontend limpia credenciales y muestra el login.

## Backend (mejoras sobre v4)

- Sistema de sesiones con Map (`userSessions`) y clase `UserSession`.
- Funciones separadas: `validarAutenticacion()`, `validarSesion()` y `validarAutorizacion()`.
- Endpoint `/logout` que invalida la sesión.
- Dispatcher refactorizado usando esas funciones en secuencia.
- `Access-Control-Allow-Headers` con todas las cabeceras que envía el frontend.

## Estructura

```
sdk/v5/
├── backend/
│   ├── config.json
│   ├── db.sqlite3
│   └── main.mjs
└── frontend/
    ├── index.html
    ├── assets/
    │   └── logo-isft151.png
    ├── css/
    │   └── styles.css
    └── js/
        ├── api-client.js
        ├── vistas.js
        └── components/
            ├── WCLoginFormView.js
            ├── WCRegisterFormView.js
            └── WCDashboardView.js
```

## Para probarlo

1. **Backend**: `node main.mjs` dentro de `sdk/v5/backend` (puerto 8080).
2. **Frontend**: abrir `sdk/v5/frontend/index.html` con Live Server.
3. **Login**: usuario con contraseña hasheada en la DB, por ejemplo `manu` / `1234`. También se puede registrar un usuario nuevo desde la vista de registro.
4. **Permisos**: `/logAction` está permitido para el grupo 1 (respuesta en verde); `/sayHelloAction` está denegado (respuesta en rojo, manteniendo la sesión activa).
5. **Logout**: botón "Salir" en la barra superior, o expulsión automática ante sesión inválida/expirada.