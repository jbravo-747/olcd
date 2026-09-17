import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { categorias, slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const tiposPublicacion = [
  { label: "Reportes", value: "reportes" },
  { label: "Artículos y libros", value: "articulos-y-libros" },
  { label: "Recursos educativos o multimedia", value: "recursos-educativos" },
] as const;

export const Publicaciones: CollectionConfig = {
  slug: "publicaciones",
  typescript: { interface: "Publicacion" },
  labels: { singular: "Publicación", plural: "Publicaciones" },
  admin: { group: "Contenido", useAsTitle: "titulo", defaultColumns: ["titulo", "tipo", "anio"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("publicaciones"),
  defaultSort: "-createdAt",
  fields: [
    { name: "titulo", type: "text", required: true, localized: true, label: "Título" },
    slug(),
    {
      name: "tipo",
      type: "select",
      required: true,
      options: [...tiposPublicacion],
      index: true,
      admin: { position: "sidebar" },
    },
    { name: "lab", type: "relationship", relationTo: "labs", admin: { position: "sidebar" } },
    { name: "descripcion", type: "textarea", required: true, localized: true, label: "Descripción corta" },
    { name: "contenido", type: "richText", localized: true },
    {
      type: "row",
      fields: [
        { name: "autores", type: "text" },
        { name: "anio", type: "text", label: "Año" },
        { name: "paginas", type: "text", label: "Páginas" },
      ],
    },
    categorias,
    { name: "portada", type: "upload", relationTo: "media" },
    { name: "pdf", type: "upload", relationTo: "documentos", label: "PDF" },
  ],
};
