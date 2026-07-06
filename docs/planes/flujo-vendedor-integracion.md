# Plan: Integración completa del flujo de Vendedor (front ↔ back)

## Context

Hoy el flujo de vendedor (proponer un bien → inspección → propuesta de condiciones → aceptar/rechazar → incluido en subasta) **no está conectado**. El frontend simula el envío con un `setTimeout` en [CreateObjectStep3.jsx:37-40](frontend/views/CreateObjectStep3.jsx#L37-L40) y [MyAuctionsScreen.jsx](frontend/views/MyAuctionsScreen.jsx) lee de `data/items.json`. En el backend el módulo `bien` tiene **solo 4 DTOs** (`bien/dto/`), sin entity/repo/service/controller.

**Hallazgo clave (del ERD real):** no hace falta inventar columnas ni una tabla nueva. El esquema ya modela todo el ciclo de vida:
- `productos.estado_revision` ∈ {`en_revision`, `aceptado`, `rechazado`} + `motivo_rechazo`, `ubicacion_deposito`, `seguro` (FK), `declaracion_propiedad`, `doc_origen_licito`, `cantidad_piezas`, `fecha_obra`.
- `itemscatalogo.estado_acuerdo` ∈ {`propuesto`, `aceptado`, `rechazado`} + `preciobase`, `comision`.

Los **6 estados del artículo** se *derivan* combinando ambas tablas. Las entidades JPA actuales no mapean varias de esas columnas, así que el primer paso es completarlas.

Decisiones tomadas con el usuario:
1. **Persistencia:** reutilizar `productos` + `itemscatalogo` (no crear tabla `bienes`).
2. **Lado empresa:** endpoint **dev/simulado** para disparar inspección y propuesta (no un módulo admin completo).
3. **Auth:** desde [jwt-auth.md](../arquitectura/jwt-auth.md) el mock token (`Bearer mock-jwt-token-for-<doc>`) ya no existe. Todo el módulo `bien` se diseña sobre el JWT real: identidad desde `@AuthenticationPrincipal AuthenticatedUser` / `SecurityUtils.currentPersonaId()`, nunca desde un path param (regla anti-IDOR, jwt-auth.md §6.3). El endpoint dev/simulado se monta bajo `/api/v1/admin/**` para heredar gratis la protección `hasRole("EMPLEADO")` que ya existe, en vez de quedar abierto a cualquier usuario autenticado.

### Mapa de estados (fuente → slug que devuelve el backend en `BienDetailDto.estado`)

| Estado del artículo | Condición derivada |
|---|---|
| `pendiente_inspeccion` | `producto.estado_revision == 'en_revision'` |
| `rechazado` | `producto.estado_revision == 'rechazado'` (mostrar `motivo_rechazo`) |
| `propuesta_enviada` | `estado_revision == 'aceptado'` **y** existe `itemscatalogo` con `estado_acuerdo == 'propuesto'` |
| `aceptado_usuario` | `itemscatalogo.estado_acuerdo == 'aceptado'` **y** su `catalogo.subasta == null` |
| `rechazado_usuario` | `itemscatalogo.estado_acuerdo == 'rechazado'` |
| `incluido_subasta` | `itemscatalogo.estado_acuerdo == 'aceptado'` **y** `catalogo.subasta != null` |

---

## Backend

### 1. Completar entidades JPA con columnas existentes en el ERD

**[ProductoEntity.java](backend/src/main/java/com/tpo/backend/producto/entity/ProductoEntity.java)** — agregar mapeos:
- `estadoRevision` (`estado_revision`, default `"en_revision"`)
- `motivoRechazo` (`motivo_rechazo`)
- `declaracionPropiedad` (`declaracion_propiedad`)
- `docOrigenLicito` (`doc_origen_licito`)
- `ubicacionDeposito` (`ubicacion_deposito`)
- `cantidadPiezas` (`cantidad_piezas`)
- `fechaObra` (`fecha_obra`, String) — nota: hoy `resena_historica` existe; el campo de arte `fecha_obra` está separado.

**[ItemCatalogoEntity.java](backend/src/main/java/com/tpo/backend/catalogo/entity/ItemCatalogoEntity.java)** — agregar:
- `estadoAcuerdo` (`estado_acuerdo`, default `"propuesto"`)

`ddl-auto=update` no rompe nada: las columnas ya existen en la base.

### 2. Repos
- **ProductoRepository**: ya tiene `findByDuenio`. OK.
- **ItemCatalogoRepository**: ya tiene `findByProducto(Long)` (Optional). OK.
- **CatalogoRepository**: ya tiene `findBySubasta`. Para el paso simulado se usará `save`.

### 3. Nuevo módulo `bien` (controller + service), reutilizando los DTOs existentes

**La identidad ya no se parsea de un token mock.** El módulo `bien` debe seguir el patrón **ya vigente** en [ProductoController](backend/src/main/java/com/tpo/backend/producto/controller/ProductoController.java#L52-L55) y [MedioPagoController](backend/src/main/java/com/tpo/backend/mediospago/controller/MedioPagoController.java) — no el de `direccion` (`/usuarios/{personaId}/direcciones`, [DireccionController.java](backend/src/main/java/com/tpo/backend/direccion/controller/DireccionController.java)), que sigue siendo el esquema viejo de id-por-path y que jwt-auth.md lista como deuda pendiente (§12).

Crear `bien/service/BienService.java` y **dos** controllers:
- **`bien/controller/BienController.java`** — ruta base `/api/v1/clientes/me/bienes` (mismo prefijo que `medios-pago`, cae en la regla `authenticated()` de `SecurityConfig`). Cada método recibe `@AuthenticationPrincipal AuthenticatedUser me` y usa `me.personaId()` como `duenioId`; nunca un `{clienteId}` en el path.
- **`bien/controller/BienAdminController.java`** — ruta base `/api/v1/admin/bienes`, solo para el endpoint simulado del lado empresa. Al vivir bajo `/api/v1/admin/**`, `SecurityConfig` ya lo protege con `hasRole("EMPLEADO")` ([SecurityConfig.java:58](backend/src/main/java/com/tpo/backend/auth/security/SecurityConfig.java#L58)) sin escribir nada nuevo — de lo contrario el "endpoint dev" quedaría abierto a cualquier usuario logueado. Ambos controllers delegan en el mismo `BienService`.

Inyectar en `BienService`: `ProductoRepository`, `FotoRepository`, `ItemCatalogoRepository`, `CatalogoRepository`, `SeguroRepository`, `DuenioRepository`, `PersonaRepository`, `EmpleadoRepository`. Reusar la constante de verificador del sistema (`= 2L`, ya existe en [ProductoService.java:30](backend/src/main/java/com/tpo/backend/producto/service/ProductoService.java#L30) y en [AuthService.java:39](backend/src/main/java/com/tpo/backend/auth/service/AuthService.java#L39)) como **revisor por defecto** y verificador del dueño.

**Endpoints:**

| Método | Ruta | Auth | Body | Acción |
|---|---|---|---|---|
| `POST` (multipart) | `/api/v1/clientes/me/bienes` | `authenticated()` | `@ModelAttribute BienProponerRequest` (campos + `List<MultipartFile> fotos`) | Crea el bien (`duenioId = me.personaId()`) |
| `GET` | `/api/v1/clientes/me/bienes` | `authenticated()` | — | Lista bienes del dueño autenticado → `List<BienListDto>` |
| `GET` | `/api/v1/clientes/me/bienes/{bienId}` | `authenticated()` | — | Detalle → `BienDetailDto` (404 si `bienId` no pertenece a `me.personaId()`) |
| `POST` | `/api/v1/clientes/me/bienes/{bienId}/respuesta` | `authenticated()` | `BienRespuestaRequest{aceptado}` | Acepta/rechaza las condiciones |
| `POST` (**dev**) | `/api/v1/admin/bienes/{bienId}/simular-inspeccion` | `hasRole("EMPLEADO")` | `{aprobar, motivoRechazo?, precioBase?, comision?, ubicacion?}` | Simula inspección + propuesta de la empresa, con token de empleado |

**`proponer(Long personaId, BienProponerRequest request)`** — `personaId` llega del controller vía `me.personaId()`, nunca por path. Mirror de [ProductoService.crear](backend/src/main/java/com/tpo/backend/producto/service/ProductoService.java#L97-L115) + multipart de [AuthController.register](backend/src/main/java/com/tpo/backend/auth/controller/AuthController.java#L21-L24):
1. Validar mínimo 6 fotos (RF-14, ver `CatalogoService.MIN_FOTOS`); si no, `UnprocessableEntityException`.
2. Validar `declaracionPropiedad == true` (RF-46), si no `BadRequestException`.
3. **Asegurar fila `duenios`** para la persona: mismo patrón idempotente que [`ProductoService.ensureDuenio`](backend/src/main/java/com/tpo/backend/producto/service/ProductoService.java#L122-L134) (`findById` → si falta, crear `DuenioEntity` con `persona`, `verificador=2`, `numeroPais` heredado de la persona). Ese método es `private` en `ProductoService`, así que `BienService` necesita su propia copia del helper (misma lógica, ~10 líneas) — no vale la pena extraer un servicio compartido para dos usos. Necesario por el FK `fk_productos_duenios`.
4. Crear `ProductoEntity`: `duenio=<DuenioEntity de personaId>`, `revisor=2`, `estadoRevision="en_revision"`, `disponible=false`, `descripcionCompleta`, `descripcionCatalogo`(=título), `categoria`, `subcategoria`, `artista`, `fechaObra`, `resenia`, `declaracionPropiedad=true`. Guardar.
5. Guardar cada `MultipartFile` como `FotoEntity{producto, foto=bytes}`.
6. Devolver `BienSolicitudResponse(productoId, "pendiente_inspeccion", "Bien enviado a inspección")`.

**`listar(Long personaId)` / `getDetalle(Long personaId, Long bienId)`**: cargar productos del dueño (`ProductoRepository.findByDuenio(personaId)`), derivar `estado` con la tabla del Context, y poblar los DTOs. `getDetalle` además verifica pertenencia — mismo chequeo anti-IDOR que [`MedioPagoService.getById`](backend/src/main/java/com/tpo/backend/mediospago/service/MedioPagoService.java#L33-L40): si `producto.getDuenio().getId()` no coincide con `personaId`, lanzar `ResourceNotFoundException` (404, no 403, para no revelar que el recurso existe). Para `BienDetailDto`: si hay `itemscatalogo` → `precioBase`/`comision`; cargar `SeguroEntity` (incluye `compania`, `importe`, `polizaCombinada`) y `ubicacion=producto.ubicacionDeposito`; si el `catalogo` tiene `subasta`, poblar `SubastaRefDto`; si rechazado, `motivoRechazo`.

**`responder(Long personaId, Long bienId, boolean aceptado)`**: primero la misma verificación de pertenencia que en `getDetalle`. Validar que el estado derivado sea `propuesta_enviada` (si no, `ConflictException`). Buscar el `itemscatalogo` del producto y setear `estadoAcuerdo = aceptado ? "aceptado" : "rechazado"`. Devolver `BienSolicitudResponse` con el nuevo estado.

**`simularInspeccion(Long bienId, ...)` (dev, invocado desde `BienAdminController`)**: no recibe `personaId` de dueño — el llamador ya es un empleado autenticado (`ROLE_EMPLEADO`, validado por `SecurityConfig` antes de llegar al método), así que opera sobre cualquier `bienId` sin chequeo de pertenencia. Documentar claramente como simulación del sistema interno.
- `aprobar=false` → `producto.estadoRevision="rechazado"`, `motivoRechazo=<texto>` → estado `rechazado`.
- `aprobar=true` → `producto.estadoRevision="aceptado"`, `ubicacionDeposito=<ubicacion|"Depósito Central">`, opcional asociar/crear `SeguroEntity`. Obtener/crear un `catalogo` "de propuestas" (responsable=2, `subasta=null`) y crear `itemscatalogo{catalogo, producto, preciobase, comision, estadoAcuerdo="propuesto", subastado=false}` (preciobase/comision con default >0.01) → estado `propuesta_enviada`.
- *(Para alcanzar `incluido_subasta` en demo: cuando el usuario acepta y se quiera mostrar ese estado, el endpoint dev puede aceptar un flag `vincularSubasta` que setea `catalogo.subasta` a una subasta `abierta` existente.)*

### 4. Errores
Reusar excepciones tipadas + `GlobalExceptionHandler` (formato `{ "error": "..." }`). Nada nuevo.

---

## Frontend

### 5. [services/api.js](frontend/services/api.js) — agregar sección "Bienes"
Reusar `apiRequest` (ya soporta `FormData` y token). El backend ya no acepta `clienteId` por URL para estos endpoints (la identidad sale del token): seguir la firma de [`getClienteMe(token)`](frontend/services/api.js#L94-L96) / `getMetricasMe(token)`, **no** la de [`getMediosPago(clienteId, token)`](frontend/services/api.js#L137-L139) — ese helper quedó desalineado con el backend real (`MedioPagoController` vive en `/clientes/me/medios-pago`, sin `{clienteId}`; el `api.js` actual le sigue pasando uno, así que esas llamadas ya están rotas hoy — deuda preexistente, fuera del alcance de este plan). Agregar:
- `proponerBien({ itemData, photos }, token)` → arma `FormData` (campos + cada foto como `{ uri, name, type }`, igual que `registerRequest`), `POST /clientes/me/bienes`.
- `getBienes(token)` → `GET /clientes/me/bienes`.
- `getBienDetalle(bienId, token)` → `GET /clientes/me/bienes/${bienId}`.
- `responderBien(bienId, aceptado, token)` → `POST /clientes/me/bienes/${bienId}/respuesta`.
- `simularInspeccionBien(bienId, body, adminToken)` → `POST /admin/bienes/${bienId}/simular-inspeccion`. **Requiere un token de empleado** (`ROLE_EMPLEADO`), no el del vendedor — ver punto 8.

**Mapeo de campos del front → request:** `descripcionCatalogo←title`, `descripcionCompleta←description`, `categoria←category`, `subcategoria←subCategory`, `artista←artistName`, `fechaObra←itemDate`, `resenia←itemHistory`, `declaracionPropiedad←isChecked`. (`condition` New/Used: anexar a `descripcionCompleta` o ignorar.)

### 6. [CreateObjectStep3.jsx](frontend/views/CreateObjectStep3.jsx#L33-L41) — reemplazar el `setTimeout`
Sustituir `handleConfirmAndSubmit` por `async` con `try/catch/finally`: llamar `proponerBien({ itemData, photos }, user.token)` (ya no se pasa `user.id` — el backend lo obtiene del JWT); en éxito `navigation.navigate('AuctionUnderReview')`; en error `Alert.alert`. Obtener `user` de `AuthContext` (patrón de [RegisterStep2](frontend/views/RegisterStep2.jsx)). Mantener `isLoading`.

### 7. [MyAuctionsScreen.jsx](frontend/views/MyAuctionsScreen.jsx) — datos reales
- Reemplazar `itemsData.json` por fetch con `useFocusEffect` + `getBienes(user.token)` (mismo patrón que `getClienteMe(token)`; **no** el de `AddressesScreen`/`PaymentMethodsScreen`, que todavía pasan un id en la URL — convención vieja que el backend de `bien` no tiene): estados `loading`, `Alert` en error.
- Ampliar el objeto [`STATUS`](frontend/views/MyAuctionsScreen.jsx#L10-L31) (hoy solo tiene `en_puja`/`pendiente`/`subastado`/`verificacion_pendiente`) a los **6 estados** del bien (`pendiente_inspeccion`→"PENDING REVIEW", `rechazado`→"REJECTED", `propuesta_enviada`→"OFFER RECEIVED", `aceptado_usuario`→"ACCEPTED", `rechazado_usuario`→"DECLINED", `incluido_subasta`→"IN AUCTION").
- `handlePress`: navegar a `BienDetail` (pantalla nueva) pasando `bienId`.

### 8. Nueva pantalla `BienDetailScreen.jsx` (+ registrar en [App.jsx](frontend/App.jsx))
Muestra el detalle (`getBienDetalle(bienId, user.token)`) según estado:
- `propuesta_enviada`: muestra `precioBase`, `comision`, `ubicacion`, datos de `seguro` y **botones Aceptar / Rechazar** → `responderBien(bienId, aceptado, user.token)` → refresca (cumple "aceptar o rechazar condiciones" y "póliza/depósito/ubicación").
- `rechazado`: muestra `motivoRechazo`.
- `incluido_subasta`: muestra la subasta (`SubastaRefDto`).
- `pendiente_inspeccion` (**modo demo**): botón "Simular inspección" cuyo handler primero llama `loginRequest('00000002', 'admin1234')` para obtener un token de empleado y solo entonces `simularInspeccionBien(bienId, body, adminToken)` — nunca reusar `user.token` del vendedor, porque la ruta exige `ROLE_EMPLEADO`. Ocultar el botón fuera de modo demo.
- Otros: estado informativo.

(Reutilizar estilos/heurística visual de `ManageObjectScreen`.)

---

## Verificación end-to-end

1. **Backend**: `cd backend && ./mvnw spring-boot:run`. Confirmar que arranca (Hibernate valida columnas nuevas contra la base existente sin error).
2. **Proponer** (multipart, con 6 fotos): login con el usuario demo (`12345678`/`password123`) vía `POST /api/v1/auth/login`, tomar el `token` y probar `POST /api/v1/clientes/me/bienes` con `Authorization: Bearer <token>`. Verificar respuesta `estado=pendiente_inspeccion` y que `GET /api/v1/clientes/me/bienes` (mismo token) lo lista.
3. **Inspección simulada**: login como empleado (`00000002`/`admin1234`, ver [jwt-auth.md §7.1](../arquitectura/jwt-auth.md)) para obtener `<TOKEN_ADMIN>` con `ROLE_EMPLEADO`. `POST /api/v1/admin/bienes/{bienId}/simular-inspeccion` con `aprobar=true, precioBase, comision` y `Authorization: Bearer <TOKEN_ADMIN>`. Probar el mismo request con el token del vendedor → debe dar `403`. Verificar `GET /api/v1/clientes/me/bienes/{bienId}` (con el token del vendedor) → `propuesta_enviada` con precio/comisión/ubicación/seguro. Probar también `aprobar=false` → `rechazado` con motivo.
4. **Respuesta del usuario**: `POST /api/v1/clientes/me/bienes/{bienId}/respuesta {aceptado:true}` con el token del vendedor → detalle `aceptado_usuario`; con `false` → `rechazado_usuario`.
5. **Frontend**: `cd frontend && npm start`. Login → crear objeto (3 pasos) → ver "Submit for Review" real → aparece en *My Items* como PENDING REVIEW → (correr inspección simulada desde el botón demo) → refrescar → OFFER RECEIVED → abrir detalle → Aceptar → ACCEPTED.
6. Confirmar manejo de errores (menos de 6 fotos → mensaje; sin token → 401; token de vendedor contra `/admin/bienes/...` → 403).

## Archivos clave
- Backend nuevos: `bien/service/BienService.java`, `bien/controller/BienController.java`, `bien/controller/BienAdminController.java`, `bien/dto/BienProponerRequest.java` (+ request del endpoint dev).
- Backend modificados: `producto/entity/ProductoEntity.java`, `catalogo/entity/ItemCatalogoEntity.java`.
- Frontend nuevos: `views/BienDetailScreen.jsx`.
- Frontend modificados: `services/api.js`, `views/CreateObjectStep3.jsx`, `views/MyAuctionsScreen.jsx`, `App.jsx`.
