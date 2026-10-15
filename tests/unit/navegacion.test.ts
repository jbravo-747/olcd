/**
 * S5 · Integridad del menú (src/lib/navegacion.ts): cada href debe tener una
 * página en src/app/(frontend)/[locale]/.
 *
 * Correspondencia href → carpeta de página:
 *  - se quita el ancla (#…) y la query (?…);
 *  - cada segmento se resuelve primero como carpeta literal y, si no existe,
 *    como segmento dinámico `[param]` del mismo nivel;
 *  - el comodín `[...rest]` (página 404) NO cuenta como coincidencia: un enlace
 *    que sólo lo alcanzara estaría roto.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { columnasFooter, enlacesLegales, navegacion, type ItemNav } from "@/lib/navegacion";

const RAIZ_PAGINAS = path.resolve(__dirname, "../../src/app/(frontend)/[locale]");

function aplanar(items: ItemNav[]): ItemNav[] {
  return items.flatMap((item) => [item, ...aplanar(item.hijos ?? [])]);
}

function rutaLimpia(href: string) {
  return href.replace(/[#?].*$/, "");
}

/** Devuelve la carpeta de página que atiende la ruta, o null si no hay ninguna. */
function carpetaDePagina(ruta: string): string | null {
  const segmentos = ruta.split("/").filter(Boolean);
  let actual = RAIZ_PAGINAS;
  for (const segmento of segmentos) {
    const literal = path.join(actual, segmento);
    if (existsSync(literal) && statSync(literal).isDirectory()) {
      actual = literal;
      continue;
    }
    const dinamica = readdirSync(actual).find((nombre) => /^\[[^.\]]+\]$/.test(nombre));
    if (!dinamica) return null;
    actual = path.join(actual, dinamica);
  }
  return existsSync(path.join(actual, "page.tsx")) ? actual : null;
}

const todos = [...aplanar(navegacion), ...columnasFooter.flatMap((c) => [c.titulo, ...c.enlaces]), ...enlacesLegales];
const rutas = [...new Set(todos.map((i) => rutaLimpia(i.href)))].sort();

describe("navegación", () => {
  it("todos los hrefs son rutas absolutas internas", () => {
    for (const item of todos) expect(item.href, item.clave).toMatch(/^\/[a-z0-9\-/#?=]*$/);
  });

  it("el menú, el pie y los enlaces legales cubren las secciones del sitio", () => {
    expect(rutas).toEqual(
      expect.arrayContaining([
        "/quienes-somos",
        "/ejes-de-trabajo",
        "/mapa-de-centros-de-datos",
        "/buscador-de-noticias",
        "/publicaciones",
        "/actualidad",
        "/contacto",
        "/accesibilidad",
        "/privacidad",
        "/terminos-de-uso",
      ]),
    );
  });

  it.each(rutas)("%s tiene una page.tsx", (ruta) => {
    expect(carpetaDePagina(ruta), `sin página para ${ruta}`).not.toBeNull();
  });

  it("la correspondencia no acepta rutas inexistentes (el comodín 404 no cuenta)", () => {
    expect(carpetaDePagina("/no-existe")).toBeNull();
    expect(carpetaDePagina("/ejes-de-trabajo/data-lab/un-proyecto/de-mas")).toBeNull();
  });
});
