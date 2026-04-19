# API REST - Sistema de Subastas

## Base URL

```
/api/v1
```

---

## 1. Autenticacion

### 1.1 Completar registro y generar clave personal

- **POST** `/auth/register`
- **Descripcion:** El usuario completa su registro (segunda etapa) generando su clave personal. Requiere que la empresa ya haya aprobado la primera etapa de registracion.
- **Body:**

```json
{
  "documento": "string",
  "password": "string"
}
```

- **Respuestas:**
  - `201 Created` - Registro completado exitosamente.
  - `400 Bad Request` - Datos invalidos o faltantes.
  - `404 Not Found` - No se encontro persona con primera etapa aprobada.
  - `409 Conflict` - El usuario ya completo su registro.

---

### 1.2 Login

- **POST** `/auth/login`
- **Descripcion:** El usuario se identifica para acceder a la aplicacion.
- **Body:**

```json
{
  "documento": "string",
  "password": "string"
}
```

- **Respuestas:**
  - `200 OK` - Login exitoso. Retorna token JWT.
  - `401 Unauthorized` - Credenciales invalidas.
  - `403 Forbidden` - Usuario no admitido o bloqueado por falta de pago.

---

## 2. Usuarios / Clientes (Postores)

### 2.1 Obtener perfil del usuario autenticado

- **GET** `/clientes/me`
- **Descripcion:** Retorna los datos del cliente autenticado, incluyendo su categoria, pais y estado.
- **Respuestas:**
  - `200 OK`

```json
{
  "identificador": 1,
  "documento": "string",
  "nombre": "string",
  "direccion": "string",
  "estado": "activo",
  "categoria": "comun",
  "admitido": "si",
  "pais": {
    "numero": 1,
    "nombre": "Argentina"
  }
}
```

- `401 Unauthorized`

---

### 2.2 Actualizar perfil del usuario (Revisar)

- **PUT** `/clientes/me`
- **Descripcion:** Permite al usuario actualizar datos de su perfil (direccion, foto, etc.).
- **Body:**

```json
{
  "direccion": "string",
  "foto": "base64string"
}
```

- **Respuestas:**
  - `200 OK` - Perfil actualizado.
  - `400 Bad Request` - Datos invalidos.
  - `401 Unauthorized`

---

### 2.3 Obtener metricas del usuario

- **GET** `/clientes/me/metricas`
- **Descripcion:** Retorna estadisticas del usuario: cantidad de subastas a las que asistio, veces que gano, importes ofertados y pagados, participaciones por categoria, etc.
- **Respuestas:**
  - `200 OK`

```json
{
  "subastasAsistidas": 10,
  "subastasGanadas": 3,
  "totalOfertado": 150000.0,
  "totalPagado": 75000.0,
  "participacionesPorCategoria": {
    "comun": 5,
    "especial": 3,
    "plata": 2,
    "oro": 0,
    "platino": 0
  }
}
```

- `401 Unauthorized`

---

## 3. Medios de Pago

### 3.1 Listar medios de pago del usuario

- **GET** `/clientes/me/medios-pago`
- **Descripcion:** Retorna todos los medios de pago registrados por el usuario autenticado.
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "tipo": "cuenta_bancaria",
    "detalle": "Banco Nacion - ****1234",
    "moneda": "ARS",
    "verificado": true,
    "montoReservado": 50000.0
  }
]
```

- `401 Unauthorized`

---

### 3.2 Registrar medio de pago

- **POST** `/clientes/me/medios-pago`
- **Descripcion:** Registra un nuevo medio de pago (cuenta bancaria, tarjeta de credito o cheque certificado). El usuario debe tener al menos uno para pujar.
- **Body:**

```json
{
  "tipo": "cuenta_bancaria | tarjeta_credito | cheque_certificado",
  "banco": "string (opcional)",
  "numeroCuenta": "string (opcional)",
  "numeroTarjeta": "string (opcional)",
  "moneda": "ARS | USD",
  "montoReservado": 0.0,
  "paisBanco": "string (opcional)",
  "internacional": false
}
```

- **Respuestas:**
  - `201 Created` - Medio de pago registrado.
  - `400 Bad Request` - Datos invalidos o faltantes.
  - `401 Unauthorized`

---

### 3.3 Obtener detalle de un medio de pago

- **GET** `/clientes/me/medios-pago/{id}`
- **Descripcion:** Retorna el detalle de un medio de pago especifico.
- **Parametros:**
  - `id` (path) - Identificador del medio de pago.
- **Respuestas:**
  - `200 OK`
  - `401 Unauthorized`
  - `404 Not Found`

---

### 3.4 Actualizar medio de pago (REVISAR)

- **PUT** `/clientes/me/medios-pago/{id}`
- **Descripcion:** Actualiza datos de un medio de pago existente.
- **Parametros:**
  - `id` (path) - Identificador del medio de pago.
- **Body:**

```json
{
  "montoReservado": 100000.0
}
```

- **Respuestas:**
  - `200 OK` - Medio de pago actualizado.
  - `400 Bad Request`
  - `401 Unauthorized`
  - `404 Not Found`

---

### 3.5 Eliminar medio de pago

- **DELETE** `/clientes/me/medios-pago/{id}`
- **Descripcion:** Elimina un medio de pago. No se puede eliminar si es el unico medio de pago verificado del usuario.
- **Parametros:**
  - `id` (path) - Identificador del medio de pago.
- **Respuestas:**
  - `204 No Content` - Eliminado exitosamente.
  - `401 Unauthorized`
  - `404 Not Found`
  - `409 Conflict` - No se puede eliminar el unico medio de pago verificado.

---

## 4. Subastas

### 4.1 Listar subastas

- **GET** `/subastas`
- **Descripcion:** Lista las subastas disponibles. Los catalogos son publicos pero el precio base solo es visible para usuarios registrados.
- **Query Params:**
  - `estado` (opcional): `abierta` | `cerrada`
  - `categoria` (opcional): `comun` | `especial` | `plata` | `oro` | `platino`
  - `fecha` (opcional): filtrar por fecha (YYYY-MM-DD)
  - `moneda` (opcional): `ARS` | `USD`
  - `page` (opcional): numero de pagina
  - `size` (opcional): cantidad por pagina
- **Respuestas:**
  - `200 OK`

```json
{
  "content": [
    {
      "identificador": 1,
      "fecha": "2026-05-01",
      "hora": "14:00",
      "estado": "abierta",
      "ubicacion": "Buenos Aires",
      "categoria": "comun",
      "moneda": "ARS",
      "subastador": {
        "identificador": 1,
        "nombre": "Juan Perez",
        "matricula": "MAT-001"
      }
    }
  ],
  "totalPages": 5,
  "totalElements": 50,
  "page": 0,
  "size": 10
}
```

---

### 4.2 Obtener detalle de una subasta

- **GET** `/subastas/{id}`
- **Descripcion:** Retorna el detalle completo de una subasta, incluyendo su catalogo.
- **Parametros:**
  - `id` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK`

```json
{
  "identificador": 1,
  "fecha": "2026-05-01",
  "hora": "14:00",
  "estado": "abierta",
  "ubicacion": "Buenos Aires",
  "categoria": "comun",
  "moneda": "ARS",
  "capacidadAsistentes": 100,
  "subastador": {
    "identificador": 1,
    "nombre": "Juan Perez",
    "matricula": "MAT-001"
  },
  "catalogo": {
    "identificador": 1,
    "descripcion": "Catalogo General Mayo 2026",
    "items": [
      {
        "identificador": 1,
        "numeroPieza": 1,
        "descripcion": "Juego de Te de 18 piezas",
        "precioBase": 10000.0,
        "comision": 500.0,
        "subastado": "no",
        "imagenes": [{ "identificador": 1, "url": "/api/v1/productos/1/fotos/1" }]
      }
    ]
  }
}
```

- `404 Not Found`

---

### 4.3 Conectarse a una subasta (unirse como asistente) (REVISAR)

- **POST** `/subastas/{id}/conectar`
- **Descripcion:** El usuario se conecta a una subasta abierta. Valida que la categoria del usuario sea >= a la de la subasta, que tenga al menos un medio de pago verificado, y que no este conectado a otra subasta simultaneamente.
- **Parametros:**
  - `id` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK` - Conectado exitosamente. Retorna el numero de postor asignado.

```json
{
  "asistente": {
    "identificador": 1,
    "numeroPostor": 42
  }
}
```

- `401 Unauthorized`
- `403 Forbidden` - Categoria insuficiente, sin medio de pago verificado, o conectado a otra subasta.
- `404 Not Found` - Subasta no encontrada.
- `409 Conflict` - La subasta no esta abierta.

---

### 4.4 Desconectarse de una subasta (NO VA)

- **POST** `/subastas/{id}/desconectar`
- **Descripcion:** El usuario se desconecta de la subasta a la que esta conectado.
- **Parametros:**
  - `id` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK` - Desconectado exitosamente.
  - `401 Unauthorized`
  - `404 Not Found`

---

### 4.5 Obtener el item actualmente en subasta

- **GET** `/subastas/{id}/item-actual`
- **Descripcion:** Retorna el item que se esta subastando en este momento, junto con la mejor oferta actual.
- **Parametros:**
  - `id` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK`

```json
{
  "item": {
    "identificador": 1,
    "descripcion": "Juego de Te de 18 piezas",
    "precioBase": 10000.0,
    "imagenes": [{ "identificador": 1, "url": "/api/v1/productos/1/fotos/1" }]
  },
  "mejorOferta": {
    "importe": 15000.0,
    "numeroPostor": 42
  }
}
```

- `404 Not Found`

---

## 5. Pujas (Ofertas)

### 5.1 Realizar una puja

- **POST** `/subastas/{subastaId}/items/{itemId}/pujas`
- **Descripcion:** El usuario realiza una puja sobre un item en subasta. Validaciones:
  - El importe debe ser mayor a la mejor oferta actual.
  - El monto minimo es: mejor oferta + 1% del valor base.
  - El monto maximo es: mejor oferta + 20% del valor base.
  - Los limites de minimo y maximo **no aplican** a subastas de categoria `oro` y `platino`.
  - El usuario debe tener fondos/credito suficiente en sus medios de pago.
  - La app no permite otra puja hasta recibir confirmacion de que la transaccion fue registrada.
- **Parametros:**
  - `subastaId` (path) - Identificador de la subasta.
  - `itemId` (path) - Identificador del item del catalogo.
- **Body:**

```json
{
  "importe": 15100.0,
  "medioPagoId": 1
}
```

- **Respuestas:**
  - `201 Created` - Puja registrada exitosamente.

```json
{
  "identificador": 1,
  "importe": 15100.0,
  "ganador": "no",
  "confirmada": true
}
```

- `400 Bad Request` - Importe fuera del rango permitido o invalido.
- `401 Unauthorized`
- `403 Forbidden` - El usuario no puede pujar (sin medio de pago verificado, categoria insuficiente, multa pendiente).
- `404 Not Found` - Subasta o item no encontrado.
- `409 Conflict` - La subasta o el item no estan activos.
- `422 Unprocessable Entity` - Fondos insuficientes.

---

### 5.2 Obtener historial de pujas de un item

- **GET** `/subastas/{subastaId}/items/{itemId}/pujas`
- **Descripcion:** Retorna todas las pujas realizadas sobre un item, ordenadas cronologicamente.
- **Parametros:**
  - `subastaId` (path) - Identificador de la subasta.
  - `itemId` (path) - Identificador del item.
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "numeroPostor": 42,
    "importe": 15100.0,
    "ganador": "no",
    "timestamp": "2026-05-01T14:30:00"
  }
]
```

- `404 Not Found`

---

### 5.3 Obtener historial de pujas del usuario en una subasta

- **GET** `/clientes/me/subastas/{subastaId}/pujas`
- **Descripcion:** Retorna el historial de pujas del usuario autenticado en una subasta especifica.
- **Parametros:**
  - `subastaId` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "item": {
      "identificador": 1,
      "descripcion": "Juego de Te de 18 piezas"
    },
    "importe": 15100.0,
    "ganador": "si"
  }
]
```

- `401 Unauthorized`
- `404 Not Found`

---

## 6. Registro de Ventas / Compras

### 6.1 Obtener compras del usuario

- **GET** `/clientes/me/compras`
- **Descripcion:** Retorna todas las compras realizadas por el usuario, con detalle de importe, comision y costo de envio.
- **Query Params:**
  - `page` (opcional)
  - `size` (opcional)
- **Respuestas:**
  - `200 OK`

```json
{
  "content": [
    {
      "identificador": 1,
      "subasta": {
        "identificador": 1,
        "fecha": "2026-05-01"
      },
      "producto": {
        "identificador": 1,
        "descripcion": "Juego de Te de 18 piezas"
      },
      "importe": 15100.0,
      "comision": 755.0,
      "costoEnvio": 2000.0,
      "total": 17855.0,
      "retiroPersonal": false
    }
  ],
  "totalPages": 1,
  "totalElements": 1
}
```

- `401 Unauthorized`

---

### 6.2 Obtener detalle de una compra

- **GET** `/clientes/me/compras/{id}`
- **Descripcion:** Retorna el detalle de una compra especifica incluyendo importe pujado, comisiones y costo de envio.
- **Parametros:**
  - `id` (path) - Identificador del registro de subasta.
- **Respuestas:**
  - `200 OK`
  - `401 Unauthorized`
  - `404 Not Found`

---

### 6.3 Seleccionar retiro personal

- **PUT** `/clientes/me/compras/{id}/retiro-personal`
- **Descripcion:** El usuario indica que retirara personalmente el bien adquirido. Se informa que pierde la cobertura del seguro.
- **Parametros:**
  - `id` (path) - Identificador del registro de subasta.
- **Respuestas:**
  - `200 OK` - Retiro personal confirmado.
  - `401 Unauthorized`
  - `404 Not Found`

---

## 7. Productos / Bienes

### 7.1 Obtener detalle de un producto

- **GET** `/productos/{id}`
- **Descripcion:** Retorna la informacion completa de un producto, incluyendo descripcion, fotos, datos historicos (si aplica), y dueño.
- **Parametros:**
  - `id` (path) - Identificador del producto.
- **Respuestas:**
  - `200 OK`

```json
{
  "identificador": 1,
  "descripcionCatalogo": "Juego de Te de 18 piezas",
  "descripcionCompleta": "Juego de Te de porcelana china, siglo XVIII...",
  "fecha": "2026-04-01",
  "disponible": "si",
  "duenio": {
    "identificador": 1,
    "nombre": "Maria Lopez"
  },
  "fotos": [
    { "identificador": 1, "url": "/api/v1/productos/1/fotos/1" },
    { "identificador": 2, "url": "/api/v1/productos/1/fotos/2" }
  ],
  "seguro": {
    "nroPoliza": "POL-001",
    "compania": "La Caja Seguros",
    "importe": 15000.0
  }
}
```

- `404 Not Found`

---

### 7.2 Obtener foto de un producto

- **GET** `/productos/{productoId}/fotos/{fotoId}`
- **Descripcion:** Retorna la imagen binaria (BLOB) de una foto de un producto.
- **Parametros:**
  - `productoId` (path) - Identificador del producto.
  - `fotoId` (path) - Identificador de la foto.
- **Respuestas:**
  - `200 OK` - Content-Type: image/jpeg o image/png
  - `404 Not Found`

---

## 8. Solicitud de Subasta de Bienes (Duenos)

### 8.1 Solicitar inclusion de un bien en subasta

- **POST** `/clientes/me/bienes`
- **Descripcion:** El usuario solicita a la empresa que coloque un articulo de su propiedad en una subasta futura. Debe incluir al menos 6 fotos, datos del bien y declarar que le pertenece.
- **Body (multipart/form-data):**

```
descripcion: "string"
datosHistoricos: "string (opcional, para obras de arte)"
artista: "string (opcional)"
fechaObra: "string (opcional)"
declaracionPropiedad: true (obligatorio, checkbox)
declaracionOrigenLicito: true (obligatorio)
fotos: [archivo1, archivo2, ..., archivo6+] (minimo 6)
```

- **Respuestas:**
  - `201 Created` - Solicitud registrada.

```json
{
  "identificador": 1,
  "estado": "pendiente_revision",
  "mensaje": "Su solicitud fue recibida. La empresa revisara el bien."
}
```

- `400 Bad Request` - Datos faltantes, menos de 6 fotos, o declaracion no aceptada.
- `401 Unauthorized`

---

### 8.2 Listar bienes propios enviados a subasta

- **GET** `/clientes/me/bienes`
- **Descripcion:** Lista todos los bienes que el usuario ha enviado para subasta, con su estado (pendiente, aceptado, rechazado, en subasta, vendido).
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "descripcion": "Cuadro oleo sobre tela",
    "estado": "aceptado",
    "subasta": {
      "identificador": 5,
      "fecha": "2026-06-15"
    },
    "precioBase": 50000.0,
    "comision": 2500.0
  }
]
```

- `401 Unauthorized`

---

### 8.3 Ver detalle de un bien propio

- **GET** `/clientes/me/bienes/{id}`
- **Descripcion:** Retorna el detalle de un bien propio enviado a subasta, incluyendo estado, causas de rechazo (si aplica), ubicacion (deposito), poliza de seguro, y datos de la subasta asignada.
- **Parametros:**
  - `id` (path) - Identificador del producto.
- **Respuestas:**
  - `200 OK`

```json
{
  "identificador": 1,
  "descripcion": "Cuadro oleo sobre tela",
  "estado": "aceptado",
  "ubicacion": "Deposito Central - Buenos Aires",
  "seguro": {
    "nroPoliza": "POL-005",
    "compania": "La Caja Seguros",
    "importe": 50000.0,
    "polizaCombinada": "no"
  },
  "subasta": {
    "identificador": 5,
    "fecha": "2026-06-15",
    "hora": "16:00",
    "ubicacion": "Salon Principal"
  },
  "precioBase": 50000.0,
  "comision": 2500.0,
  "motivoRechazo": null
}
```

- `401 Unauthorized`
- `404 Not Found`

---

### 8.4 Aceptar o rechazar condiciones de subasta de un bien

- **PUT** `/clientes/me/bienes/{id}/respuesta`
- **Descripcion:** El usuario acepta o rechaza el valor base y las comisiones propuestas por la empresa para su bien. Si rechaza, se procede a la devolucion con los gastos correspondientes.
- **Parametros:**
  - `id` (path) - Identificador del producto.
- **Body:**

```json
{
  "aceptado": true
}
```

- **Respuestas:**
  - `200 OK` - Respuesta registrada.
  - `401 Unauthorized`
  - `404 Not Found`
  - `409 Conflict` - El bien ya fue procesado o no esta en estado pendiente de respuesta.

---

## 9. Catalogos

### 9.1 Listar catalogos de una subasta

- **GET** `/subastas/{id}/catalogos`
- **Descripcion:** Retorna los catalogos asociados a una subasta. Son publicos pero el precio base solo es visible para usuarios registrados.
- **Parametros:**
  - `id` (path) - Identificador de la subasta.
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "descripcion": "Catalogo General Mayo 2026",
    "cantidadItems": 25,
    "items": [
      {
        "identificador": 1,
        "descripcion": "Juego de Te de 18 piezas",
        "precioBase": 10000.0,
        "subastado": "no",
        "imagenPrincipal": "/api/v1/productos/1/fotos/1"
      }
    ]
  }
]
```

- `404 Not Found`

---

### 9.2 Obtener detalle de un item del catalogo

- **GET** `/catalogos/{catalogoId}/items/{itemId}`
- **Descripcion:** Retorna el detalle completo de un item del catalogo incluyendo todas sus fotos, descripcion completa e historial (si es obra de arte).
- **Parametros:**
  - `catalogoId` (path) - Identificador del catalogo.
  - `itemId` (path) - Identificador del item.
- **Respuestas:**
  - `200 OK`

```json
{
  "identificador": 1,
  "precioBase": 10000.0,
  "comision": 500.0,
  "subastado": "no",
  "producto": {
    "identificador": 1,
    "descripcionCatalogo": "Juego de Te de 18 piezas",
    "descripcionCompleta": "Juego de Te de porcelana china...",
    "fotos": [{ "identificador": 1, "url": "/api/v1/productos/1/fotos/1" }]
  }
}
```

- `404 Not Found`

---

## 10. Paises

### 10.1 Listar paises

- **GET** `/paises`
- **Descripcion:** Retorna la lista de paises disponibles (usado para registracion y seleccion de datos).
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "numero": 1,
    "nombre": "Argentina",
    "nombreCorto": "AR",
    "nacionalidad": "Argentina"
  }
]
```

---

## 11. Multas y Pagos Pendientes

### 11.1 Obtener multas pendientes del usuario

- **GET** `/clientes/me/multas`
- **Descripcion:** Retorna las multas pendientes del usuario (10% del valor ofertado cuando no pudo pagar).
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "importeOriginal": 15000.0,
    "multa": 1500.0,
    "estado": "pendiente",
    "fechaLimite": "2026-05-04T14:30:00",
    "compra": {
      "identificador": 1,
      "producto": "Juego de Te de 18 piezas"
    }
  }
]
```

- `401 Unauthorized`

---

### 11.2 Pagar multa

- **POST** `/clientes/me/multas/{id}/pagar`
- **Descripcion:** El usuario paga una multa pendiente para poder volver a participar en subastas.
- **Parametros:**
  - `id` (path) - Identificador de la multa.
- **Body:**

```json
{
  "medioPagoId": 1
}
```

- **Respuestas:**
  - `200 OK` - Multa pagada exitosamente.
  - `401 Unauthorized`
  - `404 Not Found`
  - `422 Unprocessable Entity` - Fondos insuficientes.

---

## 12. Seguros

### 12.1 Obtener poliza de seguro de un producto propio

- **GET** `/clientes/me/bienes/{id}/seguro`
- **Descripcion:** Retorna la informacion de la poliza de seguro contratada por la empresa para un bien del usuario. Permite al usuario contactar a la compañia de seguros para aumentar la cobertura.
- **Parametros:**
  - `id` (path) - Identificador del producto.
- **Respuestas:**
  - `200 OK`

```json
{
  "nroPoliza": "POL-005",
  "compania": "La Caja Seguros",
  "polizaCombinada": "no",
  "importe": 50000.0,
  "contactoCompania": {
    "telefono": "+54 11 4555-0000",
    "email": "contacto@lacaja.com.ar"
  }
}
```

- `401 Unauthorized`
- `404 Not Found`

---

## 13. Cuentas para cobro de ventas (Duenos)

### 13.1 Listar cuentas de cobro del usuario

- **GET** `/clientes/me/cuentas-cobro`
- **Descripcion:** Lista las cuentas declaradas por el usuario para recibir el dinero de la venta de sus bienes. Pueden ser cuentas del exterior. Deben declararse antes del inicio de la subasta.
- **Respuestas:**
  - `200 OK`

```json
[
  {
    "identificador": 1,
    "banco": "Banco Nacion",
    "numeroCuenta": "****5678",
    "moneda": "ARS",
    "pais": "Argentina"
  }
]
```

- `401 Unauthorized`

---

### 13.2 Registrar cuenta de cobro

- **POST** `/clientes/me/cuentas-cobro`
- **Descripcion:** Registra una nueva cuenta bancaria para recibir pagos por ventas de bienes.
- **Body:**

```json
{
  "banco": "string",
  "numeroCuenta": "string",
  "cbu": "string (opcional)",
  "swift": "string (opcional, para cuentas extranjeras)",
  "moneda": "ARS | USD",
  "pais": "string"
}
```

- **Respuestas:**
  - `201 Created`
  - `400 Bad Request`
  - `401 Unauthorized`

---

### 13.3 Eliminar cuenta de cobro

- **DELETE** `/clientes/me/cuentas-cobro/{id}`
- **Descripcion:** Elimina una cuenta de cobro. No se puede eliminar si hay una subasta activa asociada.
- **Parametros:**
  - `id` (path) - Identificador de la cuenta.
- **Respuestas:**
  - `204 No Content`
  - `401 Unauthorized`
  - `404 Not Found`
  - `409 Conflict` - Cuenta asociada a subasta activa.

---

## 14. Historial de participacion

### 14.1 Listar subastas en las que participo el usuario

- **GET** `/clientes/me/subastas`
- **Descripcion:** Retorna el listado de subastas en las que el usuario participo como postor.
- **Query Params:**
  - `page` (opcional)
  - `size` (opcional)
- **Respuestas:**
  - `200 OK`

```json
{
  "content": [
    {
      "identificador": 1,
      "fecha": "2026-05-01",
      "categoria": "comun",
      "estado": "cerrada",
      "ganadas": 1,
      "totalOfertado": 15100.0
    }
  ],
  "totalPages": 1,
  "totalElements": 1
}
```

- `401 Unauthorized`

---

## Resumen de Endpoints

| #    | Metodo | Endpoint                                     | Descripcion                  |
| ---- | ------ | -------------------------------------------- | ---------------------------- |
| 1.1  | POST   | `/auth/register`                             | Completar registro           |
| 1.2  | POST   | `/auth/login`                                | Login                        |
| 2.1  | GET    | `/clientes/me`                               | Obtener perfil               |
| 2.2  | PUT    | `/clientes/me`                               | Actualizar perfil            |
| 2.3  | GET    | `/clientes/me/metricas`                      | Metricas del usuario         |
| 3.1  | GET    | `/clientes/me/medios-pago`                   | Listar medios de pago        |
| 3.2  | POST   | `/clientes/me/medios-pago`                   | Registrar medio de pago      |
| 3.3  | GET    | `/clientes/me/medios-pago/{id}`              | Detalle medio de pago        |
| 3.4  | PUT    | `/clientes/me/medios-pago/{id}`              | Actualizar medio de pago     |
| 3.5  | DELETE | `/clientes/me/medios-pago/{id}`              | Eliminar medio de pago       |
| 4.1  | GET    | `/subastas`                                  | Listar subastas              |
| 4.2  | GET    | `/subastas/{id}`                             | Detalle de subasta           |
| 4.3  | POST   | `/subastas/{id}/conectar`                    | Conectarse a subasta         |
| 4.4  | POST   | `/subastas/{id}/desconectar`                 | Desconectarse de subasta     |
| 4.5  | GET    | `/subastas/{id}/item-actual`                 | Item actual en subasta       |
| 5.1  | POST   | `/subastas/{subastaId}/items/{itemId}/pujas` | Realizar puja                |
| 5.2  | GET    | `/subastas/{subastaId}/items/{itemId}/pujas` | Historial pujas de item      |
| 5.3  | GET    | `/clientes/me/subastas/{subastaId}/pujas`    | Mis pujas en subasta         |
| 6.1  | GET    | `/clientes/me/compras`                       | Listar compras               |
| 6.2  | GET    | `/clientes/me/compras/{id}`                  | Detalle de compra            |
| 6.3  | PUT    | `/clientes/me/compras/{id}/retiro-personal`  | Retiro personal              |
| 7.1  | GET    | `/productos/{id}`                            | Detalle de producto          |
| 7.2  | GET    | `/productos/{productoId}/fotos/{fotoId}`     | Foto de producto             |
| 8.1  | POST   | `/clientes/me/bienes`                        | Solicitar subasta de bien    |
| 8.2  | GET    | `/clientes/me/bienes`                        | Listar bienes propios        |
| 8.3  | GET    | `/clientes/me/bienes/{id}`                   | Detalle de bien propio       |
| 8.4  | PUT    | `/clientes/me/bienes/{id}/respuesta`         | Aceptar/rechazar condiciones |
| 9.1  | GET    | `/subastas/{id}/catalogos`                   | Catalogos de subasta         |
| 9.2  | GET    | `/catalogos/{catalogoId}/items/{itemId}`     | Detalle de item de catalogo  |
| 10.1 | GET    | `/paises`                                    | Listar paises                |
| 11.1 | GET    | `/clientes/me/multas`                        | Multas pendientes            |
| 11.2 | POST   | `/clientes/me/multas/{id}/pagar`             | Pagar multa                  |
| 12.1 | GET    | `/clientes/me/bienes/{id}/seguro`            | Poliza de seguro de bien     |
| 13.1 | GET    | `/clientes/me/cuentas-cobro`                 | Listar cuentas de cobro      |
| 13.2 | POST   | `/clientes/me/cuentas-cobro`                 | Registrar cuenta de cobro    |
| 13.3 | DELETE | `/clientes/me/cuentas-cobro/{id}`            | Eliminar cuenta de cobro     |
| 14.1 | GET    | `/clientes/me/subastas`                      | Historial de subastas        |

**Total: 36 endpoints**

---

## Notas de Implementacion

1. **Autenticacion:** Todos los endpoints (excepto login, register y listados publicos) requieren token JWT en el header `Authorization: Bearer <token>`.

2. **Moneda:** Las subastas pueden ser en ARS o USD. Los pagos en subastas en dolares deben realizarse en dicha moneda (transferencia o tarjeta internacional).

3. **Tiempo real:** Los pujos deben notificarse en tiempo real a todos los usuarios conectados. Se recomienda implementar WebSockets (`/ws/subastas/{id}`) para esta funcionalidad.

4. **Concurrencia de pujas:** La app no debe permitir otro puje hasta recibir confirmacion del sistema. Implementar mecanismo de bloqueo optimista o cola de mensajes.

5. **Limites de puja:**
   - Minimo: mejor oferta + 1% del valor base.
   - Maximo: mejor oferta + 20% del valor base.
   - Estos limites **NO aplican** a subastas de categoria `oro` y `platino`.

6. **Restriccion de conexion simultanea:** Un usuario no puede estar conectado a mas de una subasta a la vez.

7. **Garantia de cheque certificado:** Las compras del usuario no pueden superar el monto del cheque certificado.

8. **Streaming:** El servicio de streaming no forma parte de este desarrollo; es un servicio externo.
