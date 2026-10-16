#!/usr/bin/env bash
# Despliega en el servidor el último main de GitHub: ./scripts/desplegar.sh
#
# - Sólo avanza si el servidor no tiene cambios ni commits propios: el código
#   se edita en el repo y se sube a GitHub, nunca en el servidor.
# - Respalda la base antes de tocar nada (en ~/respaldos-olcd).
# - No toca el contenido: se edita en /admin. El seed (docker compose run --rm
#   seed) sólo se usa una vez, para llenar una base nueva.
set -euo pipefail
cd "$(dirname "$0")/.."

RESPALDOS="${RESPALDOS:-$HOME/respaldos-olcd}"

echo "==> Código"
if ! git diff --quiet HEAD --; then
  echo "ERROR: hay archivos del repo modificados en el servidor:" >&2
  git status --short --untracked-files=no >&2
  echo "Súbelos a GitHub desde tu equipo o descártalos (git restore <archivo>)." >&2
  echo "La configuración propia del servidor va en .env o docker-compose.override.yml." >&2
  exit 1
fi
git fetch --quiet origin main
if ! git merge-base --is-ancestor HEAD origin/main; then
  echo "ERROR: el main del servidor tiene commits que no están en GitHub:" >&2
  git log --oneline origin/main..HEAD >&2
  echo "Súbelos (git push) o descártalos antes de desplegar." >&2
  exit 1
fi
git merge --quiet --ff-only origin/main
echo "    main en $(git log -1 --format='%h %s')"

echo "==> Respaldo"
if docker compose ps --status running --services | grep -qx db; then
  mkdir -p "$RESPALDOS"
  archivo="$RESPALDOS/olcd-$(date +%F-%H%M).sql.gz"
  docker compose exec -T db pg_dump -U olcd olcd | gzip > "$archivo"
  echo "    $archivo ($(du -h "$archivo" | cut -f1))"
else
  echo "    la base no está corriendo (primer despliegue): sin respaldo"
fi

echo "==> Construcción y arranque (las migraciones se aplican al arrancar)"
docker compose up -d --build

echo "Listo: $(git log -1 --format='%h')"
