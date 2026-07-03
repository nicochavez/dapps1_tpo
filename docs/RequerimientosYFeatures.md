# Sistema de Subastas — Requerimientos Funcionales, Historias de Usuario y Features

Documento derivado del enunciado en [`TPO.md`](./TPO.md). Recoge el alcance de la aplicación móvil para subastas dinámicas ascendentes y su integración con el sistema interno existente.

---

## 1. Requerimientos Funcionales

### 1.1 Registración y autenticación de usuarios
✅ - **RF-01** El sistema debe permitir a un usuario iniciar el registro ingresando: nombre, apellido, foto del DNI (frente y dorso), domicilio legal y país de origen.
🟡 - **RF-02** El sistema debe enviar los datos cargados a la empresa para verificación externa y mantener al usuario en estado *pendiente* hasta resolución.
✅ - **RF-03** Una vez aprobado, el sistema debe asignar al usuario una categoría: `comun`, `especial`, `plata`, `oro` o `platino`.
❌ - **RF-04** El sistema debe enviar un mail al usuario aprobado invitándolo a completar el registro y generar su clave personal.
✅ - **RF-05** El sistema debe permitir al usuario autenticarse con documento y clave personal.
❌ - **RF-06** El sistema debe permitir actualizar y mejorar la categoría del usuario en base a la diversidad de medios de pago registrados y su actividad histórica en subastas.

### 1.2 Gestión de medios de pago
✅ - **RF-07** El usuario aprobado debe registrar al menos un medio de pago para poder pujar.
✅ - **RF-08** El sistema debe aceptar como medios de pago: cuentas bancarias (nacionales o extranjeras) con fondos reservados, tarjetas de crédito (nacionales o extranjeras) y cheques certificados por un monto determinado.
🟡 - **RF-09** El sistema debe permitir al usuario registrar, listar, **modificar** y eliminar tantos medios de pago como desee.
❌ - **RF-10** El sistema debe marcar cada medio de pago como *verificado* o *no verificado* por la empresa.
❌ - **RF-11** Cuando el medio de pago sea un cheque certificado, el sistema debe registrar el monto entregado y restringir las compras del usuario a ese tope mientras el cheque siga vigente.

### 1.3 Catálogos y subastas
✅ - **RF-12** El sistema debe exponer los catálogos públicos con el listado de objetos a subastar.
🟡 - **RF-13** El sistema debe ocultar el precio base de los ítems del catálogo a los usuarios no registrados; **los usuarios registrados de cualquier categoría pueden verlo**.
✅ - **RF-14** De cada ítem del catálogo el sistema debe almacenar: número de pieza, descripción, precio base, dueño actual y al menos 6 imágenes.
🟡 - **RF-15** Para ítems de arte/diseño el sistema debe almacenar adicionalmente: nombre del artista o diseñador, fecha y reseña histórica. **El front lo pide, no se si lo guarda en productos**
✅ - **RF-16** El sistema debe permitir que un ítem esté compuesto por varios elementos (por ejemplo, juego de té de 18 piezas).
🟡 - **RF-17** Cada subasta debe tener asignados: fecha y hora de inicio, ubicación, categoría requerida, **rematador**, moneda (ARS o USD) y catálogo.
❌ - **RF-18** Una subasta es monomonetaria: no puede aceptar pagos en monedas distintas a la definida al crearla. **Creo que acepta cualquier medio de pago actualmente**
✅ - **RF-19** El sistema debe permitir que la empresa tenga varias subastas activas simultáneamente.

### 1.4 Participación en subastas
✅ - **RF-20** El sistema debe listar al usuario las subastas abiertas a las que puede acceder en función de su categoría (categoría de la subasta ≤ categoría del usuario).
✅ - **RF-21** El sistema debe permitir el ingreso a una subasta como *espectador* a cualquier usuario aprobado, aunque no tenga medio de pago verificado.
🟡 - **RF-22** El sistema debe permitir *pujar* solo a usuarios con al menos un medio de pago verificado y en la moneda de la subasta. **En este caso no permite ver precios, lo de la moneda no se verifica**
❌ - **RF-23** El sistema debe impedir que un usuario esté conectado simultáneamente a más de una subasta. **Entiendo que se puede actualmente**
✅ - **RF-24** Al ingresar a una subasta el sistema debe mostrar el ítem en curso y la mayor oferta vigente.
✅ - **RF-25** El sistema debe entregar a los usuarios conectados las actualizaciones de las ofertas en tiempo real.
✅ - **RF-26** El sistema debe brindar acceso al servicio de streaming externo a cualquier usuario registrado y aprobado (no forma parte del desarrollo, pero debe enlazarse).

### 1.5 Reglas de puja
✅ - **RF-27** Cada puja debe ser estrictamente mayor que la mejor oferta vigente.
✅ - **RF-28** El monto de la puja debe ser al menos `mejor_oferta + 1% × precio_base` del ítem.
✅ - **RF-29** El monto de la puja no puede ser mayor que `mejor_oferta + 20% × precio_base` del ítem.
❌ - **RF-30** Los límites mínimo y máximo de puja **no aplican** a subastas de categorías `oro` y `platino`.
✅ - **RF-31** El sistema debe validar el monto de la puja antes de enviarla.
✅ - **RF-32** El sistema debe bloquear nuevas pujas del mismo usuario hasta haber recibido la confirmación de que la transacción anterior fue registrada y propagada al resto de los conectados.
✅ - **RF-33** El sistema debe registrar todas las pujas realizadas por cada usuario, manteniendo el orden temporal.
❌ - **RF-34** Si un usuario tiene fondos reservados (por ejemplo cheque certificado), la suma de sus compras adjudicadas no puede superar el monto reservado, pero puede participar en tantas subastas como quiera mientras le alcance.

### 1.6 Cierre y adjudicación
🟡 - **RF-35** Cuando ya nadie iguale o supere la última puja, el sistema debe declarar ganador al autor de esa puja y **registrarlo como nuevo dueño de la pieza**.
🟡 - **RF-36** El sistema debe marcar la pieza como vendida, registrar la venta con el medio de pago elegido y actualizar dueño, importes y comisiones. **Revisar si se actualizan**
✅ - **RF-37** El sistema debe enviar al ganador un mensaje privado con el desglose: importe pujado, comisiones y costo de envío a la dirección declarada.
🟡 - **RF-38** El sistema debe permitir al ganador elegir entre envío a domicilio o retiro personal; **el retiro personal anula la cobertura del seguro**.
❌ - **RF-39** Si nadie puja por un ítem, el sistema debe asignar la compra a la empresa por el precio base al finalizar la subasta.
❌ - **RF-40** Las subastas en dólares deben cancelarse en dólares (transferencia o tarjeta internacional).

### 1.7 Incumplimiento de pago
🟡 - **RF-41** Si el ganador no posee los fondos para cumplir el pago, el sistema debe aplicarle una multa equivalente al 10% del valor ofertado. **Se hace por Swagger**
🟡 - **RF-42** El sistema debe impedir al usuario participar en nuevas subastas hasta abonar la multa pendiente. **Falta probar si paga si se vuelve a habilitar**
❌ - **RF-43** El sistema debe exigir al usuario presentar los fondos necesarios para pagar la oferta dentro de las 72 hs. **No dice nada sobre 72hrs**
❌ - **RF-44** Si el usuario no cumple con la obligación de pago, el sistema debe bloquear el acceso del usuario a todos los servicios y marcar el caso como derivado a la justicia (fuera del alcance de la app).

### 1.8 Submisión de ítems para subastar (rol Dueño)
✅ - **RF-45** El sistema debe permitir al usuario proponer un bien para incluir en una subasta cargando: datos del bien, al menos 6 fotos y datos históricos/de interés.
✅ - **RF-46** El sistema debe exigir una declaración (checkbox obligatorio) de que el bien le pertenece y no posee impedimentos para subastarlo.
🟡 - **RF-47** El sistema debe permitir adjuntar acreditación de origen lícito cuando sea requerido.
✅ - **RF-48** Tras una inspección, el sistema debe informar la aceptación o el rechazo del bien.
✅ - **RF-49** En caso de rechazo el sistema debe mostrar las causas y registrar la devolución con cargo al usuario.
✅ - **RF-50** En caso de aceptación el sistema debe informar al usuario fecha, hora, lugar de la subasta, precio base por ítem y comisiones.
✅ - **RF-51** El sistema debe permitir al usuario aceptar o rechazar el precio base/comisiones propuestos; el rechazo dispara devolución con cargo.
❌ - **RF-52** Si un dueño envía una cantidad muy numerosa de artículos, el sistema debe permitir a la empresa agruparlos como **colección** con el nombre del usuario.
❌ - **RF-53** El sistema debe exigir al dueño declarar antes del inicio de la subasta la cuenta (puede ser del exterior) donde recibirá el resultado de las ventas.

### 1.9 Logística y seguros
🟡 - **RF-54** El sistema debe contratar un seguro sobre el bien en función del precio base. **Lo hace, pero como?**
❌ - **RF-55** El sistema debe permitir que una póliza cubra varias piezas, siempre que sean del mismo dueño (beneficiario único).
❌ - **RF-56** El sistema debe permitir al dueño consultar la ubicación de la pieza (depósito) y la póliza vigente.
❌ - **RF-57** El sistema debe exponer los datos de contacto de la compañía de seguros para que el dueño amplíe la cobertura pagando la diferencia.

### 1.10 Historial y métricas
✅ - **RF-58** El sistema debe registrar la participación del usuario en cada subasta: si asistió, si ganó, historial completo de sus pujas, importes ofertados y pagados.
✅ - **RF-59** El sistema debe ofrecer al usuario métricas agregadas: categorías de subastas en las que participó, cantidad de participaciones, cantidad de victorias, importes pagados/ofertados, etc.
✅ - **RF-60** El sistema debe almacenar y poder consultar los datos completos de cada subasta: ubicación, fecha/hora de inicio, subastador y la totalidad de las pujas ordenadas.

### 1.11 Integración
✅ - **RF-61** La app debe consumir y actualizar la información del sistema local existente de la empresa (subastas, dueños, postores, ofertas, rematadores).

---

## 2. Historias de Usuario

Formato: **Como** _rol_, **quiero** _objetivo_, **para** _beneficio_.

### 2.1 Registración y cuenta
✅ - **HU-01** Como visitante, quiero registrarme cargando mis datos personales y fotos del DNI, para poder ser evaluado y participar de subastas.
✅ - **HU-02** Como usuario aprobado, quiero recibir un mail con el enlace para generar mi clave, para activar mi cuenta y empezar a operar.
✅ - **HU-03** Como usuario, quiero iniciar sesión con mi documento y clave, para acceder a las funcionalidades de la app.
✅ - **HU-04** Como usuario, quiero conocer mi categoría asignada, para saber a qué subastas puedo postularme.
❌ - **HU-05** Como usuario, quiero ver cómo mejora mi categoría con mi actividad y medios de pago, para entender qué hacer para subir de nivel.

### 2.2 Medios de pago
✅ - **HU-06** Como usuario aprobado, quiero registrar una cuenta bancaria, tarjeta de crédito o cheque certificado, para poder pujar en subastas.
❌ - **HU-07** Como usuario, quiero ver el estado de verificación de cada medio de pago, para saber con cuáles puedo pujar.
🟡 - **HU-08** Como usuario, quiero administrar (agregar, **editar**, dar de baja) mis medios de pago, para mantenerlos actualizados.
❌ - **HU-09** Como usuario con cheque certificado, quiero conocer el tope disponible, para no exceder el monto cubierto en mis compras.

### 2.3 Exploración de subastas y catálogos
✅ - **HU-10** Como visitante o usuario, quiero explorar los catálogos públicos, para conocer los ítems que se subastarán.
✅ - **HU-11** Como usuario registrado, quiero ver el precio base de los ítems del catálogo, para evaluar mi interés.
✅ - **HU-12** Como usuario, quiero ver las subastas abiertas para mi categoría, para elegir a cuál unirme.
🟡 - **HU-13** Como usuario interesado en arte, quiero ver autor, fecha e historia del objeto, para evaluar su valor. **Ver si se almacena y muestra en front**

### 2.4 Participación en una subasta
✅ - **HU-14** Como usuario habilitado, quiero conectarme a una subasta abierta, para seguirla en vivo.
✅ - **HU-15** Como usuario, quiero ver el streaming de la subasta presencial, para seguir el contexto de la sala.
✅ - **HU-16** Como postor, quiero ver el ítem actual y la mejor oferta vigente, para decidir si pujo.
✅ - **HU-17** Como postor, quiero recibir en tiempo real las pujas de otros postores, para reaccionar a tiempo.
✅ - **HU-18** Como postor, quiero que la app valide mi puja antes de enviarla, para no equivocarme con los límites mínimo/máximo.
✅ - **HU-19** Como postor, quiero que la app bloquee una nueva puja hasta confirmar la anterior, para evitar enviar pujas duplicadas o conflictivas.
❌ - **HU-20** Como postor de categoría `oro` o `platino`, quiero pujar sin los límites del +1% / +20%, para operar con mayor libertad.
✅ - **HU-21** Como usuario sin medio de pago verificado, quiero entrar como espectador, para conocer la dinámica antes de habilitarme.
❌ - **HU-22** Como usuario, quiero saber que no puedo entrar a dos subastas al mismo tiempo, para no confundirme entre salas.

### 2.5 Adjudicación y pago
✅ - **HU-23** Como ganador, quiero recibir un mensaje con el desglose de importe, comisiones y envío, para conocer cuánto debo abonar.
🟡 - **HU-24** Como ganador, quiero elegir entre envío a domicilio o retiro personal, **sabiendo que el retiro anula el seguro**.
❌ - **HU-25** Como ganador en subasta en USD, quiero pagar en dólares con tarjeta internacional o transferencia, para cumplir la obligación. **Creo que te deja parar con cualquiera**
🟡 - **HU-26** Como ganador que no puede pagar, quiero ver claramente la multa del 10% y el **plazo de 72 hs**, para regularizar mi situación.
✅ - **HU-27** Como usuario multado, quiero saber que no podré ingresar a nuevas subastas hasta abonar la multa, para priorizar el pago.

### 2.6 Submisión de objetos como dueño
✅ - **HU-28** Como dueño, quiero proponer un objeto para subastar cargando fotos y datos, para que la empresa lo evalúe.
✅ - **HU-29** Como dueño, quiero firmar electrónicamente que el bien es de mi propiedad y sin impedimentos, para cumplir el requisito legal.
❌ - **HU-30** Como dueño, quiero adjuntar la documentación de origen lícito, para acreditarlo cuando me lo pidan.
✅ - **HU-31** Como dueño, quiero recibir la aceptación o el rechazo del bien con sus motivos, para tomar acción.
✅ - **HU-32** Como dueño, quiero conocer el precio base sugerido y las comisiones, para aceptarlos o rechazarlos.
❌- **HU-33** Como dueño con muchos objetos, quiero que se agrupen como una colección con mi nombre, para darles identidad propia.
❌ - **HU-34** Como dueño, quiero declarar mi cuenta de cobro antes del inicio de la subasta, para recibir el dinero de las ventas.
❌ - **HU-35** Como dueño, quiero ver dónde está depositada mi pieza y la póliza contratada, para tener visibilidad y tranquilidad.
❌ - **HU-36** Como dueño, quiero contactar a la aseguradora y aumentar la cobertura pagando la diferencia, para proteger mejor mi bien.

### 2.7 Historial y métricas
✅ - **HU-37** Como usuario, quiero ver mi historial de participaciones, pujas y compras, para llevar registro de mi actividad.
✅ - **HU-38** Como usuario, quiero ver métricas agregadas (subastas ganadas, importes ofertados/pagados, categorías), para evaluar mi performance.
✅ - **HU-39** Como usuario, quiero consultar el historial detallado de pujas de una subasta, para revisar lo ocurrido.

### 2.8 Onboarding y soporte
🟡 - **HU-40** Como usuario nuevo, quiero ver una pantalla splash y un **onboarding claro**, para entender qué ofrece la app.
🟡 - **HU-41** Como usuario, quiero recibir notificaciones cuando se aprueba mi registro o **cambia el estado de una subasta/objeto**, para no perder eventos relevantes.

---

## 3. Features

Agrupación de funcionalidades en módulos entregables. Cada feature lista las capacidades principales y los requerimientos/historias que cubre.

### F-01. Autenticación y onboarding
- Splash, login, registro en dos pasos (datos personales + DNI), pantalla "registro en revisión", generación de clave post-aprobación.
- Recupero/cambio de clave personal.
- Cubre: RF-01..RF-06, HU-01..HU-05, HU-40.

### F-02. Gestión de medios de pago
- Alta, edición y baja de cuentas bancarias, tarjetas y cheques certificados.
- Visualización del estado de verificación y del tope disponible (cheques).
- Cubre: RF-07..RF-11, HU-06..HU-09.

### F-03. Perfil y categorías
- Vista del perfil con categoría actual, indicadores de progreso para mejorar la categoría.
- Edición de domicilio legal y datos de contacto.
- Cubre: RF-03, RF-06, HU-04, HU-05.

### F-04. Exploración de catálogos y subastas
- Listado de catálogos públicos.
- Detalle de ítem (descripción, fotos, autor/fecha/historia para arte).
- Listado de subastas filtradas por categoría del usuario, moneda y estado.
- Cubre: RF-12..RF-19, RF-20, HU-10..HU-13.

### F-05. Sala de subasta en vivo
- Conexión / desconexión a una subasta (uno a la vez).
- Visualización del ítem actual, mejor oferta y streaming.
- Recepción de pujas en tiempo real.
- Modo espectador para usuarios sin medio de pago verificado.
- Cubre: RF-20..RF-26, HU-14..HU-17, HU-21, HU-22.

### F-06. Motor de pujas
- Validación de mínimo (+1%) y máximo (+20%) sobre precio base.
- Excepción de límites para subastas `oro`/`platino`.
- Bloqueo de nueva puja hasta confirmación de la anterior.
- Persistencia ordenada del historial de pujas.
- Cubre: RF-27..RF-34, HU-18..HU-20.

### F-07. Cierre, facturación y pago
- Detección de cierre de puja y adjudicación.
- Mensaje privado con desglose (importe + comisiones + envío).
- Selección de envío vs retiro personal (con aviso de pérdida de seguro).
- Pago en moneda de la subasta (ARS / USD).
- Compra por parte de la empresa al precio base si nadie pujó.
- Cubre: RF-35..RF-40, HU-23..HU-25.

### F-08. Multas e incumplimiento
- Cálculo y registro de multa del 10% sobre el valor ofertado.
- Bloqueo de participación hasta el pago de la multa.
- Plazo de 72 hs para acreditar fondos.
- Bloqueo total del usuario ante incumplimiento definitivo.
- Cubre: RF-41..RF-44, HU-26, HU-27.

### F-09. Submisión de objetos por el dueño
- Formulario multi-paso con fotos (≥6), datos históricos, declaración jurada y origen lícito.
- Seguimiento del estado: en revisión, aceptado, rechazado.
- Aceptación / rechazo del precio base y comisiones propuestas.
- Agrupación como "Colección de <nombre>".
- Declaración de la cuenta de cobro previa al inicio de la subasta.
- Cubre: RF-45..RF-53, HU-28..HU-34.

### F-10. Logística y seguros
- Consulta de ubicación del bien en depósito.
- Visualización de la póliza contratada.
- Contacto directo con la aseguradora para ampliar cobertura.
- Cubre: RF-54..RF-57, HU-35, HU-36.

### F-11. Historial y métricas del usuario
- "Mis subastas": participaciones, victorias, importes ofertados y pagados.
- Detalle de pujas por subasta.
- Métricas agregadas por categoría y moneda.
- Cubre: RF-58..RF-60, HU-37..HU-39.

### F-12. Notificaciones
- Notificación de cambio de estado de registración.
- Notificación de aceptación/rechazo de objetos propuestos.
- Recordatorio de subastas próximas para las que el usuario está habilitado.
- Aviso de multas y plazos.
- Cubre transversal a HU-02, HU-26, HU-31, HU-41.

### F-13. Integración con el sistema interno
- Sincronización con el sistema local de la empresa (subastas, postores, dueños, pujas, rematadores).
- Cubre: RF-61.

---

## 4. Trazabilidad rápida

| Feature | Requerimientos | Historias |
|---|---|---|
| F-01 Autenticación | RF-01..RF-06 | HU-01..HU-05, HU-40 |
| F-02 Medios de pago | RF-07..RF-11 | HU-06..HU-09 |
| F-03 Perfil | RF-03, RF-06 | HU-04, HU-05 |
| F-04 Catálogos | RF-12..RF-20 | HU-10..HU-13 |
| F-05 Sala en vivo | RF-20..RF-26 | HU-14..HU-17, HU-21, HU-22 |
| F-06 Pujas | RF-27..RF-34 | HU-18..HU-20 |
| F-07 Cierre y pago | RF-35..RF-40 | HU-23..HU-25 |
| F-08 Multas | RF-41..RF-44 | HU-26, HU-27 |
| F-09 Submisión dueño | RF-45..RF-53 | HU-28..HU-34 |
| F-10 Seguros | RF-54..RF-57 | HU-35, HU-36 |
| F-11 Historial | RF-58..RF-60 | HU-37..HU-39 |
| F-12 Notificaciones | (transversal) | HU-02, HU-26, HU-31, HU-41 |
| F-13 Integración | RF-61 | — |
