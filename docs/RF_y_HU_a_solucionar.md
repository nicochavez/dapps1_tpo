
---

## 1. Requerimientos Funcionales

### 1.1 Registración y autenticación de usuarios
🟡 - **RF-02** El sistema debe enviar los datos cargados a la empresa para verificación externa y mantener al usuario en estado *pendiente* hasta resolución.
✅ - **RF-04** El sistema debe enviar un mail al usuario aprobado invitándolo a completar el registro y generar su clave personal.
❌ - **RF-06** El sistema debe permitir actualizar y mejorar la categoría del usuario en base a la diversidad de medios de pago registrados y su actividad histórica en subastas.

### 1.2 Gestión de medios de pago
🟡 - **RF-09** El sistema debe permitir al usuario registrar, listar, **modificar** y eliminar tantos medios de pago como desee.
✅ - **RF-10** El sistema debe marcar cada medio de pago como *verificado* o *no verificado* por la empresa.
❌ - **RF-11** Cuando el medio de pago sea un cheque certificado, el sistema debe registrar el monto entregado y restringir las compras del usuario a ese tope mientras el cheque siga vigente.

### 1.3 Catálogos y subastas
✅ - **RF-13** El sistema debe ocultar el precio base de los ítems del catálogo a los usuarios no registrados; **los usuarios registrados de cualquier categoría pueden verlo**.
✅ - **RF-15** Para ítems de arte/diseño el sistema debe almacenar adicionalmente: nombre del artista o diseñador, fecha y reseña histórica. **No se muestra en ItemDetailScreen**
🟡 - **RF-17** Cada subasta debe tener asignados: fecha y hora de inicio, ubicación, categoría requerida, **rematador**, moneda (ARS o USD) y catálogo.
✅ - **RF-18** Una subasta es monomonetaria: no puede aceptar pagos en monedas distintas a la definida al crearla. **Creo que acepta cualquier medio de pago actualmente**

### 1.4 Participación en subastas
✅ - **RF-22** El sistema debe permitir *pujar* solo a usuarios con al menos un medio de pago verificado y en la moneda de la subasta. **En este caso no permite ver precios, lo de la moneda no se verifica**
❌ - **RF-23** El sistema debe impedir que un usuario esté conectado simultáneamente a más de una subasta. **Se puede actualmente**

### 1.5 Reglas de puja
✅ - **RF-30** Los límites mínimo y máximo de puja **no aplican** a subastas de categorías `oro` y `platino`.
❌ - **RF-34** Si un usuario tiene fondos reservados (por ejemplo cheque certificado), la suma de sus compras adjudicadas no puede superar el monto reservado, pero puede participar en tantas subastas como quiera mientras le alcance.

### 1.6 Cierre y adjudicación
✅ - **RF-35** Cuando ya nadie iguale o supere la última puja, el sistema debe declarar ganador al autor de esa puja y **registrarlo como nuevo dueño de la pieza**. (se usa nueva variable "nuevo duenio")
✅ - **RF-36** El sistema debe marcar la pieza como vendida, registrar la venta con el medio de pago elegido y actualizar dueño, importes y comisiones. **Revisar si se actualizan**
🟡- **RF-38** El sistema debe permitir al ganador elegir entre envío a domicilio o retiro personal; **el retiro personal anula la cobertura del seguro**.
🟡 - **RF-39** Si nadie puja por un ítem, el sistema debe asignar la compra a la empresa por el precio base al finalizar la subasta. **Se le adjudica en la BD al usuario admin id 1**
✅ - **RF-40** Las subastas en dólares deben cancelarse en dólares (transferencia o tarjeta internacional).

### 1.7 Incumplimiento de pago
🟡 - **RF-41** Si el ganador no posee los fondos para cumplir el pago, el sistema debe aplicarle una multa equivalente al 10% del valor ofertado. **Se hace por Swagger**
🟡 - **RF-42** El sistema debe impedir al usuario participar en nuevas subastas hasta abonar la multa pendiente. **Falta probar si paga si se vuelve a habilitar**
🟡 - **RF-43** El sistema debe exigir al usuario presentar los fondos necesarios para pagar la oferta dentro de las 72 hs. **Se notifica**
🟡 - **RF-44** Si el usuario no cumple con la obligación de pago, el sistema debe bloquear el acceso del usuario a todos los servicios y marcar el caso como derivado a la justicia (fuera del alcance de la app). **Se bloquea por Swagger con admin**

### 1.8 Submisión de ítems para subastar (rol Dueño)
🟡 - **RF-47** El sistema debe permitir adjuntar acreditación de origen lícito cuando sea requerido.
❌ - **RF-52** Si un dueño envía una cantidad muy numerosa de artículos, el sistema debe permitir a la empresa agruparlos como **colección** con el nombre del usuario.
❌ - **RF-53** El sistema debe exigir al dueño declarar antes del inicio de la subasta la cuenta (puede ser del exterior) donde recibirá el resultado de las ventas.

### 1.9 Logística y seguros
✅ - **RF-54** El sistema debe contratar un seguro sobre el bien en función del precio base. **Si el producto vale > 10M ars o > 10k usd, el sistema le asigna un seguro random una vez que el duenio acepta la oferta**
❌ - **RF-55** El sistema debe permitir que una póliza cubra varias piezas, siempre que sean del mismo dueño (beneficiario único).
❌ - **RF-56** El sistema debe permitir al dueño consultar la ubicación de la pieza (depósito) y la póliza vigente.
❌ - **RF-57** El sistema debe exponer los datos de contacto de la compañía de seguros para que el dueño amplíe la cobertura pagando la diferencia.

---

## 2. Historias de Usuario

Formato: **Como** _rol_, **quiero** _objetivo_, **para** _beneficio_.

### 2.1 Registración y cuenta
❌ - **HU-05** Como usuario, quiero ver cómo mejora mi categoría con mi actividad y medios de pago, para entender qué hacer para subir de nivel.

### 2.2 Medios de pago
✅ - **HU-07** Como usuario, quiero ver el estado de verificación de cada medio de pago, para saber con cuáles puedo pujar.
🟡 - **HU-08** Como usuario, quiero administrar (agregar, **editar**, dar de baja) mis medios de pago, para mantenerlos actualizados.
❌ - **HU-09** Como usuario con cheque certificado, quiero conocer el tope disponible, para no exceder el monto cubierto en mis compras.

### 2.3 Exploración de subastas y catálogos
✅ - **HU-13** Como usuario interesado en arte, quiero ver autor, fecha e historia del objeto, para evaluar su valor. **Ver si se almacena y muestra en front**

### 2.4 Participación en una subasta
✅ - **HU-20** Como postor de categoría `oro` o `platino`, quiero pujar sin los límites del +1% / +20%, para operar con mayor libertad.
❌ - **HU-22** Como usuario, quiero saber que no puedo entrar a dos subastas al mismo tiempo, para no confundirme entre salas.

### 2.5 Adjudicación y pago
🟡 - **HU-24** Como ganador, quiero elegir entre envío a domicilio o retiro personal, **sabiendo que el retiro anula el seguro**.
✅ - **HU-25** Como ganador en subasta en USD, quiero pagar en dólares con tarjeta internacional o transferencia, para cumplir la obligación.
🟡 - **HU-26** Como ganador que no puede pagar, quiero ver claramente la multa del 10% y el **plazo de 72 hs**, para regularizar mi situación.

### 2.6 Submisión de objetos como dueño
❌ - **HU-30** Como dueño, quiero adjuntar la documentación de origen lícito, para acreditarlo cuando me lo pidan.
❌- **HU-33** Como dueño con muchos objetos, quiero que se agrupen como una colección con mi nombre, para darles identidad propia.
❌ - **HU-34** Como dueño, quiero declarar mi cuenta de cobro antes del inicio de la subasta, para recibir el dinero de las ventas.
❌ - **HU-35** Como dueño, quiero ver dónde está depositada mi pieza y la póliza contratada, para tener visibilidad y tranquilidad.
❌ - **HU-36** Como dueño, quiero contactar a la aseguradora y aumentar la cobertura pagando la diferencia, para proteger mejor mi bien.

### 2.8 Onboarding y soporte
🟡 - **HU-40** Como usuario nuevo, quiero ver una pantalla splash y un **onboarding claro**, para entender qué ofrece la app.
🟡 - **HU-41** Como usuario, quiero recibir notificaciones cuando se aprueba mi registro o **cambia el estado de una subasta/objeto**, para no perder eventos relevantes.

---