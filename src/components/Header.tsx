"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";
import { Link, usePathname } from "@/i18n/navigation";
import { navegacion } from "@/lib/navegacion";
import { IconoCerrar, IconoChevron, IconoMenu } from "./Iconos";

export default function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const [abierto, setAbierto] = useState(false);
  const [desplegado, setDesplegado] = useState<string | null>(null);

  // Al navegar se cierra el menú móvil.
  useEffect(() => {
    setAbierto(false);
    setDesplegado(null);
  }, [pathname]);

  const activo = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const otroIdioma = locale === "es" ? "en" : "es";

  const conmutadorIdioma = (className: string) => (
    <Link href={pathname} locale={otroIdioma} className={className} aria-label={t("cambiarIdioma")}>
      {t("codigoIdioma")}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-ink-soft text-cream">
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo />

        {/* Navegación de escritorio */}
        <nav aria-label={t("principal")} className="hidden items-center gap-1 lg:flex">
          {navegacion.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-[length:var(--fs-nav)] font-semibold transition-colors hover:bg-white/10 ${
                  activo(item.href) ? "bg-white/10" : ""
                }`}
              >
                {tNav(item.clave)}
                {item.hijos && <IconoChevron className="h-3 w-3" />}
              </Link>

              {item.hijos && (
                <div className="invisible absolute left-0 top-full w-64 translate-y-1 rounded-2xl bg-ink-soft p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.hijos.map((hijo) => (
                    <Link
                      key={hijo.href}
                      href={hijo.href}
                      className="block rounded-xl px-3 py-2 text-[length:var(--fs-nav)] text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
                    >
                      {tNav(hijo.clave)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-px bg-white/25 lg:block" />
          {conmutadorIdioma("hidden text-[length:var(--fs-nav)] font-semibold tracking-wide lg:block")}

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? t("cerrarMenu") : t("abrirMenu")}
          >
            {abierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
      </div>

      {/* Navegación móvil */}
      {abierto && (
        <nav id="menu-movil" aria-label={t("principalMovil")} className="border-t border-white/10 bg-ink-soft lg:hidden">
          <div className="shell max-h-[70vh] overflow-y-auto py-3">
            {navegacion.map((item) => (
              <div key={item.href} className="border-b border-white/10 last:border-0">
                <div className="flex items-center justify-between">
                  <Link href={item.href} className="block flex-1 py-3 text-sm font-semibold">
                    {tNav(item.clave)}
                  </Link>
                  {item.hijos && (
                    <button
                      type="button"
                      onClick={() => setDesplegado(desplegado === item.href ? null : item.href)}
                      aria-expanded={desplegado === item.href}
                      aria-label={t("mostrarSecciones", { seccion: tNav(item.clave) })}
                      className="p-3"
                    >
                      <IconoChevron
                        className={`h-4 w-4 transition-transform ${desplegado === item.href ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {item.hijos && desplegado === item.href && (
                  <div className="pb-3 pl-3">
                    {item.hijos.map((hijo) => (
                      <Link key={hijo.href} href={hijo.href} className="block py-2 text-sm text-cream/75">
                        {tNav(hijo.clave)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {conmutadorIdioma("block py-4 text-sm font-semibold")}
          </div>
        </nav>
      )}
    </header>
  );
}
