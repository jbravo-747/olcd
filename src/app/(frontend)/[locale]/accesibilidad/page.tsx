import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { obtenerSitio } from "@/lib/cms/sitio";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legales" });
  return { title: t("accesibilidad") };
}

export default async function Pagina({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, sitio] = await Promise.all([getTranslations("legales"), obtenerSitio(locale)]);

  return (
    <>
      <EncabezadoPagina titulo={t("accesibilidad")} />
      <div className="bg-cream py-16">
        <div className="shell max-w-3xl">
          <TextoEnriquecido datos={sitio.legales?.accesibilidad} />
        </div>
      </div>
    </>
  );
}
