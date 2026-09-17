import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const Organizaciones: CollectionConfig = {
  slug: "organizaciones",
  typescript: { interface: "Organizacion" },
  labels: { singular: "Organización", plural: "Organizaciones" },
  admin: { group: "Directorio", useAsTitle: "nombre", defaultColumns: ["nombre", "region"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("organizaciones"),
  defaultSort: "nombre",
  fields: [
    { name: "nombre", type: "text", required: true },
    slug(),
    {
      type: "row",
      fields: [
        { name: "region", type: "text", label: "Región" },
        { name: "web", type: "text", label: "Sitio web" },
        { name: "correo", type: "email" },
      ],
    },
    { name: "descripcion", type: "richText", localized: true, label: "Descripción" },
    { name: "logo", type: "upload", relationTo: "media" },
  ],
};
