import Link from "next/link";

/** Bloque de bienvenida en la página de inicio del panel. */
export function Bienvenida() {
  return (
    <section className="olcd-bienvenida">
      <div>
        <h2>Sitio del Observatorio Latinoamericano de Centros de Datos</h2>
        <p>
          Este panel gestiona todo el contenido del sitio público. Cada apartado del menú corresponde a una
          sección del sitio; al guardar un cambio se publica de inmediato en español y, si está traducido, en
          inglés.
        </p>
      </div>
      <Link href="/admin/manual" className="btn btn--style-primary btn--size-medium olcd-bienvenida__boton">
        Leer el manual de uso
      </Link>
    </section>
  );
}
