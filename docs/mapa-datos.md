# Mapa de centros de datos: capas y datos

El mapa de `/mapa-de-centros-de-datos` usa Leaflet con capas superponibles. La
vista resumida del inicio sigue usando el mapa SVG ligero (`MapaCentros`).

**Alcance actual: México.** La hidrografía proviene de INEGI.

## Piezas

| Pieza                              | Dónde                                            |
| ---------------------------------- | ------------------------------------------------ |
| Mapa interactivo (vista completa)  | `src/components/mapa/MapaCentrosInteractivo.tsx` |
| Mapa Leaflet (capas, solo cliente) | `src/components/mapa/MapaLeaflet.tsx`            |
| Centros de Payload → GeoJSON       | `src/lib/geo/centrosGeoJSON.ts`                  |
| Capas de agua y ríos (estáticas)   | `public/geo/*.geojson`                           |
| Conversión de insumos de INEGI     | `scripts/convertir-inegi.sh`                     |
| Mapa resumido del inicio (SVG)     | `src/components/MapaCentros.tsx`                 |

## Capas

- **Base satelital:** Esri World Imagery (por defecto), Sentinel-2 cloudless de
  EOX, y un mapa claro de CARTO. Se alternan en el control de capas. Ninguna
  requiere llave de API; sólo atribución, ya incluida.
- **Cuerpos de agua (INEGI):** 1,090 polígonos perennes e intermitentes,
  ~300 KB, encendida por defecto.
- **Ríos (INEGI):** 6,067 corrientes perennes, ~1.1 MB, apagada por defecto
  (sólo se descarga al activarla).
- **Centros de datos:** marcadores reactivos derivados de los `centros` de
  Payload, coloreados por estado, filtrables por país y estado, con ficha y
  lista sincronizadas.

## Datos de INEGI

Fuente: **Conjunto de datos vectoriales de la serie topográfica escala
1:1 000 000** (INEGI), capas "Corriente de agua" y "Cuerpos de agua".
Descarga manual desde https://www.inegi.org.mx/temas/hidrografia/ (sección
Descargas). Los ZIP originales se conservan en `docs/insumos/inegi/` (fuera de
git por tamaño):

- `702825267698_s.zip` — corriente de agua (líneas)
- `702825267704_s.zip` — cuerpos de agua (polígonos)

Licencia: Términos de Libre Uso de la Información del INEGI. La atribución
"Hidrografía: INEGI, serie topográfica 1:1 000 000" aparece en el control de
atribución del mapa al activar esas capas.

### Conversión (reproducible)

`scripts/convertir-inegi.sh` hace todo: descomprime, reproyecta de cónica
conforme de Lambert (ITRF92) a WGS84 usando el `.prj`, filtra y simplifica con
mapshaper, y escribe los GeoJSON en `public/geo/`. Decisiones tomadas:

- **Cuerpos de agua:** se excluyen los 8 polígonos `TIPO = "Marítimo"` (el mar
  ya lo muestra el satélite y ese polígono abarca medio continente).
- **Ríos:** se conservan sólo los perennes; los 5,629 intermitentes duplican el
  peso y son ruido a escala nacional. Si se necesitan, están en el insumo.
- Simplificación `keep-shapes` (15% cuerpos, 10% ríos) y precisión de 3
  decimales (~100 m), suficiente para un mapa nacional.

Si INEGI publica una edición nueva, basta reemplazar los ZIP y volver a correr
el script.

## Si el alcance vuelve a ser LATAM

Para cubrir el resto de la región, añadir HydroLAKES y HydroRIVERS de
HydroSHEDS (libres con atribución, WGS84, cobertura continental homogénea) con
el mismo flujo de mapshaper, y devolver el centro y zoom del mapa a la vista
regional. INEGI quedaría como capa de detalle para México.

## Proveedores de tiles y producción

Ninguna capa base actual requiere licencia ni llave para desarrollo. Antes de
ir a producción con tráfico real, revisar los términos de CARTO y Esri (ver la
conversación de decisión) o cambiarlos por un proveedor con plan propio.

## Accesibilidad

El mapa de tiles es menos accesible que el SVG. Por eso la vista completa
mantiene la lista filtrable de centros junto al mapa, que funciona con teclado
y lector de pantalla como alternativa equivalente.
