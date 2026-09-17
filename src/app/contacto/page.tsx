import type { Metadata } from "next";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { IconoRed } from "@/components/Iconos";
import { redes } from "@/data/navegacion";

export const metadata: Metadata = { title: "Contacto" };

/** Sección 8 del árbol de navegación. Sin wireframe: propuesta base. */
export default function PaginaContacto() {
  return (
    <>
      <EncabezadoPagina
        titulo="Contacto"
        descripcion="[Descripción corta] Escríbenos para sumarte a la red, compartir información sobre un centro de datos o solicitar una colaboración."
      />

      <div className="bg-cream py-16">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_320px]">
          <form className="max-w-2xl" aria-label="Formulario de contacto">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-2 block text-xs font-semibold">
                  Nombre
                </label>
                <input id="nombre" name="nombre" type="text" className="field border border-line" required />
              </div>
              <div>
                <label htmlFor="correo" className="mb-2 block text-xs font-semibold">
                  Correo electrónico
                </label>
                <input id="correo" name="correo" type="email" className="field border border-line" required />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="asunto" className="mb-2 block text-xs font-semibold">
                Asunto
              </label>
              <input id="asunto" name="asunto" type="text" className="field border border-line" />
            </div>

            <div className="mt-6">
              <label htmlFor="mensaje" className="mb-2 block text-xs font-semibold">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                className="w-full rounded-2xl border border-line bg-cream px-5 py-4 text-[15px]"
                required
              />
            </div>

            <button type="submit" className="pill pill-dark mt-8 px-8 py-3.5">
              Enviar mensaje
            </button>
            <p className="mt-3 text-xs text-ink/55">
              Maqueta: el formulario aún no envía datos.
            </p>
          </form>

          <aside className="rounded-xl bg-cream-deep p-8">
            <h2 className="display text-2xl">Escríbenos</h2>
            <p className="mt-4 text-sm">
              <a href="mailto:contacto@olcd.org" className="font-semibold underline">
                contacto@olcd.org
              </a>
            </p>

            <h3 className="mt-8 text-xs font-bold uppercase tracking-wide text-ink/60">Redes</h3>
            <ul className="mt-3 flex gap-4">
              {redes.map((red) => (
                <li key={red.label}>
                  <a href={red.href} target="_blank" rel="noreferrer" aria-label={red.label}>
                    <IconoRed tipo={red.icono} />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
