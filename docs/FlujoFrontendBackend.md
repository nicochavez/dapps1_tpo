# Flujo Frontend → Backend por Requerimiento / Historia de Usuario

Este documento traza, para cada requerimiento funcional (RF) e historia de usuario (HU) de [`RequerimientosYFeatures.md`](./RequerimientosYFeatures.md), el flujo real implementado: qué pantalla del frontend lo dispara, qué endpoint del backend consume, con qué método/payload y cuál es el resultado esperado.

## Convenciones

- **Base URL**: el frontend arma las URLs contra `API_BASE_URL` (`frontend/services/api.js`), por defecto `http://<host>:8080/api/v1`. Todas las rutas de la tabla son relativas a `/api/v1`.
- **Auth**: las funciones de `api.js` reciben un `token` y lo envían como `Authorization: Bearer <token>`. La identidad "propia" se resuelve del token en los endpoints `/clientes/me/**` (evita IDOR); no viaja en la URL.
- **Capa de API**: **todas** las llamadas HTTP pasan por `apiRequest()` en `frontend/services/api.js`, que centraliza headers, parseo JSON y manejo de errores (lanza `Error` con el mensaje del backend). Las pantallas nunca llaman `fetch` directo.
- **Tiempo real**: además del REST, hay un canal WebSocket/STOMP (`/ws-native`, tópico `/topic/subastas/{id}`) gestionado por `frontend/hooks/useLiveBids.js`. Ver [F-05](#f-05--sala-de-subasta-en-vivo).
- Estado de cada ítem heredado de `RequerimientosYFeatures.md`: ✅ hecho · 🟡 parcial · ❌ no implementado.

---

## F-01 · Autenticación y onboarding
Cubre: RF-01..RF-06 · HU-01..HU-05, HU-40.

| HU / RF | Pantalla (frontend) | Función `api.js` | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-01 / RF-01 Registro | `RegisterStep1` → `RegisterStep2` | `registerRequest()` | `POST /auth/register` (multipart) | `FormData`: nombre, apellido, documento, email, domicilio (calle, número, piso, depto, ciudad, provincia, CP), `numeroPais`, `dniFrente`, `dniDorso` (imágenes) | `201` `{ id }`. Usuario queda en estado **pendiente**. Navega a `RegisterPending`. |
| RF-02 Verificación externa | `RegisterPending` | — | — | — | Pantalla informativa; la aprobación se hace fuera de la app (Swagger/admin). 🟡 |
| HU-02 / RF-04 Mail + alta de clave | `ChangePasswordScreen` (link del mail) | `cambiarContrasenia()` | `POST /auth/cambiar-contrasenia` | `{ email, contrasenia, contraseniaActual? }` | `200`. La clave queda seteada; el usuario ya puede loguearse. |
| HU-03 / RF-05 Login | `LoginScreen` (+ `AuthContext.login`) | `loginRequest()` → luego `getClienteMe()` | `POST /auth/login` · `GET /clientes/me` | `{ documento, contrasenia }` | `200` `{ token }`. `AuthContext` guarda el token, pide el perfil y setea `user`. Navega a `HomeScreen`. |
| HU-04 / RF-03 Ver categoría | `ProfileScreen` | `getClienteMe()` / `getMetricasMe()` | `GET /clientes/me` | — | Perfil con `categoria` (`comun`→`platino`). |
| — Recupero de clave | `ForgotPasswordScreen` | `recuperarContrasenia()` | `POST /auth/recuperar-contrasenia` | `{ documento }` | `200`. Dispara envío de mail de recupero. |
| HU-05 / RF-06 Mejora de categoría | — | — | — | — | ❌ No implementado. |

---

## F-02 · Gestión de medios de pago
Cubre: RF-07..RF-11 · HU-06..HU-09. Base: `/clientes/me/medios-pago` (identidad por JWT).

| HU / RF | Pantalla | Función `api.js` | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-07 Listar + estado verificación | `PaymentMethodsScreen`, `ProfileScreen` | `getMediosPago()` | `GET /clientes/me/medios-pago` | — | `200` lista de `MedioPagoDto` con flag `verificado`. |
| HU-06 / RF-08 Alta cuenta bancaria | `AddPaymentMethodScreen` → `BankForm` | `createCuentaBancaria()` | `POST /clientes/me/medios-pago/cuenta-bancaria` | datos de cuenta (moneda, fondos reservados, etc.) | `201` `CuentaBancariaDto` (nace **no verificado**). |
| HU-06 / RF-08 Alta tarjeta | `AddPaymentMethodScreen` → `CardForm` | `createTarjetaCredito()` | `POST /clientes/me/medios-pago/tarjeta-credito` | datos de tarjeta | `201` `TarjetaCreditoDto`. |
| HU-06 / RF-08 Alta cheque certificado | `AddPaymentMethodScreen` → `CheckForm` | `createChequeCertificado()` | `POST /clientes/me/medios-pago/cheque-certificado` | monto certificado, moneda | `201` `ChequeCertificadoDto`. |
| HU-08 Baja | `PaymentMethodsScreen` | `deleteMedioPago()` | `DELETE /clientes/me/medios-pago/{id}` | — | `204`. Desaparece de la lista. |
| HU-08 Edición | — | — | (existe `GET /{id}`; no hay PUT) | — | 🟡 No hay edición; solo alta/baja. |
| HU-09 / RF-11 Tope de cheque | — | — | — | — | ❌ No implementado. |

---

## F-03 · Perfil y categorías
Cubre: RF-03, RF-06 · HU-04, HU-05.

| HU / RF | Pantalla | Función `api.js` | Método + Endpoint | Resultado esperado |
|---|---|---|---|---|
| HU-04 Ver perfil/categoría | `ProfileScreen` | `getClienteMe()` | `GET /clientes/me` | `ClienteDto` con datos personales + categoría. |
| — Métricas en perfil | `ProfileScreen` | `getMetricasMe()` | `GET /clientes/me/metricas` | `MetricasDto` (participaciones, victorias, importes). |
| — Editar domicilio/datos | `ProfileScreen` / `AddressesScreen` | (perfil: `PUT /clientes/me`) · direcciones abajo | `PUT /clientes/me` | Perfil actualizado. |
| — Direcciones (alta/baja/edición) | `AddressesScreen`, `EditAddressScreen` | `getDirecciones` / `createDireccion` / `updateDireccion` / `deleteDireccion` / `getDireccionFavorita` | `GET·POST·PUT·DELETE /usuarios/{personaId}/direcciones[/{id}]` · `GET .../favorita` | CRUD de domicilios del usuario. |

---

## F-04 · Exploración de catálogos y subastas
Cubre: RF-12..RF-20 · HU-10..HU-13.

| HU / RF | Pantalla | Función `api.js` | Método + Endpoint | Resultado esperado |
|---|---|---|---|---|
| HU-10 / RF-12 Explorar catálogos | `ExploreCatalogsScreen`, `CatalogItemsScreen` | `getCatalogos(token?)` | `GET /catalogos` | Lista de catálogos con subasta e items embebidos. **Token opcional**. |
| HU-11 / RF-13 Ver precio base (registrado) | idem | `getCatalogos(token)` | `GET /catalogos` **con token** | Con token se incluye `precioBase`; sin token queda oculto. |
| HU-13 / RF-15 Detalle ítem de arte | `ItemDetailScreen` | `getItemCatalogoDetalle()` | `GET /catalogos/{catalogoId}/items/{itemId}` | `ItemCatalogoDetailDto`: descripción, ≥6 imágenes, y para arte: artista, fecha, reseña. |
| HU-12 / RF-20 Subastas para mi categoría | `HomeScreen`, `ViewAuctionScreen` | `getSubastas()` / `getSubastaById()` / `getCatalogos()` | `GET /subastas?estado=abierta` · `GET /subastas/{id}` | Subastas abiertas filtrables por categoría (categoría subasta ≤ categoría usuario) y moneda. |

---

## F-05 · Sala de subasta en vivo
Cubre: RF-20..RF-26 · HU-14..HU-17, HU-21, HU-22.

**Flujo:** conectar → recibir ítem actual → suscribirse a eventos en tiempo real → pujar.

| HU / RF | Pantalla / Hook | Función | Método + Endpoint | Payload / Evento | Resultado esperado |
|---|---|---|---|---|---|
| HU-14 / RF-21 Conectarse (incl. espectador) | `ItemDetailLiveView` | `conectarASubasta()` | `POST /subastas/{id}/conectar` | — (token) | `200` `ConectarResponse { asistente }` con `numeroPostor`. Espectador si no hay medio de pago verificado. |
| HU-16 / RF-24 Ítem actual + mejor oferta | (sala) | — | `GET /subastas/{id}/item-actual` | — | `ItemActualDto { item, mejorOferta{importe, numeroPostor} }`. |
| HU-17 / RF-25 Pujas en tiempo real | `useLiveBids.js` (usado por `ItemDetailLiveView`) | STOMP client | **WS** `/ws-native`, sub `/topic/subastas/{id}` | Eventos: `item-actual`, `nueva-puja`, `item-cerrado`, `subasta-finalizada` | Actualiza `currentBid`, `closesAt`, `itemClosed` sin polling. Publicados por `SubastaEventPublisher` (backend). |
| HU-15 / RF-26 Streaming externo | `ViewAuctionScreen` | — (link) | — | — | Enlace a servicio de streaming (fuera de alcance). |
| HU-22 / RF-23 Una subasta a la vez | — | — | (existe `POST /subastas/{id}/desconectar`) | — | ❌ No se impide conexión simultánea. |

---

## F-06 · Motor de pujas
Cubre: RF-27..RF-34 · HU-18..HU-20.

| HU / RF | Pantalla | Función | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-18 / RF-31 Validar y enviar puja | `ItemDetailLiveView` | `realizarPuja()` | `POST /subastas/{id}/items/{itemId}/pujas` | `{ importe, medioPagoId }` | `201` `PujaResponse { identificador, importe, ganador, confirmada }`. |
| RF-27..RF-30 Reglas de monto | (validación server) | — | idem | — | Rechaza (`422`/`400`) si `importe ≤ mejor_oferta`, `< +1%·precioBase` o `> +20%·precioBase`. Límites **no** aplican en subastas `oro`/`platino`. |
| HU-19 / RF-32 Bloqueo hasta confirmar | `ItemDetailLiveView` | (flag local + `confirmada`) | idem | — | La UI bloquea nueva puja hasta recibir confirmación y propagación por WS. |
| HU-37/HU-39 / RF-33 Historial de pujas | `ItemDetailScreen`, `BidHistorySection` | `getHistorialPujas()` | `GET /subastas/{id}/items/{itemId}/pujas` | — | Lista ordenada de `PujaHistorialDto`. |
| — Mis pujas por subasta | (perfil/historial) | (existe) | `GET /clientes/me/subastas/{id}/pujas` | — | `MiPujaDto[]`. |
| RF-34 Tope de fondos reservados | — | — | — | — | ❌ No implementado. |

---

## F-07 · Cierre, facturación y pago
Cubre: RF-35..RF-40 · HU-23..HU-25.

| HU / RF | Pantalla | Función | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-23 / RF-37 Ver compras/desglose | `BidsScreen`, `CompletePurchaseScreen` | `getCompras()` / `getCompraById()` | `GET /clientes/me/compras` · `GET /clientes/me/compras/{id}` | — | `CompraDto` con importe, comisiones y envío. Adjudicación (RF-35/36) la resuelve `AdjudicacionService` en el cierre. |
| HU-24 / RF-38 Retiro personal | `CompletePurchaseScreen` | `setRetiroPersonal()` | `PUT /clientes/me/compras/{id}/retiro-personal` | — | `200`. Marca retiro (anula seguro). 🟡 |
| HU-25 / RF-40 Pagar compra | `CompletePurchaseScreen` | `pagarCompra()` | `POST /clientes/me/compras/{id}/pagar` | `{ medioPagoId }` | `200`. Registra la venta con el medio elegido; moneda de la subasta. |
| RF-39 Sin pujas → empresa | — | — | (server, cierre) | — | Se adjudica al admin (id 1) al finalizar. 🟡 |

---

## F-08 · Multas e incumplimiento
Cubre: RF-41..RF-44 · HU-26, HU-27.

| HU / RF | Pantalla | Función | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-26 / RF-41 Ver multas | `CompletePurchaseScreen`, `ItemDetailScreen` | `getMultas()` | `GET /clientes/me/multas` | — | Lista de `MultaDto` (10% del valor ofertado). Alta de multa se hace por Swagger. 🟡 |
| HU-27 / RF-42 Pagar multa | `CompletePurchaseScreen` | `pagarMulta()` | `POST /clientes/me/multas/{id}/pagar` | `{ medioPagoId }` | `200`. Al pagar debería rehabilitar la participación. 🟡 |
| RF-43/RF-44 Plazo 72h / bloqueo total | `NotificationsScreen` (aviso) | — | — | — | 🟡 Se notifica; bloqueo definitivo por Swagger/admin. |

---

## F-09 · Submisión de objetos por el dueño
Cubre: RF-45..RF-53 · HU-28..HU-34.

| HU / RF | Pantalla | Función | Método + Endpoint | Payload | Resultado esperado |
|---|---|---|---|---|---|
| HU-28 / RF-45 Proponer bien | `CreateObjectStep1→3` | `createProducto()` | `POST /productos` (multipart) | `FormData`: fecha, descripciones, categoría/subcategoría, artista/fechaObra/reseña, `fotos[]` (≥6) | `201` `ProductoDto` (nace `disponible=false`, en revisión). |
| HU-29 / RF-46 Declaración jurada | `CreateObjectStep3` | (checkbox obligatorio) | — | — | Requisito de UI antes de enviar. |
| HU-31 Ver mis objetos y estado | `MyAuctionsScreen`, `ProfileScreen`, `ManageObjectScreen` | `getMisProductos()` / `getProductoById()` / `getItemCatalogoDetalle()` | `GET /productos/me` · `GET /productos/{id}` | — | Lista con estado (en revisión / aceptado / rechazado). |
| HU-31/HU-32 / RF-48..RF-51 Propuesta (precio base + comisiones) | `AuctionUnderReviewScreen` | `getPropuesta()` | `GET /productos/{id}/propuesta` | — | `PropuestaDto`: precio base, comisiones, fecha/lugar. |
| HU-32 / RF-51 Aceptar propuesta | `AuctionUnderReviewScreen` | `aceptarPropuesta()` | `POST /productos/{id}/propuesta/aceptar` | — | `200` `ProductoDto`. Objeto pasa a subastable. |
| HU-32 / RF-51 Rechazar propuesta | `AuctionUnderReviewScreen` | `rechazarPropuesta()` | `POST /productos/{id}/propuesta/rechazar` | — | `200`. Dispara devolución con cargo. |
| — Subastas del dueño | `ManageAuctionScreen`, `MyAuctionsScreen` | `getSubastasByDuenio()` / `getCatalogos()` | `GET /subastas/duenios/{userId}` | — | Subastas donde participa como dueño. |
| HU-30/HU-33/HU-34 / RF-47,52,53 | — | — | (existe `CuentaCobroController`, `coleccion/`) | — | ❌/🟡 Origen lícito, colección y cuenta de cobro: parcial o no cableado en UI. |

---

## F-10 · Logística y seguros
Cubre: RF-54..RF-57 · HU-35, HU-36.

| HU / RF | Estado | Notas |
|---|---|---|
| RF-54 Contratar seguro | 🟡 | Backend asigna seguro random si el bien supera el umbral (>10M ARS / >10k USD) al aceptar la oferta. Sin pantalla dedicada. |
| HU-35/HU-36 / RF-55..RF-57 | ❌ | Consulta de póliza/ubicación y contacto con aseguradora no implementados. |

---

## F-11 · Historial y métricas del usuario
Cubre: RF-58..RF-60 · HU-37..HU-39.

| HU / RF | Pantalla | Función | Método + Endpoint | Resultado esperado |
|---|---|---|---|---|
| HU-38 / RF-59 Métricas agregadas | `ProfileScreen`, `BidsScreen` | `getMetricasMe()` | `GET /clientes/me/metricas` | `MetricasDto`: participaciones, victorias, importes ofertados/pagados, categorías. |
| HU-37 / RF-58 Participaciones | `BidsScreen` | `getMisParticipaciones()` | `GET /clientes/me/participaciones` | `ParticipacionDto[]`: asistió/ganó, importes. |
| HU-37 Compras | `BidsScreen`, `CompletePurchaseScreen` | `getCompras()` | `GET /clientes/me/compras` | Historial de compras adjudicadas. |
| HU-39 / RF-60 Detalle de pujas de una subasta | `ItemDetailScreen` | `getHistorialPujas()` | `GET /subastas/{id}/items/{itemId}/pujas` | Pujas ordenadas de la subasta. |

---

## F-12 · Notificaciones
Transversal a HU-02, HU-26, HU-31, HU-41.

| HU | Pantalla | Función | Método + Endpoint | Resultado esperado |
|---|---|---|---|---|
| HU-41 Listar notificaciones | `NotificationsScreen` | `getNotificaciones()` | `GET /clientes/me/notificaciones` | `NotificacionDto[]` (aprobación de registro, estado de objeto/subasta, multas). |
| HU-41 Marcar leída | `NotificationsScreen` | `marcarNotificacionLeida()` | `PATCH /clientes/me/notificaciones/{id}/leida` | `200` `NotificacionDto` actualizado. |
| — Push en vivo | (disponible) | — | **SSE** `GET /clientes/me/notificaciones/stream` (`text/event-stream`) | Backend expone stream SSE; la UI actualmente refresca por listado. |

---

## F-13 · Integración con el sistema interno
Cubre: RF-61. ✅ El backend expone/actualiza subastas, dueños, postores, pujas y rematadores vía los controllers anteriores (`/subastas`, `/productos`, `/usuarios`, `/clientes`), respaldados por JPA/PostgreSQL (Supabase).

---

## Anexo · Endpoints no cableados desde la app (admin / soporte)

Existen en el backend pero se operan por Swagger/otro cliente, no desde el frontend móvil:

| Área | Endpoints |
|---|---|
| Admin | `AdminClienteController`, `AdminMedioPagoController` (verificar medios), `AdminPagoController`, `AdminProductoController` (aceptar/rechazar bien, generar propuesta) |
| Subastas (gestión) | `POST /subastas`, `PUT /subastas/{id}`, `POST /subastas/{id}/addItem`, `DELETE /subastas/{id}/removeItem/{itemId}`, `POST /subastas/{id}/desconectar` |
| Catálogos (gestión) | `POST /catalogos`, `POST /item-catalogo`, `GET /item-catalogo/{userId}` |
| Cuentas de cobro | `GET·POST·DELETE /clientes/me/cuentas-cobro` (RF-53) |
| Países | `GET /paises` (referencia para registro) |
| Usuarios | `GET /usuarios/{userId}`, `GET /usuarios/mail/{mail}` |
| Compras | `POST /clientes/me/newCompra`, `GET /clientes/me/subastas` (historial) |
| Productos | `PUT /productos/{id}`, `PATCH /productos/{id}/fotos`, `PATCH /productos/{id}/fotos/eliminar`, `GET /productos/{id}/fotos/{fotoId}` |
| Pujas | `GET /pujas/{productoId}` (pujas por producto) |
