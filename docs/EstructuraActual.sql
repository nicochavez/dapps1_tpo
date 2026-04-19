CREATE TABLE paises(
numero INTEGER PRIMARY KEY NOT NULL,
nombre TEXT NOT NULL,
nombreCorto TEXT,
capital TEXT NOT NULL,
nacionalidad TEXT NOT NULL,
idiomas TEXT NOT NULL
);

CREATE TABLE personas(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
documento TEXT NOT NULL,
nombre TEXT NOT NULL,
direccion TEXT,
estado TEXT CHECK (estado IN ('activo', 'inactivo')),
foto BLOB
);

CREATE TABLE empleados(
identificador INTEGER PRIMARY KEY NOT NULL,
cargo TEXT,
sector INTEGER
);

CREATE TABLE sectores(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
nombreSector TEXT NOT NULL,
codigoSector TEXT,
responsableSector INTEGER,
CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsableSector) REFERENCES empleados(identificador)
);

CREATE TABLE seguros(
nroPoliza TEXT PRIMARY KEY NOT NULL,
compania TEXT NOT NULL,
polizaCombinada TEXT CHECK(polizaCombinada IN ('si','no')),
importe DECIMAL(18,2) NOT NULL CHECK (importe > 0)
);

CREATE TABLE clientes(
identificador INTEGER PRIMARY KEY NOT NULL,
numeroPais INTEGER,
admitido TEXT CHECK(admitido IN ('si','no')),
categoria TEXT CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
verificador INTEGER NOT NULL,
CONSTRAINT fk_clientes_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador),
CONSTRAINT fk_clientes_paises FOREIGN KEY (numeroPais) REFERENCES paises(numero)
);

CREATE TABLE duenios(
identificador INTEGER PRIMARY KEY NOT NULL,
numeroPais INTEGER,
verificacionFinanciera TEXT CHECK(verificacionFinanciera IN ('si','no')),
verificacionJudicial TEXT CHECK(verificacionJudicial IN ('si','no')),
calificacionRiesgo INTEGER CHECK(calificacionRiesgo IN (1,2,3,4,5,6)),
verificador INTEGER NOT NULL,
CONSTRAINT fk_duenios_personas FOREIGN KEY (identificador) REFERENCES personas(identificador),
CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador) REFERENCES empleados(identificador)
);

CREATE TABLE subastadores(
identificador INTEGER PRIMARY KEY NOT NULL,
matricula TEXT,
region TEXT,
CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES personas(identificador)
);

CREATE TABLE subastas(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
fecha DATE CHECK (fecha > DATE('now', '+10 days')),
hora TIME NOT NULL,
estado TEXT CHECK (estado IN ('abierta','cerrada')),
subastador INTEGER,
ubicacion TEXT,
capacidadAsistentes INTEGER,
tieneDeposito TEXT CHECK(tieneDeposito IN ('si','no')),
seguridadPropia TEXT CHECK(seguridadPropia IN ('si','no')),
categoria TEXT CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES subastadores(identificador)
);

CREATE TABLE productos(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
fecha DATE,
disponible TEXT CHECK (disponible IN ('si','no')),
descripcionCatalogo TEXT DEFAULT 'No Posee',
descripcionCompleta TEXT NOT NULL,
revisor INTEGER NOT NULL,
duenio INTEGER NOT NULL,
seguro TEXT,
CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES empleados(identificador),
CONSTRAINT fk_productos_duenios FOREIGN KEY (duenio) REFERENCES duenios(identificador)
);

CREATE TABLE fotos(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
producto INTEGER NOT NULL,
foto BLOB NOT NULL,
CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

CREATE TABLE catalogos(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
descripcion TEXT NOT NULL,
subasta INTEGER,
responsable INTEGER NOT NULL,
CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES empleados(identificador),
CONSTRAINT fk_catalogos_subastas FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

CREATE TABLE itemsCatalogo(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
catalogo INTEGER NOT NULL,
producto INTEGER NOT NULL,
precioBase DECIMAL(18,2) NOT NULL CHECK (precioBase > 0.01),
comision DECIMAL(18,2) NOT NULL CHECK (comision > 0.01),
subastado TEXT CHECK (subastado IN ('si','no')),
CONSTRAINT fk_itemsCatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES catalogos(identificador),
CONSTRAINT fk_itemsCatalogo_productos FOREIGN KEY (producto) REFERENCES productos(identificador)
);

CREATE TABLE asistentes(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
numeroPostor INTEGER NOT NULL,
cliente INTEGER NOT NULL,
subasta INTEGER NOT NULL,
CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES clientes(identificador),
CONSTRAINT fk_asistentes_subasta FOREIGN KEY (subasta) REFERENCES subastas(identificador)
);

CREATE TABLE pujos(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
asistente INTEGER NOT NULL,
item INTEGER NOT NULL,
importe DECIMAL(18,2) NOT NULL CHECK (importe > 0.01),
ganador TEXT CHECK (ganador IN ('si','no')) DEFAULT 'no',
CONSTRAINT fk_pujos_asistentes FOREIGN KEY (asistente) REFERENCES asistentes(identificador),
CONSTRAINT fk_pujos_itemsCatalogo FOREIGN KEY (item) REFERENCES itemsCatalogo(identificador)
);

CREATE TABLE registroDeSubasta(
identificador INTEGER PRIMARY KEY AUTOINCREMENT,
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
