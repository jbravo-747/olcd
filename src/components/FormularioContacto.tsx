"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { enviarMensaje, type EstadoContacto } from "@/app/(frontend)/[locale]/contacto/acciones";

const inicial: EstadoContacto = { estado: "inicial" };

export default function FormularioContacto() {
  const t = useTranslations("contacto");
  const [estado, accion, pendiente] = useActionState(enviarMensaje, inicial);
  const invalido = (campo: keyof NonNullable<EstadoContacto["errores"]>) => Boolean(estado.errores?.[campo]);

  if (estado.estado === "exito") {
    return (
      <p role="status" className="max-w-2xl rounded-xl bg-cream-deep p-8 text-[15px] font-semibold">
        {t("exito")}
      </p>
    );
  }

  return (
    <form action={accion} className="max-w-2xl" aria-label={t("formulario")} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-xs font-semibold">
            {t("nombre")}
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            aria-invalid={invalido("nombre")}
            className="field border border-line aria-[invalid=true]:border-orange"
          />
        </div>
        <div>
          <label htmlFor="correo" className="mb-2 block text-xs font-semibold">
            {t("correo")}
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            aria-invalid={invalido("correo")}
            className="field border border-line aria-[invalid=true]:border-orange"
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="asunto" className="mb-2 block text-xs font-semibold">
          {t("asunto")}
        </label>
        <input id="asunto" name="asunto" type="text" className="field border border-line" />
      </div>

      <div className="mt-6">
        <label htmlFor="mensaje" className="mb-2 block text-xs font-semibold">
          {t("mensaje")}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={6}
          required
          aria-invalid={invalido("mensaje")}
          className="w-full rounded-2xl border border-line bg-cream px-5 py-4 text-[15px] aria-[invalid=true]:border-orange"
        />
      </div>

      <div className="hidden" aria-hidden>
        <label htmlFor="sitio_web">Sitio web</label>
        <input id="sitio_web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={pendiente} className="pill pill-dark mt-8 px-8 py-3.5 disabled:opacity-60">
        {pendiente ? t("enviando") : t("enviar")}
      </button>

      {estado.estado === "invalido" && (
        <p role="alert" className="mt-3 text-sm font-semibold text-orange">
          {t("invalido")}
        </p>
      )}
      {estado.estado === "error" && (
        <p role="alert" className="mt-3 text-sm font-semibold text-orange">
          {t("error")}
        </p>
      )}
    </form>
  );
}
