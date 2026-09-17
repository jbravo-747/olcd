"use client";

import { useMemo, useState, type SVGProps } from "react";
import { useFormatter, useTranslations } from "next-intl";
import latam from "@/lib/latam.json";
import type { Centro } from "@/payload-types";
import { ALTO, ANCHO, anilloAPath, proyectar } from "@/lib/proyeccion";

const geografia = latam as Record<string, number[][][]>;

/** Trazo de los países: se calcula una sola vez, no depende del estado. */
const trazos = Object.entries(geografia).flatMap(([pais, anillos]) =>
  anillos.map((anillo, i) => ({ id: `${pais}-${i}`, pais, d: anilloAPath(anillo) })),
);

type Estado = Centro["estado"];

const estados: Estado[] = ["en-operacion", "en-construccion", "anunciado"];

/**
 * Cada estado se distingue por forma Y color (no solo color), y cada color
 * supera 3:1 sobre el relleno del mapa (cream-deep). Los colores son tokens
 * de globals.css; aquí solo van las clases de Tailwind.
 */
const formaEstado: Record<Estado, "circulo" | "diamante" | "triangulo"> = {
  "en-operacion": "circulo",
  "en-construccion": "diamante",
  anunciado: "triangulo",
};

const claseEstado: Record<Estado, string> = {
  "en-operacion": "fill-marker-operacion",
  "en-construccion": "fill-marker-construccion",
  anunciado: "fill-marker-anunciado",
};

/**
 * Dibuja la marca de un estado con su forma propia. `interactivo` añade los
 * atributos de puntero/teclado (solo en los marcadores del mapa, no en la
 * leyenda).
 */
function MarcaEstado({
  estado,
  r,
  interactivo,
}: {
  estado: Estado;
  r: number;
  interactivo?: Omit<SVGProps<SVGGeometryElement>, "ref">;
}) {
  const props = {
    className: `${claseEstado[estado]} stroke-ink`,
    strokeWidth: 2.5,
    vectorEffect: "non-scaling-stroke" as const,
    ...interactivo,
  };
  if (formaEstado[estado] === "diamante") {
    return <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`} {...props} />;
  }
  if (formaEstado[estado] === "triangulo") {
    return <polygon points={`0,${-(r + 1)} ${r},${r * 0.8} ${-r},${r * 0.8}`} {...props} />;
  }
  return <circle r={r} {...props} />;
}

/**
 * Mapa de centros de datos de América Latina.
 *
 * `resumido` es la versión del Inicio (sin filtros ni ficha); la completa
 * añade filtros por país y estado, ficha lateral y listado.
 */
export default function MapaCentros({
  centros,
  resumido = false,
  descripcion,
}: {
  centros: Centro[];
  resumido?: boolean;
  descripcion?: string | null;
}) {
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

  const mapa = (
    <figure className="relative m-0">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className={`w-full ${resumido ? "max-h-[520px]" : "max-h-[620px]"}`}
        role="img"
        aria-label={t("descripcionMapa", { n: visibles.length })}
      >
        <g>
          {trazos.map((trazo) => (
            <path
              key={trazo.id}
              d={trazo.d}
              className="fill-cream-deep stroke-slate-light"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        <g>
          {visibles.map((centro) => {
            const { x, y } = proyectar(centro.lat, centro.lng);
            const seleccionado = activo?.id === centro.id;
            return (
              <g key={centro.id} transform={`translate(${x} ${y})`}>
                {seleccionado && <circle r={22} className="fill-ink/15" />}
                <MarcaEstado
                  estado={centro.estado}
                  r={seleccionado ? 13 : 9}
                  interactivo={{
                    className: `${claseEstado[centro.estado]} stroke-ink cursor-pointer transition-all`,
                    onClick: () => setActivo(seleccionado ? null : centro),
                    role: "button",
                    tabIndex: 0,
                    "aria-label": `${centro.nombre}. ${centro.ciudad}, ${centro.pais}. ${t(`estados.${centro.estado}`)}.`,
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActivo(seleccionado ? null : centro);
                      }
                    },
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Leyenda */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:block sm:space-y-1.5">
        {estados.map((e) => (
          <li key={e} className="flex items-center gap-2 text-[11px] font-semibold text-cream">
            <svg viewBox="-11 -11 22 22" className="h-3.5 w-3.5 shrink-0" aria-hidden focusable="false">
              <MarcaEstado estado={e} r={8} />
            </svg>
            {t(`estados.${e}`)}
          </li>
        ))}
      </ul>
    </figure>
  );

  if (resumido) {
    return (
      <div className="bg-slate py-10">
        <div className="shell grid items-center gap-8 lg:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full max-w-[520px]">{mapa}</div>

          <div>
            <p className="display text-2xl text-cream">{t("centrosDeDatos", { n: centros.length })}</p>
            {descripcion && <p className="mt-3 text-sm leading-relaxed text-cream/85">{descripcion}</p>}
            <ul className="mt-6 space-y-2">
              {paises.map((p) => (
                <li key={p} className="flex justify-between border-b border-cream/20 pb-1 text-[13px] text-cream">
                  <span>{p}</span>
                  <span className="font-semibold">{centros.filter((c) => c.pais === p).length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="rounded-xl bg-slate p-6">{mapa}</div>

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
                  <svg viewBox="-11 -11 22 22" className="h-3 w-3 shrink-0" aria-hidden focusable="false">
                    <MarcaEstado estado={c.estado} r={8} />
                  </svg>
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
