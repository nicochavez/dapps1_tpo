-- ============================================================================
-- BidFlow — Datos semilla mínimos
-- ----------------------------------------------------------------------------
-- Ejecutar DESPUÉS de docs/newErd.sql y ANTES de levantar el backend.
--
-- Por qué hace falta: ahora las FKs existen en la base. El backend, al
-- registrar un cliente, fija clientes.verificador = 2 (AuthService.VERIFICADOR_SISTEMA_ID),
-- que referencia empleados(identificador) -> personas(identificador). Sin esa
-- fila, el registro falla por violación de FK.
--
-- Es idempotente: se puede correr varias veces sin duplicar.
-- ============================================================================

-- País por defecto usado por el registro (ClienteEntity.numeroPais = 32).
INSERT INTO public.paises (numero, nombre, nombrecorto, capital, nacionalidad, idiomas)
VALUES (32, 'Argentina', 'AR', 'Buenos Aires', 'argentina', 'es')
ON CONFLICT (numero) DO NOTHING;

-- Verificador del sistema: persona + empleado con identificador = 2.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.empleados WHERE identificador = 2) THEN
    INSERT INTO public.personas (identificador, documento, nombre, apellido, estado_registro, estado)
    OVERRIDING SYSTEM VALUE
    VALUES (2, '00000002', 'Sistema', 'Verificador', 'aprobado', 'activo')
    ON CONFLICT (identificador) DO NOTHING;

    INSERT INTO public.empleados (identificador, cargo) VALUES (2, 'Verificador');

    -- Evita que la secuencia IDENTITY de personas vuelva a generar el id 2.
    PERFORM setval(pg_get_serial_sequence('public.personas', 'identificador'), 1000, true);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Login del administrador (rol EMPLEADO) para los endpoints /api/v1/admin/**.
-- ----------------------------------------------------------------------------
-- El empleado verificador (identificador = 2) ya otorga ROLE_EMPLEADO; solo le
-- falta una fila en `usuarios` con credenciales para poder loguearse.
--
-- IMPORTANTE: `password_hash` DEBE ser un hash BCrypt (empieza con $2a/$2b/$2y),
-- porque el backend valida con BCryptPasswordEncoder.matches(). NO sirve la clave
-- en texto plano ni un token JWT. Para generar el tuyo:
--   python3 -c "import bcrypt;print(bcrypt.hashpw(b'TU_CLAVE',bcrypt.gensalt(10)).decode())"
--   # o:  htpasswd -bnBC 10 '' 'TU_CLAVE'   (usar la parte después de los ':')
--
-- El hash de abajo corresponde a la clave  'admin1234'.
-- Login:  POST /api/v1/auth/login  { "documento": "00000002", "contrasenia": "admin1234" }
INSERT INTO public.usuarios (persona, email, password_hash, activo)
VALUES (2, 'admin@bidflow.com', '$2b$10$OsMvisp.W7uQZ7pBWf7Nj.RWKYnWyHy38/l05YTLVK9cUGxp1oWTi', true)
ON CONFLICT (persona) DO NOTHING;

-- ============================================================================
-- (OPCIONAL) Demo para probar el flujo de subasta/puja/adjudicación.
-- Crea: subastador, dueño, catálogo, producto con 6 fotos, subasta abierta e ítem.
-- Descomentar para usarlo. Tras correrlo, registrá un cliente por la API,
-- aprobalo (POST /api/v1/admin/clientes/{id}/aprobar) y conectate a la subasta.
-- ============================================================================
/*
DO $$
DECLARE
  v_subastador bigint;
  v_duenio     bigint;
  v_subasta    bigint;
  v_catalogo   bigint;
  v_producto   bigint;
BEGIN
  -- Subastador
  INSERT INTO public.personas (documento, nombre, apellido, estado_registro, estado)
  VALUES ('10000001', 'Rita', 'Remate', 'aprobado', 'activo')
  RETURNING identificador INTO v_subastador;
  INSERT INTO public.subastadores (identificador, matricula, region)
  VALUES (v_subastador, 'MAT-001', 'CABA');

  -- Dueño (consignante)
  INSERT INTO public.personas (documento, nombre, apellido, estado_registro, estado)
  VALUES ('10000002', 'Diego', 'Dueño', 'aprobado', 'activo')
  RETURNING identificador INTO v_duenio;
  INSERT INTO public.duenios (identificador, verificador)
  VALUES (v_duenio, 2);

  -- Subasta abierta (fecha debe superar hoy + 10 días por el CHECK del ERD)
  INSERT INTO public.subastas (fecha, hora, estado, subastador, ubicacion, categoria, moneda)
  VALUES (CURRENT_DATE + 15, '18:00', 'abierta', v_subastador, 'Sala Central', 'comun', 'ARS')
  RETURNING identificador INTO v_subasta;

  -- Catálogo de la subasta (responsable = empleado verificador)
  INSERT INTO public.catalogos (descripcion, subasta, responsable)
  VALUES ('Catálogo demo', v_subasta, 2)
  RETURNING identificador INTO v_catalogo;

  -- Producto con metadatos de arte (RF-15)
  INSERT INTO public.productos
    (duenio, revisor, fecha, disponible, descripcioncompleta, descripcioncatalogo,
     categoria, artista, fecha_obra, resena_historica, estado_revision)
  VALUES
    (v_duenio, 2, CURRENT_DATE, true, 'Óleo sobre tela 80x60', 'Paisaje al amanecer',
     'arte', 'A. Pintor', '1950', 'Pieza exhibida en 1955.', 'aceptado')
  RETURNING identificador INTO v_producto;

  -- 6 fotos (RF-14). bytea placeholder.
  INSERT INTO public.fotos (producto, foto)
  SELECT v_producto, decode('00', 'hex') FROM generate_series(1, 6);

  -- Ítem del catálogo
  INSERT INTO public.itemscatalogo (catalogo, producto, numeropieza, preciobase, comision, subastado)
  VALUES (v_catalogo, v_producto, 1, 1000.00, 100.00, false);
END $$;
*/
