import { expect, test } from "@playwright/test";
import { contextoAdmin, mensajes, sufijoUnico } from "./helpers";

/**
 * E5 - Formulario de contacto: validación en servidor (Server Action) y
 * persistencia del mensaje en la colección `mensajes-contacto`.
 */

const t = mensajes.es.contacto;

test.describe("formulario de contacto (/es/contacto)", () => {
  test("enviar vacío muestra el aviso de campos inválidos", async ({ page }) => {
    await page.goto("/es/contacto");
    await page.getByRole("button", { name: t.enviar }).click();
    // Next añade su propio div[role=alert] (route announcer); se filtra por texto.
    const alerta = page.getByRole("alert").filter({ hasText: t.invalido });
    await expect(alerta).toBeVisible();
    await expect(alerta).toHaveText(t.invalido);
    await expect(page.getByLabel(t.nombre)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(t.correo)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(t.mensaje)).toHaveAttribute("aria-invalid", "true");
  });

  test("correo inválido y mensaje corto muestran el aviso y marcan sólo esos campos", async ({ page }) => {
    await page.goto("/es/contacto");
    await page.getByLabel(t.nombre).fill("Persona de pruebas");
    await page.getByLabel(t.correo).fill("esto-no-es-un-correo");
    await page.getByLabel(t.mensaje).fill("corto");
    await page.getByRole("button", { name: t.enviar }).click();
    await expect(page.getByRole("alert").filter({ hasText: t.invalido })).toHaveText(t.invalido);
    await expect(page.getByLabel(t.nombre)).toHaveAttribute("aria-invalid", "false");
    await expect(page.getByLabel(t.correo)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(t.mensaje)).toHaveAttribute("aria-invalid", "true");
  });

  test("un envío válido muestra el éxito y queda guardado en mensajes-contacto", async ({ page }) => {
    const asunto = `E2E ${sufijoUnico()}`;
    await page.goto("/es/contacto");
    await page.getByLabel(t.nombre).fill("Persona de pruebas");
    await page.getByLabel(t.correo).fill("pruebas@example.org");
    await page.getByLabel(t.asunto).fill(asunto);
    await page.getByLabel(t.mensaje).fill("Mensaje de prueba automatizada del formulario de contacto.");
    await page.getByRole("button", { name: t.enviar }).click();

    await expect(page.getByRole("status")).toHaveText(t.exito);
    await expect(page.getByRole("form", { name: t.formulario })).toHaveCount(0);

    const { api } = await contextoAdmin();
    try {
      const respuesta = await api.get("/api/mensajes-contacto?sort=-createdAt&limit=1&depth=0");
      expect(respuesta.status()).toBe(200);
      const { docs } = await respuesta.json();
      expect(docs).toHaveLength(1);
      expect(docs[0]).toMatchObject({
        asunto,
        nombre: "Persona de pruebas",
        correo: "pruebas@example.org",
        leido: false,
      });
      // Limpieza: el mensaje de prueba no debe quedar en la bandeja.
      const borrado = await api.delete(`/api/mensajes-contacto/${docs[0].id}`);
      expect(borrado.status()).toBe(200);
    } finally {
      await api.dispose();
    }
  });

  test("la colección mensajes-contacto no es legible sin sesión", async ({ request }) => {
    const respuesta = await request.get("/api/mensajes-contacto?limit=1");
    expect([401, 403]).toContain(respuesta.status());
  });
});
