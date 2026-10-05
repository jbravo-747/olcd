# Mapa de centros de datos: capas y datos

El mapa de `/mapa-de-centros-de-datos` usa Leaflet con capas superponibles. La
vista resumida del inicio sigue usando el mapa SVG ligero (`MapaCentros`).

## Piezas

| Pieza                              | Dónde                                            |
| ---------------------------------- | ------------------------------------------------ |
| Mapa interactivo (vista completa)  | `src/components/mapa/MapaCentrosInteractivo.tsx` |
| Mapa Leaflet (capas, solo cliente) | `src/components/mapa/MapaLeaflet.tsx`            |
| Centros de Payload → GeoJSON       | `src/lib/geo/centrosGeoJSON.ts`                  |
| Capas de agua y ríos (estáticas)   | `public/geo/*.geojson`                           |
| Mapa resumido del inicio (SVG)     | `src/components/MapaCentros.tsx`                 |

## Capas

- **Base satelital:** Esri World Imagery (por defecto), Sentinel-2 cloudless de EOX, y un mapa claro de CARTO. Se alternan en el control de capas.
- **Cuerpos de agua y ríos:** GeoJSON en `public/geo/`, overlays que se encienden y apagan.
- **Centros de datos:** marcadores reactivos derivados de los `centros` de Payload, coloreados por estado, filtrables por país y estado, con ficha y lista sincronizadas.

## Datos de agua: estado actual vs producción

**Hoy (provisional):** `public/geo/cuerpos-agua-latam.geojson` y `rios-latam.geojson`
son un recorte de Natural Earth (escala 1:50M) a Latinoamérica, con precisión
reducida. Son libres (dominio público) y sirven para toda la región, pero con
poco detalle.

**Producción (pendiente):** México en alta resolución desde INEGI y el resto de
la región desde HydroSHEDS.

### México — INEGI

1. Descargar de INEGI la Red Hidrográfica 1:50,000 y Cuerpos de Agua (shapefile):
   https://www.inegi.org.mx/temas/hidrologia/
2. Reproyectar a WGS84 y convertir a GeoJSON:
   ```bash
   ogr2ogr -f GeoJSON -t_srs EPSG:4326 cuerpos_mx.geojson cuerpos_agua_inegi.shp
   ```
3. Simplificar para la web (reduce vértices sin deformar):
   ```bash
   npx mapshaper cuerpos_mx.geojson -simplify 5% keep-shapes -o cuerpos_mx.min.geojson
   ```

### Resto de LATAM — HydroSHEDS

1. Descargar HydroLAKES (cuerpos de agua) y HydroRIVERS (ríos) de
   https://www.hydrosheds.org/products — ya vienen en WGS84.
2. Recortar a la región y a México-excluido para no duplicar con INEGI, y
   simplificar con `mapshaper` igual que arriba.

### Unir y publicar

Unir el GeoJSON de INEGI (México) con el de HydroSHEDS (resto) en
`public/geo/cuerpos-agua-latam.geojson` y `rios-latam.geojson`, reemplazando el
stand-in de Natural Earth. Mantener los archivos pequeños (idealmente < 1–2 MB
cada uno) simplificando y bajando la precisión de coordenadas.

## Atribución

Obligatoria y ya incluida en el control de atribución del mapa:

- Imágenes satelitales: Esri, Maxar, Earthstar Geographics; o Sentinel-2
  cloudless por EOX (datos Copernicus modificados).
- Mapa claro: OpenStreetMap y CARTO.
- Agua y ríos: Natural Earth hoy; al migrar, citar "Fuente: INEGI" y HydroSHEDS.

## Accesibilidad

El mapa de tiles es menos accesible que el SVG. Por eso la vista completa
mantiene la lista filtrable de centros junto al mapa, que funciona con teclado y
lector de pantalla como alternativa equivalente.
