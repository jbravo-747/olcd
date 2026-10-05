import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import PaginacionEnlaces from "@/components/PaginacionEnlaces";
import { IconoEnlace } from "@/components/Iconos";
import { buscarNoticias, listarCategorias } from "@/lib/cms/noticias";
import { nombresCategorias } from "@/lib/cms/util";

type ValorParametro = string | string[] | undefined;

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: ValorParametro; categoria?: ValorParametro; pagina?: ValorParametro }>;
};

/** Un parámetro repetido (`?q=a&q=b`) llega como arreglo: nos quedamos con el último. */
function unico(valor: ValorParametro): string {
  if (Array.isArray(valor)) return valor.at(-1) ?? "";
  return valor ?? "";
}

const flechaSelect =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231e2429' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "buscador" });
  return { title: t("titulo") };
}

/** N1 - Buscador de noticias: búsqueda y paginación en servidor, vía querystring. */
export default async function PaginaBuscador({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const parametros = await searchParams;
  const q = unico(parametros.q);
  const categoria = unico(parametros.categoria);
  const paginaPedida = Math.max(1, Number.parseInt(unico(parametros.pagina) || "1", 10) || 1);

  const [t, tComun, formato, categorias, primeraBusqueda] = await Promise.all([
    getTranslations("buscador"),
    getTranslations("comun"),
    getFormatter(),
    listarCategorias(locale),
    buscarNoticias({ q: q.trim(), categoria, pagina: paginaPedida, locale }),
  ]);

  // Si se pide una página más allá del total (p. ej. tras estrechar el filtro),
  // Payload devuelve 0 docs con totalDocs > 0: se reconsulta la última página
  // válida para no mostrar una lista vacía (auditoría Q-5).
  const totalPaginas = primeraBusqueda.totalPages || 1;
  const pagina = Math.min(paginaPedida, totalPaginas);
  const resultado =
    pagina === paginaPedida ? primeraBusqueda : await buscarNoticias({ q: q.trim(), categoria, pagina, locale });
  const sinResultados = resultado.docs.length === 0;

  const href = (n: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (categoria) qs.set("categoria", categoria);
    if (n > 1) qs.set("pagina", String(n));
    const cadena = qs.toString();
    return `/buscador-de-noticias${cadena ? `?${cadena}` : ""}`;
  };

  return (
    <>
      <section className="bg-slate py-20 text-cream">
        <div className="shell">
          <h1 className="display t-h1 text-center">{t("titulo")}</h1>

          <form
            method="get"
            className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            role="search"
            aria-label={t("filtros")}
          >
            <div>
              <label htmlFor="q" className="mb-2 block text-xs font-semibold text-cream/80">
                {t("palabraClave")}
              </label>
              <input id="q" name="q" type="search" defaultValue={q} className="field" placeholder={t("placeholder")} />
            </div>

            <div>
              <label htmlFor="categoria" className="mb-2 block text-xs font-semibold text-cream/80">
                {t("categoria")}
              </label>
              <select
                id="categoria"
                name="categoria"
                defaultValue={categoria}
                className="field appearance-none bg-[length:16px] bg-[right_1.25rem_center] bg-no-repeat pr-12"
                style={{ backgroundImage: flechaSelect }}
              >
                <option value="">{t("todasCategorias")}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="pill pill-dark px-6 py-3.5">
              {t("buscar")}
            </button>
          </form>
        </div>
      </section>

      <section className="bg-slate-light py-16">
        <div className="shell">
          <h2 className="display t-section text-cream">{t("noticias")}</h2>
          <p className="mt-2 text-sm text-cream/85" aria-live="polite">
            {tComun("resultados", { n: resultado.totalDocs })}
          </p>

          {sinResultados ? (
            <p className="mt-10 rounded-xl bg-cream p-8 text-center text-sm">{t("sinResultados")}</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resultado.docs.map((noticia) => {
                const fecha = new Date(noticia.fecha);
                return (
                  <li key={noticia.id} className="flex">
                    <article className="flex w-full flex-col overflow-hidden rounded-xl bg-cream shadow-sm">
                      <div className="relative bg-ink-soft p-5 pb-12 text-cream">
                        <h3 className="text-lg font-bold leading-snug">{noticia.titulo}</h3>
                        <a
                          href={noticia.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-4 right-5 text-cream/90 hover:text-cream"
                          aria-label={t("abrirNota", { medio: noticia.medio })}
                        >
                          <IconoEnlace />
                        </a>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <dl className="text-[13px] font-semibold">
                          <div className="border-b border-line py-2">
                            <dt className="sr-only">{t("medio")}</dt>
                            <dd>{noticia.medio}</dd>
                          </div>
                          <div className="border-b border-line py-2">
                            <dt className="sr-only">{t("fecha")}</dt>
                            <dd>
                              <time dateTime={noticia.fecha}>{formato.dateTime(fecha, { dateStyle: "full" })}</time>
                            </dd>
                          </div>
                          <div className="border-b border-line py-2">
                            <dt className="sr-only">{t("hora")}</dt>
                            <dd>{formato.dateTime(fecha, { timeStyle: "short", timeZone: "UTC" })} GMT</dd>
                          </div>
                        </dl>

                        <ul className="mt-4 flex flex-wrap gap-2">
                          {nombresCategorias(noticia.categorias).map((c) => (
                            <li key={c}>
                              <span className="tag">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          <PaginacionEnlaces
            pagina={pagina}
            total={totalPaginas}
            href={href}
            etiqueta={t("paginacion")}
            etiquetaPagina={(n) => tComun("pagina", { n })}
            etiquetaSiguiente={tComun("paginaSiguiente")}
          />
        </div>
      </section>
    </>
  );
}
