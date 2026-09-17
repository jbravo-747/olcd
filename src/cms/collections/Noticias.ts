import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { categorias } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const Noticias: CollectionConfig = {
  slug: "noticias",
  labels: { singular: "Noticia (buscador)", plural: "Noticias (buscador)" },
  admin: {
    group: "Contenido",
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "medio", "fecha"],
    description: "Corpus de notas de prensa que alimenta el Buscador de Noticias.",
  },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("noticias"),
  defaultSort: "-fecha",
  fields: [
    { name: "titulo", type: "text", required: true, label: "Título" },
    {
      type: "row",
      fields: [
        { name: "medio", type: "text", required: true, index: true },
        { name: "fecha", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "url", type: "text", required: true, label: "Enlace" },
    categorias,
  ],
};
