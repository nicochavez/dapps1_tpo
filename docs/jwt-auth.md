# Autenticación JWT — BidFlow Backend

Documentación de la implementación de autenticación y autorización basada en
**JSON Web Tokens (JWT)** sobre Spring Security.

> Reemplaza al token simulado anterior (`"mock-jwt-token-for-<documento>"`), que no
> estaba firmado, viajaba con el documento en texto plano y no era validado por ningún
> filtro. Ahora el token es un JWT real firmado (HS256), validado en cada petición.

---

## 1. Visión general

```
                    ┌──────────────────────────────────────────────┐
   POST /auth/login │  AuthService                                  │
  (documento, pass) │  - findByDocumento + BCrypt.matches           │
 ────────────────►  │  - computeRoles(personaId)                    │
                    │  - JwtService.generateToken(...)              │
                    └───────────────┬──────────────────────────────┘
                                    │  { "token": "<jwt>" }
                                    ▼
   Cliente guarda el token y lo envía en cada request:
        Authorization: Bearer <jwt>
                                    │
                                    ▼
                    ┌──────────────────────────────────────────────┐
  cualquier request │  JwtAuthenticationFilter (OncePerRequest)     │
 ────────────────►  │  - JwtService.parse(token)                    │
                    │  - setea AuthenticatedUser en SecurityContext │
                    └───────────────┬──────────────────────────────┘
                                    ▼
                    ┌──────────────────────────────────────────────┐
                    │  SecurityConfig (reglas por ruta/rol)         │
                    │  - público / authenticated / hasRole(EMPLEADO)│
                    └───────────────┬──────────────────────────────┘
                                    ▼
            Controller → Service usa SecurityUtils.currentPersonaId()
```

**Idea clave:** el `subject` del token es el `personaId`. En el modelo de datos
(`docs/newErd.sql`), `personas` es la raíz y las tablas de rol
(`clientes`, `duenios`, `empleados`, `subastadores`) **comparten esa misma PK**. Por lo
tanto un único id identifica al usuario, y "tener un rol" = existir una fila en la tabla
de ese subtipo.

---

## 2. Estructura del token

Algoritmo: **HS256** (HMAC-SHA256). Claims:

| Claim       | Significado                                                        |
|-------------|-------------------------------------------------------------------|
| `sub`       | `personaId` — identidad única (PK compartida)                     |
| `documento` | DNI del usuario (conveniencia)                                    |
| `email`     | email del usuario (conveniencia)                                  |
| `roles`     | lista, ej. `["CLIENTE","DUENIO"]` (sin prefijo `ROLE_`)          |
| `iat`       | emitido en                                                         |
| `exp`       | expiración (`iat + app.jwt.expiration-ms`, por defecto 24 h)      |

Ejemplo de payload decodificado:

```json
{
  "sub": "5",
  "documento": "12345678",
  "email": "demo@bidflow.com",
  "roles": ["CLIENTE"],
  "iat": 1749312000,
  "exp": 1749398400
}
```

Los roles se mapean a *authorities* de Spring agregando el prefijo `ROLE_`
(`CLIENTE` → `ROLE_CLIENTE`), de modo que `hasRole("EMPLEADO")` funcione.

---

## 3. Configuración

`backend/src/main/resources/application.properties`:

```properties
# El secreto DEBE venir de la variable de entorno APP_JWT_SECRET en producción.
# El default es solo para desarrollo local (>= 32 bytes para HS256).
app.jwt.secret=${APP_JWT_SECRET:dev-only-bidflow-jwt-secret-change-me-please-32b}
app.jwt.expiration-ms=86400000
```

Enlazado de forma tipada con `auth/config/JwtProperties.java`
(`@ConfigurationProperties("app.jwt")`).

> ⚠️ En producción definí `APP_JWT_SECRET` como variable de entorno con una clave de al
> menos 32 bytes. `JwtService` falla al arrancar si el secreto es más corto.

Dependencias agregadas en `pom.xml`:

- `spring-boot-starter-security`
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl` (runtime), `jjwt-jackson` (runtime) — v0.12.6

---

## 4. Componentes (paquete `com.tpo.backend.auth`)

| Archivo | Rol |
|---|---|
| `config/JwtProperties.java` | Config tipada `app.jwt.*` (secret, expiración). |
| `security/JwtService.java` | Firma (`generateToken`) y valida (`parse`) el JWT. `parse` devuelve `null` si la firma/expiración es inválida. |
| `security/AuthenticatedUser.java` | `record (Long personaId, String documento, List<String> roles)`. Es el *principal* en el `SecurityContext`. |
| `security/JwtAuthenticationFilter.java` | `OncePerRequestFilter`. Lee `Authorization: Bearer`, valida y coloca el `AuthenticatedUser` en el contexto. **Indulgente:** sin token o token inválido → continúa anónimo (las reglas deciden si se permite). |
| `security/SecurityConfig.java` | `SecurityFilterChain` stateless + reglas por ruta + bean `BCryptPasswordEncoder`. |
| `security/SecurityUtils.java` | Helpers estáticos: `currentUser()`, `currentUserOrNull()`, `currentPersonaId()`. |
| `security/RestAuthenticationEntryPoint.java` | Respuesta 401 con formato `{"error": "..."}`. |
| `security/RestAccessDeniedHandler.java` | Respuesta 403 con formato `{"error": "..."}`. |
| `security/PasswordMigrationRunner.java` | Migración única al arrancar: re-hashea contraseñas en texto plano a BCrypt. |
| `service/AuthService.java` | Login (emite el JWT), registro y cambio de clave (BCrypt). |

---

## 5. Reglas de autorización (`SecurityConfig`)

Sesión **stateless**, CSRF deshabilitado (API REST). Orden de las reglas (la primera que
coincide gana):

| Patrón | Acceso |
|---|---|
| `/api/v1/auth/**` | público |
| `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**` | público |
| `/ws/**` (WebSocket/STOMP) | público |
| `GET /api/v1/catalogos/**` | público (RF-12/RF-13) |
| `GET /api/v1/productos/**` | público (browse + fotos) |
| `GET /api/v1/paises/**` | público (alta de usuario) |
| `/api/v1/admin/**` | `hasRole("EMPLEADO")` |
| cualquier otra | `authenticated()` |

Notas:
- Las escrituras (`POST/PUT/DELETE`) sobre catálogos y productos **no** son públicas:
  caen en `authenticated()`.
- Los endpoints personales viven bajo `/api/v1/clientes/me/**` y por lo tanto requieren
  autenticación automáticamente.
- **RF-13 (ocultar precio base a no registrados):** los endpoints públicos de catálogo
  igual ejecutan el filtro JWT; si llega un token válido, `ClienteService.isAuthenticated()`
  devuelve `true` y se muestra el precio; si no, se oculta.

---

## 6. Flujos

### 6.1 Login (`POST /api/v1/auth/login`)

Request:
```json
{ "documento": "12345678", "contrasenia": "password123" }
```

Pasos en `AuthService.login`:
1. `personaRepository.findByDocumento(documento)` (sin *full table scan*).
2. Busca el `usuario` por `personaId`.
3. `passwordEncoder.matches(raw, usuario.passwordHash)` (BCrypt).
4. Verifica `usuario.activo`.
5. `computeRoles(personaId)` — `existsById` sobre clientes/duenios/empleados/subastadores.
6. `jwtService.generateToken(personaId, documento, email, roles)`.

Response (sin cambios de forma respecto al mock):
```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

### 6.2 Petición autenticada

```
GET /api/v1/clientes/me
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

`JwtAuthenticationFilter` valida y setea el contexto → `ClienteController.getPerfil()` →
`ClienteService.getAuthenticatedCliente()` → `SecurityUtils.currentPersonaId()`.

### 6.3 Identidad derivada del token (no de la URL)

Para evitar **IDOR**, la identidad nunca se toma de un path/query param:

- **Medios de pago:** `GET/POST/DELETE /api/v1/clientes/me/medios-pago` — el `clienteId`
  sale del token vía `@AuthenticationPrincipal AuthenticatedUser me`.
- **Alta de producto (rol Dueño):** `POST /api/v1/productos` — el dueño sale del token.
  Como `productos.duenio` referencia a `duenios` y el registro solo crea `clientes`, al
  enviar su primer bien (RF-45) la persona adquiere el rol DUEÑO de forma diferida
  (`ProductoService.ensureDuenio`).

### 6.4 Cambio / generación de clave (`POST /api/v1/auth/cambiar-contrasenia`)

Guarda siempre `passwordEncoder.encode(nuevaClave)`. Si ya existía una clave, valida la
actual con `passwordEncoder.matches`.

---

## 7. Roles

| Rol (claim) | Authority | Se obtiene si… |
|---|---|---|
| `CLIENTE` | `ROLE_CLIENTE` | existe fila en `clientes` (todo usuario registrado) |
| `DUENIO` | `ROLE_DUENIO` | existe fila en `duenios` (al enviar su primer bien) |
| `EMPLEADO` | `ROLE_EMPLEADO` | existe fila en `empleados` (acceso a `/admin/**`) |
| `SUBASTADOR` | `ROLE_SUBASTADOR` | existe fila en `subastadores` |

Los roles se calculan **en el login** y quedan fijos en el token hasta que expira. Si a
un usuario se le otorga un rol nuevo, lo verá reflejado al volver a iniciar sesión.

---

## 7.1 Administrador (rol EMPLEADO)

Los endpoints `/api/v1/admin/**` requieren `ROLE_EMPLEADO`, pero el alta de usuarios solo
crea **clientes**. El empleado administrador se siembra manualmente con
[`docs/seed.sql`](./seed.sql): el empleado verificador (`identificador = 2`) ya otorga
`ROLE_EMPLEADO`; solo se le agrega una fila en `usuarios` con credenciales de login.

`password_hash` **debe** ser un hash **BCrypt** (`$2a/$2b/$2y...`), porque el backend valida
con `BCryptPasswordEncoder.matches()`. Para generar el tuyo:

```bash
python3 -c "import bcrypt;print(bcrypt.hashpw(b'TU_CLAVE',bcrypt.gensalt(10)).decode())"
# o:  htpasswd -bnBC 10 '' 'TU_CLAVE'   (usar la parte después de los ':')
```

El hash incluido en `seed.sql` corresponde a la clave `admin1234`. Login y uso:

```bash
# Token de administrador (documento del verificador sembrado)
curl -s -X POST localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"documento":"00000002","contrasenia":"admin1234"}'

# Aprobar un cliente (roles del JWT incluyen EMPLEADO)
curl -i -s -X POST localhost:8080/api/v1/admin/clientes/5/aprobar \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H 'Content-Type: application/json' \
  -d '{"categoria":"comun"}'
```

> Nota: `AdminClienteService.aprobar()` genera una contraseña temporal y la guarda
> **hasheada con BCrypt** (se envía en texto plano solo por email), de modo que el cliente
> aprobado puede loguearse inmediatamente.

---

## 8. Manejo de errores

Respuestas consistentes con `GlobalExceptionHandler` (`{"error": "..."}`):

| Situación | Status | Cuerpo |
|---|---|---|
| Falta token / token inválido en ruta protegida | `401` | `{"error":"No autenticado: falta o es invalido el token."}` |
| Token válido pero sin el rol requerido | `403` | `{"error":"Acceso denegado: permisos insuficientes."}` |
| Credenciales incorrectas en login | `401` | `{"error":"Credenciales invalidas."}` |

---

## 9. Migración de contraseñas

Las cuentas sembradas antes de adoptar BCrypt tienen la clave en texto plano.
`PasswordMigrationRunner` (un `CommandLineRunner`) corre al arrancar y re-hashea cualquier
`password_hash` que **no** empiece con `$2` (formato BCrypt). Es idempotente: en arranques
posteriores no toca las que ya están hasheadas.

> Efecto: la cuenta demo (`documento 12345678` / `password123`) sigue funcionando tras la
> migración, ahora con el hash BCrypt.

---

## 10. Pruebas

`backend/src/test/java/com/tpo/backend/auth/security/JwtServiceTest.java` (unitario, sin
contexto de Spring ni base de datos):

- round-trip generar/parsear,
- token manipulado → `null`,
- firmado con otro secreto → `null`,
- token expirado → `null`,
- secreto demasiado corto → `IllegalStateException`.

```bash
cd backend
./mvnw test -Dtest=JwtServiceTest
```

### Verificación manual (app en `:8080`)

```bash
# 1) Login → obtener token
curl -s -X POST localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"documento":"12345678","contrasenia":"password123"}'

# 2) Endpoint protegido con el token
curl -s localhost:8080/api/v1/clientes/me \
  -H "Authorization: Bearer <TOKEN>"

# 3) Sin token → 401
curl -i -s localhost:8080/api/v1/clientes/me

# 4) Endpoint admin con token de cliente → 403
curl -i -s localhost:8080/api/v1/admin/clientes/pendientes \
  -H "Authorization: Bearer <TOKEN_CLIENTE>"
```

---

## 11. Impacto en el frontend

- La forma de la respuesta de login **no cambió** (`{ "token": "..." }`). El cliente sigue
  guardando el string y enviándolo en `Authorization: Bearer <token>`.
- Los tokens viejos (`mock-jwt-token-for-…`) ya no son válidos → 401. Hay que reloguear.
- Cambió la ruta de medios de pago: `/clientes/{clienteId}/medios-pago` →
  `/clientes/me/medios-pago`.
- Cambió la ruta de alta de producto: `POST /productos/{duenioId}/addProducto` →
  `POST /productos`.

---

## 12. Pendientes / futuro

- Endpoints de solo lectura que aún reciben id por path (menor riesgo, ya requieren auth):
  `GET /subastas/duenios/{userId}`, `GET /subastas/cliente/{userId}`, y los lookups de
  `UsuarioController`. Se pueden migrar a `/me`.
- *Refresh tokens* (hoy: un único access token de 24 h).
- Tightening de escrituras administrativas (ej. `POST /catalogos`, creación de subastas)
  a `ROLE_EMPLEADO` si se desea.
