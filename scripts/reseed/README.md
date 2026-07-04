# Reseed de la base (demo)

Resetea la base de producción (Railway) a los datos de prueba. Sirve para la
presentación: deja las subastas #1 y #3 como `programada` con hora = próximo
minuto, así el scheduler las pasa a **LIVE** y se puede mostrar el flujo en vivo.

## Preparación (una sola vez, ANTES de presentar)

1. Instalá las dependencias:
   ```bash
   cd scripts/reseed
   npm install
   ```
2. Creá el archivo `db_url.txt` en esta carpeta con la connection string pública
   del Postgres de Railway (una sola línea). La sacás de:
   **Railway → servicio Postgres → Variables → `DATABASE_PUBLIC_URL`**.
   ```
   postgresql://postgres:PASSWORD@host.proxy.rlwy.net:PUERTO/railway
   ```
   > `db_url.txt` está gitignoreado: no se sube al repo.

## Durante la presentación

Cada vez que quieras resetear las subastas:

- **Windows**: doble clic en `reseed.bat`
- **Linux / Ubuntu**:
  ```bash
  cd scripts/reseed
  chmod +x reseed.sh   # solo la primera vez, si hace falta
  ./reseed.sh
  ```
- **Cualquier SO (terminal)**:
  ```bash
  cd scripts/reseed
  npm run seed
  ```

Tarda un par de segundos. Después esperá a que el reloj cambie de minuto y
refrescá la app: las subastas #1 y #3 aparecen LIVE.

## Usuarios de prueba (password de todos: `comun123`)

Login por documento. Ej: `40000013` (cliente oro, ganador), `50000020` (dueño),
`30000001` (empleado/admin).
