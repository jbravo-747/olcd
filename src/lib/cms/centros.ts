import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarCentros = cacheado(
  async () => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({ collection: "centros", sort: "nombre", limit: 1000, depth: 0 });
    return docs;
  },
  "centros",
  ["centros"],
);
