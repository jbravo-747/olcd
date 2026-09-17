import { expect, test, type APIRequestContext } from "@playwright/test";
import { contextoAdmin, sufijoUnico } from "./helpers";

/**
 * E7 - Ida y vuelta del contenido: se crea una entrada por REST en español, se
 * traduce por PATCH al inglés y el sitio la muestra en ambos idiomas. Las
 * páginas leen con Data Cache por etiquetas; el hook afterChange de la
 * colección debe invalidarla, así que no se hace ningún truco de caché.
 */

test.describe("entrada de actualidad creada por REST", () => {
  let api: APIRequestContext;
  let id: number | string | undefined;
  const sufijo = sufijoUnico();
  const slug = `e2e-entrada-${sufijo}`;
  const tituloEs = `Entrada E2E ${sufijo}`;
  const tituloEn = `[EN] Entry E2E ${sufijo}`;
  const tituloEsEditado = `Entrada E2E editada ${sufijo}`;

  test.beforeAll(async () => {
    ({ api } = await contextoAdmin());
  });

  test.afterAll(async () => {
    if (id !== undefined) await api.delete(`/api/entradas/${id}`);
    await api.dispose();
  });

  test("se crea en es, se traduce a en y cada locale muestra su título", async ({ page }) => {
    const creada = await api.post("/api/entradas?locale=es", {
      data: {
        titulo: tituloEs,
        slug,
        tipo: "blog",
        fecha: "2026-09-16T00:00:00.000Z",
        descripcion: "Descripción corta de la entrada creada por la prueba E2E.",
      },
    });
    expect(creada.status(), await creada.text()).toBe(201);
    id = (await creada.json()).doc.id;

    const traducida = await api.patch(`/api/entradas/${id}?locale=en`, {
      data: { titulo: tituloEn, descripcion: "[EN] Short description of the E2E entry." },
    });
    expect(traducida.status(), await traducida.text()).toBe(200);
    expect((await traducida.json()).doc.titulo).toBe(tituloEn);

    // El listado y el detalle deben verla sin recargas con cache-busting.
    await page.goto(`/es/actualidad/${slug}`);
    await expect(page.locator("h1")).toHaveText(tituloEs);

    await page.goto(`/en/actualidad/${slug}`);
    await expect(page.locator("h1")).toHaveText(tituloEn);

    await page.goto("/es/actualidad");
    await expect(page.locator("main")).toContainText(tituloEs);
  });

  test("editar el título en es invalida la caché y la página muestra el nuevo título", async ({ page }) => {
    expect(id, "la entrada se creó en la prueba anterior").toBeDefined();
    // Primera lectura: entra en la Data Cache.
    await page.goto(`/es/actualidad/${slug}`);
    await expect(page.locator("h1")).toHaveText(tituloEs);

    const editada = await api.patch(`/api/entradas/${id}?locale=es`, { data: { titulo: tituloEsEditado } });
    expect(editada.status(), await editada.text()).toBe(200);

    await page.goto(`/es/actualidad/${slug}`);
    await expect(page.locator("h1")).toHaveText(tituloEsEditado);
    // El inglés conserva su propia traducción.
    await page.goto(`/en/actualidad/${slug}`);
    await expect(page.locator("h1")).toHaveText(tituloEn);
  });

  test("al borrarla, la página responde 404", async ({ page }) => {
    expect(id).toBeDefined();
    const borrada = await api.delete(`/api/entradas/${id}`);
    expect(borrada.status()).toBe(200);
    id = undefined;
    const respuesta = await page.goto(`/es/actualidad/${slug}`);
    expect(respuesta?.status()).toBe(404);
  });
});
