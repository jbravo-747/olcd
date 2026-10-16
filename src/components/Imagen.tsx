import Image from "next/image";
import type { Media } from "@/payload-types";
import Marcador from "./Marcador";

type Tamano = "thumbnail" | "card" | "hero" | "original";

/** Un documento de Media del CMS o una imagen fija de /public con sus medidas. */
export type FuenteImagen = Pick<Media, "url" | "alt" | "width" | "height"> & { sizes?: Media["sizes"] };

/** Imagen con next/image; si no hay imagen, muestra el marcador gris de la maqueta. */
export default function Imagen({
  media,
  tamano = "card",
  className = "",
  etiqueta = "[Imagen]",
  sizes,
  priority = false,
}: {
  media: FuenteImagen | null | undefined;
  tamano?: Tamano;
  className?: string;
  etiqueta?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!media?.url) return <Marcador etiqueta={etiqueta} className={className} />;

  const variante = tamano === "original" ? undefined : media.sizes?.[tamano];
  const src = variante?.url ?? media.url;
  const width = variante?.width ?? media.width ?? 1200;
  const height = variante?.height ?? media.height ?? 800;

  return (
    <Image
      src={src}
      alt={media.alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
