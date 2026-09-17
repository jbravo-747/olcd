import { expect, test } from "@playwright/test";
import { mensajes } from "./helpers";

/**
 * E2 - Localización: el contenido del CMS en /en lleva el prefijo "[EN] " del
 * seed, en /es no, y el conmutador del header cambia de idioma conservando la ruta.
 */

const rutasConContenidoCms = ["/ejes-de-trabajo", "/publicaciones", "/quienes-somos"];

test.describe("localización", () => {
  for (const ruta of rutasConContenidoCms) {
    test(`/en${ruta} muestra contenido "[EN] " y /es${ruta} no`, async ({ page }) => {
      await page.goto(`/en${ruta}`);
      await expect(page.locator("main")).toContainText("[EN] ");

      await page.goto(`/es${ruta}`);
      await expect(page.locator("main")).not.toContainText("[EN] ");
    });
  }

  test("el conmutador de idioma alterna /es <-> /en conservando la ruta", async ({ page }, info) => {
    const ruta = "/ejes-de-trabajo";
    await page.goto(`/es${ruta}`);

    const abrirMenuSiMovil = async (locale: "es" | "en") => {
      if (info.project.name !== "movil") return;
      await page.getByRole("button", { name: mensajes[locale].header.abrirMenu }).click();
      await expect(page.getByRole("navigation", { name: mensajes[locale].header.principalMovil })).toBeVisible();
    };

    await abrirMenuSiMovil("es");
    const aIngles = page.getByRole("link", { name: mensajes.es.header.cambiarIdioma });
    await expect(aIngles).toBeVisible();
    await expect(aIngles).toHaveText(mensajes.es.header.codigoIdioma);
    await aIngles.click();
    await expect(page).toHaveURL(new RegExp(`/en${ruta}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(mensajes.en.ejes.titulo);
    await expect(page.locator("main")).toContainText("[EN] ");

    await abrirMenuSiMovil("en");
    const aEspanol = page.getByRole("link", { name: mensajes.en.header.cambiarIdioma });
    await expect(aEspanol).toHaveText(mensajes.en.header.codigoIdioma);
    await aEspanol.click();
    await expect(page).toHaveURL(new RegExp(`/es${ruta}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("h1")).toHaveText(mensajes.es.ejes.titulo);
    await expect(page.locator("main")).not.toContainText("[EN] ");
  });

  test("los textos de interfaz cambian con el idioma", async ({ page }) => {
    await page.goto("/es/contacto");
    await expect(page.locator("h1")).toHaveText(mensajes.es.contacto.titulo);
    await expect(page.getByRole("form", { name: mensajes.es.contacto.formulario })).toBeVisible();

    await page.goto("/en/contacto");
    await expect(page.locator("h1")).toHaveText(mensajes.en.contacto.titulo);
    await expect(page.getByRole("form", { name: mensajes.en.contacto.formulario })).toBeVisible();
  });
});
