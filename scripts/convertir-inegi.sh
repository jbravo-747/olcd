#!/usr/bin/env bash
# Convierte los conjuntos vectoriales de INEGI (serie topográfica 1:1 000 000)
# a las capas GeoJSON del mapa. Reproducible: basta volver a correrlo si INEGI
# publica una edición nueva.
#
# Insumos (descarga manual desde https://www.inegi.org.mx/temas/hidrografia/):
#   docs/insumos/inegi/702825267698_s.zip  → corriente de agua (ríos, líneas)
#   docs/insumos/inegi/702825267704_s.zip  → cuerpos de agua (polígonos)
#
# Salidas:
#   public/geo/rios-mx.geojson         (sólo ríos perennes, ~1.1 MB)
#   public/geo/cuerpos-agua-mx.geojson (sin polígonos marítimos, ~300 KB)
#
# Los shapefiles vienen en cónica conforme de Lambert (ITRF92/GRS80); mapshaper
# los reproyecta a WGS84 con el .prj incluido.
set -euo pipefail
cd "$(dirname "$0")/.."

TRABAJO=$(mktemp -d)
trap 'rm -rf "$TRABAJO"' EXIT

unzip -q docs/insumos/inegi/702825267698_s.zip -d "$TRABAJO/rios_ext"
unzip -q docs/insumos/inegi/702825267704_s.zip -d "$TRABAJO/cuerpos_ext"
unzip -q "$TRABAJO/rios_ext/conjunto_de_datos/"cdv_serietopo_1_1_000_000_corrienteagua.zip -d "$TRABAJO/rios"
unzip -q "$TRABAJO/cuerpos_ext/conjunto_de_datos/"cdv_serietopo_1_1_000_000_cuerposagua.zip -d "$TRABAJO/cuerpos"

# Cuerpos de agua: fuera los 8 polígonos "Marítimo" (el mar ya lo da el satélite).
npx -y mapshaper -i "$TRABAJO/cuerpos/cuerposagua.shp" \
  -filter 'TIPO !== "Marítimo"' \
  -proj wgs84 \
  -simplify 15% keep-shapes \
  -filter-fields TIPO \
  -o public/geo/cuerpos-agua-mx.geojson force precision=0.001 format=geojson

# Ríos: sólo la red perenne (los intermitentes duplican el peso y son ruido a
# escala nacional; están en el insumo si algún día se quieren).
npx -y mapshaper -i "$TRABAJO/rios/corrienteagua.shp" \
  -filter 'TIPO === "Perenne"' \
  -proj wgs84 \
  -simplify 10% keep-shapes \
  -filter-fields TIPO \
  -o public/geo/rios-mx.geojson force precision=0.001 format=geojson

ls -la public/geo/
