import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { categorias, fotos, slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const Proyectos: CollectionConfig = {
  slug: "proyectos",
  labels: { singular: "Proyecto", plural: "Proyectos" },
  admin: { group: "Contenido", useAsTitle: "titulo", defaultColumns: ["titulo", "lab", "anio"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("proyectos"),
  fields: [
    { name: "titulo", type: "text", required: true, localized: true, label: "Título" },
    // El slug es único dentro de cada lab, no global: la URL es /ejes-de-trabajo/[lab]/[proyecto].
    slug({ unico: false }),
    { name: "lab", type: "relationship", relationTo: "labs", required: true, index: true, admin: { position: "sidebar" } },
    { name: "descripcion", type: "textarea", required: true, localized: true, label: "Descripción corta" },
    {
      type: "row",
      fields: [
        { name: "autores", type: "text" },
        { name: "anio", type: "text", label: "Año" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "lugar", type: "text", localized: true },
        { name: "participantes", type: "text", localized: true },
      ],
    },
    categorias,
    fotos,
    {
      name: "secciones",
      type: "array",
      labels: { singular: "Sección", plural: "Secciones" },
      fields: [
        { name: "titulo", type: "text", required: true, localized: true },
        { name: "cuerpo", type: "richText", localized: true },
        {
          name: "subsecciones",
          type: "array",
          labels: { singular: "Subsección", plural: "Subsecciones" },
          fields: [
            { name: "titulo", type: "text", required: true, localized: true },
            { name: "cuerpo", type: "richText", localized: true },
          ],
        },
      ],
    },
    {
      name: "descargable",
      type: "group",
      label: "Documento descargable",
      fields: [
        { name: "etiqueta", type: "text", localized: true },
        { name: "archivo", type: "upload", relationTo: "documentos" },
      ],
    },
  ],
};
