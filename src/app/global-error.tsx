"use client";

/**
 * Último recurso: captura errores que ocurren en el layout raíz (p. ej. si la
 * base de datos cae y falla `obtenerSitio` en el Footer), donde el `error.tsx`
 * de cada locale ya no alcanza. Reemplaza todo el documento, así que trae su
 * propio <html>/<body> y no depende de next-intl. Mensaje bilingüe estático.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f1e9",
          color: "#1e2429",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Algo salió mal · Something went wrong</h1>
          <p style={{ maxWidth: "40ch", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
            Estamos teniendo un problema para mostrar el sitio. Intenta de nuevo en unos momentos.
            <br />
            We are having trouble loading the site. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              borderRadius: "9999px",
              border: "none",
              background: "#1e2429",
              color: "#f5f1e9",
              padding: "12px 28px",
              fontWeight: 600,
            }}
          >
            Reintentar · Retry
          </button>
        </main>
      </body>
    </html>
  );
}
