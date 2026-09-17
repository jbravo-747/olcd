import { expect, test } from "@playwright/test";
import { es as traduccionesPayload } from "@payloadcms/translations/languages/es";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers";

/**
 * E4 - Autenticación del panel de Payload. Los textos vienen de las
 * traducciones oficiales de Payload en español (idioma por defecto del panel).
 */

const t = traduccionesPayload.translations;

type Pagina = import("@playwright/test").Page;

/**
 * Consulta /api/users/me con las cookies de la propia página (fetch en el
 * navegador). No se usa page.request porque el APIRequestContext de Playwright
 * no reenvía la cookie HttpOnly del dominio "localhost".
 */
async function usuarioActual(page: Pagina) {
  return page.evaluate(async () => {
    const respuesta = await fetch("/api/users/me", { credentials: "include" });
    return {
      status: respuesta.status,
      cuerpo: (await respuesta.json()) as { user: null | { email: string; rol: string } },
    };
  });
}

async function iniciarSesion(page: Pagina, password: string) {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.locator("#field-email").fill(ADMIN_EMAIL);
  await page.locator("#field-password").fill(password);
  await page.getByRole("button", { name: t.authentication.login, exact: true }).click();
}

test.describe("admin: autenticación", () => {
  test("/admin sin sesión redirige a la vista de login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.locator("#field-email")).toBeVisible();
    await expect(page.locator("#field-password")).toBeVisible();
    await expect(page.getByRole("button", { name: t.authentication.login, exact: true })).toBeVisible();
  });

  test("contraseña incorrecta muestra error y permanece en login", async ({ page }) => {
    await iniciarSesion(page, "contraseña-incorrecta");
    await expect(page.getByText(t.error.emailOrPasswordIncorrect).first()).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
    expect((await usuarioActual(page)).cuerpo.user).toBeNull();
  });

  test("credenciales correctas llegan al panel y /api/users/me devuelve el usuario", async ({ page }) => {
    await iniciarSesion(page, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.locator("#field-password")).toHaveCount(0);

    const yo = await usuarioActual(page);
    expect(yo.status).toBe(200);
    expect(yo.cuerpo.user?.email).toBe(ADMIN_EMAIL);
    expect(yo.cuerpo.user?.rol).toBe("admin");
  });

  test("cerrar sesión devuelve al login y /admin vuelve a pedir credenciales", async ({ page }) => {
    await iniciarSesion(page, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/admin\/?$/);

    await page.goto("/admin/logout");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText(t.authentication.loggedOutSuccessfully).first()).toBeVisible();

    expect((await usuarioActual(page)).cuerpo.user).toBeNull();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
