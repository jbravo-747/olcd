/** Tipos del dataset de centros de datos recopilado de medios periodísticos
 * (src/datos/datacenters-prensa.json, generado por
 * scripts/generar_datacenters_prensa.py). */

export type EstadoCentro = "en-operacion" | "en-construccion" | "anunciado";

export type NotaPrensa = {
  url: string;
  medio: string;
};

export type MencionPrensa = {
  anio: number;
  fecha: string | null;
  accion: string | null;
  monto: string | null;
  ubicacionFuente: string | null;
  notas: NotaPrensa[];
};

export type CentroPrensa = {
  id: string;
  empresa: string;
  nombre: string | null;
  municipio: string | null;
  entidad: string;
  lat: number;
  lng: number;
  /** "municipio" = cabecera municipal aproximada; "entidad" = punto representativo del estado. */
  precision: "municipio" | "entidad";
  estado: EstadoCentro;
  ultimaAccion: string | null;
  ultimoAnio: number;
  menciones: MencionPrensa[];
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
    totalMenciones: number;
    aniosCubiertos: [number, number];
    medios: MedioResumen[];
    sinUbicacion: unknown[];
  };
  centros: CentroPrensa[];
};
