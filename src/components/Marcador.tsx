/**
 * Marcador decorativo para cuando falta una imagen. No muestra texto de
 * maqueta (antes "[Imagen]"/"[Foto]"/"[Logo]"): es un bloque neutral marcado
 * como `aria-hidden`, invisible para lectores de pantalla (A-7). El texto
 * alternativo real lo aporta `<Imagen>` cuando sí hay imagen.
 */
export default function Marcador({
  className = "",
  tono = "medio",
}: {
  /** Conservado por compatibilidad con las llamadas; ya no se muestra. */
  etiqueta?: string;
  className?: string;
  tono?: "medio" | "oscuro";
}) {
  const fondo = tono === "oscuro" ? "bg-slate" : "bg-slate-light";
  return (
    <div aria-hidden className={`flex items-center justify-center ${fondo} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 text-cream/40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}
