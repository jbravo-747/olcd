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
  hooks: {
    // El primer usuario del sistema siempre nace admin, pase lo que pase por el
    // formulario o el body de /api/users/first-register (auditoría S-2). Sin
    // esto, un primer usuario "editor" deja el CMS sin administrador y sólo se
    // arregla por SQL.
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation !== "create") return data;
        const { totalDocs } = await req.payload.count({ collection: "users" });
        if (totalDocs === 0) return { ...data, rol: "admin" };
        return data;
      },
    ],
  },
  access: {
    create: esAdmin,
    delete: esAdmin,
    update: ({ req: { user } }) => (user?.rol === "admin" ? true : user ? { id: { equals: user.id } } : false),
    read: ({ req: { user } }) => (user?.rol === "admin" ? true : user ? { id: { equals: user.id } } : false),
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
