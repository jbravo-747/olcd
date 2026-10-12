"use client";

/**
 * Vista completa del mapa de centros de datos: aviso de procedencia (medios
 * periodísticos), filtros por entidad y estado, mapa Leaflet con pines
 * agrupados, ficha lateral con el historial de menciones y sus fuentes, y
 * listado. El mapa se carga sólo en cliente (`ssr: false`, Leaflet usa window).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { FaLocationPin } from "react-icons/fa6";
import { COLOR_ESTADO } from "@/lib/geo/centrosGeoJSON";
import type { CentroPrensa, DatosPrensa, EstadoCentro } from "@/datos/tipos";
import type { EtiquetasMapa } from "./MapaLeaflet";

const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
  ssr: false,
  loading: () => <div className="h-[70vh] min-h-[420px] w-full rounded-lg bg-cream-deep" aria-hidden />,
});

const estados: EstadoCentro[] = ["en-operacion", "en-construccion", "anunciado"];

/** Colores del semáforo de completitud de información. */
const COLOR_SEMAFORO: Record<CentroPrensa["semaforo"], string> = {
  verde: "#2f7d32",
  amarillo: "#b58900",
  naranja: "#c2590b",
  rojo: "#b3261e",
};

export default function MapaCentrosInteractivo({ datos }: { datos: DatosPrensa }) {
  const t = useTranslations("mapa");
  const [entidad, setEntidad] = useState("");
  const [estado, setEstado] = useState("");
  const [activo, setActivo] = useState<CentroPrensa | null>(null);

  const centros = datos.centros;
  const entidades = useMemo(() => [...new Set(centros.map((c) => c.entidad))].sort(), [centros]);
  const visibles = useMemo(
    () => centros.filter((c) => (!entidad || c.entidad === entidad) && (!estado || c.estado === estado)),
    [centros, entidad, estado],
  );

  const etiquetas: EtiquetasMapa = {
    claro: t("capas.claro"),
    detallado: t("capas.detallado"),
    satelite: t("capas.satelite"),
    etiquetasLugares: t("capas.etiquetasLugares"),
    agua: t("capas.agua"),
    rios: t("capas.rios"),
    centros: t("capas.centros"),
    centrar: t("centrar"),
  };

  const lugarDe = (c: CentroPrensa) => (c.municipio ? `${c.municipio}, ${c.entidad}` : c.entidad);

  return (
    <div className="shell py-14">
      <form className="mb-10 grid gap-5 sm:grid-cols-2 lg:max-w-2xl" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="entidad" className="mb-2 block text-xs font-semibold">
            {t("entidad")}
          </label>
          <select
            id="entidad"
            value={entidad}
            onChange={(e) => {
              setEntidad(e.target.value);
              setActivo(null);
            }}
            className="field border border-line"
          >
            <option value="">{t("todasEntidades")}</option>
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e}
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

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <MapaLeaflet
            centros={visibles}
            activo={activo}
            onSeleccionar={setActivo}
            etiquetas={etiquetas}
            textoAproximada={t("ubicacionAproximada")}
          />
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {estados.map((e) => (
              <li key={e} className="flex items-center gap-2 text-xs font-semibold">
                <FaLocationPin size={15} color={COLOR_ESTADO[e]} aria-hidden className="shrink-0" />
                {t(`estados.${e}`)}
              </li>
            ))}
            <li className="flex items-center gap-2 text-xs font-semibold">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-cream"
                aria-hidden
              >
                n
              </span>
              {t("leyendaGrupo")}
            </li>
          </ul>

          {/* Aviso de procedencia: obligatorio y visible, debajo del mapa. */}
          <aside
            className="mt-6 rounded-xl border-l-4 border-orange-deep bg-cream-deep p-6"
            aria-labelledby="aviso-fuentes"
          >
            <h2 id="aviso-fuentes" className="text-sm font-bold uppercase tracking-wide">
              {t("aviso.titulo")}
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">
              {t("aviso.cuerpo", {
                total: datos.meta.totalCentros,
                desde: datos.meta.aniosCubiertos[0],
                hasta: datos.meta.aniosCubiertos[1],
              })}
            </p>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">{t("aviso.ubicaciones")}</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold underline">
                {t("aviso.verMedios", { n: datos.meta.medios.length })}
              </summary>
              <ul className="mt-3 flex max-w-3xl flex-wrap gap-x-4 gap-y-1 text-[13px]">
                {datos.meta.medios.map((m) => (
                  <li key={m.nombre}>
                    {m.nombre} <span className="text-ink/60">({m.notas})</span>
                  </li>
                ))}
              </ul>
            </details>
          </aside>
        </div>

        <aside aria-live="polite">
          {activo ? (
            <div className="rounded-xl bg-cream-deep p-6">
              <h2 className="display text-2xl">{activo.nombre}</h2>
              <p className="mt-1 text-sm font-semibold text-ink/70">{activo.empresa}</p>
              <dl className="mt-4 space-y-3 text-[13px]">
                {(
                  [
                    [t("ubicacion"), `${lugarDe(activo)} (${t("ubicacionAproximada")})`],
                    [t("estado"), t(`estados.${activo.estado}`)],
                    [t("inversion"), activo.monto],
                    [t("electricidad"), activo.electricidad],
                    [t("tamano"), activo.tamano],
                    [t("enfriamiento"), activo.enfriamiento],
                  ] as [string, string | null][]
                )
                  .filter(([, valor]) => valor)
                  .map(([clave, valor]) => (
                    <div key={clave} className="border-b border-line pb-2">
                      <dt className="text-ink/70">{clave}</dt>
                      <dd className="font-semibold">{valor}</dd>
                    </div>
                  ))}
                <div className="border-b border-line pb-2">
                  <dt className="text-ink/70">{t("nivelInformacion")}</dt>
                  <dd className="flex items-center gap-2 font-semibold">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLOR_SEMAFORO[activo.semaforo] }}
                      aria-hidden
                    />
                    {t(`semaforo.${activo.semaforo}`)}
                  </dd>
                </div>
              </dl>

              {Object.values(activo.fases).some(Boolean) && (
                <>
                  <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-ink/70">{t("cronologia")}</h3>
                  <ul className="mt-2 space-y-2">
                    {(["anuncio", "construccion", "expansion"] as const)
                      .filter((f) => activo.fases[f])
                      .map((f) => (
                        <li key={f} className="border-b border-line pb-2 text-[13px]">
                          <p className="text-ink/70">{t(`fases.${f}`)}</p>
                          <p className="font-semibold">{activo.fases[f]!.texto}</p>
                        </li>
                      ))}
                  </ul>
                </>
              )}

              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-ink/70">
                {t("notasPrensa", { n: activo.notas.length })}
              </h3>
              <ul className="mt-2 space-y-0.5 text-[13px]">
                {activo.notas.map((n) => (
                  <li key={n.url}>
                    <a href={n.url} target="_blank" rel="noreferrer" className="text-ink/80 underline hover:text-ink">
                      {n.medio || t("fuente")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-xl bg-cream-deep p-6 text-sm text-ink/70">{t("seleccionar")}</p>
          )}

          <h3 className="mt-8 text-xs font-bold uppercase tracking-wide text-ink/60">
            {t("resultados", { n: visibles.length })}
          </h3>
          <ul className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
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
                  <FaLocationPin size={13} color={COLOR_ESTADO[c.estado]} aria-hidden className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{c.nombre}</span>
                  <span className="shrink-0 text-ink/60">{c.entidad}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
