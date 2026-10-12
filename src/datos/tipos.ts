/** Tipos del dataset de centros de datos recopilado de medios periodísticos
 * (src/datos/datacenters-prensa.json, generado por
 * scripts/generar_datacenters_prensa.py a partir del consolidado curado). */

export type EstadoCentro = "en-operacion" | "en-construccion" | "anunciado";

/** Semáforo de completitud de la información (umbrales del consolidado). */
export type Semaforo = "verde" | "amarillo" | "naranja" | "rojo";

export type NotaPrensa = {
  url: string;
  medio: string;
};

/** Una fase del proyecto según la prensa: "Febrero de 2025 (Inversión)". */
export type FaseCentro = {
  texto: string;
  anio: number | null;
  accion: string | null;
};

export type CentroPrensa = {
  id: string;
  /** Nombre del centro según el consolidado (p. ej. "AWS México Central"). */
  nombre: string;
  variacion: string | null;
  empresa: string;
  fases: {
    anuncio: FaseCentro | null;
    construccion: FaseCentro | null;
    expansion: FaseCentro | null;
  };
  monto: string | null;
  electricidad: string | null;
  tamano: string | null;
  enfriamiento: string | null;
  notas: NotaPrensa[];
  score: number;
  semaforo: Semaforo;
  ubicacionFuente: string;
  /** Claves geoestadísticas de INEGI del geocodificado del equipo. */
  cveEnt: string;
  cveMun: string | null;
  cvegeo: string | null;
  municipio: string | null;
  entidad: string;
  lat: number;
  lng: number;
  /** "municipio" = cabecera municipal aproximada; "entidad" = punto representativo del estado. */
  precision: "municipio" | "entidad";
  estado: EstadoCentro;
  ultimaAccion: string | null;
  ultimoAnio: number | null;
};

export type MedioResumen = {
  nombre: string;
  notas: number;
};

export type DatosPrensa = {
  meta: {
    generado: string;
    descripcion: string;
    fuente: string;
    totalCentros: number;
    totalNotas: number;
    aniosCubiertos: [number, number];
    medios: MedioResumen[];
    sinUbicacion: { nombre: string; empresa: string }[];
    umbralesSemaforo: { verde: number; amarillo: number; naranja: number };
  };
  centros: CentroPrensa[];
};
