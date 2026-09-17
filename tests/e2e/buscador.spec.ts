import { expect, test, type APIRequestContext } from "@playwright/test";
import { mensajes, primerDocumento } from "./helpers";
// Tamaño de página del buscador; debe coincidir con POR_PAGINA en src/lib/cms/noticias.ts
// (no se importa porque ese módulo arrastra next/cache y Payload).
const POR_PAGINA = 9;

/**
 * E8 - Buscador de noticias: búsqueda por querystring, contador de resultados,
 * mensaje sin resultados y paginación por enlaces.
 */

const t = mensajes.es.buscador;
const tComun = mensajes.es.comun;

/** "{n, plural, =1 {1 resultado} other {# resultados}}" -> texto para n. */
function textoResultados(n: number) {
  const icu = tComun.resultados;
  if (n === 1) return icu.match(/=1 \{([^}]+)\}/)![1];
  return icu.match(/other \{([^}]+)\}/)![1].replace("#", String(n));
}

/**
 * Palabra más frecuente en los títulos sembrados (>= 5 letras) y el total que
 * devuelve la API para ella con el mismo filtro `like` que usa la página.
 */
async function terminoConResultados(request: APIRequestContext) {
  const listado = await request.get("/api/noticias?limit=100&depth=0");
  expect(listado.status()).toBe(200);
  const { docs } = (await listado.json()) as { docs: { titulo: string }[] };
  expect(docs.length).toBeGreaterThan(0);

  const frecuencia = new Map<string, number>();
  for (const { titulo } of docs) {
    const palabras = new Set(
      titulo
        .split(/[^\p{L}\d]+/u)
        .filter((p) => p.length >= 5)
        .map((p) => p.toLowerCase()),
    );
    for (const p of palabras) frecuencia.set(p, (frecuencia.get(p) ?? 0) + 1);
  }
  const [q] = [...frecuencia.entries()].sort((a, b) => b[1] - a[1])[0];
  expect(q, "palabra buscable en los títulos sembrados").toBeTruthy();

  const respuesta = await request.get(
    `/api/noticias?limit=${POR_PAGINA}&depth=0&where[or][0][titulo][like]=${encodeURIComponent(q)}&where[or][1][medio][like]=${encodeURIComponent(q)}`,
  );
  expect(respuesta.status()).toBe(200);
  const { totalDocs, totalPages } = await respuesta.json();
  return { q, totalDocs: totalDocs as number, totalPages: totalPages as number };
}

test.describe("buscador de noticias (/es/buscador-de-noticias)", () => {
  test("una palabra de un título sembrado devuelve resultados y su contador", async ({ page, request }) => {
    const { q, totalDocs, totalPages } = await terminoConResultados(request);
    expect(totalDocs).toBeGreaterThan(0);

    await page.goto(`/es/buscador-de-noticias?q=${encodeURIComponent(q)}`);
    await expect(page.locator("h1")).toHaveText(t.titulo);
    await expect(page.getByRole("searchbox", { name: t.palabraClave })).toHaveValue(q);
    await expect(page.getByText(textoResultados(totalDocs))).toBeVisible();
    await expect(page.getByText(t.sinResultados)).toHaveCount(0);

    const tarjetas = page.locator("main article");
    await expect(tarjetas).toHaveCount(Math.min(totalDocs, POR_PAGINA));
    await expect(tarjetas.first().getByRole("heading", { level: 3 })).toContainText(new RegExp(q, "i"));

    const paginacion = page.getByRole("navigation", { name: t.paginacion });
    if (totalPages > 1) {
      await expect(paginacion).toBeVisible();
      await expect(paginacion.getByRole("link", { name: tComun.pagina.replace("{n}", "2") })).toHaveAttribute(
        "href",
        new RegExp(`/es/buscador-de-noticias\\?q=${encodeURIComponent(q)}&pagina=2$`),
      );
      await expect(paginacion.getByRole("link", { name: tComun.paginaSiguiente })).toBeVisible();
      await expect(paginacion.getByRole("link", { name: tComun.pagina.replace("{n}", "1") })).toHaveAttribute(
        "aria-current",
        "page",
      );
    } else {
      await expect(paginacion).toHaveCount(0);
    }
  });

  test("sin filtros lista todo el corpus con paginación", async ({ page, request }) => {
    const respuesta = await request.get(`/api/noticias?limit=${POR_PAGINA}&depth=0`);
    const { totalDocs, totalPages } = await respuesta.json();
    expect(totalDocs).toBeGreaterThan(POR_PAGINA);

    await page.goto("/es/buscador-de-noticias");
    await expect(page.getByText(textoResultados(totalDocs))).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(POR_PAGINA);

    const paginacion = page.getByRole("navigation", { name: t.paginacion });
    await expect(paginacion).toBeVisible();
    await expect(paginacion.getByRole("link")).toHaveCount(totalPages + 1); // páginas + "siguiente"
    await expect(
      paginacion.getByRole("link", { name: tComun.pagina.replace("{n}", String(totalPages)) }),
    ).toHaveAttribute("href", new RegExp(`/es/buscador-de-noticias\\?pagina=${totalPages}$`));

    await paginacion.getByRole("link", { name: tComun.paginaSiguiente }).click();
    await expect(page).toHaveURL(/\?pagina=2$/);
    await expect(
      page
        .getByRole("navigation", { name: t.paginacion })
        .getByRole("link", { name: tComun.pagina.replace("{n}", "2") }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("la página 2 enlaza a la anterior y conserva la consulta", async ({ page, request }) => {
    const { q, totalPages } = await terminoConResultados(request);
    test.skip(totalPages < 2, "el corpus sembrado no llega a dos páginas para esta palabra");
    await page.goto(`/es/buscador-de-noticias?q=${encodeURIComponent(q)}&pagina=2`);
    const paginacion = page.getByRole("navigation", { name: t.paginacion });
    await expect(paginacion.getByRole("link", { name: tComun.pagina.replace("{n}", "2") })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(paginacion.getByRole("link", { name: tComun.pagina.replace("{n}", "1") })).toHaveAttribute(
      "href",
      new RegExp(`/es/buscador-de-noticias\\?q=${encodeURIComponent(q)}$`),
    );
    await expect(page.locator("main article").first()).toBeVisible();
  });

  test("el formulario de búsqueda envía por GET y llega al mismo resultado", async ({ page, request }) => {
    const { q, totalDocs } = await terminoConResultados(request);
    await page.goto("/es/buscador-de-noticias");
    await expect(page.getByText(t.sinResultados)).toHaveCount(0);
    await page.getByRole("searchbox", { name: t.palabraClave }).fill(q);
    await page.getByRole("button", { name: t.buscar }).click();
    await expect(page).toHaveURL(new RegExp(`\\?q=${encodeURIComponent(q)}`));
    await expect(page.getByText(textoResultados(totalDocs))).toBeVisible();
  });

  test("una consulta sin coincidencias muestra el mensaje de sin resultados", async ({ page }) => {
    await page.goto("/es/buscador-de-noticias?q=zzqxjv-no-existe-9f3a");
    await expect(page.getByText(t.sinResultados)).toBeVisible();
    await expect(page.getByText(textoResultados(0))).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: t.paginacion })).toHaveCount(0);
  });

  test("en inglés el mensaje de sin resultados está traducido", async ({ page }) => {
    await page.goto("/en/buscador-de-noticias?q=zzqxjv-no-existe-9f3a");
    await expect(page.getByText(mensajes.en.buscador.sinResultados)).toBeVisible();
  });

  test("acepta parámetros repetidos ?q=a&q=b sin error 500 (Q-2 corregido)", async ({ page }) => {
    const respuesta = await page.goto("/es/buscador-de-noticias?q=a&q=b");
    expect(respuesta?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(t.titulo);
  });

  test("pagina fuera de rango se recorta a la última página con resultados (Q-5 corregido)", async ({ page }) => {
    const respuesta = await page.goto("/es/buscador-de-noticias?pagina=9999");
    expect(respuesta?.status()).toBe(200);
    // Se recorta a la última página válida: hay resultados y NO el mensaje de vacío.
    await expect(page.locator("main article").first()).toBeVisible();
    await expect(page.getByText(t.sinResultados)).toHaveCount(0);
  });
});
