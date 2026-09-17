import Link from "next/link";
import GridRecursos, { type Recurso } from "@/components/GridRecursos";
import MapaCentros from "@/components/MapaCentros";
import { publicaciones } from "@/data/publicaciones";
import { entradas } from "@/data/actualidad";

/** N1 - Inicio */
export default function Inicio() {
  // "Lo más reciente": mezcla de reportes, blog y artículos, como en el wireframe.
  const reportes = publicaciones
    .filter((p) => p.tipo === "reportes")
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      titulo: p.titulo,
      descripcion: p.descripcion,
      etiqueta: "Reportes",
      href: `/publicaciones/${p.slug}`,
    }));

  const blog = entradas
    .filter((e) => e.tipo === "blog")
    .slice(0, 4)
    .map((e) => ({
      slug: e.slug,
      titulo: e.titulo,
      descripcion: e.descripcion,
      etiqueta: "Blog",
      href: `/actualidad/${e.slug}`,
    }));

  const articulos = publicaciones
    .filter((p) => p.tipo === "articulos-y-libros")
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      titulo: p.titulo,
      descripcion: p.descripcion,
      etiqueta: "Artículos y libros",
      href: `/publicaciones/${p.slug}`,
    }));

  // Se intercalan los tres tipos para que cada fila muestre uno de cada uno,
  // como en el wireframe de Inicio.
  const recientes: Recurso[] = reportes.flatMap((reporte, i) => [reporte, blog[i], articulos[i]]);

  return (
    <>
      {/* Presentación */}
      <section className="relative overflow-hidden bg-cream py-24 sm:py-32">
        {/* Manchas de marca, enmascaradas sobre el fondo */}
        <div className="hero-pattern" aria-hidden />

        <div className="shell relative text-center">
          <h1 className="display t-h1 mx-auto max-w-[20ch]">
            Observatorio Latinoamericano de Centros de Datos
          </h1>
          <p className="t-lead mx-auto mt-6 max-w-[var(--lead-max)]">
            <strong>[Descripción corta]</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vel
            felis dapibus, convallis ligula ac, aliquet elit. Vivamus ornare leo non urna sollicitudin lacinia.
            Integer orci ex, consectetur at egestas nec, ultrices a lorem.
          </p>
          <Link href="/quienes-somos" className="pill pill-dark mt-12">
            Quiénes somos
          </Link>
        </div>
      </section>

      {/* Banner del mapa */}
      <section aria-labelledby="titulo-mapa">
        <h2 id="titulo-mapa" className="sr-only">
          Mapa de centros de datos
        </h2>
        <MapaCentros resumido />
        <div className="bg-slate-light pb-12 text-center">
          <Link href="/mapa-de-centros-de-datos" className="pill pill-dark">
            Ver el mapa completo
          </Link>
        </div>
      </section>

      {/* Lo más reciente */}
      <section className="bg-slate py-16" aria-labelledby="titulo-reciente">
        <div className="shell">
          <h2 id="titulo-reciente" className="display t-section text-cream">
            Reciente
          </h2>
          <div className="mt-10">
            <GridRecursos recursos={recientes} porPagina={3} tema="oscuro" etiquetaPaginacion="Paginación de lo más reciente" />
          </div>
        </div>
      </section>
    </>
  );
}
