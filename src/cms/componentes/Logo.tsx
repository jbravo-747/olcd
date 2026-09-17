/** Logo de la pantalla de inicio de sesión del panel. */
export function Logo() {
  return (
    <div className="olcd-logo olcd-logo--login">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-olcd-vertical.png" alt="Observatorio Latinoamericano de Centros de Datos" width={132} />
    </div>
  );
}
