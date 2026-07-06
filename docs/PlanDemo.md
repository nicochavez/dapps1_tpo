# BidFlow — Plan de prueba y guion de Demo

Estrategia para recorrer los **flujos principales** de la app validando las **reglas de negocio** clave.
Basado en el estado real del código (backend Spring + WebSocket + scheduler) y en la seed
[`datos_de_prueba_BBDD.txt`](./datos_de_prueba_BBDD.txt). Los requerimientos están trazados contra
[`RequerimientosYFeatures.md`](./RequerimientosYFeatures.md).

> **Regla de oro de la demo:** mostrar solo lo ✅ y lo 🟡 (con su parche). Evitar los ❌ (ver §7).

---

## 0. Cómo se comporta la app (lo que hay que saber antes de presentar)

Confirmado leyendo el backend — condiciona el pacing de la demo:

| Mecanismo | Comportamiento real | Impacto en la demo |
|---|---|---|
| **Scheduler** (`SubastaSchedulerService`, cada 5 s) | Pasa las subastas `programada`→`abierta (LIVE)` cuando llega su fecha/hora. | La seed pone #1 y #3 con hora = **próximo minuto**. Correr la seed y esperar ≤1 min: se ponen LIVE solas. |
| **Ventana de cierre** (`AdjudicacionService`, `VENTANA_PUJA_SEGUNDOS = 60`) | El ítem en curso se cierra tras **60 s SIN nuevas pujas**. Cada puja reinicia el contador a 60 s. | Controla el pacing: para "mantener vivo" el lote hay que pujar dentro de los 60 s. Para mostrar el cierre en vivo, dejar correr 60 s. |
| **Adjudicación** | Al cerrar: mayor postor = ganador → notificación + `compra` pendiente; sin pujas → compra la empresa (nuevo dueño = admin id 1). Cuando no quedan lotes → subasta `finalizada`. | Es el "momento cierre" en vivo (§5, Acto 5). |
| **Una subasta a la vez** (RF-23) | **SÍ está enforced** en `conectar()`: tira `"Ya esta conectado a otra subasta"`. *(El doc lo marca ❌, pero el código lo cumple.)* | Usar el usuario recomendado por subasta, o `desconectar` antes de cambiar de sala. |
| **Precio base** (RF-13) | Se muestra solo si hay usuario autenticado; anónimo lo recibe `null`. | Se puede mostrar el contraste logueado vs. no logueado. |
| **Puja** (`PujaService`) | Valida: subasta abierta, no espectador, **medio verificado en la moneda de la subasta**, rango +1%/+20% (salvo oro/platino), idempotencia. Propaga por WebSocket. | Base de los Actos 3–4. |

---

## 1. Checklist pre-demo (10 min antes)

1. **Correr la seed** en Supabase (SQL editor) — resetea todo y programa #1/#3 al próximo minuto.
2. **Levantar backend:** `cd backend && mvnw.cmd spring-boot:run` (queda en `:8080`).
   - Verificar en los logs `[SCHEDULER] Subasta 1 activada (LIVE)` y `Subasta 3 activada (LIVE)` (~1 min tras la seed).
3. **Levantar frontend:** `cd frontend && npm start` → escanear QR con Expo Go. Confirmar IP en `frontend/.env`.
4. **Dos dispositivos/emuladores** para la puja en vivo (device A y device B). Es el plato fuerte.
5. **Swagger abierto** (`localhost:8080/swagger-ui.html`) logueado como **admin (30000001)** para los parches 🟡 (multa, bloqueo, verificaciones).
6. **Password de TODOS los usuarios:** `comun123`. Login por **documento**.

> Si el minuto ya pasó y #1/#3 no arrancan, correr la seed de nuevo (reprograma al próximo minuto) o cambiar la hora vía Swagger `PUT /subastas/{id}`.

---

## 2. Usuarios y para qué sirve cada uno

| Documento | Rol / Cat. | Qué demuestra | Medios |
|---|---|---|---|
| `40000010` | comun | Puja en subasta #3 (comun/ARS); tiene notificación de multa | Visa ARS ✔ |
| `40000011` | especial | Rival de comun en #3; ve subastas ≤ especial | Cta. Nación ARS ✔ |
| `40000012` | **plata** | **Postor principal subasta #1** (Rolex, ARS) | Visa ARS ✔ |
| `40000013` | **oro (ganador)** | Rival en #1; **compras ganadas** (Óleo sin pagar + Grabado pagado); métricas | Cta USD, MC USD, Amex ARS ✔ |
| `40000014` | platino | **Ganó Litografía sin pagar + MULTA por mora** (CompletePurchase con multa sumada) | Cheque USD, Visa ARS ✔ |
| `50000020` | dueño (comun) | **Flujo vendedor**: ítems en todos los estados (revisión/propuesta/aceptado/rechazado); notificaciones de aceptación/rechazo | — |
| `30000001` | admin (Swagger) | Parches 🟡: aplicar multa, bloquear usuario, aprobar/verificar | — |

---

## 3. Reglas de negocio a validar (checklist con cómo dispararlas)

Cada fila = una regla observable. Marcar en vivo.

### Autenticación y categorías
- [ ] **RF-05 / HU-03** Login por documento + clave (`40000012` / `comun123`).
- [ ] **RF-03 / HU-04** Cada usuario ve su categoría en Perfil.
- [ ] **RF-20 / HU-12** Listado de subastas filtrado por categoría: loguear como **comun (40000010)** → *no* ve la subasta #4 (especial) ni #2 (oro); loguear como **platino (40000014)** → ve todas. (`CategoriaUtil.puedeAcceder`).
- [ ] **RF-13 / HU-11** Precio base visible logueado vs. oculto sin loguear.

### Medios de pago
- [ ] **RF-07 / RF-22** Sin medio verificado en la moneda → no puede pujar (bloqueo al pujar).
- [ ] **RF-08** Los 3 tipos existen: tarjeta (plata), cuenta bancaria (oro USD), cheque (platino). Mostrarlos en "Payment Methods".
- [ ] **RF-10 / HU-07** Cada medio marca *verificado / no verificado*.
- [ ] **🟡 RF-09 / HU-08** Alta y baja funcionan; **editar es el parche** — mencionar que el "modificar" del enunciado se resuelve como baja + alta.

### Sala en vivo y pujas (núcleo — §5)
- [ ] **RF-21 / HU-21** Entrar como **espectador** sin medio verificado (no puede pujar).
- [ ] **RF-24 / HU-16** Al entrar: ítem en curso + mejor oferta vigente.
- [ ] **RF-25 / HU-17** Puja de un device aparece en el otro **en tiempo real** (WebSocket).
- [ ] **RF-27/28/29 / HU-18** Validación de rango: rechaza < +1% y > +20% (números en §5).
- [ ] **RF-32 / HU-19** Bloqueo de nueva puja hasta confirmar la anterior (idempotencia).
- [ ] **RF-30 / HU-20** Oro/platino sin límites +1%/+20% — *ver nota en §7 (no hay subasta oro LIVE en la seed)*.

### Cierre, adjudicación y pago
- [ ] **RF-35/36 / HU-23** Cierre por inactividad (60 s) → ganador + notificación + compra pendiente.
- [ ] **RF-39** Ítem sin pujas → lo compra la empresa a precio base (ver Escultura en subasta #2 ENDED, o dejar expirar un lote sin pujar).
- [ ] **RF-37 / HU-23** Ganador (oro, 40000013) ve desglose importe + comisión + envío en CompletePurchase.
- [ ] **🟡 RF-38 / HU-24** Elegir envío vs. retiro personal (retiro anula seguro) — mostrar el toggle.
- [ ] **RF-40 / HU-25** Compra en USD (oro / platino, subasta #2) se paga en USD.

### Multas e incumplimiento
- [ ] **🟡 RF-41** Multa 10% del valor ofertado — **platino (40000014)** ya la tiene sobre la Litografía; se ve **sumada** en CompletePurchase.
- [ ] **🟡 RF-42** Pagar la multa (app: `POST /multas/{id}/pagar`) y verificar que se limpia. *(Auto-rehabilitar tras pagar está por validar — es lo 🟡.)*
- [ ] **🟡 RF-43/44** Plazo 72 hs y bloqueo total → **por Swagger admin** (`POST /admin/usuarios/{id}/bloquear`) + texto de la notificación.

### Flujo vendedor (dueño 50000020)
- [ ] **RF-45/46 / HU-28/29** Proponer bien: fotos (≥6) + declaración jurada (checkbox obligatorio).
- [ ] **RF-48/49 / HU-31** Estados: en revisión / aceptado / **rechazado con motivo** (Cámara Antigua muestra la causa).
- [ ] **RF-50/51 / HU-32** Ver precio base + comisiones propuestas y aceptar/rechazar (Cómic = `aceptado_por_usuario`, Moneda = `propuesta_enviada`).
- [ ] **🟡 RF-54** Seguro automático si vale > 10M ARS / > 10k USD (asignado al aceptar).

### Historial, métricas, notificaciones, integración
- [ ] **RF-58/59 / HU-37/38** "My Bids" + métricas (oro tiene participaciones y victorias).
- [ ] **RF-60 / HU-39** Historial de pujas ordenado de una subasta.
- [ ] **🟡 HU-41** Notificaciones: ganó, multa, ítem aceptado/rechazado (seed las precarga; hay stream SSE).
- [ ] **RF-61** Datos vienen del sistema interno (la BD seed = sistema de la empresa).

---

## 4. Guion de la demo (orden narrativo sugerido, ~20–25 min)

Secuencia pensada para que las reglas salgan naturalmente y el cierre en vivo caiga cuando la sala está atenta.

### Acto 1 — Onboarding y catálogos (2–3 min) · *F-01, F-04*
1. Splash → mostrar catálogos **sin loguear**: precio base oculto (**RF-13**).
2. Login como **plata (40000012)**. Perfil → categoría (**RF-03/04**).
3. Explorar catálogos: precio base ahora visible; ítem de arte con autor/fecha/reseña (**RF-14/15**, ej. Óleo).
4. Mostrar el **filtro por categoría**: loguear rápido como **comun (40000010)** para evidenciar que no ve #2/#4 (**RF-20**). Volver a plata.

### Acto 2 — Medios de pago (2 min) · *F-02*
- "Payment Methods": los 3 tipos, estado verificado/no verificado (**RF-08/10**).
- Mencionar el parche 🟡 de edición (**RF-09**) y que sin medio en la moneda no se puede pujar (**RF-22**, se probará al pujar).

### Acto 3 — Entrar a la sala en vivo (2 min) · *F-05*
- Con **plata (40000012)** entrar a **subasta #1 (Rolex, plata/ARS)**: ítem en curso + mejor oferta = **$16.500.000** del postor #3 (**RF-24**).
- Opcional: en otro device entrar como **espectador** (usuario sin medio verificado) para mostrar **RF-21** (ve pero el botón de pujar está deshabilitado).

### Acto 4 — Puja en vivo + validaciones (5–7 min) — **PLATO FUERTE** · *F-06* → ver §5 detallado
- Duelo entre 2 devices, tiempo real, y las validaciones de rango/bloqueo.

### Acto 5 — Cierre y adjudicación en vivo (2 min) · *F-07*
- Dejar pasar **60 s sin pujar** → el lote se cierra solo: el device ganador recibe **"You won the bid!"** (**RF-35**), el lote se marca vendido y pasa al **Omega** (siguiente lote).
- Alternativa RF-39: dejar expirar un lote sin ninguna puja para mostrar "lo compra la empresa" (o mostrarlo ya consumado en la subasta #2 ENDED: Escultura → empresa).

### Acto 6 — Ganador, pago y multa (3–4 min) · *F-07, F-08*
1. Login como **oro (40000013)** → "My Bids"/compras: ganó **Óleo Abstracto** (sin pagar) y **Grabado** (pagado). CompletePurchase: desglose importe + comisión + envío (**RF-37**), toggle envío/retiro (**RF-38 🟡**), pago en **USD** (**RF-40**).
2. Login como **platino (40000014)** → ganó **Litografía sin pagar + MULTA por mora**: CompletePurchase muestra el importe **con la multa del 10% sumada** (**RF-41 🟡**). Notificación de mora con el texto de 72 hs.
3. Pagar la multa desde la app y mostrar que se limpia (**RF-42 🟡**). Para el bloqueo total (**RF-44**): mostrar por Swagger `POST /admin/usuarios/{id}/bloquear`.

### Acto 7 — Flujo vendedor + métricas (3 min) · *F-09, F-11*
- Login como **dueño (50000020)** → "My Items": ítems en cada estado (revisión / propuesta enviada / aceptado por usuario / **rechazado con motivo**). Aceptar/rechazar la propuesta de precio+comisión (**RF-50/51**). Notificaciones de aceptado/rechazado (**HU-31**).
- Cerrar mostrando **métricas** (oro tiene victorias/importes) e **historial de pujas** de una subasta (**RF-58/59/60**).

---

## 5. Detalle del plato fuerte: puja en vivo (Acto 4)

**Setup:** subasta #1 (Rolex, categoría **plata** → límites +1%/+20% SÍ aplican).
Ambos usuarios ya vienen conectados por la seed (respeta RF-23):

- **Device A → plata (40000012)**, postor #1
- **Device B → oro (40000013)**, postor #2 *(oro ≥ plata, y tiene medio ARS verificado)*

**Números del Rolex** (precio base **$15.000.000**, mejor oferta actual **$16.500.000**):
- Paso mínimo = +1% de la base = **+$150.000** → próxima puja válida ≥ **$16.650.000**
- Paso máximo = +20% de la base = **+$3.000.000** → próxima puja válida ≤ **$19.500.000**

**Coreografía:**
1. **Tiempo real (RF-25):** Device A puja **$16.700.000** → aparece al instante en Device B con el nº de postor.
2. **Rechazo por mínimo (RF-28):** Device B intenta **$16.600.000** (< $16.650.000 tras la nueva mejor oferta) → error "Importe debe estar entre…". *Recalcular: tras la puja de A la mejor oferta es 16.700.000, entonces mín = 16.850.000 / máx = 19.700.000.*
3. **Rechazo por máximo (RF-29):** Device B intenta **$25.000.000** → mismo error de rango.
4. **Puja válida:** Device B puja **$17.000.000** → se propaga a Device A. Se ve el ida y vuelta.
5. **Bloqueo hasta confirmar (RF-32):** tocar "pujar" dos veces rápido → la segunda no duplica (idempotencia); el botón se rehabilita al confirmar.
6. **Cierre (Acto 5):** dejar 60 s sin pujar → gana el último postor, notificación "You won the bid!".

> **Alternativa low-value** (números más cómodos de tipear): subasta #3 (Figura, comun/ARS), base **$150.000**, mejor oferta **$168.000** → válida entre **$169.500** y **$198.000**. Devices: comun (40000010) vs. especial (40000011).

---

## 6. Trazabilidad rápida (regla → dónde se ve)

| Feature | Se valida en | Reglas |
|---|---|---|
| F-01 Auth/onboarding | Acto 1 | RF-01✅, RF-03/04/05, RF-13 |
| F-02 Medios de pago | Acto 2 | RF-07/08/10, RF-09🟡 |
| F-04 Catálogos | Acto 1 | RF-12..20, HU-10..13 |
| F-05 Sala en vivo | Actos 3–4 | RF-21/24/25/26 |
| F-06 Pujas | Acto 4 (§5) | RF-27/28/29/30/32/33 |
| F-07 Cierre y pago | Actos 5–6 | RF-35/36/37, RF-38🟡, RF-39, RF-40 |
| F-08 Multas | Acto 6 | RF-41🟡/42🟡/43🟡/44🟡 |
| F-09 Vendedor | Acto 7 | RF-45..51, RF-54🟡 |
| F-11 Historial/métricas | Acto 7 | RF-58/59/60 |
| F-12 Notificaciones | transversal | HU-41🟡 |

---

## 7. Qué EVITAR y aclaraciones (❌ y 🟡)

**No mostrar (❌ no implementado):**
- RF-06 / HU-05 — mejora automática de categoría por actividad/medios.
- RF-11 / HU-09 — tope de compras por cheque certificado.
- RF-23 / HU-22 — *(en realidad el código sí impide 2 subastas a la vez; no es necesario "mostrar que no está", simplemente respetar 1 sala por usuario).*
- RF-34 — límite de compras por fondos reservados.
- RF-52/53 / HU-33/34 — colección con nombre del dueño / declarar cuenta de cobro previa.
- RF-55/56/57 / HU-35/36 — pólizas multi-pieza, ubicación en depósito, contacto aseguradora.
- HU-30 — adjuntar documentación de origen lícito.

**Parches / excepciones (🟡 — se muestran pero con aclaración verbal):**
- **RF-02** verificación externa → simulada; el usuario queda *pendiente* y se aprueba por admin/Swagger.
- **RF-09** "modificar" medio de pago → resuelto como baja + alta.
- **RF-38** retiro personal anula el seguro → es una regla declarada en la UI.
- **RF-41/42/43/44** multas/bloqueo → la multa de platino ya está sembrada; **aplicar multa nueva y bloqueo total se hacen por Swagger admin**, no desde la app.
- **RF-54** seguro → se asigna automático (aleatorio) al aceptar la propuesta si supera el umbral (>10M ARS / >10k USD).
- **RF-39** ítem sin pujas → se adjudica al **admin (persona id 1)** como "empresa".

**Discrepancias detectadas en la seed (a tener en cuenta):**
- **Multa de comun (40000010):** la seed le carga una *notificación* de multa $5000 pero **no** una fila real en `multas`. No usar comun para demostrar "bloqueo por multa" — para eso usar **platino (40000014)**, que sí tiene la multa real ligada a su compra. *(comun sí puede pujar en #3, como recomienda la seed.)*
- **RF-30 (oro/platino sin límites):** en la seed **no hay ninguna subasta oro/platino en estado LIVE** (#2 está finalizada). Se puede: (a) explicarlo y mostrar el historial de #2, o (b) crear/activar una subasta oro por Swagger si se quiere demostrar en vivo. No forzar el rango en #1/#3 (son plata/comun, los límites SÍ aplican).
</content>
</invoke>
