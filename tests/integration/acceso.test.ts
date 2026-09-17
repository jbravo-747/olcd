/**
 * S1 · Control de acceso por rol, observado a través de la Local API con
 * `overrideAccess: false` y un `user` explícito (o ninguno = anónimo).
 * Reglas esperadas según docs/cms.md: admin gestiona usuarios y ve mensajes de
 * contacto; editor sólo edita contenido; público sólo lee.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { User } from "@/payload-types";
import {
  CONTRASENA,
  como,
  comoAnonimo,
  correoUnico,
  crearUsuario,
  limpiar,
  obtenerPayload,
  registrarCierre,
} from "./helpers";

registrarCierre();

const PROHIBIDO = { status: 403 };

let admin: User;
let editor: User;
let otroEditor: User;

beforeAll(async () => {
  await limpiar();
  admin = await crearUsuario("admin");
  editor = await crearUsuario("editor");
  otroEditor = await crearUsuario("editor");
});

const datosLab = (slug: string) => ({
  nombre: `Lab ${slug}`,
  slug,
  descripcion: "Descripción de prueba",
});

describe("S1 · anónimo", () => {
  it("puede listar labs (colección pública)", async () => {
    const payload = await obtenerPayload();
    await payload.create({ collection: "labs", data: datosLab("publico-lee"), overrideAccess: true });
    const resultado = await payload.find({ collection: "labs", ...comoAnonimo() });
    expect(resultado.docs.map((d) => d.slug)).toContain("publico-lee");
  });

  it("no puede crear contenido", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({ collection: "labs", data: datosLab("anonimo-crea"), ...comoAnonimo() }),
    ).rejects.toMatchObject(PROHIBIDO);
  });

  it("no puede actualizar ni borrar contenido", async () => {
    const payload = await obtenerPayload();
    const lab = await payload.create({ collection: "labs", data: datosLab("anonimo-edita"), overrideAccess: true });
    await expect(
      payload.update({ collection: "labs", id: lab.id, data: { nombre: "Cambiado" }, ...comoAnonimo() }),
    ).rejects.toMatchObject(PROHIBIDO);
    await expect(payload.delete({ collection: "labs", id: lab.id, ...comoAnonimo() })).rejects.toMatchObject(PROHIBIDO);
  });

  it("no puede actualizar el global sitio", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.updateGlobal({ slug: "sitio", data: { inicio: { texto: "anónimo" } }, ...comoAnonimo() }),
    ).rejects.toMatchObject(PROHIBIDO);
  });

  it("no puede crear mensajes de contacto por la API con control de acceso", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({
        collection: "mensajes-contacto",
        data: { nombre: "Bot", correo: "bot@pruebas.test", asunto: "Hola", mensaje: "Mensaje de prueba" },
        ...comoAnonimo(),
      }),
    ).rejects.toMatchObject(PROHIBIDO);
  });

  it("no puede leer usuarios", async () => {
    const payload = await obtenerPayload();
    await expect(payload.find({ collection: "users", ...comoAnonimo() })).rejects.toMatchObject(PROHIBIDO);
  });
});

describe("S1 · editor", () => {
  it("puede crear, actualizar y borrar contenido (labs)", async () => {
    const payload = await obtenerPayload();
    const lab = await payload.create({ collection: "labs", data: datosLab("editor-lab"), ...como(editor) });
    const actualizado = await payload.update({
      collection: "labs",
      id: lab.id,
      data: { nombre: "Lab editado" },
      ...como(editor),
    });
    expect(actualizado.nombre).toBe("Lab editado");
    await payload.delete({ collection: "labs", id: lab.id, ...como(editor) });
    const restantes = await payload.find({ collection: "labs", where: { id: { equals: lab.id } }, ...comoAnonimo() });
    expect(restantes.totalDocs).toBe(0);
  });

  it("puede crear categorías y publicaciones", async () => {
    const payload = await obtenerPayload();
    const categoria = await payload.create({
      collection: "categorias",
      data: { nombre: "Energía", slug: "energia" },
      ...como(editor),
    });
    const publicacion = await payload.create({
      collection: "publicaciones",
      data: {
        titulo: "Reporte anual",
        slug: "reporte-anual",
        tipo: "reportes",
        descripcion: "Descripción del reporte",
        categorias: [categoria.id],
      },
      ...como(editor),
    });
    expect(publicacion.titulo).toBe("Reporte anual");
  });

  it("puede actualizar el global sitio", async () => {
    const payload = await obtenerPayload();
    const sitio = await payload.updateGlobal({
      slug: "sitio",
      data: { inicio: { texto: "Texto del editor" } },
      ...como(editor),
    });
    expect(sitio.inicio?.texto).toBe("Texto del editor");
  });

  it("no puede crear usuarios", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({
        collection: "users",
        data: { email: correoUnico("intruso"), password: CONTRASENA, nombre: "Intruso", rol: "editor" },
        ...como(editor),
      }),
    ).rejects.toMatchObject(PROHIBIDO);
  });

  it("no puede borrar usuarios", async () => {
    const payload = await obtenerPayload();
    await expect(payload.delete({ collection: "users", id: otroEditor.id, ...como(editor) })).rejects.toMatchObject(
      PROHIBIDO,
    );
  });

  it("no puede leer mensajes de contacto", async () => {
    const payload = await obtenerPayload();
    await expect(payload.find({ collection: "mensajes-contacto", ...como(editor) })).rejects.toMatchObject(PROHIBIDO);
  });

  it("sólo ve su propio usuario", async () => {
    const payload = await obtenerPayload();
    const visibles = await payload.find({ collection: "users", ...como(editor) });
    expect(visibles.docs.map((u) => u.id)).toEqual([editor.id]);
    const ajeno = await payload.find({
      collection: "users",
      where: { id: { equals: otroEditor.id } },
      ...como(editor),
    });
    expect(ajeno.totalDocs).toBe(0);
  });

  it("puede actualizar su propio usuario pero no el de otro", async () => {
    const payload = await obtenerPayload();
    const propio = await payload.update({
      collection: "users",
      id: editor.id,
      data: { nombre: "Editora" },
      ...como(editor),
    });
    expect(propio.nombre).toBe("Editora");
    await expect(
      payload.update({ collection: "users", id: otroEditor.id, data: { nombre: "Hackeado" }, ...como(editor) }),
    ).rejects.toMatchObject({ status: expect.toSatisfy((s: number) => s === 403 || s === 404) });
  });

  it("no puede ascenderse a admin (el campo rol se ignora)", async () => {
    const payload = await obtenerPayload();
    const resultado = await payload.update({
      collection: "users",
      id: editor.id,
      data: { rol: "admin" },
      ...como(editor),
    });
    expect(resultado.rol).toBe("editor");
    const releido = await payload.findByID({ collection: "users", id: editor.id, overrideAccess: true });
    expect(releido.rol).toBe("editor");
  });
});

describe("S1 · admin", () => {
  it("puede crear usuarios con rol admin y editor", async () => {
    const payload = await obtenerPayload();
    const nuevoAdmin = await payload.create({
      collection: "users",
      data: { email: correoUnico("admin2"), password: CONTRASENA, nombre: "Segundo admin", rol: "admin" },
      ...como(admin),
    });
    const nuevoEditor = await payload.create({
      collection: "users",
      data: { email: correoUnico("editor2"), password: CONTRASENA, nombre: "Segundo editor", rol: "editor" },
      ...como(admin),
    });
    expect(nuevoAdmin.rol).toBe("admin");
    expect(nuevoEditor.rol).toBe("editor");
  });

  it("puede leer los mensajes de contacto", async () => {
    const payload = await obtenerPayload();
    await payload.create({
      collection: "mensajes-contacto",
      data: { nombre: "Vecina", correo: "vecina@pruebas.test", asunto: "Consulta", mensaje: "Un mensaje largo" },
      overrideAccess: true,
    });
    const mensajes = await payload.find({ collection: "mensajes-contacto", ...como(admin) });
    expect(mensajes.docs.map((m) => m.asunto)).toContain("Consulta");
  });

  it("puede leer y borrar cualquier usuario", async () => {
    const payload = await obtenerPayload();
    const todos = await payload.find({ collection: "users", ...como(admin) });
    expect(todos.docs.map((u) => u.id)).toEqual(expect.arrayContaining([admin.id, editor.id, otroEditor.id]));
    await payload.delete({ collection: "users", id: otroEditor.id, ...como(admin) });
    const restantes = await payload.find({
      collection: "users",
      where: { id: { equals: otroEditor.id } },
      ...como(admin),
    });
    expect(restantes.totalDocs).toBe(0);
  });
});
