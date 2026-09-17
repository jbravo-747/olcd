/**
 * Siembra el CMS con el contenido de la maqueta (src/seed/datos/*). Se ejecuta con
 * `npm run seed` contra la base de datos de DATABASE_URI. No hace nada si ya
 * hay labs cargados.
 */
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { parrafosALexical } from "../cms/lexical";
import { labs as labsMaqueta } from "./datos/labs";
import { publicaciones as publicacionesMaqueta } from "./datos/publicaciones";
import { entradas as entradasMaqueta } from "./datos/actualidad";
import { noticias as noticiasMaqueta, categoriasNoticias } from "./datos/noticias";
import { centros as centrosMaqueta } from "./datos/centros";
import { personas as personasMaqueta } from "./datos/personas";
import { organizaciones as organizacionesMaqueta } from "./datos/organizaciones";
import { descripcionCortaLarga, descripcionLarga } from "./datos/lorem";

const contexto = { disableRevalidate: true };
const en = (texto: string) => `[EN] ${texto}`;

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
  [...labsMaqueta.flatMap((l) => l.proyectos), ...publicacionesMaqueta, ...entradasMaqueta].forEach((d) =>
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

async function sembrarOrganizaciones(payload: Payload) {
  const ids: number[] = [];
  for (const o of organizacionesMaqueta) {
    const doc = await payload.create({
      collection: "organizaciones",
      data: {
        nombre: o.nombre,
        slug: o.slug,
        region: o.region,
        web: o.web,
        correo: o.correo,
        descripcion: parrafosALexical(o.descripcion),
      },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "organizaciones",
      id: doc.id,
      data: { descripcion: parrafosALexical(o.descripcion.map(en)) },
      locale: "en",
      context: contexto,
    });
    ids.push(doc.id);
  }
  return ids;
}

async function sembrarLabsYProyectos(payload: Payload, categoriaIds: (n: string[]) => number[]) {
  const labIdPorNombre = new Map<string, number>();
  for (const [i, lab] of labsMaqueta.entries()) {
    const docLab = await payload.create({
      collection: "labs",
      data: {
        nombre: lab.nombre,
        slug: lab.slug,
        orden: i,
        descripcion: lab.descripcion,
        introduccion: parrafosALexical(lab.introduccion),
      },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "labs",
      id: docLab.id,
      data: {
        nombre: lab.nombre,
        descripcion: en(lab.descripcion),
        introduccion: parrafosALexical(lab.introduccion.map(en)),
      },
      locale: "en",
      context: contexto,
    });
    labIdPorNombre.set(lab.nombre, docLab.id);

    for (const p of lab.proyectos) {
      const docProyecto = await payload.create({
        collection: "proyectos",
        data: {
          titulo: p.titulo,
          slug: p.slug,
          lab: docLab.id,
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
  return labIdPorNombre;
}

async function sembrarPublicaciones(
  payload: Payload,
  labIdPorNombre: Map<string, number>,
  categoriaIds: (n: string[]) => number[],
) {
  for (const pub of publicacionesMaqueta) {
    const doc = await payload.create({
      collection: "publicaciones",
      data: {
        titulo: pub.titulo,
        slug: pub.slug,
        tipo: pub.tipo,
        lab: labIdPorNombre.get(pub.lab),
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

async function sembrarCentros(payload: Payload) {
  const estado: Record<string, "en-operacion" | "en-construccion" | "anunciado"> = {
    "En operación": "en-operacion",
    "En construcción": "en-construccion",
    Anunciado: "anunciado",
  };
  for (const c of centrosMaqueta) {
    await payload.create({
      collection: "centros",
      data: {
        nombre: c.nombre,
        ciudad: c.ciudad,
        pais: c.pais,
        empresa: c.empresa,
        estado: estado[c.estado],
        inversionUsdMillones: Number(c.inversion.replace(/[^\d]/g, "")),
        lat: c.lat,
        lng: c.lng,
      },
      context: contexto,
    });
  }
}

async function sembrarPersonas(payload: Payload, organizacionIds: number[]) {
  const grupo: Record<string, "investigacion" | "comunidad" | "aliados"> = {
    Investigación: "investigacion",
    Comunidad: "comunidad",
    Aliados: "aliados",
  };
  for (const [i, p] of personasMaqueta.entries()) {
    const doc = await payload.create({
      collection: "personas",
      data: {
        nombre: p.nombre,
        slug: p.slug,
        orden: i,
        equipo: p.equipo,
        grupo: grupo[p.grupo],
        titulo: p.titulo,
        rol: p.rol,
        organizacion: organizacionIds[i % organizacionIds.length],
        region: p.region,
        afiliacion: p.afiliacion,
        correo: p.correo,
        biografia: parrafosALexical(p.biografia),
      },
      locale: "es",
      context: contexto,
    });
    await payload.update({
      collection: "personas",
      id: doc.id,
      data: {
        titulo: en(p.titulo),
        rol: en(p.rol),
        afiliacion: en(p.afiliacion),
        biografia: parrafosALexical(p.biografia.map(en)),
      },
      locale: "en",
      context: contexto,
    });
  }
}

async function sembrarSitio(payload: Payload) {
  const datos = (traducir: (s: string) => string) => ({
    inicio: { texto: traducir(descripcionCortaLarga) },
    quienesSomos: {
      titulo: traducir(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus.",
      ),
      proposito: parrafosALexical(descripcionLarga.map(traducir)),
      equipoTexto: traducir(descripcionCortaLarga),
      organizacionesTexto: traducir(descripcionCortaLarga),
      personasTexto: traducir(descripcionCortaLarga),
    },
    paginas: {
      ejesDeTrabajo: traducir(descripcionCortaLarga),
      mapa: traducir(
        "[Descripción corta] Registro colaborativo de los centros de datos anunciados, en construcción y en operación en América Latina.",
      ),
      mapaResumen: traducir(
        "Registro colaborativo de la infraestructura anunciada, en construcción y en operación en América Latina.",
      ),
      contacto: traducir(
        "[Descripción corta] Escríbenos para sumarte a la red, compartir información sobre un centro de datos o solicitar una colaboración.",
      ),
    },
    publicaciones: {
      reportes: traducir(descripcionCortaLarga),
      articulosLibros: traducir(descripcionCortaLarga),
      recursosEducativos: traducir(descripcionCortaLarga),
    },
    actualidad: {
      blog: traducir(
        "[Descripción corta] Entradas del Observatorio con galería de imágenes, créditos y participantes.",
      ),
      comunicados: traducir("[Descripción corta] Posicionamientos públicos del Observatorio en PDF descargable."),
      coberturaPrensa: traducir("[Descripción corta] Menciones del Observatorio en medios de comunicación."),
      noticiasObservatorio: traducir("[Descripción corta] Avisos, convocatorias y novedades de la red."),
    },
    legales: {
      accesibilidad: parrafosALexical(descripcionLarga.map(traducir)),
      privacidad: parrafosALexical(descripcionLarga.map(traducir)),
      terminos: parrafosALexical(descripcionLarga.map(traducir)),
    },
    redes: {
      correoContacto: "contacto@olcd.org",
      enlaces: [
        { red: "instagram" as const, url: "https://instagram.com" },
        { red: "linkedin" as const, url: "https://linkedin.com" },
        { red: "facebook" as const, url: "https://facebook.com" },
      ],
    },
  });
  await payload.updateGlobal({ slug: "sitio", data: datos((s) => s), locale: "es", context: contexto });
  await payload.updateGlobal({ slug: "sitio", data: datos(en), locale: "en", context: contexto });
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
  const { totalDocs } = await payload.count({ collection: "labs" });
  if (totalDocs > 0) {
    payload.logger.warn("Ya hay contenido cargado; no se siembra contenido.");
    // Aun con contenido (p. ej. base restaurada por pg_dump) se intenta crear el
    // admin desde SEED_ADMIN_* si aún no hay ningún usuario (auditoría Q-6).
    await sembrarAdmin(payload);
    process.exit(0);
  }

  payload.logger.info("Sembrando categorías…");
  const categoriaIds = await sembrarCategorias(payload);
  payload.logger.info("Sembrando organizaciones…");
  const organizacionIds = await sembrarOrganizaciones(payload);
  payload.logger.info("Sembrando labs y proyectos…");
  const labIdPorNombre = await sembrarLabsYProyectos(payload, categoriaIds);
  payload.logger.info("Sembrando publicaciones…");
  await sembrarPublicaciones(payload, labIdPorNombre, categoriaIds);
  payload.logger.info("Sembrando actualidad…");
  await sembrarEntradas(payload, categoriaIds);
  payload.logger.info("Sembrando noticias…");
  await sembrarNoticias(payload, categoriaIds);
  payload.logger.info("Sembrando centros de datos…");
  await sembrarCentros(payload);
  payload.logger.info("Sembrando personas…");
  await sembrarPersonas(payload, organizacionIds);
  payload.logger.info("Sembrando textos del sitio…");
  await sembrarSitio(payload);
  await sembrarAdmin(payload);
  payload.logger.info("Listo.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
