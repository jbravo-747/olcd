/**
 * Siembra una base nueva. Se ejecuta una sola vez con `npm run seed` (o
 * `docker compose run --rm seed`) contra DATABASE_URI; no hace nada si ya hay
 * contenido.
 *
 * El contenido institucional (textos, equipo, organizaciones, labs) vive en
 * src/contenido y no pasa por aquí. El seed sólo carga las categorías, las
 * noticias del buscador y, con SEED_MAQUETA=1 (lo usan las pruebas), proyectos,
 * publicaciones y entradas de maqueta con lorem ipsum.
 */
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { parrafosALexical } from "../cms/lexical";
import { labs, type SlugLab } from "../contenido/labs";
import { proyectosMaqueta } from "./datos/labs";
import { publicaciones as publicacionesMaqueta } from "./datos/publicaciones";
import { entradas as entradasMaqueta } from "./datos/actualidad";
import { noticias as noticiasMaqueta, categoriasNoticias } from "./datos/noticias";

const contexto = { disableRevalidate: true };
const MAQUETA = process.env.SEED_MAQUETA === "1";
const en = (texto: string) => `[EN] ${texto}`;
const proyectos = MAQUETA ? labs.flatMap((l) => proyectosMaqueta(l.slug)) : [];

const meses: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

/** "Sábado, 03 Abril 2021" + "07:00 GMT" → ISO */
function fechaISO(texto: string, hora = "00:00 GMT") {
  const [, dia, mes, anio] = texto.match(/(\d{2}) (\w+) (\d{4})/) ?? [];
  const [hh, mm] = hora.replace(" GMT", "").split(":").map(Number);
  return new Date(Date.UTC(Number(anio), meses[mes.toLowerCase()], Number(dia), hh, mm)).toISOString();
}

function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function sembrarCategorias(payload: Payload) {
  const nombres = new Set<string>(categoriasNoticias);
  [...proyectos, ...publicacionesMaqueta, ...entradasMaqueta].forEach((d) =>
    d.categorias.forEach((c) => nombres.add(c)),
  );
  const ids = new Map<string, number>();
  for (const nombre of nombres) {
    const doc = await payload.create({
      collection: "categorias",
      data: { nombre, slug: slugificar(nombre) },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "categorias",
      id: doc.id,
      data: { nombre: en(nombre) },
      locale: "en",
      context: contexto,
    });
    ids.set(nombre, doc.id);
  }
  return (nombres: string[]) => nombres.map((n) => ids.get(n)!).filter(Boolean);
}

async function sembrarProyectos(payload: Payload, categoriaIds: (n: string[]) => number[]) {
  for (const p of proyectos) {
    const docProyecto = await payload.create({
      collection: "proyectos",
      data: {
        titulo: p.titulo,
        slug: p.slug,
        lab: p.lab as SlugLab,
        descripcion: p.descripcion,
        autores: p.autores,
        anio: p.anio,
        lugar: p.lugar,
        participantes: p.participantes,
        categorias: categoriaIds(p.categorias),
        secciones: p.secciones.map((s) => ({
          titulo: s.titulo,
          cuerpo: parrafosALexical(s.parrafos),
          subsecciones: s.subsecciones.map((sub) => ({
            titulo: sub.titulo,
            cuerpo: parrafosALexical(sub.parrafos),
          })),
        })),
        descargable: p.descargable ? { etiqueta: p.descargable.etiqueta } : undefined,
      },
      locale: "es",
      context: contexto,
    });
    // Al traducir un array hay que conservar los ids de sus filas; si no,
    // Payload las recrea y se pierden los valores del otro idioma.
    const seccionesEn = (docProyecto.secciones ?? []).map((fila, i) => ({
      id: fila.id,
      titulo: en(p.secciones[i].titulo),
      cuerpo: parrafosALexical(p.secciones[i].parrafos.map(en)),
      subsecciones: (fila.subsecciones ?? []).map((sub, j) => ({
        id: sub.id,
        titulo: en(p.secciones[i].subsecciones[j].titulo),
        cuerpo: parrafosALexical(p.secciones[i].subsecciones[j].parrafos.map(en)),
      })),
    }));
    await payload.update({
      collection: "proyectos",
      id: docProyecto.id,
      data: {
        titulo: en(p.titulo),
        descripcion: en(p.descripcion),
        lugar: en(p.lugar),
        participantes: en(p.participantes),
        secciones: seccionesEn,
        descargable: p.descargable ? { etiqueta: en(p.descargable.etiqueta) } : undefined,
      },
      locale: "en",
      context: contexto,
    });
  }
}

async function sembrarPublicaciones(payload: Payload, categoriaIds: (n: string[]) => number[]) {
  for (const pub of publicacionesMaqueta) {
    const doc = await payload.create({
      collection: "publicaciones",
      data: {
        titulo: pub.titulo,
        slug: pub.slug,
        tipo: pub.tipo,
        lab: pub.lab as SlugLab,
        descripcion: pub.descripcion,
        contenido: parrafosALexical(pub.contenido),
        autores: pub.autores,
        anio: pub.anio,
        paginas: pub.paginas,
        categorias: categoriaIds(pub.categorias),
      },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "publicaciones",
      id: doc.id,
      data: {
        titulo: en(pub.titulo),
        descripcion: en(pub.descripcion),
        contenido: parrafosALexical(pub.contenido.map(en)),
      },
      locale: "en",
      context: contexto,
    });
  }
}

async function sembrarEntradas(payload: Payload, categoriaIds: (n: string[]) => number[]) {
  for (const e of entradasMaqueta) {
    const doc = await payload.create({
      collection: "entradas",
      data: {
        titulo: e.titulo,
        slug: e.slug,
        tipo: e.tipo,
        fecha: fechaISO(e.fecha),
        descripcion: e.descripcion,
        contenido: parrafosALexical(e.contenido),
        creditos: e.creditos,
        participantes: e.participantes,
        fuente: e.fuente,
        categorias: categoriaIds(e.categorias),
      },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "entradas",
      id: doc.id,
      data: {
        titulo: en(e.titulo),
        descripcion: en(e.descripcion),
        contenido: parrafosALexical(e.contenido.map(en)),
        participantes: en(e.participantes),
      },
      locale: "en",
      context: contexto,
    });
  }
}

async function sembrarNoticias(payload: Payload, categoriaIds: (n: string[]) => number[]) {
  for (const n of noticiasMaqueta) {
    await payload.create({
      collection: "noticias",
      data: {
        titulo: n.titulo,
        medio: n.medio,
        fecha: fechaISO(n.fecha, n.hora),
        url: n.url === "#" ? "https://example.org" : n.url,
        categorias: categoriaIds(n.categorias),
      },
      context: contexto,
    });
  }
}

async function sembrarAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;
  const existentes = await payload.count({ collection: "users" });
  if (existentes.totalDocs > 0) return;
  await payload.create({ collection: "users", data: { email, password, nombre: "Administración", rol: "admin" } });
  payload.logger.info(`Usuario admin creado: ${email}`);
}

async function main() {
  const payload = await getPayload({ config });
  const { totalDocs } = await payload.count({ collection: "categorias" });
  if (totalDocs > 0) {
    payload.logger.warn("Ya hay contenido cargado; no se siembra contenido.");
    // Aun con contenido (p. ej. base restaurada por pg_dump) se intenta crear el
    // admin desde SEED_ADMIN_* si aún no hay ningún usuario (auditoría Q-6).
    await sembrarAdmin(payload);
    process.exit(0);
  }

  payload.logger.info("Sembrando categorías…");
  const categoriaIds = await sembrarCategorias(payload);
  payload.logger.info("Sembrando noticias…");
  await sembrarNoticias(payload, categoriaIds);
  if (MAQUETA) {
    payload.logger.info("Sembrando maqueta: proyectos, publicaciones y actualidad…");
    await sembrarProyectos(payload, categoriaIds);
    await sembrarPublicaciones(payload, categoriaIds);
    await sembrarEntradas(payload, categoriaIds);
  }
  await sembrarAdmin(payload);
  payload.logger.info("Listo.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
