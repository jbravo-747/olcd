"use client";

import { usePathname } from "next/navigation";

/**
 * Límite de error del área pública (A-9). Es un componente cliente y no depende
 * del contexto de next-intl (que puede no estar disponible al capturar un
 * error, p. ej. un fallo de base de datos en una página): el idioma se deduce
 * del prefijo de la ruta y los textos son bilingües y estáticos.
 */
const TEXTOS = {
  es: {
    titulo: "Algo salió mal",
    texto: "Ocurrió un error al cargar esta página. Puedes reintentar o volver al inicio.",
    reintentar: "Reintentar",
    inicio: "Volver al inicio",
  },
  en: {
    titulo: "Something went wrong",
    texto: "An error occurred while loading this page. You can try again or go back home.",
    reintentar: "Try again",
    inicio: "Back to home",
  },
} as const;

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "es";
  const t = TEXTOS[locale];

  return (
    <div className="bg-cream py-32 text-center">
      <div className="shell">
        <h1 className="display text-4xl">{t.titulo}</h1>
        <p className="mt-4 text-[15px] text-ink/75">{t.texto}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={reset} className="pill pill-dark">
            {t.reintentar}
          </button>
          <a href={`/${locale}`} className="pill pill-light border border-line">
            {t.inicio}
          </a>
        </div>
      </div>
    </div>
  );
}
