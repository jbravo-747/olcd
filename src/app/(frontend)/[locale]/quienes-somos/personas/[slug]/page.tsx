import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Imagen from "@/components/Imagen";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { buscarPersona } from "@/lib/cms/personas";
import { imagen, poblado } from "@/lib/cms/util";
import type { Organizacion } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: (await buscarPersona(slug, locale))?.nombre ?? "Persona" };
}

/** N2 - Personas */
export default async function FichaPersona({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, persona] = await Promise.all([getTranslations("persona"), buscarPersona(slug, locale)]);
  if (!persona) notFound();

  const datos: [string, string | null | undefined][] = [
    [t("organizacion"), poblado<Organizacion>(persona.organizacion)?.nombre],
    [t("rol"), persona.rol],
    [t("region"), persona.region],
    [t("afiliacion"), persona.afiliacion],
    [t("correo"), persona.correo],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1">{persona.nombre}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Imagen
            media={imagen(persona.foto)}
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

        <TextoEnriquecido datos={persona.biografia} className="mt-14 max-w-4xl" />
      </div>
    </article>
  );
}
