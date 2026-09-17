import type { Metadata } from "next";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { descripcionLarga } from "@/data/lorem";

export const metadata: Metadata = { title: "Términos de uso" };

export default function Pagina() {
  return (
    <>
      <EncabezadoPagina titulo="Términos de uso" />
      <div className="bg-cream py-16">
        <div className="shell max-w-3xl">
          {descripcionLarga.map((p, i) => (
            <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
              {p}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
