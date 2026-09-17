import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { slug } from "../campos";
import { revalidarColeccion } from "../hooks/revalidar";

export const Categorias: CollectionConfig = {
  slug: "categorias",
  labels: { singular: "Categoría", plural: "Categorías" },
  admin: { group: "Catálogos", useAsTitle: "nombre" },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("categorias"),
  fields: [
    { name: "nombre", type: "text", required: true, localized: true },
    slug(),
  ],
};
