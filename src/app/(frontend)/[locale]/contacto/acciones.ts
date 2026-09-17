"use server";

import { z } from "zod";
import { obtenerPayload } from "@/lib/cms/payload";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  correo: z.email().trim().max(200),
  asunto: z.string().trim().max(200).optional(),
  mensaje: z.string().trim().min(10).max(5000),
  // Honeypot: los humanos no lo ven; si viene con valor es un bot.
  sitio_web: z.string().max(0).optional(),
});

export type EstadoContacto = {
  estado: "inicial" | "exito" | "error" | "invalido";
  errores?: Partial<Record<"nombre" | "correo" | "asunto" | "mensaje", string[]>>;
};

export async function enviarMensaje(_previo: EstadoContacto, formulario: FormData): Promise<EstadoContacto> {
  const resultado = esquema.safeParse(Object.fromEntries(formulario));
  if (!resultado.success) {
    const { fieldErrors } = z.flattenError(resultado.error);
    if (fieldErrors.sitio_web) return { estado: "exito" };
    return { estado: "invalido", errores: fieldErrors };
  }

  const { nombre, correo, mensaje } = resultado.data;
  const asunto = resultado.data.asunto || "(sin asunto)";

  try {
    const payload = await obtenerPayload();
    await payload.create({
      collection: "mensajes-contacto",
      data: { nombre, correo, asunto, mensaje },
    });

    const destino = process.env.CONTACTO_DESTINO;
    if (destino) {
      try {
        await payload.sendEmail({
          to: destino,
          replyTo: correo,
          subject: `[OLCD] ${asunto}`,
          text: `De: ${nombre} <${correo}>\n\n${mensaje}`,
        });
      } catch (error) {
        payload.logger.error({ err: error }, "No se pudo enviar el correo de contacto");
      }
    }
    return { estado: "exito" };
  } catch {
    return { estado: "error" };
  }
}
