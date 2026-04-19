# 📱 Sistema de Subastas — Requisitos + UX Flows

---

# ✅ Requisitos Funcionales

## 🧑‍💻 Registro y gestión de usuarios

- ☐ Registro en dos etapas (datos personales + validación externa)
- ☐ Carga de datos: nombre, apellido, documento (frente/dorso), domicilio, país
- ☐ Asignación de categoría (común, especial, plata, oro, platino)
- ☐ Confirmación por email para completar registro
- ☐ Creación de contraseña
- ☐ Login / autenticación de usuario

## 💳 Medios de pago

- ☐ Alta de al menos un medio de pago obligatorio
- ☐ Soporte para:
  - ☐ Cuentas bancarias (locales/extranjeras)
  - ☐ Tarjetas de crédito
  - ☐ Cheques certificados

- ☐ Gestión (alta/baja/modificación) de medios de pago
- ☐ Validación previa de medios de pago
- ☐ Control de límite de gasto según fondos garantizados

## 🔍 Visualización de subastas

- ☐ Listado de subastas disponibles
- ☐ Visualización de catálogo de subasta
- ☐ Visualización de:
  - ☐ Descripción del ítem
  - ☐ Precio base
  - ☐ Imágenes (~6)
  - ☐ Info adicional (artista, historia, etc.)

- ☐ Ver subastas según categoría del usuario
- ☐ Acceso a streaming (externo)

## 🔐 Acceso a subastas

- ☐ Validación de acceso según:
  - ☐ Usuario registrado
  - ☐ Categoría suficiente
  - ☐ Medio de pago verificado

- ☐ Restricción: solo una subasta activa por usuario

## 💰 Sistema de pujas

- ☐ Visualización en tiempo real de:
  - ☐ Ítem actual
  - ☐ Mejor oferta

- ☐ Realizar pujas
- ☐ Validaciones:
  - ☐ Oferta > oferta actual
  - ☐ Mínimo = oferta actual + 1% del valor base
  - ☐ Máximo = oferta actual + 20% del valor base
  - ☐ (excepto oro/platino)

- ☐ Actualización en tiempo real de ofertas
- ☐ Bloqueo hasta confirmación de puja
- ☐ Registro histórico de pujas

## 🏆 Resultado de subasta

- ☐ Determinar ganador (última puja válida)
- ☐ Registrar venta del ítem
- ☐ Actualizar propietario
- ☐ Generar detalle de pago:
  - ☐ Precio final
  - ☐ Comisiones
  - ☐ Envío

- ☐ Notificación privada al ganador

## ⚠️ Penalizaciones y pagos

- ☐ Control de fondos disponibles
- ☐ Multa del 10% por falta de pago
- ☐ Bloqueo hasta regularización
- ☐ Límite de 72hs para pagar
- ☐ Inhabilitación si no cumple

## 📦 Gestión de envíos y retiro

- ☐ Opción de envío (con costo)
- ☐ Opción de retiro presencial
- ☐ Pérdida de seguro al retirar

## 📊 Historial y métricas

- ☐ Historial de participación
- ☐ Subastas asistidas
- ☐ Subastas ganadas
- ☐ Historial de pujas
- ☐ Métricas de:
  - ☐ Categorías
  - ☐ Montos ofertados/pagados

## 📤 Publicación de artículos

- ☐ Solicitud para subastar un bien
- ☐ Carga de:
  - ☐ Descripción
  - ☐ Imágenes (mínimo 6)
  - ☐ Datos históricos

- ☐ Declaración de propiedad y legalidad
- ☐ Validación por la empresa
- ☐ Notificación de:
  - ☐ Aceptación
  - ☐ Rechazo (con motivo)

- ☐ Aceptación/rechazo de condiciones (precio base, comisiones)

## 🏢 Gestión de bienes en subasta

- ☐ Visualizar estado del bien (depósito)
- ☐ Visualizar póliza de seguro
- ☐ Posibilidad de ampliar seguro

## 💵 Gestión financiera

- ☐ Transferencia de dinero al vendedor
- ☐ Registro de cuentas del vendedor
- ☐ Manejo de moneda:
  - ☐ Subastas en pesos o dólares
  - ☐ Pago en moneda correspondiente

## 🔄 Integración con sistema existente

- ☐ Consumo de datos del sistema actual
- ☐ Actualización sincronizada de:
  - ☐ Subastas
  - ☐ Usuarios
  - ☐ Ofertas
  - ☐ Ventas

---

# 🔁 User Flows + Pantallas

## 1. 🧑‍💻 Onboarding / Registro

**Flow:**
Splash → Login / Registro → Datos → Documentos → Validación → Confirmación → Password → Medio de pago → Home

**Pantallas:**

- ☐ Splash
- ☐ Login
- ☐ Registro
- ☐ Subida de documentos
- ☐ Estado validación
- ☐ Crear contraseña
- ☐ Alta medio de pago

---

## 2. 🏠 Explorar subastas

**Flow:**
Home → Lista → Detalle → Catálogo

**Pantallas:**

- ☐ Home
- ☐ Listado
- ☐ Detalle subasta
- ☐ Catálogo
- ☐ Detalle ítem

---

## 3. 🔐 Ingreso a subasta

**Flow:**
Detalle → Validación → Sala

**Pantallas:**

- ☐ Validación acceso
- ☐ Sala de subasta

---

## 4. 💰 Pujar

**Flow:**
Sala → Ver oferta → Pujar → Validar → Confirmar → Update

**Pantallas:**

- ☐ Sala (live)
- ☐ Confirmación puja
- ☐ Error

---

## 5. 🏆 Resultado

**Flow:**
Fin → Resultado → Pago

**Pantallas:**

- ☐ Resultado
- ☐ Detalle compra
- ☐ Estado pago

---

## 6. 💳 Pagos

**Flow:**
Perfil → Medios → CRUD

**Pantallas:**

- ☐ Lista medios
- ☐ Alta
- ☐ Editar

---

## 7. 📊 Perfil

**Flow:**
Perfil → Historial → Métricas

**Pantallas:**

- ☐ Perfil
- ☐ Historial
- ☐ Métricas

---

## 8. 📤 Publicar artículo

**Flow:**
Perfil → Publicar → Form → Estado

**Pantallas:**

- ☐ Formulario
- ☐ Imágenes
- ☐ Declaración
- ☐ Estado

---

## 9. 📦 Seguimiento

**Flow:**
Mis artículos → Detalle

**Pantallas:**

- ☐ Lista
- ☐ Detalle
- ☐ Seguro

---

# ⭐ Pantallas clave

- ☐ Sala de subasta
- ☐ Detalle ítem
- ☐ Home
- ☐ Registro
- ☐ Medio de pago
- ☐ Resultado
- ☐ Publicar artículo

---

# 🧩 Componentes

- ☐ Card subasta
- ☐ Card ítem
- ☐ Input puja
- ☐ Precio en vivo
- ☐ Badge categoría
- ☐ Estados
- ☐ Modal
- ☐ Toast

---

# 🔥 UX Tips

- Feedback en tiempo real en subasta
- Mostrar líder actual
- Sugerir puja mínima automáticamente
- Evitar errores con validaciones claras
