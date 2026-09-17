import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const Labs: CollectionConfig = {
  slug: "labs",
  labels: { singular: "Eje de trabajo (lab)", plural: "Ejes de trabajo (labs)" },
  admin: { group: "Contenido", useAsTitle: "nombre", defaultColumns: ["nombre", "slug", "orden"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("labs"),
  defaultSort: "orden",
  fields: [
    { name: "nombre", type: "text", required: true, localized: true },
    slug(),
    { name: "orden", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    { name: "descripcion", type: "textarea", required: true, localized: true, label: "Descripción corta" },
    { name: "introduccion", type: "richText", localized: true, label: "Introducción" },
    { name: "imagen", type: "upload", relationTo: "media" },
  ],
};
