import type { Centro } from "@/payload-types";

/**
 * Convierte los centros de datos de Payload en una FeatureCollection GeoJSON,
 * la forma que consumen Leaflet/MapLibre como una capa más del mapa.
 */

export type PropsCentro = {
  id: number | string;
  nombre: string;
  ciudad: string | null;
  pais: string | null;
  empresa: string | null;
  estado: Centro["estado"];
  inversionUsdMillones: number | null;
};

export type FeatureCentro = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  properties: PropsCentro;
};

export type CentrosGeoJSON = {
  type: "FeatureCollection";
  features: FeatureCentro[];
};

export function centrosAGeoJSON(centros: Centro[]): CentrosGeoJSON {
  return {
    type: "FeatureCollection",
    features: centros
      .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
      .map((c) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
        properties: {
          id: c.id,
          nombre: c.nombre,
          ciudad: c.ciudad ?? null,
          pais: c.pais ?? null,
          empresa: c.empresa ?? null,
          estado: c.estado,
          inversionUsdMillones: c.inversionUsdMillones ?? null,
        },
      })),
  };
}

/** Color por estado del centro (coincide con los tokens del mapa SVG). */
export const COLOR_ESTADO: Record<Centro["estado"], string> = {
  "en-operacion": "#1e2429",
  "en-construccion": "#b84600",
  anunciado: "#00707a",
};
