import config from "@payload-config";
import { getPayload } from "payload";

export const obtenerPayload = () => getPayload({ config });
