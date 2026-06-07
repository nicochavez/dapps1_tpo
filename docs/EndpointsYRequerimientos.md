# Endpoints del Backend y Requerimientos que resuelven

Mapa de los endpoints REST (y el canal WebSocket) del backend contra los requerimientos funcionales (**RF**) e historias de usuario (**HU**) de [`RequerimientosYFeatures.md`](./RequerimientosYFeatures.md). Las features del [MVP](./mvp_requerimientos_y_features.md) están marcadas con ✅; lo que excede el MVP, con ➕.

Convenciones:
- Base URL: `/api/v1`. Documentación viva en `/swagger-ui.html`.
- Autenticación: header `Authorization: Bearer mock-jwt-token-for-<documento>` (token mock; el documento identifica al cliente).
- Tiempo real: STOMP sobre WebSocket en `/ws`, tópico `/topic/subastas/{id}`.

---

## F-01 · Autenticación y registro — `AuthController` (`/api/v1/auth`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| POST | `/register` | Alta de usuario con datos personales + DNI; queda en estado *pendiente* | RF-01, RF-02 · HU-01 ✅ |
| POST | `/login` | Autenticación con documento y clave | RF-05 · HU-03 ✅ |
| POST | `/set-contrasenia` | Generación/cambio de la clave personal tras la aprobación | RF-04 · HU-02 ✅ |
| POST | `/documentacion` | Envío de documentación a verificación externa (stub) | RF-01, RF-02 · HU-01 ✅ |

## Aprobación de clientes — `AdminClienteController` (`/api/v1/admin/clientes`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/pendientes` | Lista de clientes pendientes de verificación | RF-02 ✅ |
| POST | `/{clienteId}/aprobar` | Aprueba y asigna categoría; dispara el mail mock (RF-04) | RF-02, RF-03, RF-04 · HU-04 ✅ |
| POST | `/{clienteId}/rechazar` | Rechaza la solicitud de registro | RF-02 ✅ |

---

## F-03 · Perfil y categoría — `ClienteController` (`/api/v1/clientes/me`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/` | Perfil del cliente autenticado (incluye categoría) | RF-03 · HU-04 ✅ |
| PUT | `/` | Edición de datos de perfil | RF-03 · HU-05 ✅ |
| GET | `/metricas` | Métricas agregadas de participación | RF-59 · HU-38 ➕ |

## Soporte de cuenta — `UsuarioController` (`/api/v1/usuarios`) · `PaisController` (`/api/v1/paises`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/usuarios/{userId}` | Datos del cliente por id | RF-03 (soporte) ✅ |
| GET | `/usuarios/mail/{mail}` | Búsqueda de cliente por email | RF-04, RF-05 (soporte) ✅ |
| GET | `/paises` | Catálogo de países para el registro | RF-01 (soporte) ✅ |

---

## F-02 · Medios de pago — `MedioPagoController` (`/api/v1/clientes/me/medios-pago`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/` | Lista los medios de pago del cliente (incluye estado *verificado*) | RF-09, RF-10 · HU-07 ✅ |
| POST | `/` | Alta de medio de pago | RF-07, RF-08, RF-09 · HU-06 ✅ |
| GET | `/{id}` | Detalle de un medio de pago | RF-09 ✅ |
| PUT | `/{id}` | Modifica el medio (p. ej. monto reservado del cheque) | RF-09, RF-11 · HU-08, HU-09 ✅ |
| DELETE | `/{id}` | Baja de medio de pago | RF-09 · HU-08 ✅ |

### Atajos por tipo — `MedioPagoExtraController`

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/usuarios/{userId}/medios-pago` | Medios de pago de un usuario | RF-09 ✅ |
| POST | `/medios-pago/cuenta-bancaria` | Alta de cuenta bancaria | RF-08 · HU-06 ✅ |
| POST | `/medios-pago/tarjeta-credito` | Alta de tarjeta de crédito | RF-08 · HU-06 ✅ |
| POST | `/medios-pago/cheque` | Alta de cheque certificado | RF-08, RF-11 · HU-06, HU-09 ➕ |

---

## F-04 · Catálogos y bienes — `CatalogoController` (`/api/v1`) · `ProductoController` (`/api/v1/productos`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/catalogos` | Catálogos públicos; el precio base se oculta a no registrados | RF-12, RF-13 · HU-10, HU-11 ✅ |
| GET | `/catalogos/{catalogoId}/items/{itemId}` | Detalle del ítem (datos de arte: artista/fecha/reseña) | RF-14, RF-15, RF-13 · HU-11, HU-13 ✅ |
| GET | `/subastas/{subastaId}/catalogos/{catalogoId}/items` | Ítems de un catálogo de la subasta | RF-12 · HU-10 ✅ |
| POST | `/item-catalogo` | Alta de ítem de catálogo (valida ≥6 fotos) | RF-14, RF-50 ➕ |
| GET | `/item-catalogo/{userId}` | Ítems cuyo dueño es el usuario | RF-58 ➕ |
| GET | `/productos` | Listado de productos | RF-14 ✅ |
| GET | `/productos/{productoId}` | Detalle del producto | RF-14, RF-15 ✅ |
| PUT | `/productos/{productoId}` | Edición del producto | RF-45 ➕ |
| GET | `/productos/{productoId}/fotos/{fotoId}` | Imagen del producto | RF-14 ✅ |
| POST | `/productos/{duenioId}/addProducto` | El dueño propone un bien para subastar | RF-45 · HU-28 ➕ |

---

## F-05 · Sala de subasta en vivo — `SubastaController` (`/api/v1/subastas`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/` | Lista subastas filtradas por categoría del usuario, estado, moneda | RF-12, RF-19, RF-20 · HU-12 ✅ |
| POST | `/` | Crea una subasta (fecha, categoría, moneda, rematador, catálogo) | RF-17, RF-18, RF-19 ✅ |
| GET | `/{subastaId}` | Detalle de la subasta + catálogo | RF-17, RF-13 ✅ |
| PUT | `/{subastaId}` | Actualiza datos de la subasta | RF-17 ✅ |
| POST | `/{subastaId}/conectar?modo=postor\|espectador` | Conecta como postor (requiere medio verificado) o espectador | RF-21, RF-22, RF-23 · HU-14, HU-21, HU-22 ✅ |
| POST | `/{subastaId}/desconectar` | Desconecta de la subasta | RF-23 · HU-22 ✅ |
| GET | `/{subastaId}/item-actual` | Ítem en curso y mejor oferta vigente | RF-24 · HU-16 ✅ |
| GET | `/{subastaId}/catalogos` | Catálogos de la subasta | RF-12 ✅ |
| POST | `/{subastaId}/addItem` | Agrega un ítem a la subasta (valida ≥6 fotos) | RF-14 ➕ |
| DELETE | `/{subastaId}/removeItem/{itemId}` | Quita un ítem de la subasta | RF-17 (gestión) ➕ |
| GET | `/duenios/{userId}` | Subastas donde el usuario tiene bienes | RF-58 · HU-37 ➕ |
| GET | `/cliente/{userId}` | Subastas en las que participó el usuario | RF-58 · HU-37 ✅ |

## F-06 · Motor de pujas — `PujaController` (`/api/v1`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| POST | `/subastas/{subastaId}/items/{itemId}/pujas` | Realiza una puja (valida +1%/+20%, excepción oro/platino, confirmación) | RF-27, RF-28, RF-29, RF-30, RF-31, RF-32 · HU-18, HU-19, HU-20 ✅ |
| GET | `/subastas/{subastaId}/items/{itemId}/pujas` | Historial de pujas del ítem, en orden temporal | RF-33, RF-60 · HU-39 ✅ |
| GET | `/clientes/me/subastas/{subastaId}/pujas` | Mis pujas en una subasta | RF-33, RF-58 · HU-37 ✅ |
| GET | `/pujas/{productoId}` | Historial de pujas por producto | RF-33, RF-60 ➕ |

## F-07 · Cierre, adjudicación y compra — `CompraController` (`/api/v1/clientes/me`)

| Método | Ruta | Propósito | Requerimientos |
|---|---|---|---|
| GET | `/compras` | Compras adjudicadas al cliente | RF-36, RF-58 · HU-37 ✅ |
| POST | `/newCompra` | Listado paginado de compras (variante) | RF-36, RF-58 ✅ |
| GET | `/compras/{id}` | Detalle con desglose (importe + comisión + envío) | RF-37 · HU-23 ✅ |
| PUT | `/compras/{id}/retiro-personal` | Elige retiro personal en lugar de envío | RF-38 · HU-24 ✅ |
| GET | `/subastas` | Historial de adjudicaciones/participación | RF-58, RF-60 · HU-37 ✅ |

> El **cierre por tiempo** y la **adjudicación** (declarar ganador, crear la compra, compra de la empresa si nadie puja) los ejecuta `SubastaSchedulerService` + `AdjudicacionService` de forma automática — no son endpoints. Cubren **RF-35, RF-36, RF-39**.

---

## Más allá del MVP (módulos presentes)

| Módulo / Controller | Endpoints | Requerimientos |
|---|---|---|
| Direcciones de envío — `/api/v1/usuarios/{userId}/direcciones` | GET, POST, GET `/favorita`, PUT `/{id}`, DELETE `/{id}` | RF-37, RF-38 ➕ |
| Cuentas de cobro del dueño — `/api/v1/clientes/me/cuentas-cobro` | GET, POST, DELETE `/{id}` | RF-53 · HU-34 ➕ |
| Multas — `/api/v1/clientes/me/multas` | GET, POST `/{id}/pagar` | RF-41, RF-42, RF-43 · HU-26, HU-27 ➕ |
| Notificaciones — `/api/v1/usuarios/{userId}/notificaciones` | GET | F-12 · HU-02, HU-26, HU-31, HU-41 ➕ |

---

## Canal en tiempo real (RF-25)

| Canal | Destino | Eventos | Requerimientos |
|---|---|---|---|
| WebSocket/STOMP | conexión: `/ws` · suscripción: `/topic/subastas/{id}` | `nueva-puja`, `item-actual`, `item-cerrado`, `subasta-finalizada` | RF-25 · HU-17 ✅ |

---

## Scaffolding (sin requerimiento)

| Método | Ruta | Nota |
|---|---|---|
| GET | `/api/test/users` | Datos de ejemplo (`UserTestController`); no corresponde a ningún RF |
