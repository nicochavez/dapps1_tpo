#!/usr/bin/env bash
# Resetea la base durante la demo (Linux / Ubuntu). Equivalente a reseed.bat.
#
# Uso:
#   cd scripts/reseed
#   ./reseed.sh          (o: bash reseed.sh)
#
# Requiere Node.js instalado y el archivo db_url.txt en esta carpeta
# (o la variable de entorno DATABASE_URL).
set -e

# Ubicarse en la carpeta del script, sin importar desde dónde se ejecute.
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Instalando dependencias (solo la primera vez)..."
  npm install
fi

node reseed.js
