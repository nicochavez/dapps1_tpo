# BidFlow — Cómo funciona la app (guía de flujos de punta a punta)

Guía de estudio para entender **cada flujo principal** desde lo que ve el usuario (UX) hasta cómo
se persiste. Cada flujo sigue el mismo esquema:

> **Pantallas (UX)** → **Qué llama al backend (API)** → **Lógica de negocio** → **Cómo se almacena (tablas)**

Aterrizado en el código real: frontend en `frontend/`, backend en `backend/src/main/java/com/tpo/backend/`.
Referencias a requerimientos según [`RequerimientosYFeatures.md`](./RequerimientosYFeatures.md).

---

## 0. Arquitectura general (leer primero)

### Las capas y cómo viaja un request
```
 Pantalla .jsx  ──►  services/api.js  ──►  HTTPS  ──►  Controller  ──►  Service  ──►  Repository (JPA)  ──►  PostgreSQL
 (React Native)      (fetch + JWT)                     (@RestController) (reglas)     (Spring Data)          (Supabase/Railway)
                                                                             │
                                                                             └──►  StorageService  ──►  Bucket S3 (imágenes)
```

- **Frontend:** React Native + Expo. Pantallas en `frontend/views/`, navegación stack plana en [App.jsx](../frontend/App.jsx). Toda llamada HTTP pasa por [services/api.js](../frontend/services/api.js) (`apiRequest`), que agrega el header `Authorization: Bearer <JWT>` y maneja reintentos de red.
- **Backend:** Spring Boot. Un paquete por dominio con `controller/ · service/ · dto/ · entity/ · repository/`. Todos los endpoints cuelgan de `/api/v1/`.
- **Persistencia:** PostgreSQL vía Spring Data JPA (`ddl-auto=update`). Las imágenes NO van a la BD (salvo el DNI): se suben a un **bucket S3-compatible** y en la tabla se guarda solo la *key*.

### Sesión y seguridad (JWT stateless)
- El login devuelve un **JWT** (`{ sub: personaId, documento, email, roles }`, válido ~24 h) generado por `auth/security/JwtService`.
- El front guarda ese token **solo en memoria** en [context/AuthContext.jsx](../frontend/context/AuthContext.jsx) — **no hay persistencia**: si cerrás la app, hay que volver a loguear.
- El backend es **stateless**: cada request revalida el JWT en `JwtAuthenticationFilter`. La identidad del usuario **sale del token**, nunca de la URL (evita IDOR).
- **Roles** (de las tablas de subtipo de persona): `CLIENTE`, `DUENIO`, `EMPLEADO`, `SUBASTADOR`.
- Reglas de acceso ([SecurityConfig](../backend/src/main/java/com/tpo/backend/auth/security/SecurityConfig.java)):
  | Zona | Acceso |
  |---|---|
  | `/auth/**`, `/swagger-ui/**`, `/ws-native/**`, `GET /catalogos/**`, `GET /paises/**` | **Público** |
  | `/api/v1/admin/**` | Solo rol **EMPLEADO** |
  | Todo lo demás (incluido `GET /subastas`) | **Autenticado** |

### Tiempo real y automatización
- **WebSocket (STOMP)** sobre `/ws-native`: el back publica eventos por `/topic/subastas/{id}` (`item-actual`, `nueva-puja`, `item-cerrado`, `subasta-finalizada`). El front los escucha en [hooks/useLiveBids.js](../frontend/hooks/useLiveBids.js).
- **Scheduler** (`SubastaSchedulerService`, cada 5 s): pasa subastas `programada → abierta` al llegar su fecha/hora, y cierra el lote en curso tras **60 s sin pujas** (`AdjudicacionService`).
- **SSE** (`/clientes/me/notificaciones/stream`): stream de notificaciones en vivo.

### Modelo de persona (herencia)
Una `persona` (datos + DNI) puede ser a la vez varios subtipos: `cliente`, `duenio`, `empleado`, `subastador`. El `id` de persona es la PK compartida por todas las tablas de subtipo. Por eso un mismo usuario puede **comprar (cliente)** y **vender (dueño)**.

---

## 1. Gestión de usuarios y cuenta

### 1.1 Registro (RF-01, RF-02)
- **Pantallas:** `RegisterStep1` (nombre, apellido, documento, email, domicilio) → `RegisterStep2` (foto DNI frente + dorso) → `RegisterPending` ("registro en revisión").
- **API:** `POST /auth/register` **multipart/form-data** (`registerRequest` en api.js) — incluye los bytes de las dos fotos del DNI.
- **Lógica** (`AuthService.register`): valida documento/email únicos y crea de una **cuenta en estado pendiente**.
- **Almacenamiento:** en una sola transacción crea 4 filas:
  | Tabla | Qué guarda |
  |---|---|
  | `personas` | datos + **fotos del DNI como `bytea`** (`foto_dni_frente/dorso`), `estado='pendiente'` |
  | `usuarios` | email, `activo=false`, **sin `password_hash`** todavía |
  | `clientes` | `admitido=false`, `categoria=null`, verificador = empleado del sistema (id 1) |
  | `direcciones` | "Domicilio legal", `favorito=true` |

  > ⚠️ Ojo: las fotos del **DNI** van como bytes a `personas` (dato sensible privado). Las fotos de **productos** van al bucket. Son caminos distintos.

### 1.2 Aprobación por la empresa (RF-03, RF-04) — *backoffice*
- **Pantallas:** no hay UI de admin en la app; se hace por **Swagger** con un token de rol `EMPLEADO`.
- **API:** `GET /admin/clientes/pendientes` → `POST /admin/clientes/{id}/aprobar` (con `categoria`).
- **Lógica** (`AdminClienteService.aprobar`): setea `admitido=true` + `categoria`, `persona.estado='aprobado'`, **genera una clave temporal** (se imprime en consola y se manda por email), `usuario.activo=true`, y crea una **notificación** "Registration approved".
- **Almacenamiento:** update de `clientes`, `personas`, `usuarios` + insert en `notificaciones`.

### 1.3 Login (RF-05)
- **Pantalla:** `LoginScreen` (documento + clave).
- **API:** `POST /auth/login` → `{ token }`.
- **Lógica** (`AuthService.login`): busca persona por documento, verifica la clave con **BCrypt**, exige `usuario.activo=true` (si está bloqueado o no aprobado → 401), actualiza `ultimo_acceso`, calcula roles y **emite el JWT**.
- **Front** (`AuthContext.login`): decodifica el JWT y, si el rol incluye `CLIENTE`, llama a `GET /clientes/me` para enriquecer el `user` (nombre, categoría, estado). Todo queda **en memoria**.

### 1.4 Recupero y cambio de clave
- **Pantallas:** `ForgotPasswordScreen` (por documento), `ChangePasswordScreen`.
- **API:** `POST /auth/recuperar-contrasenia` / `POST /auth/cambiar-contrasenia`.
- **Lógica:** recupero genera clave temporal nueva y la envía por email (no revela si el DNI existe, anti-enumeración). Cambio exige la clave actual si ya había una. Actualiza `usuarios.password_hash`.

### 1.5 Perfil y categorías (RF-03)
- **Pantalla:** `ProfileScreen`.
- **API:** `GET /clientes/me`, `GET /clientes/me/metricas`, `PUT /clientes/me`.
- **Almacenamiento:** lee/actualiza `clientes` + `personas`.

---

## 2. Medios de pago (RF-07 a RF-10)

- **Pantallas:** `PaymentMethodsScreen` (lista + estado verificado), `AddPaymentMethodScreen` con los forms `CardForm` / `BankForm` / `CheckForm`.
- **API:** 
  - `GET /clientes/me/medios-pago` (lista) · `DELETE /clientes/me/medios-pago/{id}` (baja)
  - `POST .../medios-pago/tarjeta-credito | cuenta-bancaria | cheque-certificado` (los 3 tipos).
- **Lógica:** al crear, el medio queda `verificado=false` hasta que un empleado lo verifica por Swagger (`POST /admin/medios-pago/{id}/verificar`). **Regla clave (RF-22):** para *pujar* o *pagar* hace falta un medio **verificado y vigente en la moneda de la subasta**.
- **Almacenamiento:** 
  | Tabla | Rol |
  |---|---|
  | `medios_pago` | fila base (cliente, tipo, moneda, `verificado`, `vigente`, detalle) |
  | `medios_tarjeta_credito` / `medios_cuenta_bancaria` / `medios_cheque_certificado` | datos específicos (PK = `medio_pago`) |
- **Nota (RF-09 🟡):** "modificar" un medio se resuelve como **baja + alta** (no hay endpoint de update).

---

## 3. Flujo comprador (postor)

### 3.1 Explorar catálogos y subastas (RF-12, RF-13, RF-20)
- **Pantallas:** `ExploreCatalogsScreen` (Home) → `CatalogItemsScreen` → `ItemDetailScreen`.
- **API:** `GET /catalogos` (público) · `GET /subastas` (requiere token) · `GET /catalogos/{cat}/items/{item}`.
- **Reglas:**
  - **RF-13:** el **precio base** solo se devuelve si hay usuario autenticado; anónimo lo recibe en `null`.
  - **RF-20:** `GET /subastas` filtra por categoría — un usuario solo ve subastas de su categoría **o inferior** (`CategoriaUtil.puedeAcceder`).
- **Almacenamiento (lectura):** `catalogos`, `itemscatalogo`, `productos`, `fotos` (URLs presignadas del bucket).

### 3.2 Entrar a la sala en vivo (RF-21, RF-24, RF-25)
- **Pantallas:** `ViewAuctionScreen` + `components/ItemDetailLiveView`, con el hook `useLiveBids`.
- **API:** `POST /subastas/{id}/conectar` → `GET /subastas/{id}/item-actual` → suscripción WebSocket.
- **Lógica** (`SubastaService.conectar`): exige subasta `abierta` y cliente `admitido`; **una sola subasta a la vez** (RF-23: si ya está conectado a otra → 409). Como **postor** necesita un medio verificado; como **espectador** (RF-21) entra sin medio pero no puede pujar. Asigna un `numeroPostor`.
- **Almacenamiento:** fila en `asistentes` (cliente, subasta, `numeropostor`, `espectador`).

### 3.3 Pujar (RF-27 a RF-33) — *motor de pujas*
- **UX:** botón de puja en la sala; el front valida el rango y muestra las pujas de otros en tiempo real (WS `nueva-puja`).
- **API:** `POST /subastas/{id}/items/{item}/pujas` con `{ importe, medioPagoId, idempotencyKey }`.
- **Lógica** (`PujaService.realizarPuja`), en orden:
  1. **Idempotencia (RF-32):** si la `idempotencyKey` ya se procesó, devuelve la puja original sin revalidar (reintento seguro tras corte de red).
  2. Subasta `abierta`, ítem no subastado, conectado y **no espectador**.
  3. **Medio verificado en la moneda** de la subasta (RF-22) → si no, 422.
  4. **Rango (RF-28/29):** `mejorOferta + 1%·precioBase ≤ importe ≤ mejorOferta + 20%·precioBase`. **Excepción (RF-30):** en subastas `oro`/`platino` no hay límites, solo `importe > mejorOferta`.
  5. Persiste la puja, **reinicia la ventana de cierre a +60 s**, y **propaga por WebSocket** a todos los conectados.
- **Almacenamiento:** insert en `pujos`; update de `itemscatalogo.cierre_programado`.

### 3.4 Cierre y adjudicación (RF-35, RF-36, RF-39) — *automático*
- **Disparador:** el scheduler detecta que pasaron 60 s sin pujas (`AdjudicacionService.cerrarItem`).
- **Lógica:**
  - **Con pujas (RF-35/36):** el mayor postor gana → se marca la puja `ganador=true`, se crea una **compra pendiente**, se registra la venta y `productos.nuevo_duenio` = persona del ganador. Se le envía notificación *"You won the bid!"*.
  - **Sin pujas (RF-39):** la **empresa** compra a precio base; `nuevo_duenio` = admin (persona 1).
  - Cuando no quedan lotes, la subasta pasa a `finalizada`.
- **Almacenamiento:** update `pujos` + `itemscatalogo.subastado=true`; insert en `compras` (`estado_pago='pendiente'`) y `registrodesubasta`; update `productos.nuevo_duenio`; insert en `notificaciones`.

### 3.5 Completar la compra y pagar (RF-37, RF-38, RF-40)
- **Pantalla:** `CompletePurchaseScreen` (desglose importe + comisión + envío; elección envío/retiro; selección de medio).
- **API:** `GET /clientes/me/compras`, `GET /clientes/me/compras/{id}`, `PUT .../{id}/retiro-personal`, `POST .../{id}/pagar`.
- **Lógica** (`CompraService`):
  - `setRetiroPersonal` marca retiro (RF-38: el retiro personal anula el seguro — regla declarada).
  - `pagar` exige un medio **propio, verificado, vigente y en la moneda de la subasta** (RF-40) → setea `estado_pago='pagado'`.
- **Almacenamiento:** update de `compras`.

### 3.6 Multas por incumplimiento (RF-41, RF-42) 🟡
- **Pantalla:** las multas pendientes se muestran en `CompletePurchaseScreen` (sumadas al total).
- **API:** `GET /clientes/me/multas`, `POST /clientes/me/multas/{id}/pagar`.
- **Cómo se genera (backoffice):** un empleado, por Swagger, aplica `POST /admin/compras/{id}/multa` → `AdminPagoService.asignarMulta` crea una multa del **10 % del importe**, con `fecha_limite` +7 días, y notifica al deudor (texto de 72 h / derivación a la justicia).
- **Pago** (`MultaService.pagar`): exige medio verificado en la moneda → `estado='pagada'`.
- **Bloqueo total (RF-44):** `POST /admin/usuarios/{id}/bloquear` → `usuario.activo=false` (le corta el login).
- **Almacenamiento:** `multas` (+ `notificaciones`); bloqueo toca `usuarios.activo`.

---

## 4. Flujo vendedor (dueño)

### 4.1 Proponer un bien (RF-45, RF-46)
- **Pantallas:** `CreateObjectStep1` (datos) → `CreateObjectStep2` (categoría, artista/fecha/reseña si es arte) → `CreateObjectStep3` (≥6 fotos + **declaración jurada obligatoria**).
- **API:** `POST /productos` **multipart** (`createProducto` en api.js), con las fotos.
- **Lógica** (`ProductoService.crear`): 
  - **`ensureDuenio` (RF-45 diferido):** si la persona todavía no era `duenio`, se crea la fila de subtipo al enviar su primer bien. Así un cliente "se convierte" en dueño sin re-registrarse.
  - Cada foto se sube al **bucket**: `StorageService.upload` la **redimensiona a ≤1080 px / JPEG q0.8** y guarda solo la *key* en `fotos.url`.
  - El producto nace en `estado = en_revision`.
- **Almacenamiento:** insert en `productos` (dueño, categoría, metadatos de arte) + N filas en `fotos` (keys del bucket) + posible insert en `duenios`.

### 4.2 Revisión de la empresa (RF-48, RF-49) — *backoffice*
- **API:** `GET /admin/productos/pendientes` → `POST /admin/productos/{id}/aprobar` | `/rechazar` (con motivo).
- **Estados** (`productos.estado`): `en_revision` → `aceptado`/`rechazado`; el rechazo guarda `motivo_rechazo` (visible en la vista del ítem).

### 4.3 Propuesta de condiciones: precio base y comisión (RF-50, RF-51)
- **Pantalla:** `ManageObjectScreen` (ve precio base + comisión + fecha/lugar de la subasta; acepta o rechaza).
- **API:** `GET /productos/{id}/propuesta`, `POST .../propuesta/aceptar`, `POST .../propuesta/rechazar`.
- **Lógica** (`ProductoService`):
  - Exige que el producto sea del dueño autenticado y esté en `propuesta_enviada`.
  - **Aceptar →** `estado=aceptado_por_usuario` **y** `itemscatalogo.estado_acuerdo='aceptado'` (así el scheduler lo toma para la subasta). **Seguro automático (RF-54):** si el precio base supera **10.000.000 ARS / 10.000 USD** (según la moneda de la subasta), se crea/asigna una póliza `POL-AUTO-{id}`.
  - **Rechazar →** `estado=rechazado_por_usuario` e `itemscatalogo.estado_acuerdo='rechazado'` (queda fuera de la subasta).
- **Almacenamiento:** update `productos`, `itemscatalogo`, y posible insert en `seguros`.

### 4.4 Seguimiento
- **Pantallas:** `MyAuctionsScreen`, `ManageAuctionScreen`, `ManageObjectScreen`, `AuctionUnderReviewScreen`.
- **API:** `GET /productos/me`, `GET /subastas/duenios/{userId}`.
- **Nota:** al venderse un bien, `productos.duenio` **no cambia** (queda como consignante original para "My Items"); el ganador se guarda en `productos.nuevo_duenio`.

---

## 5. Historial y métricas (RF-58, RF-59, RF-60)

- **Pantallas:** `BidsScreen` ("My Bids"), sección de métricas en `ProfileScreen`.
- **API:** `GET /clientes/me/participaciones`, `GET /clientes/me/metricas`, `GET /subastas/{id}/items/{item}/pujas` (historial ordenado), `GET /clientes/me/subastas`.
- **Lógica:** `participaciones` arma, por subasta en la que el cliente pujó, su resumen + el historial por ítem, marcando si ganó y si el lote está en puja. `metricas` agrega asistidas/ganadas/importes.
- **Almacenamiento (lectura):** `asistentes`, `pujos`, `itemscatalogo`, `registrodesubasta`.

---

## 6. Notificaciones (HU-41) 🟡

- **Pantalla:** `NotificationsScreen`.
- **API:** `GET /clientes/me/notificaciones` (lista) · `GET .../notificaciones/stream` (SSE, tiempo real) · `PATCH .../{id}/leida`.
- **Quién las crea:** aprobación de registro, cambio de categoría, ganar una puja, aplicación de multa, aceptación/rechazo de bien.
- **Almacenamiento:** tabla `notificaciones` (cliente, título, mensaje, `leida`, fecha).

---

## 7. Backoffice / administración (rol EMPLEADO)

No tiene UI en la app: se opera por **Swagger** con un token de empleado. Cubre los parches 🟡 de la demo.

| Acción | Endpoint | Efecto |
|---|---|---|
| Aprobar/rechazar cliente | `POST /admin/clientes/{id}/aprobar|rechazar` | admite + categoría + clave temporal |
| Cambiar categoría | `PUT /admin/clientes/{id}/categoria` | actualiza categoría + notifica |
| Verificar medio de pago | `POST /admin/medios-pago/{id}/verificar` | `verificado=true` |
| Aprobar/rechazar producto | `POST /admin/productos/{id}/aprobar|rechazar` | estado + motivo |
| Aplicar multa | `POST /admin/compras/{id}/multa` | multa 10 % + notificación |
| Bloquear usuario | `POST /admin/usuarios/{id}/bloquear` | `activo=false` (corta login) |

---

## 8. Mapa de datos (entidad ↔ tabla)

| Dominio | Tablas principales |
|---|---|
| Personas y roles | `personas`, `usuarios`, `clientes`, `duenios`, `empleados`, `subastadores`, `paises` |
| Medios de pago | `medios_pago` + `medios_tarjeta_credito` / `medios_cuenta_bancaria` / `medios_cheque_certificado` |
| Direcciones / cobro | `direcciones`, `cuentas_cobro` |
| Catálogo y bienes | `productos`, `fotos` (keys del bucket), `seguros`, `catalogos`, `itemscatalogo` |
| Subasta en vivo | `subastas`, `asistentes`, `pujos`, `registrodesubasta` |
| Post-venta | `compras`, `multas`, `notificaciones` |

**Columnas de estado que conviene conocer:**
- `personas.estado`: `pendiente → aprobado | rechazado`
- `usuarios.activo`: habilita/bloquea el login
- `clientes.admitido` + `clientes.categoria`: `comun < especial < plata < oro < platino`
- `productos.estado`: `en_revision → propuesta_enviada → aceptado_por_usuario | rechazado_por_usuario` (+ `incluido_en_subasta`, `rechazado`)
- `itemscatalogo.estado_acuerdo`: `propuesto → aceptado | rechazado` (el scheduler solo saca a puja los `aceptado`)
- `itemscatalogo.subastado` + `subastas.estado` (`programada → abierta → finalizada`)
- `compras.estado_pago`: `pendiente → pagado` · `multas.estado`: `pendiente → pagada`

---

## Apéndice — dónde mirar en el código

| Tema | Archivo |
|---|---|
| Navegación / pantallas | [frontend/App.jsx](../frontend/App.jsx) |
| Sesión / JWT en el front | [frontend/context/AuthContext.jsx](../frontend/context/AuthContext.jsx) |
| Cliente HTTP (JWT + retries) | [frontend/services/api.js](../frontend/services/api.js) |
| WebSocket sala en vivo | [frontend/hooks/useLiveBids.js](../frontend/hooks/useLiveBids.js) |
| Seguridad / roles | [auth/security/SecurityConfig.java](../backend/src/main/java/com/tpo/backend/auth/security/SecurityConfig.java) |
| Registro / login / clave | [auth/service/AuthService.java](../backend/src/main/java/com/tpo/backend/auth/service/AuthService.java) |
| Aprobación de clientes | [admin/service/AdminClienteService.java](../backend/src/main/java/com/tpo/backend/admin/service/AdminClienteService.java) |
| Motor de pujas | [puja/service/PujaService.java](../backend/src/main/java/com/tpo/backend/puja/service/PujaService.java) |
| Cierre / adjudicación | [subasta/service/AdjudicacionService.java](../backend/src/main/java/com/tpo/backend/subasta/service/AdjudicacionService.java) |
| Sala / conexión | [subasta/service/SubastaService.java](../backend/src/main/java/com/tpo/backend/subasta/service/SubastaService.java) |
| Flujo vendedor | [producto/service/ProductoService.java](../backend/src/main/java/com/tpo/backend/producto/service/ProductoService.java) |
| Compra / pago | [compra/service/CompraService.java](../backend/src/main/java/com/tpo/backend/compra/service/CompraService.java) |
| Multas / bloqueo | [multa/service/MultaService.java](../backend/src/main/java/com/tpo/backend/multa/service/MultaService.java) · [admin/service/AdminPagoService.java](../backend/src/main/java/com/tpo/backend/admin/service/AdminPagoService.java) |
| Imágenes / bucket | [common/storage/StorageService.java](../backend/src/main/java/com/tpo/backend/common/storage/StorageService.java) |

> Para el guion de demostración paso a paso, ver [`PlanDemo.md`](./PlanDemo.md).
</content>
