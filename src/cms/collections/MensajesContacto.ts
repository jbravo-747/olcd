import type { CollectionConfig } from "payload";
import { esAdmin } from "../access";

export const MensajesContacto: CollectionConfig = {
  slug: "mensajes-contacto",
  typescript: { interface: "MensajeContacto" },
  labels: { singular: "Mensaje de contacto", plural: "Mensajes de contacto" },
  admin: {
    group: "Administración",
    useAsTitle: "asunto",
    defaultColumns: ["asunto", "nombre", "correo", "leido", "createdAt"],
    description: "Mensajes recibidos desde el formulario de contacto del sitio.",
  },
  access: { read: esAdmin, create: () => false, update: esAdmin, delete: esAdmin },
  defaultSort: "-createdAt",
  fields: [
    { name: "nombre", type: "text", required: true, admin: { readOnly: true } },
    { name: "correo", type: "email", required: true, admin: { readOnly: true } },
    { name: "asunto", type: "text", required: true, admin: { readOnly: true } },
    { name: "mensaje", type: "textarea", required: true, admin: { readOnly: true } },
    { name: "leido", type: "checkbox", defaultValue: false, label: "Leído", admin: { position: "sidebar" } },
  ],
};
