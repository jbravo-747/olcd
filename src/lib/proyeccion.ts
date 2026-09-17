/**
 * Proyección Mercator recortada a América Latina.
 *
 * La usan tanto el trazo de los países (`latam.json`, en pares [lng, lat])
 * como los marcadores de los centros de datos, de modo que ambos caen en el
 * mismo sistema de coordenadas del SVG.
 */

export const LIMITES = {
  lngMin: -118,
  lngMax: -34,
  latMin: -56,
  latMax: 33,
};

/** Y de Mercator para una latitud en grados. */
function mercatorY(lat: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const Y_MIN = mercatorY(LIMITES.latMin);
const Y_MAX = mercatorY(LIMITES.latMax);

const RANGO_LNG_RAD = ((LIMITES.lngMax - LIMITES.lngMin) * Math.PI) / 180;

export const ANCHO = 1000;
// El eje Y de Mercator está en radianes, así que el ancho también debe medirse
// en radianes para que el mapa no salga aplastado.
export const ALTO = Math.round((ANCHO * (Y_MAX - Y_MIN)) / RANGO_LNG_RAD);

/** Convierte (lat, lng) en coordenadas del viewBox `0 0 ANCHO ALTO`. */
export function proyectar(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LIMITES.lngMin) / (LIMITES.lngMax - LIMITES.lngMin)) * ANCHO;
  const y = ((Y_MAX - mercatorY(lat)) / (Y_MAX - Y_MIN)) * ALTO;
  return { x, y };
}

/** Convierte un anillo de coordenadas [lng, lat] en un atributo `d` de SVG. */
export function anilloAPath(anillo: number[][]): string {
  return (
    anillo
      .map(([lng, lat], i) => {
        const { x, y } = proyectar(lat, lng);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("") + "Z"
  );
}
