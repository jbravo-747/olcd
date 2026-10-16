#!/usr/bin/env bash
# Carga un respaldo de ./scripts/respaldar.sh en este despliegue:
#   ./scripts/restaurar.sh ~/respaldos-olcd/olcd-AAAA-MM-DD-HHMM.tar.gz
#
# REEMPLAZA la base y los archivos actuales por los del respaldo. Sirve para
# levantar un servidor nuevo (en lugar del seed) o para volver a un respaldo.
# El código debe ser igual o más nuevo que el del respaldo: las migraciones
# pendientes se aplican al arrancar la app.
set -euo pipefail
cd "$(dirname "$0")/.."

respaldo="${1:?Uso: ./scripts/restaurar.sh <respaldo.tar.gz> [--si]}"
[ -f "$respaldo" ] || { echo "No existe $respaldo" >&2; exit 1; }

trabajo="$(mktemp -d)"
trap 'rm -rf "$trabajo"' EXIT
tar -xzf "$respaldo" -C "$trabajo"
dir="$(find "$trabajo" -mindepth 1 -maxdepth 1 -type d | head -1)"
[ -f "$dir/base.dump" ] || { echo "El respaldo no contiene base.dump" >&2; exit 1; }

commit_respaldo="$(cut -d' ' -f1 "$dir/commit.txt")"
echo "Respaldo del código $(cut -c1-7 <<<"$commit_respaldo"); este servidor está en $(git log -1 --format=%h)."
if git cat-file -e "$commit_respaldo^{commit}" 2>/dev/null &&
  ! git merge-base --is-ancestor "$commit_respaldo" HEAD; then
  echo "AVISO: el respaldo viene de un código más nuevo que el de este servidor." >&2
  echo "Actualiza el código (git pull) antes de restaurar." >&2
  exit 1
fi

if [ "${2:-}" != "--si" ]; then
  read -r -p "Esto reemplaza la base y los archivos de este despliegue. Escribe RESTAURAR: " ok
  [ "$ok" = "RESTAURAR" ] || { echo "Cancelado."; exit 1; }
fi

echo "==> Deteniendo la app"
docker compose stop app 2>/dev/null || true
docker compose up -d --wait db minio >/dev/null
docker compose run --rm -T minio-init >/dev/null

echo "==> Base de datos"
docker compose exec -T db psql -q -U olcd -d olcd -v ON_ERROR_STOP=1 \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose exec -T db pg_restore -U olcd -d olcd --no-owner --exit-on-error < "$dir/base.dump"
# Marca del modo push de desarrollo: en producción Payload se detendría a preguntar.
docker compose exec -T db psql -q -U olcd -d olcd -c "DELETE FROM payload_migrations WHERE name = 'dev';"

echo "==> Archivos de MinIO"
docker compose run --rm -T --user "$(id -u):$(id -g)" -e MC_CONFIG_DIR=/tmp/mc \
  -v "$dir/archivos:/respaldo:ro" --entrypoint sh minio-init -c '
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null &&
    mc mirror --quiet --overwrite --remove /respaldo local/olcd
  '

echo "==> Arrancando la app (aplica migraciones pendientes)"
docker compose up -d --build --force-recreate app
echo "Listo: restaurado $(basename "$respaldo")."
