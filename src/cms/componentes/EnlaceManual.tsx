import Link from "next/link";

/** Enlace al manual, al final del menú lateral. */
export function EnlaceManual() {
  return (
    <div className="olcd-nav-manual">
      <Link href="/admin/manual" className="nav__link">
        Manual de uso
      </Link>
    </div>
  );
}
