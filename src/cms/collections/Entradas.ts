import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { categorias, fotos, slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const tiposActualidad = [
  { label: "Blog", value: "blog" },
  { label: "Comunicados", value: "comunicados" },
  { label: "Cobertura de prensa", value: "cobertura-de-prensa" },
  { label: "Noticias del Observatorio", value: "noticias-del-observatorio" },
] as const;

export const Entradas: CollectionConfig = {
  slug: "entradas",
  labels: { singular: "Entrada de actualidad", plural: "Actualidad" },
  admin: { group: "Contenido", useAsTitle: "titulo", defaultColumns: ["titulo", "tipo", "fecha"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("entradas"),
  defaultSort: "-fecha",
  fields: [
    { name: "titulo", type: "text", required: true, localized: true, label: "Título" },
    slug(),
    {
      name: "tipo",
      type: "select",
      required: true,
      options: [...tiposActualidad],
      index: true,
      admin: { position: "sidebar" },
    },
    { name: "fecha", type: "date", required: true, index: true, admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } } },
    { name: "descripcion", type: "textarea", required: true, localized: true, label: "Descripción corta" },
    { name: "contenido", type: "richText", localized: true },
    {
      type: "row",
      fields: [
        { name: "creditos", type: "text", label: "Créditos" },
        { name: "participantes", type: "text", localized: true },
        { name: "fuente", type: "text", admin: { description: "Medio de comunicación (cobertura de prensa)." } },
      ],
    },
    categorias,
    fotos,
    { name: "pdf", type: "upload", relationTo: "documentos", label: "PDF" },
  ],
};
