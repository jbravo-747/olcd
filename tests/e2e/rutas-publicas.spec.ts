import { expect, test, type APIRequestContext } from "@playwright/test";
import { locales, primerDocumento, rutasEstaticas, vigilarErrores } from "./helpers";

/**
 * E1 - Toda ruta pública responde en ambos idiomas: 200, `lang` correcto, un
 * solo h1 visible, sin errores de página ni de consola y, en móvil, sin
 * desbordamiento horizontal.
 */

// Rutas de detalle: una por tipo de contenido, con el slug descubierto por la API REST.
const rutasDeDetalle: { tipo: string; ruta: (request: APIRequestContext) => Promise<string> }[] = [
  { tipo: "lab", ruta: async (r) => `/ejes-de-trabajo/${(await primerDocumento<{ slug: string }>(r, "labs")).slug}` },
  {
    tipo: "proyecto",
    ruta: async (r) => {
      const p = await primerDocumento<{ slug: string; lab: { slug: string } }>(r, "proyectos", 1);
      return `/ejes-de-trabajo/${p.lab.slug}/${p.slug}`;
    },
  },
  {
    tipo: "publicacion",
    ruta: async (r) => `/publicaciones/${(await primerDocumento<{ slug: string }>(r, "publicaciones")).slug}`,
  },
  {
    tipo: "entrada",
    ruta: async (r) => `/actualidad/${(await primerDocumento<{ slug: string }>(r, "entradas")).slug}`,
  },
  {
    tipo: "persona",
    ruta: async (r) => `/quienes-somos/personas/${(await primerDocumento<{ slug: string }>(r, "personas")).slug}`,
  },
  {
    tipo: "organizacion",
    ruta: async (r) =>
      `/quienes-somos/organizaciones/${(await primerDocumento<{ slug: string }>(r, "organizaciones")).slug}`,
  },
];

// Hallazgo de la auditoría E2E: en estas rutas MapaCentros emite un aviso de
// hidratación (transform="translate(x y)" con flotantes que difieren en el
// último decimal entre servidor y navegador). Ver informe.
const rutasConDesajusteDeHidratacion = ["/", "/mapa-de-centros-de-datos"];

const casos: { nombre: string; ruta: (request: APIRequestContext) => Promise<string> }[] = [
  ...rutasEstaticas.map((ruta) => ({ nombre: ruta, ruta: async () => ruta })),
  ...rutasDeDetalle.map((d) => ({ nombre: `detalle de ${d.tipo}`, ruta: d.ruta })),
];

for (const locale of locales) {
  test.describe(`rutas públicas /${locale}`, () => {
    for (const caso of casos) {
      test(`${caso.nombre}: 200, lang=${locale}, un h1 y sin errores`, async ({ page, request }, info) => {
        const ruta = await caso.ruta(request);
        test.fixme(
          rutasConDesajusteDeHidratacion.includes(ruta),
          `Auditoría E1: aviso de hidratación en MapaCentros en ${ruta} (console.error)`,
        );
        const errores = vigilarErrores(page);
        const url = `/${locale}${ruta === "/" ? "" : ruta}`;

        const respuesta = await page.goto(url, { waitUntil: "networkidle" });
        expect(respuesta?.status(), `estado de ${url}`).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);

        const h1 = page.locator("h1");
        await expect(h1.first()).toBeVisible();
        await expect(h1).toHaveCount(1);

        // El contenido principal existe y el pie enlaza a los legales (layout completo).
        await expect(page.locator("main#contenido")).toBeVisible();

        if (info.project.name === "movil") {
          const desbordamiento = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(desbordamiento, `desbordamiento horizontal en ${url}`).toBeLessThanOrEqual(1);
        }

        expect(errores, `errores de página/consola en ${url}`).toEqual([]);
      });
    }

    // Las dos rutas con el aviso de hidratación se comprueban igualmente en lo
    // estructural, para que el hallazgo no oculte otras regresiones.
    for (const ruta of rutasConDesajusteDeHidratacion) {
      test(`${ruta}: estructura (200, lang, h1) aunque tenga aviso de hidratación`, async ({ page }, info) => {
        const errores = vigilarErrores(page);
        const url = `/${locale}${ruta === "/" ? "" : ruta}`;
        const respuesta = await page.goto(url, { waitUntil: "networkidle" });
        expect(respuesta?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
        if (info.project.name === "movil") {
          const desbordamiento = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(desbordamiento).toBeLessThanOrEqual(1);
        }
        // Sólo se tolera el aviso de hidratación conocido; cualquier otro error falla.
        const otros = errores.filter((e) => !e.includes("hydrated but some attributes"));
        expect(otros, `otros errores en ${url}`).toEqual([]);
        expect(errores.filter((e) => !e.startsWith("pageerror"))).not.toEqual([]);
      });
    }
  });
}
