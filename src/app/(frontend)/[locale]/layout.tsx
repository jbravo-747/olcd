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

const URL_BASE = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// `metadataBase` resuelve las URLs relativas de canonical, hreflang y Open
// Graph. El Open Graph y la descripción por defecto se sobrescriben por página
// (Q-7 / A-6).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const descripcion = "Sitio del Observatorio Latinoamericano de Centros de Datos (OLCD).";
  return {
    metadataBase: new URL(URL_BASE),
    title: {
      default: "Observatorio Latinoamericano de Centros de Datos",
      template: "%s | OLCD",
    },
    description: descripcion,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: "OLCD",
      locale: locale === "en" ? "en_US" : "es_ES",
      title: "Observatorio Latinoamericano de Centros de Datos",
      description: descripcion,
    },
  };
}

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
