/**
 * Centros de datos del mapa interactivo (sección 4 del árbol de navegación).
 *
 * Datos de muestra para la maqueta: las coordenadas son reales (ciudad), pero
 * empresas, montos y estados son ilustrativos y deben sustituirse por el
 * registro del Observatorio.
 */

export type EstadoCentro = "En operación" | "En construcción" | "Anunciado";

export type Centro = {
  id: string;
  nombre: string;
  ciudad: string;
  pais: string;
  empresa: string;
  estado: EstadoCentro;
  inversion: string;
  lat: number;
  lng: number;
};

export const centros: Centro[] = [
  { id: "qro-1", nombre: "Campus Querétaro I", ciudad: "Querétaro", pais: "México", empresa: "CloudHQ", estado: "En construcción", inversion: "USD 4,800 M", lat: 20.59, lng: -100.39 },
  { id: "qro-2", nombre: "Campus El Marqués", ciudad: "Querétaro", pais: "México", empresa: "ODATA", estado: "En operación", inversion: "USD 1,200 M", lat: 20.7, lng: -100.25 },
  { id: "mex-1", nombre: "Data Center Valle de México", ciudad: "Ciudad de México", pais: "México", empresa: "Ascenty", estado: "En operación", inversion: "USD 600 M", lat: 19.43, lng: -99.13 },
  { id: "pty-1", nombre: "Campus Ciudad de Panamá", ciudad: "Ciudad de Panamá", pais: "Panamá", empresa: "Cirion", estado: "En operación", inversion: "USD 150 M", lat: 8.98, lng: -79.52 },
  { id: "bog-1", nombre: "Campus Bogotá", ciudad: "Bogotá", pais: "Colombia", empresa: "Scala", estado: "Anunciado", inversion: "USD 350 M", lat: 4.71, lng: -74.07 },
  { id: "lim-1", nombre: "Campus Lima", ciudad: "Lima", pais: "Perú", empresa: "ODATA", estado: "En construcción", inversion: "USD 280 M", lat: -12.05, lng: -77.04 },
  { id: "for-1", nombre: "Campus Fortaleza", ciudad: "Fortaleza", pais: "Brasil", empresa: "Cirion", estado: "En operación", inversion: "USD 400 M", lat: -3.73, lng: -38.52 },
  { id: "sao-1", nombre: "Campus São Paulo", ciudad: "São Paulo", pais: "Brasil", empresa: "Scala", estado: "En operación", inversion: "USD 2,100 M", lat: -23.55, lng: -46.63 },
  { id: "rio-1", nombre: "Campus Río de Janeiro", ciudad: "Río de Janeiro", pais: "Brasil", empresa: "ODATA", estado: "En construcción", inversion: "USD 900 M", lat: -22.91, lng: -43.17 },
  { id: "scl-1", nombre: "Campus Quilicura", ciudad: "Santiago", pais: "Chile", empresa: "Google", estado: "En construcción", inversion: "USD 200 M", lat: -33.37, lng: -70.73 },
  { id: "bue-1", nombre: "Campus Buenos Aires", ciudad: "Buenos Aires", pais: "Argentina", empresa: "Ascenty", estado: "Anunciado", inversion: "USD 480 M", lat: -34.6, lng: -58.38 },
  { id: "mvd-1", nombre: "Campus Canelones", ciudad: "Canelones", pais: "Uruguay", empresa: "Meta", estado: "En operación", inversion: "USD 800 M", lat: -34.52, lng: -56.28 },
];

export const paises = [...new Set(centros.map((c) => c.pais))].sort();

export const estados: EstadoCentro[] = ["En operación", "En construcción", "Anunciado"];

/** Color del marcador según el estado del proyecto. */
export const colorEstado: Record<EstadoCentro, string> = {
  "En operación": "#1e2429",
  "En construcción": "#7a6a4f",
  Anunciado: "#f5f1e9",
};
