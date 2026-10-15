/**
 * Equipo real del Observatorio (Contenidos de Diana B., octubre 2026).
 * El directorio de personas externas está "[EN CONSTRUCCIÓN]" en el contenido
 * oficial, así que sólo se siembra el equipo. Las fotos viven en la carpeta de
 * contenidos (fuera de git) y el seed las sube si la encuentra.
 */

export type Persona = {
  slug: string;
  nombre: string;
  titulo: string;
  rol: string;
  region: string;
  afiliacion: string;
  correo: string;
  biografia: string[];
  /** Agrupador usado en el directorio de personas ("Subtítulo" del wireframe). */
  grupo: string;
  /** true = aparece además en la sección Equipo. */
  equipo: boolean;
  /** Nombre de archivo de la foto dentro de la carpeta de contenidos. */
  foto?: string;
};

const base = { region: "México", afiliacion: "", correo: "", grupo: "Investigación", equipo: true };

export const personas: Persona[] = [
  {
    ...base,
    slug: "paola-ricaurte-quijano",
    nombre: "Paola Ricaurte Quijano",
    titulo: "Coordinadora General",
    rol: "Coordinadora General",
    foto: "Paola Ricaurte Quijano 002.jpg",
    biografia: [
      "Paola Ricaurte Quijano es investigadora titular del Departamento de Medios y Cultura Digital del Tecnológico de Monterrey e investigadora asociada del Berkman Klein Center for Internet & Society de la Universidad de Harvard. Es cofundadora de la red Tierra Común, la Coalición Feminista Descolonial por la Justicia Digital y Ambiental, el Observatorio Latinoamericano de Centros de Datos y la Red Feminista de IA en América Latina y el Caribe. Es integrante de la red AI Ethics Experts Without Borders y la plataforma Women for Ethical AI (W4EAI) de la UNESCO. Fue incluida en la lista TIME100 AI 2025 como una de las pensadoras más influyentes en el campo de la inteligencia artificial.",
    ],
  },
  {
    ...base,
    slug: "mariana-lorena-garcia-estrada",
    nombre: "Mariana Lorena García Estrada",
    titulo: "Coordinadora de Investigación",
    rol: "Coordinadora de Investigación",
    biografia: [],
  },
  {
    ...base,
    slug: "diana-baptista-rojo",
    nombre: "Diana Baptista Rojo",
    titulo: "Coordinadora de Comunicación",
    rol: "Coordinadora de Comunicación",
    correo: "datacenters@riseup.net",
    foto: "Diana Baptista Rojo.jpg",
    biografia: [
      "Licenciada en Comunicación por la Universidad Iberoamericana Ciudad de México. Exbecaria Fulbright - García Robles y Maestra en Periodismo de Datos por la Columbia University Graduate School of Journalism. Con más de 15 años de experiencia, Diana se ha especializado en la investigación de violaciones de derechos humanos en las Américas. Antes de unirse al Observatorio, trabajó como periodista de datos en Thomson Reuters Foundation, donde investigó la intersección entre tecnología, justicia económica y cambio climático. Una de sus investigaciones sobre el impacto ambiental de los centros de datos en Querétaro fue reconocida con un Telly Award en 2026. Diana también ha trabajado para Reuters, Noticias Telemundo y el periódico Reforma.",
    ],
  },
  {
    ...base,
    slug: "rodrigo-ardissom-de-souza",
    nombre: "Rodrigo Ardissom de Souza",
    titulo: "Coordinador de Políticas Públicas",
    rol: "Coordinador de Políticas Públicas",
    foto: "Rodrigo Ardissom de Souza.jpg",
    biografia: [
      "Rodrigo Ardissom de Souza es profesor-investigador de la División de Estudios Jurídicos del Centro de Investigación y Docencia Económicas (CIDE), México. Doctor en Antropología Social por la Escuela Nacional de Antropología e Historia (ENAH), maestro en Ciencias Antropológicas por la Universidad Autónoma Metropolitana (UAM) y licenciado en Ciencias Sociales y en Derecho. Ha desarrollado actividades de investigación en instituciones de México, Brasil y Portugal.",
      "Su trabajo se sitúa en la intersección entre derecho, tecnología y sociedad, con especial atención a la soberanía digital, la gubernamentalidad algorítmica, la regulación de plataformas y las infraestructuras digitales. Sus investigaciones examinan las relaciones entre poder, dependencia tecnológica y capacidades regulatorias de los Estados latinoamericanos.",
      "En el Observatorio Latinoamericano de Centros de Datos participa en el análisis comparado de los marcos normativos y las políticas públicas que regulan estas infraestructuras, particularmente en Brasil y México, atendiendo a sus implicaciones jurídicas, políticas y sociales.",
    ],
  },
  {
    ...base,
    slug: "leonardo-aranda",
    nombre: "Leonardo Aranda",
    titulo: "Coordinador de Ciencia Ciudadana",
    rol: "Coordinador de Ciencia Ciudadana",
    foto: "Leonardo Aranda.jpg",
    biografia: [
      "Artista de medios egresado de la Facultad de Artes de la UAEM. Maestro en Filosofía por la UNAM. Doctor en Estudio de Medios por la Universidad del Estado de Nueva York. Es director del Medialabmx, organización enfocada en la investigación sobre los vínculos entre arte, tecnología y política. Su trabajo se centra en el uso de nuevos medios y sus intersecciones con participación y ciudadanía. Ha expuesto en diversos países como México, Rusia, Austria, Estados Unidos, España, Canadá y Brasil. Ha sido becario de Interactivos en Medialab-Prado, IDEAS CITY Detroit del New Museum, el programa de residencia Solitude-ZKM, el New School Institute for Critical Social Inquiry, Processing Foundation y Rhizome. Su obra forma parte de la tercera y cuarta colección de la Electronic Literature Organization. En 2023 fue invitado a impartir un seminario dentro del Programa de Doctorado en Tecnoestética de la Universidad Tres de Febrero en Argentina. Actualmente desarrolla el programa Cuando las nubes eran de agua, iniciado con el apoyo del PAC y apoyado actualmente por el programa de Coinversiones del SACPC.",
    ],
  },
  {
    ...base,
    slug: "itzel-yllescas",
    nombre: "Itzel Yllescas",
    titulo: "Coordinadora de Proyecto",
    rol: "Coordinadora de Proyecto",
    foto: "Itzel Yllescas.JPEG",
    biografia: [
      "Itzel Yllescas Balderas es Licenciada en Relaciones Internacionales por el Tecnológico de Monterrey con experiencia en proyectos de investigación social, género y participación ciudadana en México y Canadá. Actualmente es encargada del área administrativa para el Observatorio Latinoamericano de Centros de Datos, además de ocupar el puesto de profesora de humanidades y ciencias sociales en instituciones de educación media superior y universidades locales. Itzel ha participado en la producción y edición de revistas digitales como Virtualis: Revista de Cultura Digital y la Revista Retos Internacionales promovida por el Departamento de Humanidades y Relaciones Internacionales del Tec de Monterrey, campus Querétaro. Desarrolló un papel de asistente de investigación en el proyecto “Parenting within professions: balancing work and family in Academia” desarrollado por la Universidad de Alberta, campus Augustana, en Canadá. Al igual que fungió como especialista de investigación en la iniciativa de innovación ciudadana Openlabs y participó en el encuentro de inteligencia artificial feminista “f<A+i>r Regional Convening: Consolidating the Feminist AI Research & Innovation Ecosystem in Latin America and the Caribbean”.",
    ],
  },
  {
    ...base,
    slug: "salomon-juarez-jimenez",
    nombre: "Salomón Juárez Jiménez",
    titulo: "Asistente de Coordinación e Investigación",
    rol: "Asistente de Coordinación e Investigación",
    foto: "Salomon Juarez Jimenez.jpg",
    biografia: [
      "Sociólogo por la Universidad Autónoma de Querétaro, titulado con mención honorífica. Cuenta con formación complementaria (diplomados y seminarios) en temas de Justicia Ambiental, Gobernanza Socioambiental, Cambio Climático y Transiciones Justas por el Consejo Latinoamericano de Ciencias Sociales (CLACSO). Su trabajo se enmarca principalmente en la Ecología Política y la Teoría del Actor-Red. Sostiene su práctica profesional desde la metodología de investigación-acción participativa, convencido de que el conocimiento se construye con las comunidades y desde el territorio. Ha realizado trabajo de campo y acompañamiento comunitario en los municipios de Colón, El Marqués y Peñamiller, promoviendo procesos de sensibilización, formación y fortalecimiento de la organización comunitaria en torno al cuidado del agua y la defensa del territorio, desde una perspectiva de derechos humanos. Actualmente colabora con el Observatorio Latinoamericano de Centros de Datos en el área de investigación y sistematización de información; de igual manera forma parte del proyecto Data Común: Visibilización de datos. Territorio + Agua. Su trabajo busca contribuir a la construcción de autonomías hídricas y territoriales en contextos de extractivismos.",
    ],
  },
  {
    ...base,
    slug: "ivanna-polo",
    nombre: "Ivanna Polo",
    titulo: "Asistente de Comunicación e Investigación",
    rol: "Asistente de Comunicación e Investigación",
    biografia: [
      "Ivanna Polo es investigadora, escritora y creadora audiovisual. Aunque comunicóloga de profesión, su desarrollo se ha orientado a diversas áreas del hacer y el saber. Inició formándose en el Programa de Investigación de la Red Feminista de Inteligencia Artificial en América Latina y el Caribe, donde posteriormente fue colaboradora. Cursó el Diploma Superior en Inteligencia artificial y ciencias sociales. Desafíos teóricos y epistemológicos en CLACSO y fue consultora de investigación en Mila - Quebec Artificial Intelligence Institute. Por otra parte, cuenta con estudios de especialidad en Creación Experimental en Medios (Tecnológico de Monterrey), Literatura Latinoamericana Contemporánea (INBAL), Edición (Sexto Piso) y Archivo (LAA). Es cofundadora y colaboradora de Colectiva Alta-Voz, una red artística enfocada en la imagen en movimiento que busca revalorizar los procesos creativos. Actualmente es estudiante del Posgrado en Ciencias Sociales y Humanidades de la UAM-C, donde indaga alrededor de prácticas artísticas, estéticas y políticas.",
    ],
  },
  {
    ...base,
    slug: "diana-moreno",
    nombre: "Diana Moreno",
    titulo: "Diseñadora gráfica",
    rol: "Diseñadora gráfica",
    biografia: [],
  },
  {
    ...base,
    slug: "laura-ugalde",
    nombre: "Laura Ugalde",
    titulo: "Investigadora comunitaria",
    rol: "Investigadora comunitaria",
    biografia: [],
  },
];

export const equipo = personas.filter((p) => p.equipo);

export const personasPorGrupo = ["Investigación", "Comunidad", "Aliados"].map((grupo) => ({
  grupo,
  personas: personas.filter((p) => !p.equipo && p.grupo === grupo),
}));

export function buscarPersona(slug: string) {
  return personas.find((p) => p.slug === slug);
}
