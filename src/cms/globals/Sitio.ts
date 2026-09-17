import type { Field, GlobalConfig } from "payload";
import { esEditor, publico } from "../access";
import { revalidarGlobal } from "../hooks/revalidar";

const texto = (name: string, label: string): Field => ({ name, type: "textarea", localized: true, label });

export const Sitio: GlobalConfig = {
  slug: "sitio",
  label: "Textos del sitio",
  admin: { group: "Contenido" },
  access: { read: publico, update: esEditor },
  hooks: revalidarGlobal("sitio"),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Inicio",
          name: "inicio",
          fields: [texto("texto", "Texto bajo el nombre del Observatorio")],
        },
        {
          label: "Quiénes somos",
          name: "quienesSomos",
          fields: [
            texto("titulo", "Frase de apertura (título)"),
            { name: "proposito", type: "richText", localized: true, label: "Propósito" },
            texto("equipoTexto", "Texto de la sección Equipo"),
            texto("organizacionesTexto", "Texto del directorio de organizaciones"),
            texto("personasTexto", "Texto del directorio de personas"),
          ],
        },
        {
          label: "Encabezados de página",
          name: "paginas",
          fields: [
            texto("ejesDeTrabajo", "Ejes de trabajo"),
            texto("mapa", "Mapa de centros de datos"),
            texto("mapaResumen", "Resumen del mapa en Inicio"),
            texto("contacto", "Contacto"),
          ],
        },
        {
          label: "Publicaciones",
          name: "publicaciones",
          fields: [
            texto("reportes", "Reportes"),
            texto("articulosLibros", "Artículos y libros"),
            texto("recursosEducativos", "Recursos educativos o multimedia"),
          ],
        },
        {
          label: "Actualidad",
          name: "actualidad",
          fields: [
            texto("blog", "Blog"),
            texto("comunicados", "Comunicados"),
            texto("coberturaPrensa", "Cobertura de prensa"),
            texto("noticiasObservatorio", "Noticias del Observatorio"),
          ],
        },
        {
          label: "Páginas legales",
          name: "legales",
          fields: [
            { name: "accesibilidad", type: "richText", localized: true },
            { name: "privacidad", type: "richText", localized: true },
            { name: "terminos", type: "richText", localized: true, label: "Términos de uso" },
          ],
        },
        {
          label: "Contacto y redes",
          name: "redes",
          fields: [
            { name: "correoContacto", type: "email", label: "Correo de contacto público" },
            {
              name: "enlaces",
              type: "array",
              fields: [
                {
                  name: "red",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Instagram", value: "instagram" },
                    { label: "LinkedIn", value: "linkedin" },
                    { label: "Facebook", value: "facebook" },
                  ],
                },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
