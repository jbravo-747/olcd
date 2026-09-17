import type { Access, FieldAccess } from "payload";

export const publico: Access = () => true;

export const esAdmin: Access = ({ req: { user } }) => user?.rol === "admin";

export const esEditor: Access = ({ req: { user } }) =>
  user?.rol === "admin" || user?.rol === "editor";

export const esAdminCampo: FieldAccess = ({ req: { user } }) => user?.rol === "admin";
