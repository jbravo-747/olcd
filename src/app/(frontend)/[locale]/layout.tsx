import type { Metadata } from "next";
import { Archivo, Roboto_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { routing } from "@/i18n/routing";

// El contenido viene del CMS en cada request (con Data Cache por etiquetas);
// así `next build` no necesita la base de datos.
export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Observatorio Latinoamericano de Centros de Datos",
    template: "%s | OLCD",
  },
  description: "Sitio del Observatorio Latinoamericano de Centros de Datos (OLCD).",
  icons: { icon: "/favicon.ico" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("header");

  return (
    <html lang={locale} className={`${archivo.variable} ${robotoCondensed.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a href="#contenido" className="skip-link">
            {t("saltarContenido")}
          </a>
          <Header />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
