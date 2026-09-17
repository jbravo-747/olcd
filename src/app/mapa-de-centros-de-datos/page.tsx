import type { Metadata } from "next";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import MapaCentros from "@/components/MapaCentros";

export const metadata: Metadata = { title: "Mapa de centros de datos" };

/** Sección 4 del árbol de navegación: mapa interactivo. */
export default function PaginaMapa() {
  return (
    <>
      <EncabezadoPagina
        titulo="Mapa de centros de datos"
        descripcion="[Descripción corta] Registro colaborativo de los centros de datos anunciados, en construcción y en operación en América Latina."
      />
      <div className="bg-cream">
        <MapaCentros />
      </div>
    </>
  );
}
