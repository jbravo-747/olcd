import type { Field } from "payload";

export function slug(opciones: { unico?: boolean } = {}): Field {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: opciones.unico ?? true,
    index: true,
    admin: { position: "sidebar", description: "Identificador en la URL (sin espacios ni acentos)." },
  };
}

export const categorias: Field = {
  name: "categorias",
  type: "relationship",
  relationTo: "categorias",
  hasMany: true,
  label: "Categorías",
};

export const fotos: Field = {
  name: "fotos",
  type: "upload",
  relationTo: "media",
  hasMany: true,
  label: "Galería de fotos",
};
