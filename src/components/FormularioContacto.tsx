"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { enviarMensaje, type EstadoContacto } from "@/app/(frontend)/[locale]/contacto/acciones";

const inicial: EstadoContacto = { estado: "inicial" };

type Campo = keyof NonNullable<EstadoContacto["errores"]>;

const camposEnOrden: Campo[] = ["nombre", "correo", "asunto", "mensaje"];

export default function FormularioContacto() {
  const t = useTranslations("contacto");
  const [estado, accion, pendiente] = useActionState(enviarMensaje, inicial);
  const invalido = (campo: Campo) => Boolean(estado.errores?.[campo]);

  // Al fallar la validación, mueve el foco al primer campo inválido (A-5).
  useEffect(() => {
    if (estado.estado !== "invalido") return;
    const primero = camposEnOrden.find((campo) => estado.errores?.[campo]);
    if (primero) document.getElementById(primero)?.focus();
  }, [estado]);

  if (estado.estado === "exito") {
    return (
      <p role="status" className="max-w-2xl rounded-xl bg-cream-deep p-8 text-[15px] font-semibold">
        {t("exito")}
      </p>
    );
  }

  const describedBy = (campo: Campo) => (invalido(campo) ? `err-${campo}` : undefined);

  const mensajeError = (campo: Campo) =>
    invalido(campo) ? (
      <p id={`err-${campo}`} role="alert" className="mt-2 text-sm font-semibold text-orange-deep">
        {t(`errores.${campo}`)}
      </p>
    ) : null;

  const obligatorio = <span className="font-normal text-ink/70"> {t("obligatorio")}</span>;

  return (
    <form action={accion} className="max-w-2xl" aria-label={t("formulario")} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-xs font-semibold">
            {t("nombre")}
            {obligatorio}
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            aria-invalid={invalido("nombre")}
            aria-describedby={describedBy("nombre")}
            className="field border border-line aria-[invalid=true]:border-orange-deep"
          />
          {mensajeError("nombre")}
        </div>
        <div>
          <label htmlFor="correo" className="mb-2 block text-xs font-semibold">
            {t("correo")}
            {obligatorio}
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            aria-invalid={invalido("correo")}
            aria-describedby={describedBy("correo")}
            className="field border border-line aria-[invalid=true]:border-orange-deep"
          />
          {mensajeError("correo")}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="asunto" className="mb-2 block text-xs font-semibold">
          {t("asunto")}
        </label>
        <input
          id="asunto"
          name="asunto"
          type="text"
          aria-invalid={invalido("asunto")}
          aria-describedby={describedBy("asunto")}
          className="field border border-line aria-[invalid=true]:border-orange-deep"
        />
        {mensajeError("asunto")}
      </div>

      <div className="mt-6">
        <label htmlFor="mensaje" className="mb-2 block text-xs font-semibold">
          {t("mensaje")}
          {obligatorio}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={6}
          required
          aria-invalid={invalido("mensaje")}
          aria-describedby={describedBy("mensaje")}
          className="w-full rounded-2xl border border-line bg-cream px-5 py-4 text-[15px] aria-[invalid=true]:border-orange-deep"
        />
        {mensajeError("mensaje")}
      </div>

      <div className="hidden" aria-hidden>
        <label htmlFor="sitio_web">Sitio web</label>
        <input id="sitio_web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={pendiente} className="pill pill-dark mt-8 px-8 py-3.5 disabled:opacity-60">
        {pendiente ? t("enviando") : t("enviar")}
      </button>

      {estado.estado === "invalido" && (
        <p role="alert" className="mt-3 text-sm font-semibold text-orange-deep">
          {t("invalido")}
        </p>
      )}
      {estado.estado === "error" && (
        <p role="alert" className="mt-3 text-sm font-semibold text-orange-deep">
          {t("error")}
        </p>
      )}
    </form>
  );
}
