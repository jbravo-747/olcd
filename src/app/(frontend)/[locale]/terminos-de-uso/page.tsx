import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import Parrafos from "@/components/Parrafos";
import { textosDelSitio } from "@/contenido/textos";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legales" });
  return { title: t("terminos") };
}

export default async function Pagina({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legales");

  return (
    <>
      <EncabezadoPagina titulo={t("terminos")} />
      <div className="bg-cream py-16">
        <div className="shell max-w-3xl">
          <Parrafos parrafos={textosDelSitio(locale).legales.terminos} />
        </div>
      </div>
    </>
  );
}
