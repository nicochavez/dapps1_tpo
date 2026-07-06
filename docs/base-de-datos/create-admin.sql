-- ============================================================================
-- BidFlow — Alta de un empleado administrador (rol EMPLEADO)
-- ----------------------------------------------------------------------------
-- Script independiente de docs/seed.sql: solo crea persona + empleado +
-- usuario para poder loguearse y acceder a /api/v1/admin/**. No depende de
-- paises ni de ninguna otra fila preexistente (no usa el identificador=2
-- reservado por seed.sql para el "Verificador del sistema").
--
-- password_hash DEBE ser un hash BCrypt ($2a/$2b/$2y), porque el backend
-- valida con BCryptPasswordEncoder.matches(). Para generar el tuyo:
--   python3 -c "import bcrypt;print(bcrypt.hashpw(b'TU_CLAVE',bcrypt.gensalt(10)).decode())"
--   # o:  htpasswd -bnBC 10 '' 'TU_CLAVE'   (usar la parte después de los ':')
--
-- El hash de abajo corresponde a la clave 'admin1234'. Cambiá documento /
-- email / hash antes de correrlo si no querés usar estos valores demo.
--
-- Es idempotente: si ya existe una persona con ese documento, no hace nada.
-- ============================================================================

DO $$
DECLARE
  v_documento     varchar := '00000099';
  v_email         varchar := 'administrador@bidflow.com';
  v_password_hash varchar := '$2b$10$OsMvisp.W7uQZ7pBWf7Nj.RWKYnWyHy38/l05YTLVK9cUGxp1oWTi'; -- 'admin1234'
  v_admin         bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM public.personas WHERE documento = v_documento) THEN
    RAISE NOTICE 'Ya existe una persona con documento %, no se crea nada.', v_documento;
    RETURN;
  END IF;

  INSERT INTO public.personas (documento, nombre, apellido, estado_registro, estado)
  VALUES (v_documento, 'Admin', 'BidFlow', 'aprobado', 'activo')
  RETURNING identificador INTO v_admin;

  INSERT INTO public.empleados (identificador, cargo)
  VALUES (v_admin, 'Administrador');

  INSERT INTO public.usuarios (persona, email, password_hash, activo)
  VALUES (v_admin, v_email, v_password_hash, true);

  RAISE NOTICE 'Empleado administrador creado: identificador=%, documento=%, email=%', v_admin, v_documento, v_email;
END $$;

-- Login:
--   POST /api/v1/auth/login
--   { "documento": "00000099", "contrasenia": "admin1234" }
