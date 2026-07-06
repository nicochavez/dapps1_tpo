-- ============================================================================
-- BidFlow — Snippets SQL de prueba (opcionales, correr aparte del seed)
-- ----------------------------------------------------------------------------
-- Estos scripts NO forman parte del seed (docs/datos_de_prueba_BBDD.sql).
-- Copiá el bloque que necesites y ejecutalo suelto contra la base.
-- ============================================================================


-- ─── Activar la subasta #4 (UPCOMING) en 30 segundos ────────────────────────
-- Para probar el arranque LIVE en vivo. El scheduler corre cada 5s y la pasa de
-- 'programada' a 'abierta' al llegar la hora. Usa la misma convención de hora
-- Argentina que las subastas #1/#3 del seed.
-- (La #4 es categoría 'especial' / ARS con 1 lote: Guitarra Eléctrica. Para pujar
--  hace falta un usuario 'especial' o superior con medio de pago ARS verificado.)
--
-- Nota de zona horaria: el scheduler compara contra LocalDateTime.now() del server.
-- Si tu backend corre con reloj en UTC, cambiá 'America/Argentina/Buenos_Aires' por 'UTC'.
--
-- Se escribe como UPDATE plano (sin CTE 'WITH'): algunos editores SQL detectan el 'WITH'
-- inicial como un SELECT y le agregan un 'LIMIT' automático al final, que rompe el UPDATE
-- (error "syntax error at or near LIMIT"). CURRENT_TIMESTAMP es constante dentro de la misma
-- sentencia, así que evaluar la fecha y la hora por separado da el mismo instante.

UPDATE public.subastas
SET estado = 'programada',
    fecha  = ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires') + interval '30 seconds')::date,
    hora   = ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires') + interval '30 seconds')::time
WHERE identificador = 4;

-- Verificar cómo quedó:
-- SELECT identificador, estado, fecha, hora FROM public.subastas WHERE identificador = 4;
