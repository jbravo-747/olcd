import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { revalidarColeccion } from "../hooks/revalidar";

export const Documentos: CollectionConfig = {
  slug: "documentos",
  labels: { singular: "Documento", plural: "Documentos" },
  admin: { group: "Archivos", useAsTitle: "titulo" },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("documentos"),
  upload: {
    mimeTypes: ["application/pdf"],
  },
  fields: [{ name: "titulo", type: "text", required: true, localized: true, label: "Título" }],
};
