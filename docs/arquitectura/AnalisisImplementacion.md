# BidFlow — Análisis de Implementación vs Requerimientos

Análisis del código real (backend Java/Spring Boot + frontend React Native) contra los requerimientos de `RequerimientosYFeatures.md`. Registra qué está hecho, qué está incompleto y qué falta por completo.

**Fecha:** 2026-06-01

---

## 0. Corrección al CLAUDE.md

El CLAUDE.md describe el backend como *"mock-driven: la mayoría de los servicios usan MockDataStore"*. Esto es **incorrecto**: `MockDataStore.java` no existe en el repositorio. Todos los módulos implementados usan JPA real contra PostgreSQL (Supabase). El CLAUDE.md debe actualizarse.

---

## 1. Estado por Feature

| Feature | % impl. | Estado |
|---|---|---|
| F-01 Autenticación | 85% | ✅ Casi completo |
| F-02 Medios de pago | 90% | ✅ Casi completo |
| F-03 Perfil y categorías | 50% | ⚠️ Parcial |
| F-04 Catálogos y subastas | 75% | ⚠️ Parcial |
| F-05 Sala en vivo | 60% | ⚠️ Parcial + bugs |
| F-06 Motor de pujas | 85% | ✅ Casi completo |
| F-07 Cierre y pago | 0% | ❌ Sin implementar |
| F-08 Multas | 40% | ❌ Crítico incompleto |
| F-09 Submisión dueño | 50% | ❌ Crítico incompleto |
| F-10 Logística y seguros | 20% | ❌ Casi nada |
| F-11 Historial y métricas | 60% | ⚠️ Parcial (depende de F-07) |
| F-12 Notificaciones | 0% | ❌ Sin implementar |
| F-13 Integración interna | 0% | ❌ Sin implementar |

---

## 2. Análisis por Feature

### F-01 — Autenticación y Onboarding (85%)

**Endpoints:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/set-contrasenia`
- `POST /api/v1/auth/documentacion` (stub vacío)

**Cubre:** RF-01 (datos + DNI), RF-02 (estado `pendiente_verificacion`), RF-04 (endpoint de generación de clave), RF-05 (login con documento + clave).

**Parcial:**
- RF-03: La categoría se asigna al aprobar (en `AdminClienteService.aprobar()`), pero nunca se mejora automáticamente.
- RF-04: El token de activación no se valida realmente; `set-contrasenia` guarda la contraseña sin verificar que el token sea válido.

**No implementado:**
- RF-06: No hay lógica de mejora de categoría según medios de pago o actividad histórica. La categoría la pone el admin y ahí queda.

**Bugs de seguridad:**
- Las contraseñas se guardan en **plain text** (sin bcrypt ni ningún hash).
- El token devuelto por login es `"mock-jwt-token-for-{documento}"` — una cadena estática, no un JWT firmado. Ningún endpoint protegido lo valida.

---

### F-02 — Gestión de Medios de Pago (90%)

**Endpoints:**
- `GET/POST /api/v1/clientes/me/medios-pago`
- `GET/PUT/DELETE /api/v1/clientes/me/medios-pago/{id}`

**Cubre:** RF-07..RF-11 casi completos. CRUD implementado, tipos validados (cuenta_bancaria / tarjeta_credito / cheque_certificado), campo `verificado`, campo `monto_reservado` para cheques.

**Parcial:**
- RF-11 / RF-34: El `monto_reservado` existe en la DB pero **no se valida en el motor de pujas**. Un usuario con cheque certificado de $1.000 puede pujar $10.000 sin que el sistema lo impida.

**No implementado:**
- No hay endpoint para que un admin marque un medio como verificado (solo se puede hacer directo en DB).

---

### F-03 — Perfil y Categorías (50%)

**Endpoints:**
- `GET /api/v1/clientes/me`
- `PUT /api/v1/clientes/me` (vacío, no hace nada)
- `GET /api/v1/clientes/me/metricas`

**Parcial:**
- RF-03: Categoría visible en el perfil. ✅
- RF-06: No hay mejora automática de categoría. La categoría la asigna el admin una sola vez.
- El `PUT /clientes/me` existe pero no persiste ningún cambio (cuerpo ignorado).

**No implementado:**
- Indicadores de progreso para subir de categoría.
- Edición de domicilio legal y datos de contacto.

---

### F-04 — Exploración de Catálogos y Subastas (75%)

**Endpoints:**
- `GET /api/v1/subastas` (con filtros: estado, categoría, fecha, moneda)
- `GET /api/v1/subastas/{id}`
- `GET /api/v1/subastas/{id}/catalogos`
- `GET /api/v1/catalogos`
- `GET /api/v1/catalogos/{catalogoId}/items/{itemId}`

**Cubre:** RF-12 (catálogos públicos), RF-14 (campos de ítem), RF-17 (atributos de subasta), RF-18 (moneda única), RF-19 (múltiples subastas simultáneas).

**Parcial:**
- RF-13: El precio base **no se oculta** a usuarios no registrados. Todo el mundo lo ve.
- RF-15: Los campos de arte/diseño (`artista`, `fecha_obra`, `resena_historica`) existen en `ProductoEntity` pero nunca se populan ni se exponen en los DTOs del catálogo.
- RF-20: `listar()` acepta el parámetro `categoria` pero **no filtra comparando con la categoría del usuario autenticado**. Cualquier usuario puede listar subastas "platino".

**No implementado:**
- RF-16: No hay endpoint para crear ítems compuestos ni consultar `componentes_producto`.

---

### F-05 — Sala de Subasta en Vivo (60%)

**Endpoints:**
- `POST /api/v1/subastas/{id}/conectar`
- `POST /api/v1/subastas/{id}/desconectar`
- `GET /api/v1/subastas/{id}/item-actual`

**Cubre:** RF-23 (un usuario conectado a una sola subasta a la vez — validado con unique index), RF-24 (ver ítem actual y mejor oferta).

**Bug — RF-21 INCUMPLIDO:**
`conectar()` exige que el usuario tenga al menos un medio de pago verificado. RF-21 dice explícitamente que usuarios **sin** medio de pago verificado deben poder entrar como espectadores. El código los rechaza.

**Parcial:**
- RF-20: `conectar()` valida que el usuario esté `admitido`, pero **no valida** que `categoría_usuario ≥ categoría_subasta`.
- RF-22: Un usuario sin medio verificado debería poder entrar como espectador (rol `espectador`), pero el código no distingue roles en la conexión.

**No implementado:**
- RF-25: No hay WebSocket, SSE ni ningún mecanismo push. La API es estrictamente pull (el frontend tiene que hacer polling manual).
- RF-26: No hay enlace al servicio de streaming de video.

---

### F-06 — Motor de Pujas (85%)

**Endpoints:**
- `POST /api/v1/subastas/{id}/items/{itemId}/pujas`
- `GET /api/v1/subastas/{id}/items/{itemId}/pujas`
- `GET /api/v1/clientes/me/subastas/{id}/pujas`

**Cubre bien:**
- RF-27: Puja debe ser > mejor oferta. ✅
- RF-28/RF-29: Límites +1% / +20% sobre precio base validados. ✅
- RF-30: Límites no aplican para subastas `oro`/`platino`. ✅
- RF-31: Validación antes de guardar. ✅
- RF-33: Historial de pujas con orden temporal. ✅

**No implementado:**
- RF-32: No hay bloqueo de nueva puja hasta que la anterior fue confirmada y propagada. Posible race condition si el usuario envía dos pujas rápidas.
- RF-34: No se valida que la suma de compras adjudicadas del usuario no supere el `monto_reservado` de su cheque certificado.

---

### F-07 — Cierre, Facturación y Pago (0%) ⚠️ CRÍTICO

**Endpoints:** ninguno.

Nada de esto está implementado:
- RF-35: No hay lógica de cierre de ítem. Las pujas se guardan, pero nunca se declara un ganador. El campo `ganador` en `PujaEntity` nunca se pone en `true`.
- RF-36: `RegistroDeSubastaEntity` y `CompraEntity` existen en JPA pero nunca se crean. La venta no se registra.
- RF-37: No se envía mensaje privado al ganador con desglose de importe + comisiones + envío.
- RF-38: La pantalla `CompletePurchaseScreen` existe en el frontend pero no llama a ningún endpoint real.
- RF-39: No se asigna el ítem a la empresa si nadie pujó.
- RF-40: No se valida que subastas en USD se cancelen en USD.

**Impacto:** el flujo principal de la app (subastar → ganar → comprar) no funciona end-to-end.

---

### F-08 — Multas e Incumplimiento (40%)

**Endpoints:**
- `GET /api/v1/clientes/me/multas`
- `POST /api/v1/clientes/me/multas/{id}/pagar`

La tabla `multas` existe en JPA y los endpoints para listar/pagar están, pero todo lo que debería crearlas y ejecutarlas está ausente:

- RF-41: No hay trigger que cree una multa automáticamente cuando el ganador no puede pagar.
- RF-42: `conectar()` y `pujar()` no validan si el usuario tiene multas pendientes. Un usuario en deuda puede seguir participando.
- RF-43: El campo `fecha_limite` existe en la entidad pero nunca se setea, y no hay job/scheduler que lo controle.
- RF-44: No hay lógica de bloqueo total del usuario ante incumplimiento definitivo.

---

### F-09 — Submisión de Objetos por el Dueño (50%)

**Endpoints:**
- `POST /api/v1/productos/{duenioId}/addProducto`
- `GET /api/v1/productos`, `GET /api/v1/productos/{id}`, `PUT /api/v1/productos/{id}`
- `GET /api/v1/productos/{id}/fotos/{fotoId}`

Se puede crear un producto y consultarlo, pero el flujo de revisión no existe:

- RF-45: No hay endpoint para subir fotos del bien (solo se puede consultar fotos existentes).
- RF-46: El campo `declaracion_propiedad` existe en la entidad pero no se valida como obligatorio en el endpoint de creación.
- RF-47: Campo `doc_origen_licito` en la entidad, pero sin endpoint para adjuntar el archivo.
- RF-48..RF-51: No hay endpoint de admin para revisar, aceptar o rechazar un bien. El dueño carga el producto y se queda en `estado_revision = 'en_revision'` para siempre.
- RF-52: No hay endpoint para crear colecciones ni agrupar productos.
- RF-53: El endpoint de cuentas de cobro existe (`GET/POST /api/v1/clientes/me/cuentas-cobro`). ✅

---

### F-10 — Logística y Seguros (20%)

La tabla `seguros` y los campos `ubicacion_deposito` / `seguro` en `ProductoEntity` existen en JPA pero no hay ningún servicio ni endpoint que los use:

- RF-53: Cuentas de cobro implementadas. ✅
- RF-54..RF-57: Sin implementar. No hay contratación de seguro, no hay consulta de ubicación, no hay datos de contacto de aseguradora.

---

### F-11 — Historial y Métricas (60%)

**Endpoints:**
- `GET /api/v1/clientes/me/metricas`
- `GET /api/v1/clientes/me/subastas`
- `GET /api/v1/clientes/me/compras`
- `GET /api/v1/clientes/me/subastas/{id}/pujas`

Las consultas existen, pero los datos son casi todos cero porque dependen de F-07 (cierre):
- `victorias` siempre 0: `RegistroDeSubasta` nunca se crea.
- `compras` siempre vacío: `Compra` nunca se crea.
- `importes_pagados` siempre 0.

Lo único real: historial de conexiones a subastas y el listado de pujas emitidas.

---

### F-12 — Notificaciones (0%)

Existe `GET /api/v1/usuarios/{userId}/notificaciones` pero la tabla siempre está vacía: no hay ningún punto del código que cree una notificación. Sin servicio de email, sin push notifications, sin nada.

---

## 3. Estado del Frontend

La mayoría de las pantallas son UI funcional con datos hardcodeados en archivos JSON locales (`/frontend/data/`). Solo un subconjunto llama a APIs reales:

| Pantalla | Llama API real | Observación |
|---|---|---|
| LoginScreen | ✅ `POST /auth/login` | Funcional |
| RegisterStep3 | ✅ `POST /auth/register` | Funcional |
| HomeScreen | ✅ `GET /subastas` | Funcional |
| ViewAuctionScreen | ✅ `GET /subastas/{id}`, conectar | Funcional |
| ItemDetailScreen | ✅ `GET` ítem + historial pujas | Funcional |
| RegisterStep2 | ❌ Fotos DNI simuladas | Sin uploader real |
| BidsScreen | ❌ `bids.json` local | Mock |
| CompletePurchaseScreen | ❌ `items.json` local | Mock |
| AddPaymentMethodScreen | ❌ Solo UI | Sin POST real |
| ProfileScreen | ❌ Stats de `bids.json` | Mock |
| NotificationsScreen | ❌ `notifications.json` local | Mock |
| Todas las pantallas de dueño | ❌ Sin API calls | Mock / placeholder |

**Gaps adicionales del frontend:**
- No hay polling de `item-actual` desde `ViewAuctionScreen` — el ítem en curso no se actualiza.
- Los límites de puja (+1%/+20%) de RF-27..RF-29 no se validan en la UI antes de enviar (solo en backend).
- No hay feedback de multas pendientes ni bloqueos en el flujo de UX.

---

## 4. Inconsistencias RF vs Código

| RF | Lo que dice el requerimiento | Lo que hace el código |
|---|---|---|
| RF-06 | Categoría mejora automáticamente según actividad | Categoría la asigna admin, nunca cambia sola |
| RF-13 | Precio base oculto a no registrados | Precio visible para todos |
| RF-20 | Solo puede acceder si `categoría_usuario ≥ categoría_subasta` | No se valida en listar ni en conectar |
| RF-21 | Espectador puede entrar sin medio de pago verificado | `conectar()` rechaza si no hay medio verificado |
| RF-25 | Actualizaciones en tiempo real | API pull-only, sin push ni WebSocket |
| RF-32 | Bloquear nueva puja hasta confirmar la anterior | Sin bloqueo, posible doble puja |
| RF-34 | Suma de compras no supera monto reservado del cheque | No se valida en ningún punto |
| RF-35 | Declarar ganador cuando nadie supera la puja | Nunca ocurre, ganador nunca se marca |
| RF-41 | Multa automática si ganador no paga | Tabla existe, nunca se crea una multa |
| RF-42 | Bloqueo de participación con multa pendiente | No se valida en ningún endpoint |

---

## 5. Prioridades de Implementación

### Crítico (bloquea el flujo principal)

1. **F-07 Cierre de ítem y adjudicación** — Sin esto, las subastas no funcionan end-to-end.
2. **Seguridad: hash de contraseñas** — Plain text es inaceptable incluso en desarrollo.
3. **RF-21: Permitir espectadores sin medio de pago** — Bug de lógica en `conectar()`.

### Alto (funcionalidad core incompleta)

4. **RF-25: Actualizaciones en tiempo real** — Al menos polling desde el frontend; idealmente WebSocket.
5. **RF-20: Validar categoría de usuario en conexión** — Cualquiera puede conectarse a cualquier subasta.
6. **RF-32: Bloqueo de pujas concurrentes** — Race condition real.
7. **F-08: Lógica de multas** — Crear multa automáticamente, bloquear usuario con deuda.

### Medio (features secundarias)

8. **RF-06: Mejora automática de categoría.**
9. **F-09: Flujo de revisión de bienes** — El rol dueño está incompleto.
10. **RF-13: Ocultar precio base a no registrados.**
11. **Integrar frontend con APIs reales** — Reemplazar los JSON hardcodeados.

### Bajo (para fases posteriores)

12. **F-10: Seguros y logística.**
13. **F-12: Notificaciones y emails.**
14. **F-13: Integración con sistema interno.**
