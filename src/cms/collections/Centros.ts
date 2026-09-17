import type { CollectionConfig } from "payload";
import { esEditor, publico } from "../access";
import { revalidarColeccion } from "../hooks/revalidar";

export const estadosCentro = [
  { label: "En operación", value: "en-operacion" },
  { label: "En construcción", value: "en-construccion" },
  { label: "Anunciado", value: "anunciado" },
] as const;

export const Centros: CollectionConfig = {
  slug: "centros",
  labels: { singular: "Centro de datos", plural: "Centros de datos" },
  admin: { group: "Contenido", useAsTitle: "nombre", defaultColumns: ["nombre", "pais", "estado"] },
  access: { read: publico, create: esEditor, update: esEditor, delete: esEditor },
  hooks: revalidarColeccion("centros"),
  fields: [
    { name: "nombre", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "ciudad", type: "text", required: true },
        { name: "pais", type: "text", required: true, index: true, label: "País" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "empresa", type: "text" },
        { name: "estado", type: "select", required: true, options: [...estadosCentro], index: true },
        { name: "inversionUsdMillones", type: "number", label: "Inversión (millones de USD)", min: 0 },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "lat", type: "number", required: true, min: -90, max: 90, label: "Latitud" },
        { name: "lng", type: "number", required: true, min: -180, max: 180, label: "Longitud" },
      ],
    },
  ],
};
