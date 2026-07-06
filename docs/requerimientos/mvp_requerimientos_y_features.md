# MVP — Sistema de Subastas

Selección de requerimientos, historias de usuario y features para la primera versión funcional de la app. El criterio de corte es: **el usuario puede registrarse, ingresar a una subasta en vivo, pujar y ver el resultado de su compra**.

Se excluyen del MVP: logística/seguros, submisión de objetos por el dueño, multas, notificaciones push, métricas avanzadas e integración con el sistema interno.

---

## 1. Requerimientos Funcionales del MVP

### 1.1 Registración y autenticación
- **RF-01** El sistema debe permitir iniciar el registro ingresando nombre, apellido, foto del DNI (frente y dorso), domicilio legal y país de origen.
- **RF-02** El sistema debe mantener al usuario en estado *pendiente* hasta que la empresa lo apruebe.
- **RF-03** Una vez aprobado, el sistema debe asignar al usuario una categoría: `comun`, `especial`, `plata`, `oro` o `platino`.
- **RF-04** El sistema debe enviar un mail al usuario aprobado para que genere su clave personal.
- **RF-05** El sistema debe permitir autenticarse con documento y clave personal.

### 1.2 Medios de pago
- **RF-07** El usuario aprobado debe registrar al menos un medio de pago para poder pujar.
- **RF-08** El sistema debe aceptar cuentas bancarias (nacionales/extranjeras) y tarjetas de crédito (nacionales/extranjeras). *(Cheques certificados quedan fuera del MVP.)*
- **RF-09** El sistema debe permitir registrar, listar y eliminar medios de pago.
- **RF-10** El sistema debe marcar cada medio de pago como *verificado* o *no verificado*.

### 1.3 Catálogos y subastas
- **RF-12** El sistema debe exponer los catálogos públicos con el listado de ítems a subastar.
- **RF-13** El sistema debe ocultar el precio base a usuarios no registrados; los registrados de cualquier categoría pueden verlo.
- **RF-14** De cada ítem debe almacenarse: número de pieza, descripción, precio base, dueño actual y al menos 6 imágenes.
- **RF-15** Para ítems de arte/diseño debe almacenarse adicionalmente: artista/diseñador, fecha y reseña histórica.
- **RF-17** Cada subasta debe tener: fecha/hora de inicio, categoría requerida, rematador, moneda (ARS o USD) y catálogo.
- **RF-19** El sistema debe permitir que existan varias subastas activas simultáneamente.

### 1.4 Participación en subastas
- **RF-20** El sistema debe listar al usuario las subastas accesibles según su categoría (categoría subasta ≤ categoría usuario).
- **RF-21** El sistema debe permitir el ingreso como *espectador* a cualquier usuario aprobado, aunque no tenga medio de pago verificado.
- **RF-22** El sistema debe permitir *pujar* solo a usuarios con al menos un medio de pago verificado en la moneda de la subasta.
- **RF-23** El sistema debe impedir que un usuario esté conectado a más de una subasta simultáneamente.
- **RF-24** Al ingresar, el sistema debe mostrar el ítem en curso y la mejor oferta vigente.
- **RF-25** El sistema debe entregar actualizaciones de ofertas en tiempo real a los usuarios conectados.

### 1.5 Reglas de puja
- **RF-27** Cada puja debe ser estrictamente mayor que la mejor oferta vigente.
- **RF-28** El monto de la puja debe ser al menos `mejor_oferta + 1% × precio_base`.
- **RF-29** El monto de la puja no puede superar `mejor_oferta + 20% × precio_base`.
- **RF-30** Los límites mínimo y máximo **no aplican** en subastas de categorías `oro` y `platino`.
- **RF-31** El sistema debe validar el monto antes de enviar la puja.
- **RF-32** El sistema debe bloquear nuevas pujas del mismo usuario hasta recibir confirmación de que la puja anterior fue registrada y propagada.
- **RF-33** El sistema debe registrar todas las pujas realizadas, ordenadas temporalmente.

### 1.6 Cierre y adjudicación
- **RF-35** Cuando nadie iguale o supere la última puja, el sistema debe declarar ganador al autor de esa puja y registrarlo como nuevo dueño.
- **RF-36** El sistema debe marcar la pieza como vendida y registrar la venta.
- **RF-37** El sistema debe enviar al ganador un mensaje con el desglose: importe pujado, comisiones y costo de envío.
- **RF-38** El sistema debe permitir al ganador elegir entre envío a domicilio o retiro personal.
- **RF-39** Si nadie puja por un ítem, el sistema asigna la compra a la empresa al precio base.

---

## 2. Historias de Usuario del MVP

### Registración y cuenta
- **HU-01** Como visitante, quiero registrarme con mis datos y fotos del DNI, para ser evaluado y participar en subastas.
- **HU-02** Como usuario aprobado, quiero recibir un mail para generar mi clave y activar mi cuenta.
- **HU-03** Como usuario, quiero iniciar sesión con mi documento y clave para acceder a la app.
- **HU-04** Como usuario, quiero conocer mi categoría asignada para saber a qué subastas puedo acceder.
- **HU-40** Como usuario nuevo, quiero ver una pantalla de splash y un onboarding claro para entender qué ofrece la app.

### Medios de pago
- **HU-06** Como usuario aprobado, quiero registrar una cuenta bancaria o tarjeta de crédito para poder pujar.
- **HU-07** Como usuario, quiero ver el estado de verificación de cada medio de pago para saber con cuáles puedo pujar.
- **HU-08** Como usuario, quiero agregar y eliminar mis medios de pago para mantenerlos actualizados.

### Exploración de subastas y catálogos
- **HU-10** Como visitante o usuario, quiero explorar los catálogos públicos para conocer los ítems que se subastarán.
- **HU-11** Como usuario registrado, quiero ver el precio base de los ítems para evaluar mi interés.
- **HU-12** Como usuario, quiero ver las subastas abiertas para mi categoría para elegir a cuál unirme.
- **HU-13** Como usuario interesado en arte, quiero ver autor, fecha e historia del objeto para evaluar su valor.

### Participación en una subasta
- **HU-14** Como usuario habilitado, quiero conectarme a una subasta abierta para seguirla en vivo.
- **HU-16** Como postor, quiero ver el ítem actual y la mejor oferta vigente para decidir si pujo.
- **HU-17** Como postor, quiero recibir en tiempo real las pujas de otros postores para reaccionar a tiempo.
- **HU-18** Como postor, quiero que la app valide mi puja antes de enviarla para no equivocarme con los límites.
- **HU-19** Como postor, quiero que la app bloquee una nueva puja hasta confirmar la anterior para evitar duplicados.
- **HU-20** Como postor `oro` o `platino`, quiero pujar sin los límites del +1% / +20% para operar con mayor libertad.
- **HU-21** Como usuario sin medio de pago verificado, quiero entrar como espectador para conocer la dinámica.
- **HU-22** Como usuario, quiero saber que no puedo estar en dos subastas al mismo tiempo.

### Adjudicación y pago
- **HU-23** Como ganador, quiero recibir el desglose de importe, comisiones y envío para saber cuánto debo abonar.
- **HU-24** Como ganador, quiero elegir entre envío a domicilio o retiro personal.

---

## 3. Features del MVP

### F-01. Autenticación y onboarding
- Splash, login, registro en dos pasos (datos personales + DNI), pantalla "registro en revisión", generación de clave post-aprobación.
- **Cubre:** RF-01..RF-05, HU-01..HU-04, HU-40.

### F-02. Gestión de medios de pago *(alcance reducido)*
- Alta y baja de cuentas bancarias y tarjetas de crédito.
- Visualización del estado de verificación.
- **Cubre:** RF-07..RF-10, HU-06..HU-08.

### F-03. Perfil de usuario
- Vista del perfil con categoría actual.
- Edición básica de domicilio y datos de contacto.
- **Cubre:** RF-03, HU-04.

### F-04. Exploración de catálogos y subastas
- Listado de catálogos públicos.
- Detalle de ítem (descripción, fotos, autor/fecha/historia para arte).
- Listado de subastas filtradas por categoría del usuario.
- **Cubre:** RF-12..RF-15, RF-17, RF-19, RF-20, HU-10..HU-13.

### F-05. Sala de subasta en vivo
- Conexión y desconexión a una subasta (una a la vez).
- Visualización del ítem actual y mejor oferta.
- Recepción de pujas en tiempo real.
- Modo espectador para usuarios sin medio de pago verificado.
- **Cubre:** RF-20..RF-25, HU-14, HU-16, HU-17, HU-21, HU-22.

### F-06. Motor de pujas
- Validación del mínimo (+1%) y máximo (+20%) sobre precio base.
- Excepción de límites para categorías `oro`/`platino`.
- Bloqueo de nueva puja hasta confirmación de la anterior.
- Persistencia ordenada del historial de pujas.
- **Cubre:** RF-27..RF-33, HU-18..HU-20.

### F-07. Cierre y adjudicación *(alcance reducido)*
- Detección de cierre y declaración de ganador.
- Mensaje al ganador con desglose (importe + comisiones + envío).
- Selección de envío vs retiro personal.
- **Cubre:** RF-35..RF-39, HU-23, HU-24.

---

## 4. Fuera del alcance del MVP

| Feature | Motivo de exclusión |
|---|---|
| F-08 Multas e incumplimiento | Complejidad de flujo de cobro; se añade en v2 |
| F-09 Submisión de objetos por el dueño | Flujo extenso; no es necesario para validar el core |
| F-10 Logística y seguros | Depende de integraciones externas |
| F-11 Historial y métricas avanzadas | Valor secundario; el historial básico queda dentro de F-07 |
| F-12 Notificaciones push | Infraestructura adicional; se agrega en v2 |
| F-13 Integración sistema interno | Requiere acceso al sistema legado |
| RF-08 Cheques certificados | Lógica de tope de fondos reservados; se añade en v2 |
| RF-06 Mejora automática de categoría | Reglas de negocio complejas; categoría se asigna manualmente |
| HU-15 Streaming externo | Integración de terceros; solo se enlaza si ya existe la URL |

---

## 5. Trazabilidad MVP

| Feature | Requerimientos | Historias |
|---|---|---|
| F-01 Autenticación | RF-01..RF-05 | HU-01..HU-04, HU-40 |
| F-02 Medios de pago | RF-07..RF-10 | HU-06..HU-08 |
| F-03 Perfil | RF-03 | HU-04 |
| F-04 Catálogos | RF-12..RF-15, RF-17, RF-19, RF-20 | HU-10..HU-13 |
| F-05 Sala en vivo | RF-20..RF-25 | HU-14, HU-16, HU-17, HU-21, HU-22 |
| F-06 Pujas | RF-27..RF-33 | HU-18..HU-20 |
| F-07 Cierre y adjudicación | RF-35..RF-39 | HU-23, HU-24 |
