# Plan: Connect Auth, Direccion & MedioPago controllers to the frontend

## Context

The Spring Boot backend now has real, working controllers for **auth**, **direcciones**, and
**medios de pago**, backed by JPA against the Supabase Postgres DB. The React Native frontend,
however, is still almost entirely mock-driven: login reads `data/users.json`, registration is
stubbed with TODO comments, and the address / payment-method forms are uncontrolled inputs with
no submit handlers. The goal is to wire these three controllers end-to-end so a user can register,
log in, and manage their addresses and payment methods against the real API.

Decisions confirmed with the user:
- **Token storage: in-memory only** (no AsyncStorage dependency; session lost on app restart — acceptable).
- **Scope: full auth flow** (register multipart + login), plus full direccion & medio-pago CRUD.
- **Password reset:** the **forgot-password** flow drives `cambiar-contrasenia`; the backend endpoint
  is changed to accept **`email`** instead of the numeric `id`.
- **Street/number:** add a dedicated **Number** field to the register & address forms so `calle`
  and `numeroCalle` are sent correctly.

## Key architectural finding (no backend changes needed for auth/direccion/medio-pago)

The address and payment endpoints take a numeric id in the path:
- Direcciones: `/api/v1/usuarios/{personaId}/direcciones`
- Medios de pago: `/api/v1/clientes/{clienteId}/medios-pago`

Login (`POST /auth/login`) returns **only** `{ "token": "mock-jwt-token-for-<documento>" }` — no id.
But `ClienteService.getDocumentoFromToken()` already parses that token from the `Authorization: Bearer`
header, and `GET /api/v1/clientes/me` returns a `ClienteDto` whose `identificador` **is** the
personaId == clienteId (in `AuthService.register`, `cliente.setId(persona.getId())`).

**Resolution flow:** login → store token → `GET /clientes/me` with the token → store
`identificador`. Use that single id for both direccion (`personaId`) and medio-pago (`clienteId`)
calls. No backend change required.

## Backend API contract (verified, for reference during wiring)

**Auth** (`/api/v1/auth`):
- `POST /register` — **multipart/form-data** (`@ModelAttribute RegisterRequest`). Fields:
  `nombre, apellido, documento, email, dniFrente(file), dniDorso(file), calle, numeroCalle,
  piso?, departamento?, ciudad, provincia?, codigoPostal, numeroPais(Integer)`. → `201 {id}` (usuario id).
  Creates a **pending** account (`activo=false`, `passwordHash=null`); password is set server-side
  and emailed — matches the existing `RegisterPending` screen copy.
- `POST /login` — JSON `{documento, contrasenia}` → `200 {token}`. Rejects if `activo=false`.
- `POST /cambiar-contrasenia` — JSON `{id(usuario), contraseniaActual?, contrasenia}`.

**Cliente** (`/api/v1/clientes/me`, token-resolved): `GET` → `ClienteDto {identificador, documento,
nombre, estado, categoria, admitido, pais}`.

**Direcciones** (`/api/v1/usuarios/{personaId}/direcciones`):
- `GET /` → `[DireccionDto]`; `POST /` → `201 DireccionDto`; `GET /favorita`;
  `PUT /{direccionId}`; `DELETE /{direccionId}` → 204.
- `DireccionDto`: `identificador, nombre, calle, numero, piso, departamento, ciudad, provincia,
  codigoPostal, pais(Integer), favorito(bool)`.
- `DireccionRequest`: `nombre, calle, numero, piso?, departamento?, ciudad, provincia?,
  codigoPostal, pais(Integer), favorito(bool)`. Setting `favorito=true` clears the previous favorite.

**Medios de pago** (`/api/v1/clientes/{clienteId}/medios-pago`):
- `GET /`, `GET /{id}`, `DELETE /{id}` (409 if it's the only verified method).
- `POST /cuenta-bancaria` — `{banco, numeroCuenta, titular?, montoReservado?, moneda(ARS|USD), internacional(bool)}`
- `POST /tarjeta-credito` — `{bancoEmisor?, ultimosCuatro(4), titular, fechaVencimiento(yyyy-MM-dd), moneda, internacional}`
- `POST /cheque-certificado` — `{banco, numeroCheque?, montoCertificado(>0), fechaVencimiento, moneda, internacional}`
- All return a polymorphic `MedioPagoDto` with base fields `identificador, tipo, moneda,
  internacional, verificado, vigente, detalle` plus the subtype-specific fields.

Error shape: `{ "error": "..." }` or `{ "errors": { field: msg } }`. `apiRequest` already reads
`data?.mensaje || data?.message`; **update it to also read `data?.error`** so backend messages surface.

## Implementation

### 1. `frontend/services/api.js` — add endpoint helpers
- **Fix `apiRequest` error extraction** to include `data?.error` and the `data.errors` map.
- **Rewrite `registerRequest`** to send `FormData` (multipart). Do **not** set `Content-Type`
  manually (let fetch set the boundary). Append `dniFrente`/`dniDorso` as
  `{ uri, name, type }` objects from the ImagePicker assets.
- Add:
  - `getClienteMe(token)` → `GET /clientes/me`
  - `getDirecciones(personaId, token)`, `createDireccion(personaId, body, token)`,
    `updateDireccion(personaId, direccionId, body, token)`, `deleteDireccion(personaId, direccionId, token)`
  - `getMediosPago(clienteId, token)`, `deleteMedioPago(clienteId, id, token)`,
    `createCuentaBancaria/createTarjetaCredito/createChequeCertificado(clienteId, body, token)`
- Reuse the existing `apiRequest` wrapper and `token` option for all of these.

### 2. `frontend/context/AuthContext.jsx` — real login + expose user id
- In `login({documento, contrasenia})`: call `loginRequest`, store token, then call
  `getClienteMe(token)` and set `user = { id: dto.identificador, documento, nombre: dto.nombre,
  category: dto.categoria, estado: dto.estado, admitido: dto.admitido, token }`.
- Keep the mock-object branch only if still needed; prefer removing it so `user.id` is always the
  real `identificador`. Keep state in-memory (no persistence) per decision.
- `user.id` (= personaId = clienteId) and `token` become the values every screen passes to the API.

### 3. `frontend/views/LoginScreen.jsx`
- Replace the `users.json` lookup with `await login({ documento: dni.trim(), contrasenia: password })`
  inside try/catch; on success `navigation.navigate('Home')`, on error set `errorMessage`
  (e.g. "Credenciales invalidas." / "Usuario inactivo."). Remove the `usersData` import.

### 4. Registration: `RegisterStep1` → `RegisterStep2` → `RegisterPending`
- `RegisterStep1`: already controlled; no change beyond optionally splitting street/number (see note).
- `RegisterStep2.handleRegister`: replace the mock `userId` with a real `registerRequest` call using
  `FormData` built from `step1Data` + `idCardNumber` (= `documento`) + the two picked images:
  - Map `step1Data.firstName→nombre`, `lastName→apellido`, `email→email`,
    `streetAddress→calle`, `city→ciudad`, `zipCode→codigoPostal`, `country→numeroPais` (Argentina=32).
  - **Street/number note:** backend requires both `calle` and `numeroCalle` (@NotBlank). Step1 only
    has one "Street Address" field. Simplest: send the whole string as `calle` and a placeholder
    `numeroCalle="0"`, OR add a small "Number" input to Step1. Recommend adding the input for correctness.
  - On `201`, navigate to `RegisterPending` (password arrives by email — copy already says this).
- No RegisterStep3 (deleted) and no client-side password set in the register flow.

### 5. Addresses: `AddressesScreen.jsx` + `EditAddressScreen.jsx`
- `AddressesScreen`: on mount, `getDirecciones(user.id, token)` into state; render the list from the
  API (`DireccionDto` fields). Add controlled state for the "add" form and a submit handler calling
  `createDireccion`. Wire the delete icon to `deleteDireccion` (+ refetch), and Edit nav to pass the
  full `direccion` object. Map UI labels: `nombre`(label/Full Name), `calle`+`numero`, `ciudad`,
  `codigoPostal`, `favorito`(isDefault).
- `EditAddressScreen`: make inputs controlled (init from the passed `direccion`), implement
  "Save Changes" → `updateDireccion(user.id, direccion.identificador, body, token)` → `goBack`.

### 6. Payment methods: `AddPaymentMethodScreen.jsx` + `CardForm/BankForm/CheckForm`
- Lift form state into controlled inputs (each form currently uncontrolled). On submit:
  - **BankForm** → `createCuentaBancaria` (`banco, numeroCuenta, titular?, moneda, internacional`).
  - **CardForm** → `createTarjetaCredito` (`titular, ultimosCuatro` = last 4 of card number,
    `fechaVencimiento` from MM/YY → `yyyy-MM-dd`, `moneda, internacional`). CVV is not sent (no backend field).
  - **CheckForm** → `createChequeCertificado` (`banco, numeroCheque?, montoCertificado, fechaVencimiento, moneda`).
  - Add a currency (ARS/USD) selector where the forms don't have one — backend requires `moneda`.
- `PaymentMethodsScreen` (list): fetch via `getMediosPago(user.id, token)`, render `detalle`/`tipo`,
  wire delete to `deleteMedioPago` (handle the 409 "only verified method" message).
- `AddPaymentMethodScreen` passes `user.id`/`token` down and refetches/navigates back on success.

### 7. Password reset via forgot-password (backend change: id → email)
Backend changes (small, both in `auth`):
- **`SetContraseniaRequest.java`**: replace `@NotNull Long id` with `@NotBlank @Email String email`
  (keep `contraseniaActual?` and `@NotBlank contrasenia`).
- **`AuthService.setContrasenia`**: look up the usuario with `usuarioRepository.findByEmail(email)`
  (already exists) instead of `findById`; keep the rest of the logic and the
  `emailService.enviarCambioClave(...)` call.

Frontend wiring (`ForgotPasswordScreen.jsx`): the screen currently only collects an email. Add a
**new-password** input (and confirm), then on submit call a new
`cambiarContrasenia({ email, contrasenia })` helper in `api.js` (`POST /auth/cambiar-contrasenia`).
Keep the existing success ("Check your email") state. Note: `setContrasenia` still enforces
`contraseniaActual` when a password already exists — for a true "forgot" reset we either pass the
empty/initial case or, if the backend should allow resetting without the old password, that is a
follow-up the user can confirm. (`ChangePasswordScreen` for logged-in users can reuse the same
email-based endpoint, sending `user.documento`'s email + current + new password.)

## Verification

1. **Backend:** `cd backend && ./mvnw spring-boot:run` (port 8080). Confirm Swagger at
   `/swagger-ui.html` lists the three controllers.
2. **Frontend:** `cd frontend && npm start`, run on Android emulator (api base is `http://10.0.2.2:8080`).
3. **Login:** seed/activate an account (`activo=true`, known password) in DB; log in → lands on Home;
   wrong password shows "Credenciales invalidas.".
4. **Register:** complete Step1+Step2 with two ID photos → expect `201`, RegisterPending screen, and a
   new pending persona/usuario/cliente + legal address rows in the DB.
5. **Addresses:** add, edit, set-favorite, delete; verify list reflects each change and `GET /favorita`
   returns the right one.
6. **Payment methods:** add one of each type, list them, delete; verify the 409 guard fires when
   deleting the only verified method.
7. **(If change-password is included)** add the backend `/me` variant, then change password and
   re-login with the new one.

## Critical files
- `frontend/services/api.js` (helpers + error parsing + multipart register)
- `frontend/context/AuthContext.jsx` (login → `/clientes/me` → `user.id`)
- `frontend/views/LoginScreen.jsx`, `RegisterStep1.jsx`, `RegisterStep2.jsx`
- `frontend/views/AddressesScreen.jsx`, `EditAddressScreen.jsx`
- `frontend/views/AddPaymentMethodScreen.jsx`, `PaymentMethodsScreen.jsx`,
  `frontend/components/CardForm.jsx`, `BankForm.jsx`, `CheckForm.jsx`
- (optional) backend `AuthController.java` + `AuthService.java` for the token-based password change
