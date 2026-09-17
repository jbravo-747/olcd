"use client";

import { useMemo, useState } from "react";
import GridRecursos, { type Recurso } from "./GridRecursos";

export type ItemExplorable = Recurso & { tipo: string };

export type Categoria = { slug: string; nombre: string; descripcion: string };

const flechaSelect =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231e2429' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/**
 * Encabezado con filtros + secciones por tipo.
 * Lo comparten Publicaciones (N1) y Actualidad (N1): misma estructura, distinto
 * catálogo.
 */
export default function ExploradorPublicaciones({
  titulo,
  etiquetaTipo,
  categorias,
  items,
}: {
  titulo: string;
  etiquetaTipo: string;
  categorias: Categoria[];
  items: ItemExplorable[];
}) {
  const [palabra, setPalabra] = useState("");
  const [tipo, setTipo] = useState("");

  const filtrando = palabra.trim() !== "" || tipo !== "";

  const resultados = useMemo(() => {
    const termino = palabra.trim().toLowerCase();
    return items.filter(
      (i) =>
        (!termino || i.titulo.toLowerCase().includes(termino) || i.descripcion.toLowerCase().includes(termino)) &&
        (!tipo || i.tipo === tipo),
    );
  }, [items, palabra, tipo]);

  return (
    <>
      <section className="bg-slate py-20 text-cream">
        <div className="shell">
          <h1 className="display t-h1 text-center">{titulo}</h1>

          <form
            className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
            role="search"
            aria-label={`Filtros de ${titulo.toLowerCase()}`}
          >
            <div>
              <label htmlFor="pub-palabra" className="mb-2 block text-xs font-semibold text-cream/80">
                Palabra Clave
              </label>
              <input
                id="pub-palabra"
                type="search"
                value={palabra}
                onChange={(e) => setPalabra(e.target.value)}
                className="field"
                placeholder="Buscar por título"
              />
            </div>
            <div>
              <label htmlFor="pub-tipo" className="mb-2 block text-xs font-semibold text-cream/80">
                {etiquetaTipo}
              </label>
              <select
                id="pub-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="field appearance-none bg-[length:16px] bg-[right_1.25rem_center] bg-no-repeat pr-12"
                style={{ backgroundImage: flechaSelect }}
              >
                <option value="">Todos</option>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </section>

      {filtrando ? (
        <section className="bg-cream py-16">
          <div className="shell">
            <h2 className="display t-section">Resultados</h2>
            <p className="mt-2 text-sm text-ink/70" aria-live="polite">
              {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="mt-10">
              {resultados.length === 0 ? (
                <p className="rounded-xl bg-cream-deep p-8 text-center text-sm">
                  No hay resultados para esta búsqueda.
                </p>
              ) : (
                <GridRecursos recursos={resultados} porPagina={9} etiquetaPaginacion="Paginación de resultados" />
              )}
            </div>
          </div>
        </section>
      ) : (
        categorias.map((categoria, i) => (
          <section
            key={categoria.slug}
            id={categoria.slug}
            className={`scroll-mt-20 py-16 ${i % 2 === 0 ? "bg-cream" : "bg-cream-deep"}`}
          >
            <div className="shell">
              <h2 className="display t-section">{categoria.nombre}</h2>
              <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{categoria.descripcion}</p>
              <div className="mt-10">
                <GridRecursos
                  recursos={items.filter((item) => item.tipo === categoria.slug)}
                  porPagina={9}
                  etiquetaPaginacion={`Paginación de ${categoria.nombre}`}
                />
              </div>
            </div>
          </section>
        ))
      )}
    </>
  );
}
