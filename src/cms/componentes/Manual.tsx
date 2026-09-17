import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";

const secciones = [
  ["que-es", "Qué es este panel"],
  ["entrar", "Entrar y cambiar la contraseña"],
  ["menu", "Cómo está organizado el menú"],
  ["editar", "Crear y editar contenido"],
  ["idiomas", "Español e inglés"],
  ["archivos", "Imágenes y documentos"],
  ["relaciones", "Categorías, labs y otras relaciones"],
  ["textos", "Textos del sitio"],
  ["mensajes", "Mensajes de contacto"],
  ["usuarios", "Usuarios y permisos"],
  ["no-editable", "Lo que no se edita aquí"],
  ["consejos", "Buenas prácticas"],
] as const;

/** Vista /admin/manual: guía de uso del panel para el equipo editorial. */
export function Manual({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult;
  const rutaAdmin = req.payload.config.routes.admin;
  if (!req.user) redirect(`${rutaAdmin}/login?redirect=${encodeURIComponent(`${rutaAdmin}/manual`)}`);

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <article className="olcd-manual">
          <h1>Manual de uso del panel</h1>
          <p className="olcd-manual__lead">
            Guía para el equipo editorial del Observatorio. Explica qué hace cada apartado, cómo publicar contenido
            en los dos idiomas y qué cuidados tener con imágenes, documentos y datos.
          </p>

          <nav className="olcd-manual__indice" aria-label="Índice del manual">
            <ol>
              {secciones.map(([id, titulo]) => (
                <li key={id}>
                  <a href={`#${id}`}>{titulo}</a>
                </li>
              ))}
            </ol>
          </nav>

          <h2 id="que-es">1. Qué es este panel</h2>
          <p>
            Es el gestor de contenidos del sitio público del Observatorio. Todo lo que se ve en el sitio (labs y
            proyectos, publicaciones, actualidad, centros de datos del mapa, directorio de personas y organizaciones,
            textos de las páginas) se escribe aquí y se guarda en una base de datos. El sitio lee esa base y muestra
            los cambios en cuanto se guardan: no hace falta avisar a nadie ni esperar un despliegue.
          </p>
          <p>
            Cada apartado del menú de la izquierda corresponde a una sección del sitio. La regla general es: si algo
            del sitio tiene texto o imagen que puede cambiar con el tiempo, se edita aquí.
          </p>

          <h2 id="entrar">2. Entrar y cambiar la contraseña</h2>
          <ol>
            <li>Abre la dirección del sitio seguida de <code>/admin</code> e introduce tu correo y contraseña.</li>
            <li>
              Para cambiar la contraseña, pulsa tu avatar (arriba a la derecha) → <strong>Cuenta</strong> →
              «Cambiar contraseña».
            </li>
            <li>
              Si la olvidaste, usa «¿Olvidaste tu contraseña?» en la pantalla de acceso; recibirás un correo si el
              envío de correo está configurado. Si no, pide a una persona administradora que te asigne una nueva.
            </li>
          </ol>

          <h2 id="menu">3. Cómo está organizado el menú</h2>
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Apartado</th>
                <th>Qué controla en el sitio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={7}>Contenido</td>
                <td>Ejes de trabajo (labs)</td>
                <td>Las cinco tarjetas de «Ejes de trabajo» y la portada de cada lab. El campo «Orden» define la posición.</td>
              </tr>
              <tr>
                <td>Proyectos</td>
                <td>Los proyectos de cada lab: ficha, galería, secciones desplegables y documento descargable.</td>
              </tr>
              <tr>
                <td>Publicaciones</td>
                <td>Reportes, artículos y libros, recursos educativos. El «Tipo» decide en qué bloque aparece.</td>
              </tr>
              <tr>
                <td>Actualidad</td>
                <td>Blog, comunicados, cobertura de prensa y noticias del Observatorio. Se ordenan por fecha.</td>
              </tr>
              <tr>
                <td>Noticias (buscador)</td>
                <td>El corpus de notas de prensa que alimenta el «Buscador de noticias». Solo título, medio, fecha, enlace y categorías.</td>
              </tr>
              <tr>
                <td>Centros de datos</td>
                <td>Los puntos del mapa. Necesitan latitud y longitud en grados decimales (p. ej. 19.43, -99.13).</td>
              </tr>
              <tr>
                <td>Textos del sitio</td>
                <td>Textos fijos de las páginas: inicio, quiénes somos, encabezados, páginas legales, redes sociales.</td>
              </tr>
              <tr>
                <td rowSpan={2}>Directorio</td>
                <td>Personas</td>
                <td>Equipo y directorio. La casilla «Forma parte del equipo» las muestra en la sección Equipo; el «Grupo» las agrupa en el directorio.</td>
              </tr>
              <tr>
                <td>Organizaciones</td>
                <td>Directorio de organizaciones y la organización a la que pertenece cada persona.</td>
              </tr>
              <tr>
                <td>Catálogos</td>
                <td>Categorías</td>
                <td>Etiquetas compartidas por proyectos, publicaciones, actualidad y noticias.</td>
              </tr>
              <tr>
                <td rowSpan={2}>Archivos</td>
                <td>Imágenes</td>
                <td>Todas las fotos, logos y portadas. Se generan miniaturas automáticamente.</td>
              </tr>
              <tr>
                <td>Documentos</td>
                <td>PDF descargables (publicaciones, comunicados, iniciativas de ley).</td>
              </tr>
              <tr>
                <td rowSpan={2}>Administración</td>
                <td>Mensajes de contacto</td>
                <td>Lo que llega por el formulario de contacto del sitio. Solo visible para administradores.</td>
              </tr>
              <tr>
                <td>Usuarios</td>
                <td>Cuentas del equipo editorial y su rol. Solo administradores.</td>
              </tr>
            </tbody>
          </table>

          <h2 id="editar">4. Crear y editar contenido</h2>
          <ol>
            <li>Entra al apartado y pulsa <strong>Crear</strong> (arriba a la derecha) o abre un elemento existente.</li>
            <li>
              Rellena los campos. Los marcados con asterisco son obligatorios; el panel no deja guardar si falta
              alguno y señala cuál.
            </li>
            <li>
              El <strong>slug</strong> es la parte final de la dirección web del elemento (por ejemplo
              <code>reporte-energia-2026</code>): solo minúsculas, números y guiones, sin acentos ni espacios. No lo
              cambies después de publicar, porque los enlaces compartidos dejarían de funcionar.
            </li>
            <li>
              Pulsa <strong>Guardar</strong>. El cambio aparece en el sitio al recargar la página; no hay
              borradores ni aprobación previa, así que revisa antes de guardar.
            </li>
            <li>
              Para eliminar, abre el elemento y usa el menú «···» → Eliminar. No se puede deshacer. Si el elemento
              está relacionado con otros (una categoría usada en varias publicaciones), esas relaciones quedan vacías.
            </li>
          </ol>
          <p>
            Los campos de texto largo usan un editor con formato: títulos, negritas, listas, enlaces y citas. Pega
            texto desde Word con <code>Ctrl+Shift+V</code> para no arrastrar formatos extraños.
          </p>

          <h2 id="idiomas">5. Español e inglés</h2>
          <p>
            El sitio se publica en español e inglés. Arriba a la derecha de cada formulario hay un selector
            <strong>Idioma: Español / English</strong>. Los campos con texto (títulos, descripciones, cuerpos) tienen
            un valor por idioma; los datos (fechas, enlaces, coordenadas, relaciones, imágenes) son comunes.
          </p>
          <ol>
            <li>Escribe y guarda primero en español.</li>
            <li>Cambia el selector a English, traduce los campos de texto y guarda de nuevo.</li>
          </ol>
          <div className="olcd-manual__aviso">
            Si un campo no tiene traducción, el sitio en inglés muestra el texto en español. Los contenidos de
            ejemplo llevan el prefijo <code>[EN]</code> en inglés para localizar fácilmente lo que falta traducir.
          </div>

          <h2 id="archivos">6. Imágenes y documentos</h2>
          <ul>
            <li>
              Puedes subir una imagen desde el propio campo («Crear nuevo») o antes, en <strong>Archivos → Imágenes</strong>,
              y luego elegirla («Seleccionar existente»). Ambas quedan en la misma biblioteca.
            </li>
            <li>
              El <strong>texto alternativo</strong> es obligatorio: describe la imagen en una frase para personas que
              usan lector de pantalla y para buscadores. También se traduce.
            </li>
            <li>
              Formatos: JPG, PNG o WebP para imágenes; PDF para documentos. Tamaño recomendado: imágenes de hasta
              2000 px de ancho y menos de 2 MB; el panel genera las versiones pequeñas.
            </li>
            <li>
              Las galerías (proyectos, actualidad) admiten varias imágenes; la primera es la portada de la tarjeta.
            </li>
            <li>Borrar un archivo lo elimina del sitio en todos los lugares donde se usaba.</li>
          </ul>

          <h2 id="relaciones">7. Categorías, labs y otras relaciones</h2>
          <ul>
            <li>
              Cada proyecto pertenece a un lab; cada publicación puede indicar el lab que la produjo; cada persona
              puede vincularse a una organización. Elige el elemento en el desplegable o créalo al momento.
            </li>
            <li>
              Las <strong>categorías</strong> son una lista común. Antes de crear una nueva comprueba que no exista
              con otro nombre; el buscador de noticias las usa como filtro.
            </li>
            <li>Renombrar una categoría o un lab actualiza todos los lugares donde aparece.</li>
          </ul>

          <h2 id="textos">8. Textos del sitio</h2>
          <p>
            En <strong>Contenido → Textos del sitio</strong> están, por pestañas, los textos fijos que no pertenecen a
            ningún elemento: el texto bajo el nombre del Observatorio en la portada, el propósito y las introducciones
            de «Quiénes somos», las descripciones de los encabezados de página, los textos de cada bloque de
            Publicaciones y Actualidad, las páginas legales (accesibilidad, privacidad, términos) y las redes
            sociales con el correo de contacto.
          </p>

          <h2 id="mensajes">9. Mensajes de contacto</h2>
          <p>
            Lo enviado por el formulario del sitio se guarda en <strong>Administración → Mensajes de contacto</strong>
            con nombre, correo, asunto y mensaje. Marca «Leído» al atenderlos. Si el envío de correo está
            configurado, además llega un aviso a la dirección del Observatorio; responde desde tu correo, no desde
            el panel.
          </p>

          <h2 id="usuarios">10. Usuarios y permisos</h2>
          <table>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Puede</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Editor</td>
                <td>Crear, editar y borrar todo el contenido, imágenes y documentos.</td>
              </tr>
              <tr>
                <td>Administrador</td>
                <td>Lo anterior, más gestionar usuarios y leer los mensajes de contacto.</td>
              </tr>
            </tbody>
          </table>
          <p>
            Para dar de alta a alguien: <strong>Administración → Usuarios → Crear</strong>, con correo, nombre,
            contraseña provisional y rol. Pídele que la cambie al entrar. Cuando una persona deja el equipo, borra
            su usuario.
          </p>

          <h2 id="no-editable">11. Lo que no se edita aquí</h2>
          <ul>
            <li>El nombre del Observatorio en la portada, el menú de navegación y los textos de botones y etiquetas de la interfaz.</li>
            <li>El diseño: colores, tipografías, disposición de las páginas.</li>
            <li>Las traducciones de la interfaz (menú, botones) en inglés.</li>
          </ul>
          <p>Esos cambios los hace el equipo de desarrollo en el código del sitio.</p>

          <h2 id="consejos">12. Buenas prácticas</h2>
          <ul>
            <li>Revisa el texto antes de guardar: se publica al instante.</li>
            <li>Un slug claro y corto, definido una sola vez.</li>
            <li>Descripción corta de una o dos frases: es lo que se ve en las tarjetas.</li>
            <li>Texto alternativo en todas las imágenes y crédito cuando corresponda.</li>
            <li>Traduce al inglés en la misma sesión o deja el prefijo <code>[EN]</code> para encontrarlo después.</li>
            <li>No borres categorías, labs u organizaciones en uso sin revisar qué elementos los referencian.</li>
          </ul>
        </article>
      </Gutter>
    </DefaultTemplate>
  );
}
