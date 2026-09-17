import Link from "next/link";
import Logo from "./Logo";
import { columnasFooter, enlacesLegales, redes } from "@/data/navegacion";
import { IconoRed } from "./Iconos";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="shell grid gap-12 py-14 lg:grid-cols-[220px_1fr]">
        <Logo variante="bloque" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columnasFooter.map((columna) => (
            <div key={columna.titulo.href}>
              <Link href={columna.titulo.href} className="block text-[13px] font-bold hover:underline">
                {columna.titulo.label}
              </Link>
              <ul className="mt-3 space-y-2">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.href + enlace.label}>
                    <Link href={enlace.href} className="text-[13px] text-cream/55 transition-colors hover:text-cream">
                      {enlace.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="shell flex flex-col gap-6 border-t border-white/10 py-6 sm:flex-row sm:items-center">
        <ul className="flex items-center gap-4">
          {redes.map((red) => (
            <li key={red.label}>
              <a href={red.href} target="_blank" rel="noreferrer" aria-label={red.label} className="block text-cream/90 hover:text-cream">
                <IconoRed tipo={red.icono} />
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap gap-x-8 gap-y-2 sm:ml-12">
          {enlacesLegales.map((enlace) => (
            <li key={enlace.href}>
              <Link href={enlace.href} className="text-[13px] text-cream/70 hover:text-cream">
                {enlace.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
