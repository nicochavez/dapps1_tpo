// Re-siembra la base de datos de producción (Railway) con los datos de prueba.
// Uso durante la presentación: resetea las subastas a "programada" con hora =
// próximo minuto, para que el scheduler las pase a LIVE y se pueda mostrar el flujo.
//
//   node reseed.js            (lee la URL de db_url.txt o de la env DATABASE_URL)
//
// La connection string sale de:
//   1) la variable de entorno DATABASE_URL, si está seteada; o
//   2) el archivo db_url.txt en esta carpeta (una sola línea, gitignoreado).

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim();
  const f = path.join(__dirname, 'db_url.txt');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  console.error('ERROR: definí DATABASE_URL o creá db_url.txt con la DATABASE_PUBLIC_URL de Railway.');
  process.exit(1);
}

const seedFile = path.join(__dirname, '..', '..', 'docs', 'datos_de_prueba_BBDD.txt');

(async () => {
  const client = new Client({ connectionString: getConnectionString() });
  const t0 = Date.now();
  try {
    console.log('Conectando a la base...');
    await client.connect();

    // Columnas legacy que el seed usa pero las entidades actuales ya no mapean.
    // IF NOT EXISTS => idempotente. Hibernate las ignora.
    await client.query(`
      ALTER TABLE public.seguros     ADD COLUMN IF NOT EXISTS contacto        varchar;
      ALTER TABLE public.seguros     ADD COLUMN IF NOT EXISTS telefono        varchar;
      ALTER TABLE public.productos   ADD COLUMN IF NOT EXISTS estado_revision varchar;
      ALTER TABLE public.catalogos   ADD COLUMN IF NOT EXISTS subasta         bigint;
      ALTER TABLE public.asistentes  ADD COLUMN IF NOT EXISTS rol             varchar;
      ALTER TABLE public.asistentes  ADD COLUMN IF NOT EXISTS conectado       boolean;
      ALTER TABLE public.medios_pago ADD COLUMN IF NOT EXISTS banco           varchar;
    `);

    // TRUNCATE dinámico sobre las tablas que existen (a prueba de drift de esquema).
    const tbls = (await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'"
    )).rows.map(r => `public.${r.tablename}`);
    let sql = fs.readFileSync(seedFile, 'utf8');
    sql = sql.replace(
      /TRUNCATE TABLE[\s\S]*?RESTART IDENTITY CASCADE;/,
      `TRUNCATE TABLE ${tbls.join(', ')} RESTART IDENTITY CASCADE;`
    );

    console.log('Sembrando datos...');
    await client.query(sql);

    const n = (q) => client.query(q).then(r => r.rows[0].n);
    const personas = await n('SELECT count(*) n FROM public.personas');
    const subastas = await n('SELECT count(*) n FROM public.subastas');
    console.log(`\n✅ Base reseteada en ${((Date.now() - t0) / 1000).toFixed(1)}s  (personas=${personas}, subastas=${subastas})`);
    console.log('   Las subastas #1 y #3 pasan a LIVE en el próximo cambio de minuto.');
    console.log('   Esperá a que el reloj marque el minuto siguiente y refrescá la app.\n');
  } catch (err) {
    console.error('\n❌ Error:', err.message, '\n');
    process.exit(1);
  } finally {
    await client.end();
  }
})();
