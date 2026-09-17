import type { Metadata } from "next";
import { Archivo, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  description:
    "Maqueta del sitio del Observatorio Latinoamericano de Centros de Datos (OLCD).",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${robotoCondensed.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#contenido" className="skip-link">
          Saltar al contenido principal
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
