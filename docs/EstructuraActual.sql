-- 1. Paises
CREATE TABLE paises(
    numero INTEGER PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    nombreCorto TEXT,
    capital TEXT NOT NULL,
    nacionalidad TEXT NOT NULL,
    idiomas TEXT NOT NULL
);

-- 2. Personas (Changed AUTOINCREMENT to SERIAL, BLOB to BYTEA)
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
    sector INTEGER
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

-- 2. Personas (Changed AUTOINCREMENT to SERIAL, BLOB to BYTEA)
CREATE TABLE personas(
    identificador SERIAL PRIMARY KEY,
    documento TEXT NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT,
    estado TEXT CHECK (estado IN ('activo', 'inactivo')),
    foto BYTEA
);

-- 6. Clientes
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

-- 7. Duenios
CREATE TABLE duenios(
    identificador INTEGER PRIMARY KEY NOT NULL,
    numeroPais INTEGER,
    verificacionFinanciera BOOLEAN,
    verificacionJudicial BOOLEAN,
    calificacionRiesgo INTEGER CHECK(calificacionRiesgo IN (1,2,3,4,5,6)),
    verificador INTEGER NOT NULL,
    CONSTRAINT fk_duenios_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
    CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador)
);

-- 8. Subastadores
CREATE TABLE subastadores(
    identificador INTEGER PRIMARY KEY NOT NULL,
    matricula TEXT,
    region TEXT,
    CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

-- 9. Subastas (Updated Date logic)
CREATE TABLE subastas(
    identificador SERIAL PRIMARY KEY,
    fecha DATE CHECK (fecha > CURRENT_DATE + INTERVAL '10 days'),
    hora TIME NOT NULL,
    estado TEXT CHECK (estado IN ('abierta','cerrada')),
    subastador INTEGER,
    ubicacion TEXT,
    capacidadAsistentes INTEGER,
    tieneDeposito BOOLEAN,
    seguridadPropia BOOLEAN,
    categoria TEXT CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
    CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES subastadores(identificador)
);

-- 10. Productos
CREATE TABLE productos(
    identificador SERIAL PRIMARY KEY,
    fecha DATE,
    disponible BOOLEAN,
    descripcionCatalogo TEXT DEFAULT 'No Posee',
    descripcionCompleta TEXT NOT NULL,
    revisor INTEGER NOT NULL,
    duenio INTEGER NOT NULL,
    seguro TEXT,
    CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES empleados(identificador),
    CONSTRAINT fk_productos_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador)
);

-- 11. Fotos
CREATE TABLE fotos(
    identificador SERIAL PRIMARY KEY,
    producto INTEGER NOT NULL,
    foto BYTEA NOT NULL,
    CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

-- 12. Catalogos
CREATE TABLE catalogos(
    identificador SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    subasta INTEGER,
    responsable INTEGER NOT NULL,
    CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES empleados(identificador),
    CONSTRAINT fk_catalogos_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

-- 13. ItemsCatalogo
CREATE TABLE itemsCatalogo(
    identificador SERIAL PRIMARY KEY,
    catalogo INTEGER NOT NULL,
    producto INTEGER NOT NULL,
    precioBase DECIMAL(18,2) NOT NULL CHECK (precioBase > 0.01),
    comision DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
    subastado BOOLEAN,
    CONSTRAINT fk_itemsCatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES catalogos(identificador),
    CONSTRAINT fk_itemsCatalogo_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

-- 14. Asistentes
CREATE TABLE asistentes(
    identificador SERIAL PRIMARY KEY,
    numeroPostor INTEGER NOT NULL,
    cliente INTEGER NOT NULL,
    subasta INTEGER NOT NULL,
    CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
    CONSTRAINT fk_asistentes_subasta FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

-- 15. Pujos
CREATE TABLE pujos(
    identificador SERIAL PRIMARY KEY,
    asistente INTEGER NOT NULL,
    item INTEGER NOT NULL,
    importe DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
    ganador BOOLEAN DEFAULT false,
    CONSTRAINT fk_pujos_asistentes FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
    CONSTRAINT fk_pujos_itemsCatalogo FOREIGN KEY (item) REFERENCES itemsCatalogo(identificador)
);

-- 16. RegistroDeSubasta
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

