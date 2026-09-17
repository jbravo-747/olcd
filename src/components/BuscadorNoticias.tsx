"use client";

import { useMemo, useState } from "react";
import { categoriasNoticias, type Noticia } from "@/data/noticias";
import { IconoEnlace } from "./Iconos";
import Paginacion from "./Paginacion";

const POR_PAGINA = 9;

const flechaSelect =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231e2429' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/** N1 - Buscador de noticias: encabezado con filtros + rejilla de resultados. */
export default function BuscadorNoticias({ noticias }: { noticias: Noticia[] }) {
  const [palabra, setPalabra] = useState("");
  const [categoria, setCategoria] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termino = palabra.trim().toLowerCase();
    return noticias.filter((n) => {
      const coincideTexto =
        !termino || n.titulo.toLowerCase().includes(termino) || n.medio.toLowerCase().includes(termino);
      const coincideCategoria = !categoria || n.categorias.includes(categoria);
      return coincideTexto && coincideCategoria;
    });
  }, [noticias, palabra, categoria]);

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const visibles = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
      <section className="bg-slate py-20 text-cream">
        <div className="shell">
          <h1 className="display t-h1 text-center">Buscador de noticias</h1>

          <form
            className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
            role="search"
            aria-label="Filtros del buscador de noticias"
          >
            <div>
              <label htmlFor="palabra-clave" className="mb-2 block text-xs font-semibold text-cream/80">
                Palabra Clave
              </label>
              <input
                id="palabra-clave"
                type="search"
                value={palabra}
                onChange={(e) => {
                  setPalabra(e.target.value);
                  setPagina(1);
                }}
                className="field"
                placeholder="Buscar por título o medio"
              />
            </div>

            <div>
              <label htmlFor="categoria" className="mb-2 block text-xs font-semibold text-cream/80">
                Categoría
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setPagina(1);
                }}
                className="field appearance-none bg-[length:16px] bg-[right_1.25rem_center] bg-no-repeat pr-12"
                style={{ backgroundImage: flechaSelect }}
              >
                <option value="">Todas las categorías</option>
                {categoriasNoticias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </section>

      <section className="bg-slate-light py-16">
        <div className="shell">
          <h2 className="display t-section text-cream">Noticias</h2>
          <p className="mt-2 text-sm text-cream/85" aria-live="polite">
            {filtradas.length} {filtradas.length === 1 ? "resultado" : "resultados"}
          </p>

          {filtradas.length === 0 ? (
            <p className="mt-10 rounded-xl bg-cream p-8 text-center text-sm">
              No hay noticias que coincidan con la búsqueda.
            </p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((noticia) => (
                <li key={noticia.id} className="flex">
                  <article className="flex w-full flex-col overflow-hidden rounded-xl bg-cream shadow-sm">
                    <div className="relative bg-ink-soft p-5 pb-12 text-cream">
                      <h3 className="text-lg font-bold leading-snug">{noticia.titulo}</h3>
                      <a
                        href={noticia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-4 right-5 text-cream/90 hover:text-cream"
                        aria-label={`Abrir la nota original en ${noticia.medio}`}
                      >
                        <IconoEnlace />
                      </a>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <dl className="text-[13px] font-semibold">
                        <div className="border-b border-line py-2">
                          <dt className="sr-only">Medio</dt>
                          <dd>{noticia.medio}</dd>
                        </div>
                        <div className="border-b border-line py-2">
                          <dt className="sr-only">Fecha</dt>
                          <dd>{noticia.fecha}</dd>
                        </div>
                        <div className="border-b border-line py-2">
                          <dt className="sr-only">Hora</dt>
                          <dd>{noticia.hora}</dd>
                        </div>
                      </dl>

                      <ul className="mt-4 flex flex-wrap gap-2">
                        {noticia.categorias.map((c) => (
                          <li key={c}>
                            <span className="tag">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <Paginacion pagina={pagina} total={totalPaginas} onCambio={setPagina} etiqueta="Paginación de noticias" />
        </div>
      </section>
    </>
  );
}
