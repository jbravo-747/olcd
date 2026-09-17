import { descripcionLarga } from "./lorem";

export type Persona = {
  slug: string;
  nombre: string;
  titulo: string;
  organizacion: string;
  rol: string;
  region: string;
  afiliacion: string;
  correo: string;
  biografia: string[];
  /** Agrupador usado en el directorio de personas ("Subtítulo" del wireframe). */
  grupo: string;
  /** true = aparece además en la sección Equipo. */
  equipo: boolean;
};

const regiones = ["México", "Brasil", "Chile", "Colombia", "Argentina", "Uruguay"];
const grupos = ["Investigación", "Comunidad", "Aliados"];

function persona(i: number): Persona {
  return {
    slug: `persona-${i}`,
    nombre: `Nombre ${i}`,
    titulo: "Título",
    organizacion: "Organización",
    rol: "Rol",
    region: regiones[i % regiones.length],
    afiliacion: "Afiliación",
    correo: "correo@ejemplo.org",
    biografia: descripcionLarga,
    grupo: grupos[Math.floor((i - 1) / 4) % grupos.length],
    equipo: i <= 12,
  };
}

/** 12 integrantes del equipo + 12 personas del directorio. */
export const personas: Persona[] = Array.from({ length: 24 }, (_, i) => persona(i + 1));

export const equipo = personas.filter((p) => p.equipo);

export const personasPorGrupo = grupos.map((grupo) => ({
  grupo,
  personas: personas.filter((p) => !p.equipo && p.grupo === grupo),
}));

export function buscarPersona(slug: string) {
  return personas.find((p) => p.slug === slug);
}
