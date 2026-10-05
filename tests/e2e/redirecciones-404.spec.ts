import { expect, test } from "@playwright/test";
import { routing } from "../../src/i18n/routing";
import { BASE_URL, mensajes } from "./helpers";

/**
 * E3 - Redirecciones de locale y páginas no encontradas. `routing.ts` declara
 * localePrefix "always" y defaultLocale "es": la raíz redirige a /es y cualquier
 * prefijo desconocido se trata como ruta bajo /es (y acaba en 404).
 */

test.describe("redirecciones y 404", () => {
  test(`GET / redirige a /${routing.defaultLocale}`, async ({ request }) => {
    expect(routing.localePrefix).toBe("always");
    const respuesta = await request.get(`${BASE_URL}/`, { maxRedirects: 0 });
    expect([307, 308]).toContain(respuesta.status());
    expect(respuesta.headers()["location"]).toMatch(new RegExp(`/${routing.defaultLocale}$`));
  });

  test("/fr (locale no soportado) termina en 404 bajo /es", async ({ page }) => {
    expect(routing.locales).not.toContain("fr");
    const respuesta = await page.goto("/fr");
    expect(respuesta?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe(`/${routing.defaultLocale}/fr`);
  });

  for (const locale of routing.locales) {
    test(`/${locale}/ruta-que-no-existe responde 404 con el texto en ${locale}`, async ({ page }) => {
      const respuesta = await page.goto(`/${locale}/ruta-que-no-existe`);
      expect(respuesta?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(mensajes[locale].noEncontrado.titulo);
      await expect(page.getByText(mensajes[locale].noEncontrado.texto)).toBeVisible();
      const volver = page.getByRole("link", { name: mensajes[locale].noEncontrado.volver });
      await expect(volver).toHaveAttribute("href", `/${locale}`);
    });
  }

  test("un slug inexistente de actualidad responde 404", async ({ page }) => {
    const respuesta = await page.goto("/es/actualidad/no-existe-esta-entrada");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(mensajes.es.noEncontrado.titulo);
  });
});
