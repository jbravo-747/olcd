import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Imagen", plural: "Imágenes" },
  admin: { group: "Archivos" },
  access: {
    read: publico,
    create: esEditor,
    update: esEditor,
    delete: esEditor,
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "hero", width: 1600 },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    { name: "alt", type: "text", required: true, localized: true, label: "Texto alternativo" },
    { name: "credito", type: "text", label: "Crédito" },
  ],
};
