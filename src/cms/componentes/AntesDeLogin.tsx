/** Texto que aparece sobre el formulario de inicio de sesión. */
export function AntesDeLogin() {
  return (
    <div className="olcd-intro">
      <h2>Panel de administración</h2>
      <p>
        Desde aquí el equipo del Observatorio publica y actualiza el contenido del sitio: ejes de trabajo y
        proyectos, publicaciones, actualidad, el registro de centros de datos, el directorio de personas y
        organizaciones y los textos de las páginas, en español e inglés. Los cambios se ven en el sitio al
        guardar.
      </p>
      <p className="olcd-intro__nota">Acceso reservado al equipo editorial. Si necesitas una cuenta, pídesela a una persona administradora.</p>
    </div>
  );
}
