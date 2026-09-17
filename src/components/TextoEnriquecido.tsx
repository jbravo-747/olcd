import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { TextoEnriquecido as Datos } from "@/cms/lexical";

/** Renderiza un campo richText (Lexical) del CMS con la tipografía del sitio (.prosa). */
export default function TextoEnriquecido({
  datos,
  className = "",
}: {
  datos: Datos | null | undefined;
  className?: string;
}) {
  if (!datos) return null;
  return <RichText data={datos as SerializedEditorState} className={`prosa ${className}`} />;
}
