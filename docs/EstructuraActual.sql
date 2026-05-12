-- =====================================================================
--  BidFlow / Sistema de Subastas - PostgreSQL schema
--  Single source of truth for the backend.
-- =====================================================================

-- 1. Paises
CREATE TABLE paises(
    numero INTEGER PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    nombreCorto TEXT,
    capital TEXT NOT NULL,
    nacionalidad TEXT NOT NULL,
    idiomas TEXT NOT NULL
);

-- 2. Personas
CREATE TABLE personas(
    identificador SERIAL PRIMARY KEY,
    documento TEXT NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT,
    estado TEXT CHECK (estado IN ('activo', 'inactivo')),
    foto BYTEA
);

-- 3. Empleados
CREATE TABLE empleados(
    identificador INTEGER PRIMARY KEY NOT NULL,
    cargo TEXT,
    sector INTEGER,
    CONSTRAINT fk_empleados_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

-- 4. Sectores
CREATE TABLE sectores(
    identificador SERIAL PRIMARY KEY,
    nombreSector TEXT NOT NULL,
    codigoSector TEXT,
    responsableSector INTEGER,
    CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsableSector) REFERENCES empleados(identificador)
);

-- 5. Seguros
CREATE TABLE seguros(
    nroPoliza TEXT PRIMARY KEY NOT NULL,
    compania TEXT NOT NULL,
    polizaCombinada BOOLEAN,
    importe DECIMAL(18,2) NOT NULL CHECK (importe > 0)
);

-- 6. Usuarios (auth)
CREATE TABLE usuarios (
    identificador SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    identificador_persona INTEGER UNIQUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT fk_usuarios_personas
        FOREIGN KEY (identificador_persona)
        REFERENCES personas(identificador)
        ON DELETE CASCADE
);

-- 7. Clientes
CREATE TABLE clientes(
    identificador INTEGER PRIMARY KEY NOT NULL,
    numeroPais INTEGER,
    admitido BOOLEAN,
    categoria TEXT CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
    verificador INTEGER NOT NULL,
    CONSTRAINT fk_clientes_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador),
    CONSTRAINT fk_clientes_paises FOREIGN KEY (numeroPais) REFERENCES paises(numero)
);

-- 8. Duenios
CREATE TABLE duenios(
    identificador INTEGER PRIMARY KEY NOT NULL,
    numeroPais INTEGER,
    verificacionFinanciera BOOLEAN,
    verificacionJudicial BOOLEAN,
    calificacionRiesgo INTEGER CHECK(calificacionRiesgo IN (1,2,3,4,5,6)),
    verificador INTEGER NOT NULL,
    CONSTRAINT fk_duenios_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador),
    CONSTRAINT fk_duenios_paises FOREIGN KEY (numeroPais) REFERENCES paises(numero)
);

-- 9. Subastadores
CREATE TABLE subastadores(
    identificador INTEGER PRIMARY KEY NOT NULL,
    matricula TEXT,
    region TEXT,
    CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

-- 10. Subastas
CREATE TABLE subastas(
    identificador SERIAL PRIMARY KEY,
    fecha DATE,
    hora TIME NOT NULL,
    estado TEXT CHECK (estado IN ('abierta','cerrada')),
    subastador INTEGER,
    ubicacion TEXT,
    capacidadAsistentes INTEGER,
    tieneDeposito BOOLEAN,
    seguridadPropia BOOLEAN,
    categoria TEXT CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
    moneda TEXT,
    CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES subastadores(identificador)
);

-- 11. Productos
CREATE TABLE productos(
    identificador SERIAL PRIMARY KEY,
    fecha DATE,
    disponible BOOLEAN,
    descripcionCatalogo TEXT DEFAULT 'No Posee',
    descripcionCompleta TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    revisor INTEGER NOT NULL,
    duenio INTEGER NOT NULL,
    seguro TEXT,
    CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES empleados(identificador),
    CONSTRAINT fk_productos_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador),
    CONSTRAINT fk_productos_seguros FOREIGN KEY (seguro) REFERENCES seguros(nroPoliza)
);

-- 12. Fotos
CREATE TABLE fotos(
    identificador SERIAL PRIMARY KEY,
    producto INTEGER NOT NULL,
    foto BYTEA NOT NULL,
    CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

-- 13. Catalogos
CREATE TABLE catalogos(
    identificador SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    subasta INTEGER,
    responsable INTEGER NOT NULL,
    CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES empleados(identificador),
    CONSTRAINT fk_catalogos_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

-- 14. ItemsCatalogo
CREATE TABLE itemsCatalogo(
    identificador SERIAL PRIMARY KEY,
    catalogo INTEGER NOT NULL,
    producto INTEGER NOT NULL,
    numeroPieza INTEGER,
    precioBase DECIMAL(18,2) NOT NULL CHECK (precioBase > 0.01),
    comision DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
    subastado BOOLEAN,
    CONSTRAINT fk_itemsCatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES catalogos(identificador),
    CONSTRAINT fk_itemsCatalogo_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

-- 15. Asistentes
CREATE TABLE asistentes(
    identificador SERIAL PRIMARY KEY,
    numeroPostor INTEGER NOT NULL,
    cliente INTEGER NOT NULL,
    subasta INTEGER NOT NULL,
    CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_asistentes_subasta FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

-- 16. Pujos (apuestas)
CREATE TABLE pujos(
    identificador SERIAL PRIMARY KEY,
    asistente INTEGER NOT NULL,
    item INTEGER NOT NULL,
    importe DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ganador BOOLEAN DEFAULT false,
    CONSTRAINT fk_pujos_asistentes FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
    CONSTRAINT fk_pujos_itemsCatalogo FOREIGN KEY (item) REFERENCES itemsCatalogo(identificador)
);

-- 17. RegistroDeSubasta
CREATE TABLE registroDeSubasta(
    identificador SERIAL PRIMARY KEY,
    subasta INTEGER NOT NULL,
    duenio INTEGER NOT NULL,
    producto INTEGER NOT NULL,
    cliente INTEGER NOT NULL,
    importe DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    comision DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
    CONSTRAINT fk_registroDeSubasta_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador),
    CONSTRAINT fk_registroDeSubasta_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador),
    CONSTRAINT fk_registroDeSubasta_producto FOREIGN KEY (producto) REFERENCES productos(identificador),
    CONSTRAINT fk_registroDeSubasta_cliente FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);

-- =====================================================================
--  Extended tables (not in the original auction-domain DDL but required
--  by the BidFlow REST API).
-- =====================================================================

-- 18. Medios de pago - tarjetas, cuentas, cheques, etc.
CREATE TABLE medios_pago(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('cuenta_bancaria', 'tarjeta_credito', 'cheque')),
    detalle TEXT,
    banco TEXT,
    numero_cuenta TEXT,
    numero_tarjeta TEXT,
    pais_banco TEXT,
    moneda TEXT NOT NULL,
    monto_reservado DECIMAL(18,2) DEFAULT 0,
    internacional BOOLEAN DEFAULT false,
    verificado BOOLEAN DEFAULT false,
    CONSTRAINT fk_medios_pago_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);

-- 19. Cuentas de cobro - donde el cliente recibe el dinero por bienes vendidos
CREATE TABLE cuentas_cobro(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    banco TEXT NOT NULL,
    numero_cuenta TEXT NOT NULL,
    moneda TEXT NOT NULL,
    pais TEXT,
    CONSTRAINT fk_cuentas_cobro_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);

-- 20. Compras - cliente que gano una puja y debe completar el pago
CREATE TABLE compras(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    subasta INTEGER NOT NULL,
    producto INTEGER NOT NULL,
    importe DECIMAL(18,2) NOT NULL,
    comision DECIMAL(18,2) NOT NULL,
    costo_envio DECIMAL(18,2) DEFAULT 0,
    total DECIMAL(18,2) NOT NULL,
    retiro_personal BOOLEAN DEFAULT false,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compras_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_compras_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador),
    CONSTRAINT fk_compras_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

-- 21. Multas
CREATE TABLE multas(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    compra INTEGER,
    importe_original DECIMAL(18,2) NOT NULL,
    multa DECIMAL(18,2) NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'pagada', 'cancelada')) DEFAULT 'pendiente',
    fecha_limite TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_multas_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_multas_compras FOREIGN KEY (compra) REFERENCES compras(identificador)
);

-- 22. Direcciones de envio (las del cliente)
CREATE TABLE direcciones(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    nombre TEXT,
    calle TEXT,
    numero TEXT,
    piso TEXT,
    departamento TEXT,
    ciudad TEXT,
    provincia TEXT,
    codigo_postal TEXT,
    pais INTEGER,
    favorito BOOLEAN DEFAULT false,
    CONSTRAINT fk_direcciones_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_direcciones_paises FOREIGN KEY (pais) REFERENCES paises(numero)
);

-- 23. Notificaciones
CREATE TABLE notificaciones(
    identificador SERIAL PRIMARY KEY,
    cliente INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador)
);
