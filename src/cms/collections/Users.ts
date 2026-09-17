import type { CollectionConfig } from "payload";
import { esAdmin, esAdminCampo } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuario", plural: "Usuarios" },
  admin: {
    useAsTitle: "nombre",
    group: "Administración",
  },
  auth: true,
  access: {
    create: esAdmin,
    delete: esAdmin,
    update: ({ req: { user } }) =>
      user?.rol === "admin" ? true : user ? { id: { equals: user.id } } : false,
    read: ({ req: { user } }) =>
      user?.rol === "admin" ? true : user ? { id: { equals: user.id } } : false,
  },
  fields: [
    { name: "nombre", type: "text", required: true },
    {
      name: "rol",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Administrador", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: { update: esAdminCampo },
    },
  ],
};
