#!/usr/bin/env bash
# Despliega en el servidor el último main de GitHub: ./scripts/desplegar.sh
#
# - Sólo avanza si el servidor no tiene cambios ni commits propios: el código
#   se edita en el repo y se sube a GitHub, nunca en el servidor.
# - Respalda base y archivos antes de tocar nada (scripts/respaldar.sh).
# - Los textos institucionales, el equipo y los labs (src/contenido) llegan
#   con el código. Lo del CMS se edita en /admin y el despliegue no lo toca; el
#   seed (docker compose run --rm seed) sólo se usa una vez, en una base nueva.
set -euo pipefail
cd "$(dirname "$0")/.."

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
  ./scripts/respaldar.sh
else
  echo "    la base no está corriendo (primer despliegue): sin respaldo"
fi

echo "==> Construcción y arranque (las migraciones se aplican al arrancar)"
docker compose up -d --build

echo "Listo: $(git log -1 --format='%h')"
