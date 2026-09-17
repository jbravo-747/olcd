import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="bg-cream py-32 text-center">
      <div className="shell">
        <p className="display text-6xl">404</p>
        <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
        <p className="mt-4 text-[15px] text-ink/75">La dirección que buscas no existe en esta maqueta.</p>
        <Link href="/" className="pill pill-dark mt-8">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
