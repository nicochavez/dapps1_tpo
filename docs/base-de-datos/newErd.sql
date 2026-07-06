-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.paises (
  numero integer NOT NULL,
  nombre character varying NOT NULL,
  nombrecorto character varying,
  capital character varying NOT NULL,
  nacionalidad character varying NOT NULL,
  idiomas character varying NOT NULL,
  CONSTRAINT paises_pkey PRIMARY KEY (numero)
);
CREATE TABLE public.personas (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  documento character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  pais_origen integer,
  foto bytea,
  foto_dni_frente bytea,
  foto_dni_dorso bytea,
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'aprobado'::character varying::text, 'rechazado'::character varying::text])),
  fecha_registro timestamp with time zone DEFAULT now(),
  estado_registro character varying,
  CONSTRAINT personas_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_personas_paises FOREIGN KEY (pais_origen) REFERENCES public.paises(numero)
);
CREATE TABLE public.usuarios (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  persona bigint NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash character varying,
  token_activacion character varying,
  activo boolean DEFAULT true,
  ultimo_acceso timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_usuarios_personas FOREIGN KEY (persona) REFERENCES public.personas(identificador)
);
CREATE TABLE public.empleados (
  identificador bigint NOT NULL,
  cargo character varying,
  sector bigint,
  CONSTRAINT empleados_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_empleados_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador),
  CONSTRAINT fk_empleados_sectores FOREIGN KEY (sector) REFERENCES public.sectores(identificador)
);
CREATE TABLE public.sectores (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombresector character varying NOT NULL,
  codigosector character varying,
  responsablesector bigint,
  CONSTRAINT sectores_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsablesector) REFERENCES public.empleados(identificador)
);
CREATE TABLE public.clientes (
  identificador bigint NOT NULL,
  admitido boolean DEFAULT false,
  categoria character varying CHECK (categoria::text = ANY (ARRAY['comun'::character varying::text, 'especial'::character varying::text, 'plata'::character varying::text, 'oro'::character varying::text, 'platino'::character varying::text])),
  verificador bigint NOT NULL,
  numeropais integer,
  CONSTRAINT clientes_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_clientes_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador),
  CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador) REFERENCES public.empleados(identificador)
);
CREATE TABLE public.duenios (
  identificador bigint NOT NULL,
  verificacionfinanciera boolean,
  verificacionjudicial boolean,
  calificacionriesgo integer CHECK (calificacionriesgo >= 1 AND calificacionriesgo <= 6),
  verificador bigint NOT NULL,
  numeropais integer,
  CONSTRAINT duenios_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_duenios_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador),
  CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador) REFERENCES public.empleados(identificador)
);
CREATE TABLE public.subastadores (
  identificador bigint NOT NULL,
  matricula character varying,
  region character varying,
  CONSTRAINT subastadores_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES public.personas(identificador)
);
CREATE TABLE public.medios_pago (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente bigint NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['cuenta_bancaria'::character varying::text, 'tarjeta_credito'::character varying::text, 'cheque_certificado'::character varying::text])),
  moneda character varying NOT NULL CHECK (moneda::text = ANY (ARRAY['ARS'::character varying::text, 'USD'::character varying::text])),
  internacional boolean DEFAULT false,
  verificado boolean DEFAULT false,
  vigente boolean DEFAULT true,
  detalle character varying,
  banco character varying,
  monto_reservado numeric,
  numero_cuenta character varying,
  numero_tarjeta character varying,
  pais_banco character varying,
  CONSTRAINT medios_pago_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_medios_pago_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador)
);
CREATE TABLE public.medios_cuenta_bancaria (
  medio_pago bigint NOT NULL,
  banco character varying NOT NULL,
  numero_cuenta character varying NOT NULL,
  titular character varying,
  monto_reservado numeric CHECK (monto_reservado > 0::numeric),
  CONSTRAINT medios_cuenta_bancaria_pkey PRIMARY KEY (medio_pago),
  CONSTRAINT fk_mcb_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);
CREATE TABLE public.medios_tarjeta_credito (
  medio_pago bigint NOT NULL,
  banco_emisor character varying,
  ultimos_cuatro character varying NOT NULL,
  titular character varying NOT NULL,
  fecha_vencimiento date NOT NULL,
  CONSTRAINT medios_tarjeta_credito_pkey PRIMARY KEY (medio_pago),
  CONSTRAINT fk_mtc_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);
CREATE TABLE public.medios_cheque_certificado (
  medio_pago bigint NOT NULL,
  banco character varying NOT NULL,
  numero_cheque character varying,
  monto_certificado numeric NOT NULL CHECK (monto_certificado > 0::numeric),
  fecha_vencimiento date NOT NULL,
  CONSTRAINT medios_cheque_certificado_pkey PRIMARY KEY (medio_pago),
  CONSTRAINT fk_mcc_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador)
);
CREATE TABLE public.direcciones (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  persona bigint NOT NULL,
  nombre character varying,
  calle character varying,
  numero character varying,
  piso character varying,
  departamento character varying,
  ciudad character varying,
  provincia character varying,
  codigo_postal character varying,
  pais integer,
  favorito boolean DEFAULT false,
  CONSTRAINT direcciones_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_direcciones_personas FOREIGN KEY (persona) REFERENCES public.personas(identificador),
  CONSTRAINT fk_direcciones_paises FOREIGN KEY (pais) REFERENCES public.paises(numero)
);
CREATE TABLE public.cuentas_cobro (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  duenio bigint NOT NULL,
  banco character varying NOT NULL,
  numero_cuenta character varying NOT NULL,
  moneda character varying NOT NULL CHECK (moneda::text = ANY (ARRAY['ARS'::character varying::text, 'USD'::character varying::text])),
  pais character varying,
  CONSTRAINT cuentas_cobro_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_cuentas_cobro_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador)
);
CREATE TABLE public.seguros (
  nropoliza character varying NOT NULL,
  compania character varying NOT NULL,
  contacto character varying,
  telefono character varying,
  polizacombinada boolean,
  importe numeric NOT NULL CHECK (importe > 0::numeric),
  CONSTRAINT seguros_pkey PRIMARY KEY (nropoliza)
);
CREATE TABLE public.colecciones (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  duenio bigint NOT NULL,
  CONSTRAINT colecciones_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_colecciones_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador)
);
CREATE TABLE public.productos (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  duenio bigint NOT NULL,
  revisor bigint NOT NULL,
  fecha date,
  disponible boolean DEFAULT false,
  descripcioncompleta character varying NOT NULL,
  descripcioncatalogo character varying DEFAULT 'No Posee'::character varying,
  categoria character varying,
  subcategoria character varying,
  artista character varying,
  fecha_obra character varying,
  resena_historica character varying,
  cantidad_piezas integer DEFAULT 1 CHECK (cantidad_piezas >= 1),
  declaracion_propiedad boolean DEFAULT false,
  doc_origen_licito character varying,
  estado_revision character varying DEFAULT 'en_revision'::character varying CHECK (estado_revision::text = ANY (ARRAY['en_revision'::character varying, 'aceptado'::character varying, 'rechazado'::character varying]::text[])),
  motivo_rechazo character varying,
  coleccion bigint,
  ubicacion_deposito character varying,
  seguro character varying,
  CONSTRAINT productos_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_productos_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador),
  CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES public.empleados(identificador),
  CONSTRAINT fk_productos_colecciones FOREIGN KEY (coleccion) REFERENCES public.colecciones(identificador),
  CONSTRAINT fk_productos_seguros FOREIGN KEY (seguro) REFERENCES public.seguros(nropoliza)
);
CREATE TABLE public.componentes_producto (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto bigint NOT NULL,
  descripcion character varying NOT NULL,
  cantidad integer DEFAULT 1 CHECK (cantidad >= 1),
  CONSTRAINT componentes_producto_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_componentes_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);
CREATE TABLE public.fotos (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto bigint NOT NULL,
  foto bytea NOT NULL,
  CONSTRAINT fotos_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);
CREATE TABLE public.subastas (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha date CHECK (fecha > (CURRENT_DATE + '10 days'::interval)),
  hora time without time zone NOT NULL,
  estado character varying DEFAULT 'abierta'::character varying CHECK (estado::text = ANY (ARRAY['abierta'::character varying::text, 'cerrada'::character varying::text, 'finalizada'::character varying::text])),
  subastador bigint,
  ubicacion character varying,
  capacidadasistentes integer,
  tienedeposito boolean,
  seguridadpropia boolean,
  categoria character varying CHECK (categoria::text = ANY (ARRAY['comun'::character varying::text, 'especial'::character varying::text, 'plata'::character varying::text, 'oro'::character varying::text, 'platino'::character varying::text])),
  moneda character varying NOT NULL CHECK (moneda::text = ANY (ARRAY['ARS'::character varying::text, 'USD'::character varying::text])),
  url_streaming character varying,
  catalogo bigint,
  CONSTRAINT subastas_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES public.subastadores(identificador),
  CONSTRAINT subastas_catalogo_fkey FOREIGN KEY (catalogo) REFERENCES public.catalogos(identificador)
);
CREATE TABLE public.catalogos (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  descripcion character varying NOT NULL,
  responsable bigint NOT NULL,
  subasta bigint,
  CONSTRAINT catalogos_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES public.empleados(identificador)
);
CREATE TABLE public.itemscatalogo (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  catalogo bigint NOT NULL,
  producto bigint NOT NULL,
  numeropieza integer,
  preciobase numeric NOT NULL CHECK (preciobase > 0.01),
  comision numeric NOT NULL CHECK (comision > 0.01),
  subastado boolean DEFAULT false,
  estado_acuerdo character varying DEFAULT 'propuesto'::character varying CHECK (estado_acuerdo::text = ANY (ARRAY['propuesto'::character varying, 'aceptado'::character varying, 'rechazado'::character varying]::text[])),
  cierre_programado timestamp with time zone,
  CONSTRAINT itemscatalogo_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_itemscatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES public.catalogos(identificador),
  CONSTRAINT fk_itemscatalogo_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador)
);
CREATE TABLE public.asistentes (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  numeropostor integer NOT NULL,
  cliente bigint NOT NULL,
  subasta bigint NOT NULL,
  rol character varying DEFAULT 'espectador'::character varying CHECK (rol::text = ANY (ARRAY['postor'::character varying, 'espectador'::character varying]::text[])),
  conectado boolean DEFAULT true,
  fecha_conexion timestamp with time zone DEFAULT now(),
  espectador boolean,
  CONSTRAINT asistentes_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador),
  CONSTRAINT fk_asistentes_subasta FOREIGN KEY (subasta) REFERENCES public.subastas(identificador)
);
CREATE TABLE public.pujos (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asistente bigint NOT NULL,
  item bigint NOT NULL,
  importe numeric NOT NULL CHECK (importe > 0.01),
  ganador boolean DEFAULT false,
  fecha timestamp with time zone DEFAULT now(),
  CONSTRAINT pujos_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_pujos_asistentes FOREIGN KEY (asistente) REFERENCES public.asistentes(identificador),
  CONSTRAINT fk_pujos_itemscatalogo FOREIGN KEY (item) REFERENCES public.itemscatalogo(identificador)
);
CREATE TABLE public.registrodesubasta (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subasta bigint NOT NULL,
  duenio bigint NOT NULL,
  producto bigint NOT NULL,
  cliente bigint,
  comprador_empresa boolean DEFAULT false,
  importe numeric NOT NULL CHECK (importe > 0.01),
  comision numeric NOT NULL CHECK (comision > 0.01),
  CONSTRAINT registrodesubasta_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_registrodesubasta_subastas FOREIGN KEY (subasta) REFERENCES public.subastas(identificador),
  CONSTRAINT fk_registrodesubasta_duenios FOREIGN KEY (duenio) REFERENCES public.duenios(identificador),
  CONSTRAINT fk_registrodesubasta_producto FOREIGN KEY (producto) REFERENCES public.productos(identificador),
  CONSTRAINT fk_registrodesubasta_cliente FOREIGN KEY (cliente) REFERENCES public.clientes(identificador)
);
CREATE TABLE public.compras (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente bigint NOT NULL,
  subasta bigint NOT NULL,
  producto bigint NOT NULL,
  medio_pago bigint,
  importe numeric NOT NULL,
  comision numeric NOT NULL,
  costo_envio numeric,
  total numeric NOT NULL,
  retiro_personal boolean DEFAULT false,
  direccion_envio bigint,
  estado_pago character varying DEFAULT 'pendiente'::character varying CHECK (estado_pago::text = ANY (ARRAY['pendiente'::character varying, 'pagado'::character varying, 'impago'::character varying]::text[])),
  fecha timestamp with time zone DEFAULT now(),
  CONSTRAINT compras_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_compras_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador),
  CONSTRAINT fk_compras_subastas FOREIGN KEY (subasta) REFERENCES public.subastas(identificador),
  CONSTRAINT fk_compras_productos FOREIGN KEY (producto) REFERENCES public.productos(identificador),
  CONSTRAINT fk_compras_medios_pago FOREIGN KEY (medio_pago) REFERENCES public.medios_pago(identificador),
  CONSTRAINT fk_compras_direcciones FOREIGN KEY (direccion_envio) REFERENCES public.direcciones(identificador)
);
CREATE TABLE public.multas (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente bigint NOT NULL,
  compra bigint,
  importe_original numeric NOT NULL,
  multa numeric NOT NULL,
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'pagada'::character varying::text, 'derivada'::character varying::text])),
  fecha_limite timestamp with time zone,
  CONSTRAINT multas_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_multas_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador),
  CONSTRAINT fk_multas_compras FOREIGN KEY (compra) REFERENCES public.compras(identificador)
);
CREATE TABLE public.notificaciones (
  identificador bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente bigint NOT NULL,
  titulo character varying NOT NULL,
  mensaje character varying NOT NULL,
  tipo character varying,
  leida boolean DEFAULT false,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (identificador),
  CONSTRAINT fk_notificaciones_clientes FOREIGN KEY (cliente) REFERENCES public.clientes(identificador)
);