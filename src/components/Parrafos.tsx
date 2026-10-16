/** Párrafos de texto fijo con la tipografía del sitio (.prosa), como TextoEnriquecido. */
export default function Parrafos({ parrafos, className = "" }: { parrafos: readonly string[]; className?: string }) {
  if (parrafos.length === 0) return null;
  return (
    <div className={`prosa ${className}`}>
      {parrafos.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
