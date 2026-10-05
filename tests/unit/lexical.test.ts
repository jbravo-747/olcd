/**
 * S5 · parrafosALexical (src/cms/lexical.ts): texto plano → JSON de Lexical con
 * un nodo `paragraph` por párrafo y un nodo `text` con el texto original.
 */
import { describe, expect, it } from "vitest";
import { parrafosALexical } from "@/cms/lexical";

describe("parrafosALexical", () => {
  it("produce una raíz Lexical con un párrafo por cada texto", () => {
    const resultado = parrafosALexical(["Primero", "Segundo"]);
    expect(resultado.root.type).toBe("root");
    expect(resultado.root.children).toHaveLength(2);
    expect(resultado.root.children.map((n) => n.type)).toEqual(["paragraph", "paragraph"]);
  });

  it("conserva el texto de cada párrafo (ida y vuelta)", () => {
    const textos = ["Hola, mundo.", "Con acentos: ñ, á, é.", ""];
    const resultado = parrafosALexical(textos);
    const recuperados = resultado.root.children.map((parrafo) => {
      const hijos = (parrafo as unknown as { children: { type: string; text: string }[] }).children;
      expect(hijos).toHaveLength(1);
      expect(hijos[0].type).toBe("text");
      return hijos[0].text;
    });
    expect(recuperados).toEqual(textos);
  });

  it("con una lista vacía devuelve una raíz sin hijos", () => {
    expect(parrafosALexical([]).root.children).toEqual([]);
  });

  it("los nodos llevan los campos que exige el editor", () => {
    const { root } = parrafosALexical(["x"]);
    expect(root).toMatchObject({ version: 1, direction: "ltr", format: "", indent: 0 });
    expect(root.children[0]).toMatchObject({ version: 1, direction: "ltr", format: "", indent: 0 });
  });
});
