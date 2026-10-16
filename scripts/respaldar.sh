#!/usr/bin/env bash
# Respalda todo lo necesario para levantar el sitio en otro despliegue:
#   ./scripts/respaldar.sh            → ~/respaldos-olcd/olcd-AAAA-MM-DD-HHMM.tar.gz
#
# El archivo contiene la base de Postgres (contenido, usuarios y mensajes de
# contacto), los archivos del bucket de MinIO (fotos, logos, PDF) y el commit
# del código. No incluye .env: cada servidor tiene sus propios secretos y URLs.
# Conserva los últimos RESPALDOS_CONSERVAR respaldos (14 por omisión).
# Se carga con ./scripts/restaurar.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

RESPALDOS="${RESPALDOS:-$HOME/respaldos-olcd}"
CONSERVAR="${RESPALDOS_CONSERVAR:-14}"
nombre="olcd-$(date +%F-%H%M)"

mkdir -p "$RESPALDOS"
chmod 700 "$RESPALDOS"
trabajo="$(mktemp -d)"
trap 'rm -rf "$trabajo"' EXIT
mkdir -p "$trabajo/$nombre/archivos"

# Arranca db y minio si están detenidos, sin recrear los que ya corren.
docker compose up -d --no-recreate --wait db minio >/dev/null

echo "==> Base de datos"
docker compose exec -T db pg_dump -U olcd -d olcd --format=custom --no-owner > "$trabajo/$nombre/base.dump"

echo "==> Archivos de MinIO"
docker compose run --rm --no-deps -T --user "$(id -u):$(id -g)" -e MC_CONFIG_DIR=/tmp/mc \
  -v "$trabajo/$nombre/archivos:/respaldo" --entrypoint sh minio-init -c '
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null &&
    mc mirror --quiet local/olcd /respaldo
  '

git log -1 --format='%H %s' > "$trabajo/$nombre/commit.txt"

tar -czf "$RESPALDOS/$nombre.tar.gz" -C "$trabajo" "$nombre"
chmod 600 "$RESPALDOS/$nombre.tar.gz"
echo "    $RESPALDOS/$nombre.tar.gz ($(du -h "$RESPALDOS/$nombre.tar.gz" | cut -f1)," \
  "$(find "$trabajo/$nombre/archivos" -type f | wc -l) archivos)"

ls -1t "$RESPALDOS"/olcd-*.tar.gz | tail -n +"$((CONSERVAR + 1))" | xargs -r rm --
