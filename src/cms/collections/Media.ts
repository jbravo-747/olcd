import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { revalidarColeccion } from "../hooks/revalidar";

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
  hooks: revalidarColeccion("media"),
  upload: {
    // Sólo mapa de bits: `image/*` admitía SVG, que sirve script en el origen
    // del bucket (auditoría S-3). Los logos vectoriales viven en `public/`.
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
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
