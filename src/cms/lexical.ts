import type { Lab } from "@/payload-types";

/** Forma del JSON de un campo richText (Lexical) según los tipos generados por Payload. */
export type TextoEnriquecido = NonNullable<Lab["introduccion"]>;

/** Convierte párrafos de texto plano al JSON que espera el editor Lexical. */
export function parrafosALexical(parrafos: string[]): TextoEnriquecido {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: parrafos.map((texto) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        textFormat: 0,
        textStyle: "",
        children: [
          { type: "text", detail: 0, format: 0, mode: "normal", style: "", text: texto, version: 1 },
        ],
      })),
    },
  };
}
