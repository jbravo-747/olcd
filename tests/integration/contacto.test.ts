/**
 * S2 · Formulario de contacto: la Server Action `enviarMensaje(prev, FormData)`.
 * Sin CONTACTO_DESTINO no se envía correo; el mensaje siempre queda en
 * `mensajes-contacto` (docs/cms.md, "Correo").
 */
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { enviarMensaje, type EstadoContacto } from "@/app/(frontend)/[locale]/contacto/acciones";
import { limpiar, obtenerPayload, registrarCierre } from "./helpers";

registrarCierre();

const INICIAL: EstadoContacto = { estado: "inicial" };

function formulario(campos: Record<string, string>) {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) datos.set(clave, valor);
  return datos;
}

const VALIDO = {
  nombre: "Ana Pérez",
  correo: "ana@pruebas.test",
  mensaje: "Quisiera sumarme a la red del Observatorio.",
};

async function mensajesGuardados() {
  const payload = await obtenerPayload();
  const { docs } = await payload.find({ collection: "mensajes-contacto", overrideAccess: true, sort: "-createdAt" });
  return docs;
}

beforeAll(async () => {
  delete process.env.CONTACTO_DESTINO;
});

beforeEach(async () => {
  await limpiar();
});

describe("S2 · enviarMensaje", () => {
  it("rechaza datos inválidos indicando el error de cada campo", async () => {
    const resultado = await enviarMensaje(
      INICIAL,
      formulario({ nombre: "A", correo: "no-es-correo", mensaje: "corto" }),
    );
    expect(resultado.estado).toBe("invalido");
    expect(Object.keys(resultado.errores ?? {}).sort()).toEqual(["correo", "mensaje", "nombre"]);
    expect(await mensajesGuardados()).toHaveLength(0);
  });

  it("señala sólo el campo inválido cuando el resto es correcto", async () => {
    const resultado = await enviarMensaje(INICIAL, formulario({ ...VALIDO, correo: "sin-arroba" }));
    expect(resultado).toEqual({ estado: "invalido", errores: { correo: expect.any(Array) } });
  });

  it("con el honeypot lleno responde éxito pero no guarda nada", async () => {
    const resultado = await enviarMensaje(INICIAL, formulario({ ...VALIDO, sitio_web: "https://spam.example" }));
    expect(resultado).toEqual({ estado: "exito" });
    expect(await mensajesGuardados()).toHaveLength(0);
  });

  it("guarda exactamente un mensaje con los datos enviados", async () => {
    const resultado = await enviarMensaje(INICIAL, formulario({ ...VALIDO, asunto: "Colaboración" }));
    expect(resultado).toEqual({ estado: "exito" });
    const guardados = await mensajesGuardados();
    expect(guardados).toHaveLength(1);
    expect(guardados[0]).toMatchObject({
      nombre: "Ana Pérez",
      correo: "ana@pruebas.test",
      asunto: "Colaboración",
      mensaje: "Quisiera sumarme a la red del Observatorio.",
      leido: false,
    });
  });

  it('usa "(sin asunto)" cuando no se indica asunto', async () => {
    await enviarMensaje(INICIAL, formulario(VALIDO));
    const [guardado] = await mensajesGuardados();
    expect(guardado.asunto).toBe("(sin asunto)");
  });

  it("recorta espacios alrededor de los campos", async () => {
    await enviarMensaje(INICIAL, formulario({ ...VALIDO, nombre: "  Ana Pérez  " }));
    const [guardado] = await mensajesGuardados();
    expect(guardado.nombre).toBe("Ana Pérez");
  });
});
