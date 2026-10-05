"use client";

/**
 * Vista completa del mapa de centros de datos: filtros por país y estado, mapa
 * Leaflet con capas superponibles (satélite, agua, ríos, centros), ficha lateral
 * y listado. El mapa se carga sólo en cliente (`ssr: false`, Leaflet usa window).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";
import type { Centro } from "@/payload-types";
import { COLOR_ESTADO } from "@/lib/geo/centrosGeoJSON";
import type { EtiquetasMapa } from "./MapaLeaflet";

const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
  ssr: false,
  loading: () => <div className="h-[70vh] min-h-[420px] w-full rounded-lg bg-slate" aria-hidden />,
});

const estados: Centro["estado"][] = ["en-operacion", "en-construccion", "anunciado"];

export default function MapaCentrosInteractivo({ centros }: { centros: Centro[] }) {
  const t = useTranslations("mapa");
  const formato = useFormatter();
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [activo, setActivo] = useState<Centro | null>(null);

  const paises = useMemo(() => [...new Set(centros.map((c) => c.pais))].sort(), [centros]);
  const visibles = useMemo(
    () => centros.filter((c) => (!pais || c.pais === pais) && (!estado || c.estado === estado)),
    [centros, pais, estado],
  );

  const etiquetas: EtiquetasMapa = {
    satelite: t("capas.satelite"),
    sentinel: t("capas.sentinel"),
    claro: t("capas.claro"),
    agua: t("capas.agua"),
    rios: t("capas.rios"),
    centros: t("capas.centros"),
  };

  return (
    <div className="shell py-14">
      <form className="mb-10 grid gap-5 sm:grid-cols-2 lg:max-w-2xl" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="pais" className="mb-2 block text-xs font-semibold">
            {t("pais")}
          </label>
          <select
            id="pais"
            value={pais}
            onChange={(e) => {
              setPais(e.target.value);
              setActivo(null);
            }}
            className="field border border-line"
          >
            <option value="">{t("todosPaises")}</option>
            {paises.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="mb-2 block text-xs font-semibold">
            {t("estado")}
          </label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setActivo(null);
            }}
            className="field border border-line"
          >
            <option value="">{t("todosEstados")}</option>
            {estados.map((opcion) => (
              <option key={opcion} value={opcion}>
                {t(`estados.${opcion}`)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <MapaLeaflet
            centros={visibles}
            activo={activo}
            onSeleccionar={setActivo}
            etiquetas={etiquetas}
            textoEstado={(e) => t(`estados.${e}`)}
            formatoInversion={(monto) => t("inversionValor", { monto: formato.number(monto) })}
          />
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {estados.map((e) => (
              <li key={e} className="flex items-center gap-2 text-xs font-semibold">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-ink"
                  style={{ backgroundColor: COLOR_ESTADO[e] }}
                  aria-hidden
                />
                {t(`estados.${e}`)}
              </li>
            ))}
          </ul>
        </div>

        <aside aria-live="polite">
          {activo ? (
            <div className="rounded-xl bg-cream-deep p-6">
              <h2 className="display text-2xl">{activo.nombre}</h2>
              <dl className="mt-4 space-y-3 text-[13px]">
                {[
                  [t("ciudad"), `${activo.ciudad}, ${activo.pais}`],
                  [t("empresa"), activo.empresa ?? "—"],
                  [t("estado"), t(`estados.${activo.estado}`)],
                  [
                    t("inversion"),
                    activo.inversionUsdMillones != null
                      ? t("inversionValor", { monto: formato.number(activo.inversionUsdMillones) })
                      : "—",
                  ],
                  [t("coordenadas"), `${activo.lat.toFixed(2)}, ${activo.lng.toFixed(2)}`],
                ].map(([clave, valor]) => (
                  <div key={clave} className="border-b border-line pb-2">
                    <dt className="text-ink/70">{clave}</dt>
                    <dd className="font-semibold">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="rounded-xl bg-cream-deep p-6 text-sm text-ink/70">{t("seleccionar")}</p>
          )}

          <h3 className="mt-8 text-xs font-bold uppercase tracking-wide text-ink/60">
            {t("resultados", { n: visibles.length })}
          </h3>
          <ul className="mt-3 space-y-1">
            {visibles.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActivo(c)}
                  aria-current={activo?.id === c.id}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-ink/5 ${
                    activo?.id === c.id ? "bg-ink/10" : ""
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-ink"
                    style={{ backgroundColor: COLOR_ESTADO[c.estado] }}
                    aria-hidden
                  />
                  {c.nombre} <span className="text-ink/70">· {c.pais}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
