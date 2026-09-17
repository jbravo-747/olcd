/** Banda oscura con el título de la página (N1 de los wireframes). */
export default function EncabezadoPagina({
  titulo,
  descripcion,
  children,
  alto = "normal",
}: {
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
  alto?: "normal" | "alto";
}) {
  return (
    <section className={`bg-slate text-cream ${alto === "alto" ? "py-24" : "py-16"}`}>
      <div className="shell text-center">
        <h1 className="display t-h1">{titulo}</h1>
        {descripcion && (
          <p className="t-lead mx-auto mt-6 max-w-[var(--lead-max)] text-cream/85">{descripcion}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function TituloSeccion({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={`display t-section ${className}`}>
      {children}
    </h2>
  );
}
