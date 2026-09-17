import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const gruposPersona = [
  { label: "Investigación", value: "investigacion" },
  { label: "Comunidad", value: "comunidad" },
  { label: "Aliados", value: "aliados" },
] as const;

export const Personas: CollectionConfig = {
  slug: "personas",
  labels: { singular: "Persona", plural: "Personas" },
  admin: { group: "Directorio", useAsTitle: "nombre", defaultColumns: ["nombre", "organizacion", "grupo", "equipo"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("personas"),
  defaultSort: "orden",
  fields: [
    { name: "nombre", type: "text", required: true },
    slug(),
    { name: "orden", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    { name: "equipo", type: "checkbox", defaultValue: false, label: "Forma parte del equipo", admin: { position: "sidebar" } },
    { name: "grupo", type: "select", required: true, options: [...gruposPersona], index: true, admin: { position: "sidebar" } },
    {
      type: "row",
      fields: [
        { name: "titulo", type: "text", localized: true, label: "Título / cargo" },
        { name: "rol", type: "text", localized: true },
      ],
    },
    { name: "organizacion", type: "relationship", relationTo: "organizaciones", label: "Organización" },
    {
      type: "row",
      fields: [
        { name: "region", type: "text", label: "Región" },
        { name: "afiliacion", type: "text", localized: true, label: "Afiliación" },
        { name: "correo", type: "email" },
      ],
    },
    { name: "biografia", type: "richText", localized: true, label: "Biografía" },
    { name: "foto", type: "upload", relationTo: "media" },
  ],
};
