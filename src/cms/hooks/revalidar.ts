import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

function invalidar(tag: string, req: PayloadRequest) {
  if (req.context?.disableRevalidate) return;
  try {
    revalidateTag(tag, { expire: 0 });
  } catch {
    // Fuera de un request de Next (seed, CLI) no hay caché que invalidar.
  }
}

export function revalidarColeccion(tag: string) {
  const afterChange: CollectionAfterChangeHook = ({ doc, req }) => {
    invalidar(tag, req);
    return doc;
  };
  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    invalidar(tag, req);
    return doc;
  };
  return { afterChange: [afterChange], afterDelete: [afterDelete] };
}

export function revalidarGlobal(tag: string) {
  const afterChange: GlobalAfterChangeHook = ({ doc, req }) => {
    invalidar(tag, req);
    return doc;
  };
  return { afterChange: [afterChange] };
}
