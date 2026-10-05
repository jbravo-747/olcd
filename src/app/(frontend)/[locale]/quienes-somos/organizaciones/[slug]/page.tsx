import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Imagen from "@/components/Imagen";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { buscarOrganizacion } from "@/lib/cms/organizaciones";
import { imagen } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: (await buscarOrganizacion(slug, locale))?.nombre ?? "Organización" };
}

/** N2 - Organizaciones */
export default async function FichaOrganizacion({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, org] = await Promise.all([getTranslations("organizacion"), buscarOrganizacion(slug, locale)]);
  if (!org) notFound();

  const datos: [string, string | null | undefined][] = [
    [t("region"), org.region],
    [t("web"), org.web],
    [t("correo"), org.correo],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1">{org.nombre}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Imagen
            media={imagen(org.logo)}
            etiqueta="[Logo]"
            className="aspect-[16/10] w-full rounded-xl"
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

        <TextoEnriquecido datos={org.descripcion} className="mt-14 max-w-4xl" />
      </div>
    </article>
  );
}
