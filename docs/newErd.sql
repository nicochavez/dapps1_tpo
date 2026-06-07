-- ============================================================================
-- BidFlow / Sistema de Subastas — Modelo de datos (PostgreSQL / Supabase)
-- ----------------------------------------------------------------------------
-- Derivado de docs/intitialErd.sql (SQL Server) + docs/RequerimientosYFeatures.md
-- Convertido a dialecto PostgreSQL.
--
-- Arquitectura de identidad (preservada del diseño original):
--   personas  = entidad raíz (toda persona física del sistema)
--     ├─ usuarios      → credenciales de acceso (1:1 con persona)
--     ├─ clientes      → rol POSTOR (puja / compra)
--     ├─ duenios       → rol DUEÑO (envía bienes a subastar)
--     ├─ subastadores  → rematador
--     └─ empleados     → personal interno (verificadores, revisores, etc.)
--   Una misma persona puede ser cliente Y dueño a la vez.
--
-- Orden: se crean primero las tablas referenciadas. Las referencias
-- circulares (empleados <-> sectores) se resuelven con ALTER al final.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Catálogos base
-- ---------------------------------------------------------------------------
CREATE TABLE public.paises (
  numero        integer NOT NULL,
  nombre        varchar(250) NOT NULL,
  nombrecorto   varchar(250),
  capital       varchar(250) NOT NULL,
  nacionalidad  varchar(250) NOT NULL,
  idiomas       varchar(150) NOT NULL,
  CONSTRAINT paises_pkey PRIMARY KEY (numero)
);

-- ---------------------------------------------------------------------------
-- Personas y subtipos (RF-01..RF-06, RF-44)
-- ---------------------------------------------------------------------------
CREATE TABLE public.personas (
  identificador     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  documento         varchar(20)  NOT NULL UNIQUE,
  nombre            varchar(150) NOT NULL,
  apellido          varchar(150) NOT NULL,                          -- RF-01
  pais_origen       integer,                                        -- RF-01
  foto              bytea,                                          -- foto de perfil
  foto_dni_frente   bytea,                                          -- RF-01 (frente)
  foto_dni_dorso    bytea,                                          -- RF-01 (dorso)
  -- RF-02: pendiente hasta verificación externa; RF-44: bloqueado por incumplimiento
  estado  varchar(15) DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente','aprobado','rechazado')),
  fecha_registro    timestamptz DEFAULT now(),
  CONSTRAINT fk_personas_paises FOREIGN KEY (pais_origen) REFERENCES public.paises(numero)
);

-- Credenciales de acceso (RF-04 generación de clave, RF-05 login)
CREATE TABLE public.usuarios (
  identificador     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  persona           bigint NOT NULL UNIQUE,
  email             varchar(250) NOT NULL UNIQUE,
  password_hash     varchar(250),                                   -- null hasta que el usuario genera su clave (RF-04)
  token_activacion  varchar(250),                                   -- enlace enviado por mail (RF-04)
  activo            boolean DEFAULT true,
  ultimo_acceso     timestamptz DEFAULT now(),
  CONSTRAINT fk_usuarios_personas FOREIGN KEY (persona) REFERENCES public.personas(identificador)
);

CREATE TABLE public.empleados (
  identificador bigint NOT NULL PRIMARY KEY,
  cargo         varchar(100),
  sector        bigint,
  CONSTRAINT fk_empleados_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador)
);

CREATE TABLE public.sectores (
  identificador      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombresector       varchar(150) NOT NULL,
  codigosector       varchar(10),
  responsablesector  bigint,
  CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsablesector) REFERENCES public.empleados(identificador)
);

-- Rol POSTOR (RF-03 categoría, RF-20 nivel de acceso)
CREATE TABLE public.clientes (
  identificador bigint NOT NULL PRIMARY KEY,
  admitido      boolean DEFAULT false,                             -- RF-02/RF-03
  categoria     varchar(10)
                CHECK (categoria IN ('comun','especial','plata','oro','platino')),
  verificador   bigint NOT NULL,
  CONSTRAINT fk_clientes_personas  FOREIGN KEY (identificador) REFERENCES public.personas(identificador),
  CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador)   REFERENCES public.empleados(identificador)
);

-- Rol DUEÑO (RF-45..RF-53)
CREATE TABLE public.duenios (
  identificador           bigint NOT NULL PRIMARY KEY,
  verificacionfinanciera  boolean,
  verificacionjudicial    boolean,
  calificacionriesgo      integer CHECK (calificacionriesgo BETWEEN 1 AND 6),
  verificador             bigint NOT NULL,
  CONSTRAINT fk_duenios_personas  FOREIGN KEY (identificador) REFERENCES public.personas(identificador),
  CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador)   REFERENCES public.empleados(identificador)
);

CREATE TABLE public.subastadores (
  identificador bigint NOT NULL PRIMARY KEY,
  matricula     varchar(15),
  region        varchar(50),
  CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador)
);

-- ---------------------------------------------------------------------------
-- Medios de pago del postor (RF-07..RF-11, RF-34)
-- ---------------------------------------------------------------------------
-- Diseño Table-Per-Type (TPT): campos comunes en medios_pago; cada subtipo
-- extiende con su propia tabla (1-a-1 obligatorio, PK = FK a medios_pago).
-- Ventaja: NOT NULL real en campos específicos de cada tipo, sin columnas sparse.
-- ---------------------------------------------------------------------------

-- Tabla base: campos compartidos por los tres tipos (RF-07, RF-09, RF-10)
CREATE TABLE public.medios_pago (
  identificador  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente        bigint NOT NULL,
  tipo           varchar(25) NOT NULL
                 CHECK (tipo IN ('cuenta_bancaria','tarjeta_credito','cheque_certificado')),
  moneda         varchar(3) NOT NULL CHECK (moneda IN ('ARS','USD')),
  internacional  boolean DEFAULT false,                              -- nacional / extranjero (RF-08)
  verificado     boolean DEFAULT false,                              -- RF-10
  vigente        boolean DEFAULT true,
  detalle        varchar(250),
  CONSTRAINT fk_medios_pago_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador)
);

-- Cuenta bancaria: nacional o extranjera con fondos reservados (RF-08)
-- monto_reservado: fondos bloqueados disponibles para pujas (RF-34)
CREATE TABLE public.medios_cuenta_bancaria (
  medio_pago       bigint NOT NULL PRIMARY KEY,
  banco            varchar(150) NOT NULL,
  numero_cuenta    varchar(50)  NOT NULL,
  titular          varchar(250),
  monto_reservado  numeric(18,2) CHECK (monto_reservado > 0),
  CONSTRAINT fk_mcb_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);

-- Tarjeta de crédito: nacional o extranjera (RF-08, RF-40)
-- Se almacenan solo los últimos 4 dígitos por seguridad
CREATE TABLE public.medios_tarjeta_credito (
  medio_pago        bigint NOT NULL PRIMARY KEY,
  banco_emisor      varchar(150),
  ultimos_cuatro    char(4)      NOT NULL,
  titular           varchar(250) NOT NULL,
  fecha_vencimiento date         NOT NULL,
  CONSTRAINT fk_mtc_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);

-- Cheque certificado: monto fijo entregado, con fecha de vigencia (RF-11)
-- El saldo disponible se calcula como monto_certificado − SUM(compras adjudicadas) (RF-34)
CREATE TABLE public.medios_cheque_certificado (
  medio_pago         bigint        NOT NULL PRIMARY KEY,
  banco              varchar(150)  NOT NULL,
  numero_cheque      varchar(50),
  monto_certificado  numeric(18,2) NOT NULL CHECK (monto_certificado > 0),
  fecha_vencimiento  date          NOT NULL,                        -- RF-11: vigencia del cheque
  CONSTRAINT fk_mcc_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);

-- Direcciones de envío del postor (RF-37/RF-38)
CREATE TABLE public.direcciones (
  identificador  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  persona        bigint NOT NULL,
  nombre         varchar(150),
  calle          varchar(250),
  numero         varchar(20),
  piso           varchar(20),
  departamento   varchar(20),
  ciudad         varchar(150),
  provincia      varchar(150),
  codigo_postal  varchar(20),
  pais           integer,
  favorito       boolean DEFAULT false,
  CONSTRAINT fk_direcciones_personas FOREIGN KEY (persona) REFERENCES public.personas(identificador),
  CONSTRAINT fk_direcciones_paises   FOREIGN KEY (pais)    REFERENCES public.paises(numero)
);

-- Cuenta donde el DUEÑO recibe el resultado de sus ventas (RF-53)
CREATE TABLE public.cuentas_cobro (
  identificador  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  duenio         bigint NOT NULL,
  banco          varchar(150) NOT NULL,
  numero_cuenta  varchar(50)  NOT NULL,
  moneda         varchar(3)   NOT NULL CHECK (moneda IN ('ARS','USD')),
  pais           varchar(150),                                      -- puede ser del exterior (RF-53)
  CONSTRAINT fk_cuentas_cobro_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador)
);

-- ---------------------------------------------------------------------------
-- Seguros y logística (RF-54..RF-57)
-- ---------------------------------------------------------------------------
CREATE TABLE public.seguros (
  nropoliza        varchar(30) NOT NULL PRIMARY KEY,
  compania         varchar(150) NOT NULL,
  contacto         varchar(250),                                    -- RF-57: datos de contacto de la aseguradora
  telefono         varchar(50),                                     -- RF-57
  polizacombinada  boolean,                                         -- RF-55: cubre varias piezas del mismo dueño
  importe          numeric(18,2) NOT NULL CHECK (importe > 0)
);

-- ---------------------------------------------------------------------------
-- Bienes / productos (RF-14..RF-16, RF-45..RF-52, RF-56)
-- ---------------------------------------------------------------------------
-- Agrupación de bienes de un mismo dueño como "Colección de <nombre>" (RF-52)
CREATE TABLE public.colecciones (
  identificador bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        varchar(250) NOT NULL,
  duenio        bigint NOT NULL,
  CONSTRAINT fk_colecciones_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador)
);

CREATE TABLE public.productos (
  identificador         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  duenio                bigint NOT NULL,
  revisor               bigint NOT NULL,
  fecha                 date,
  disponible            boolean DEFAULT false,
  descripcioncompleta   varchar(500) NOT NULL,                      -- url a PDF firmado
  descripcioncatalogo   varchar(500) DEFAULT 'No Posee',           -- se completa tras la revisión
  categoria             varchar(100),
  subcategoria          varchar(100),
  -- RF-15: datos para ítems de arte/diseño
  artista               varchar(250),
  fecha_obra            varchar(100),
  resena_historica      varchar(1000),
  -- RF-16: ítem compuesto (p. ej. juego de té de 18 piezas)
  cantidad_piezas       integer DEFAULT 1 CHECK (cantidad_piezas >= 1),
  -- RF-46/47/48/49: submisión por el dueño
  declaracion_propiedad boolean DEFAULT false,                      -- RF-46 (checkbox obligatorio)
  doc_origen_licito     varchar(300),                               -- RF-47 (url acreditación)
  estado_revision       varchar(15) DEFAULT 'en_revision'
                        CHECK (estado_revision IN ('en_revision','aceptado','rechazado')),
  motivo_rechazo        varchar(500),                               -- RF-49
  -- RF-52 / RF-56
  coleccion             bigint,
  ubicacion_deposito    varchar(250),                               -- RF-56
  seguro                varchar(30),                                -- RF-54/RF-55
  CONSTRAINT fk_productos_duenios     FOREIGN KEY (duenio)    REFERENCES public.duenios(identificador),
  CONSTRAINT fk_productos_empleados   FOREIGN KEY (revisor)   REFERENCES public.empleados(identificador),
  CONSTRAINT fk_productos_colecciones FOREIGN KEY (coleccion) REFERENCES public.colecciones(identificador),
  CONSTRAINT fk_productos_seguros     FOREIGN KEY (seguro)    REFERENCES public.seguros(nropoliza)
);

-- Detalle de los elementos que componen un ítem compuesto (RF-16)
CREATE TABLE public.componentes_producto (
  identificador bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto      bigint NOT NULL,
  descripcion   varchar(250) NOT NULL,
  cantidad      integer DEFAULT 1 CHECK (cantidad >= 1),
  CONSTRAINT fk_componentes_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);

-- RF-14: al menos 6 imágenes por ítem (la cantidad mínima se valida en la app)
CREATE TABLE public.fotos (
  identificador bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto      bigint NOT NULL,
  foto          bytea NOT NULL,
  CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);

-- ---------------------------------------------------------------------------
-- Subastas y catálogos (RF-12..RF-19, RF-26)
-- ---------------------------------------------------------------------------
CREATE TABLE public.subastas (
  identificador        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- al menos 10 días de anticipación respecto del momento de creación
  fecha                date CHECK (fecha > CURRENT_DATE + INTERVAL '10 days'),
  hora                 time NOT NULL,
  estado               varchar(12) DEFAULT 'abierta'
                       CHECK (estado IN ('abierta','cerrada','finalizada')),
  subastador           bigint,
  ubicacion            varchar(350),
  capacidadasistentes  integer,
  tienedeposito        boolean,
  seguridadpropia      boolean,
  categoria            varchar(10)
                       CHECK (categoria IN ('comun','especial','plata','oro','platino')),
  moneda               varchar(3) NOT NULL CHECK (moneda IN ('ARS','USD')),  -- RF-17/RF-18 monomonetaria
  url_streaming        varchar(350),                                          -- RF-26
  CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES public.subastadores(identificador)
);

CREATE TABLE public.catalogos (
  identificador bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion   varchar(250) NOT NULL,
  subasta       bigint,
  responsable   bigint NOT NULL,
  CONSTRAINT fk_catalogos_subastas  FOREIGN KEY (subasta)     REFERENCES public.subastas(identificador),
  CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES public.empleados(identificador)
);

CREATE TABLE public.itemscatalogo (
  identificador   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  catalogo        bigint NOT NULL,
  producto        bigint NOT NULL,
  numeropieza     integer,                                          -- RF-14
  preciobase      numeric(18,2) NOT NULL CHECK (preciobase > 0.01),
  comision        numeric(18,2) NOT NULL CHECK (comision > 0.01),
  subastado       boolean DEFAULT false,
  -- RF-50/RF-51: el dueño acepta o rechaza precio base + comisiones propuestos
  estado_acuerdo  varchar(15) DEFAULT 'propuesto'
                  CHECK (estado_acuerdo IN ('propuesto','aceptado','rechazado')),
  CONSTRAINT fk_itemscatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES public.catalogos(identificador),
  CONSTRAINT fk_itemscatalogo_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);

-- ---------------------------------------------------------------------------
-- Participación y pujas (RF-20..RF-34, RF-58..RF-60)
-- ---------------------------------------------------------------------------
CREATE TABLE public.asistentes (
  identificador   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numeropostor    integer NOT NULL,
  cliente         bigint NOT NULL,
  subasta         bigint NOT NULL,
  rol             varchar(12) DEFAULT 'espectador'
                  CHECK (rol IN ('postor','espectador')),           -- RF-21/RF-22
  conectado       boolean DEFAULT true,                             -- RF-23
  fecha_conexion  timestamptz DEFAULT now(),
  CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador),
  CONSTRAINT fk_asistentes_subasta  FOREIGN KEY (subasta) REFERENCES public.subastas(identificador)
);
-- RF-23: un usuario no puede estar conectado a más de una subasta a la vez
CREATE UNIQUE INDEX ux_asistentes_un_conectado
  ON public.asistentes (cliente) WHERE conectado;

CREATE TABLE public.pujos (
  identificador bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asistente     bigint NOT NULL,
  item          bigint NOT NULL,
  importe       numeric(18,2) NOT NULL CHECK (importe > 0.01),
  ganador       boolean DEFAULT false,
  fecha         timestamptz DEFAULT now(),                          -- RF-33: orden temporal
  CONSTRAINT fk_pujos_asistentes    FOREIGN KEY (asistente) REFERENCES public.asistentes(identificador),
  CONSTRAINT fk_pujos_itemscatalogo FOREIGN KEY (item)      REFERENCES public.itemscatalogo(identificador)
);

-- ---------------------------------------------------------------------------
-- Cierre, adjudicación y pago (RF-35..RF-40)
-- ---------------------------------------------------------------------------
-- Registro histórico de adjudicaciones de cada subasta (RF-35/RF-36/RF-60).
-- cliente NULL + comprador_empresa = true → la empresa compra a precio base (RF-39).
CREATE TABLE public.registrodesubasta (
  identificador     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subasta           bigint NOT NULL,
  duenio            bigint NOT NULL,
  producto          bigint NOT NULL,
  cliente           bigint,
  comprador_empresa boolean DEFAULT false,                          -- RF-39
  importe           numeric(18,2) NOT NULL CHECK (importe > 0.01),
  comision          numeric(18,2) NOT NULL CHECK (comision > 0.01),
  CONSTRAINT fk_registrodesubasta_subastas FOREIGN KEY (subasta)  REFERENCES public.subastas(identificador),
  CONSTRAINT fk_registrodesubasta_duenios  FOREIGN KEY (duenio)   REFERENCES public.duenios(identificador),
  CONSTRAINT fk_registrodesubasta_producto FOREIGN KEY (producto) REFERENCES public.productos(identificador),
  CONSTRAINT fk_registrodesubasta_cliente  FOREIGN KEY (cliente)  REFERENCES public.clientes(identificador)
);

-- Operación de compra del ganador con su desglose (RF-36/RF-37/RF-38/RF-40)
CREATE TABLE public.compras (
  identificador    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente          bigint NOT NULL,
  subasta          bigint NOT NULL,
  producto         bigint NOT NULL,
  medio_pago       bigint,                                          -- RF-36: medio de pago elegido
  importe          numeric(18,2) NOT NULL,                          -- importe pujado
  comision         numeric(18,2) NOT NULL,
  costo_envio      numeric(18,2),                                   -- RF-37
  total            numeric(18,2) NOT NULL,
  retiro_personal  boolean DEFAULT false,                           -- RF-38 (anula el seguro)
  direccion_envio  bigint,                                          -- RF-38 (envío a domicilio)
  estado_pago      varchar(12) DEFAULT 'pendiente'
                   CHECK (estado_pago IN ('pendiente','pagado','impago')),  -- RF-41/RF-43
  fecha            timestamptz DEFAULT now(),
  CONSTRAINT fk_compras_clientes      FOREIGN KEY (cliente)         REFERENCES public.clientes(identificador),
  CONSTRAINT fk_compras_subastas      FOREIGN KEY (subasta)         REFERENCES public.subastas(identificador),
  CONSTRAINT fk_compras_productos     FOREIGN KEY (producto)        REFERENCES public.productos(identificador),
  CONSTRAINT fk_compras_medios_pago   FOREIGN KEY (medio_pago)      REFERENCES public.medios_pago(identificador),
  CONSTRAINT fk_compras_direcciones   FOREIGN KEY (direccion_envio) REFERENCES public.direcciones(identificador)
);

-- ---------------------------------------------------------------------------
-- Incumplimiento de pago (RF-41..RF-44)
-- ---------------------------------------------------------------------------
CREATE TABLE public.multas (
  identificador     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente           bigint NOT NULL,
  compra            bigint,
  importe_original  numeric(18,2) NOT NULL,                         -- valor ofertado
  multa             numeric(18,2) NOT NULL,                         -- RF-41: 10% del valor ofertado
  estado            varchar(12) DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente','pagada','derivada')),  -- RF-42/RF-44
  fecha_limite      timestamptz,                                    -- RF-43: 72 hs
  CONSTRAINT fk_multas_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador),
  CONSTRAINT fk_multas_compras  FOREIGN KEY (compra)  REFERENCES public.compras(identificador)
);

-- ---------------------------------------------------------------------------
-- Notificaciones (F-12: HU-02, HU-26, HU-31, HU-41)
-- ---------------------------------------------------------------------------
CREATE TABLE public.notificaciones (
  identificador   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente         bigint NOT NULL,
  titulo          varchar(250) NOT NULL,
  mensaje         varchar(1000) NOT NULL,
  tipo            varchar(30),                                      -- registro / subasta / objeto / multa
  leida           boolean DEFAULT false,
  fecha_creacion  timestamptz DEFAULT now(),
  CONSTRAINT fk_notificaciones_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador)
);

-- ---------------------------------------------------------------------------
-- Referencias circulares (empleados <-> sectores)
-- ---------------------------------------------------------------------------
ALTER TABLE public.empleados
  ADD CONSTRAINT fk_empleados_sectores FOREIGN KEY (sector) REFERENCES public.sectores(identificador);
