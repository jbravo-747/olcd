import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Imagen from "@/components/Imagen";
import Parrafos from "@/components/Parrafos";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { buscarMiembroEquipo } from "@/contenido/equipo";
import { buscarPersona } from "@/lib/cms/personas";
import { imagen } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

/** El equipo vive en el código; el directorio de personas externas, en el CMS. */
async function obtenerFicha(slug: string, locale: Locale) {
  const miembro = buscarMiembroEquipo(slug);
  if (miembro) {
    return {
      nombre: miembro.nombre,
      foto: miembro.foto,
      datos: {
        organizacion: undefined,
        rol: miembro.rol,
        region: miembro.region,
        afiliacion: miembro.afiliacion,
        correo: miembro.correo,
      },
      biografia: <Parrafos parrafos={miembro.biografia} className="mt-14 max-w-4xl" />,
    };
  }
  const persona = await buscarPersona(slug, locale);
  if (!persona) return null;
  return {
    nombre: persona.nombre,
    foto: imagen(persona.foto),
    datos: {
      organizacion: persona.organizacion,
      rol: persona.rol,
      region: persona.region,
      afiliacion: persona.afiliacion,
      correo: persona.correo,
    },
    biografia: <TextoEnriquecido datos={persona.biografia} className="mt-14 max-w-4xl" />,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: (await obtenerFicha(slug, locale))?.nombre ?? "Persona" };
}

/** N2 - Personas */
export default async function FichaPersona({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, ficha] = await Promise.all([getTranslations("persona"), obtenerFicha(slug, locale)]);
  if (!ficha) notFound();

  const datos: [string, string | null | undefined][] = [
    [t("organizacion"), ficha.datos.organizacion],
    [t("rol"), ficha.datos.rol],
    [t("region"), ficha.datos.region],
    [t("afiliacion"), ficha.datos.afiliacion],
    [t("correo"), ficha.datos.correo],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1">{ficha.nombre}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Imagen
            media={ficha.foto}
            etiqueta="[Foto]"
            className="aspect-[4/3] w-full rounded-xl"
            sizes="(min-width: 1024px) 600px, 100vw"
            priority
          />

          <dl className="self-center">
            {datos
              .filter(([, valor]) => valor)
              .map(([clave, valor]) => (
                <div key={clave} className="border-b border-line py-4">
                  <dt className="text-xs uppercase tracking-wide text-ink/70">{clave}</dt>
                  <dd className="mt-1 text-[15px] font-semibold">{valor}</dd>
                </div>
              ))}
          </dl>
        </div>

        {ficha.biografia}
      </div>
    </article>
  );
}
