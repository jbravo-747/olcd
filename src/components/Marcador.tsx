/** Bloque gris que sustituye a una imagen en la maqueta ("[Imagen]"). */
export default function Marcador({
  etiqueta = "[Imagen]",
  className = "",
  tono = "medio",
}: {
  etiqueta?: string;
  className?: string;
  tono?: "medio" | "oscuro";
}) {
  const fondo = tono === "oscuro" ? "bg-slate text-cream/80" : "bg-slate-light text-cream/90";
  return (
    <div className={`flex items-center justify-center text-center text-sm font-semibold ${fondo} ${className}`}>
      <span className="px-4 whitespace-pre-line">{etiqueta}</span>
    </div>
  );
}
