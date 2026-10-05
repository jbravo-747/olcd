"use client";

/**
 * Mapa de centros de datos con Leaflet y capas superponibles:
 *  - Base satelital: Esri World Imagery o Sentinel-2 cloudless (EOX), más un mapa claro.
 *  - Overlays de cuerpos de agua y ríos (GeoJSON en /public/geo).
 *  - Centros de datos como marcadores reactivos enlazados al filtro y la selección.
 *
 * Los cuerpos de agua y ríos son hoy datos de Natural Earth (LATAM). Para
 * producción se sustituyen por INEGI (México, alta resolución) + HydroSHEDS
 * (resto de la región); ver docs/mapa-datos.md.
 */

import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";
import type { PathOptions } from "leaflet";
import { MapContainer, TileLayer, GeoJSON, LayersControl, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Centro } from "@/payload-types";
import { COLOR_ESTADO } from "@/lib/geo/centrosGeoJSON";

const CENTRO_LATAM: [number, number] = [-12, -65];

const estiloAgua: PathOptions = { color: "#1d6fa5", weight: 1, fillColor: "#3b9ad1", fillOpacity: 0.55 };
const estiloRios: PathOptions = { color: "#3b9ad1", weight: 1.2, opacity: 0.8 };

export type EtiquetasMapa = {
  satelite: string;
  sentinel: string;
  claro: string;
  agua: string;
  rios: string;
  centros: string;
};

/** Vuela al centro seleccionado cuando cambia. */
function VolarA({ centro }: { centro: Centro | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (centro) mapa.flyTo([centro.lat, centro.lng], Math.max(mapa.getZoom(), 6), { duration: 0.8 });
  }, [centro, mapa]);
  return null;
}

function useGeoJSON(url: string) {
  const [datos, setDatos] = useState<GeoJsonObject | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => vivo && setDatos(d))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [url]);
  return datos;
}

export default function MapaLeaflet({
  centros,
  activo,
  onSeleccionar,
  etiquetas,
  textoEstado,
  formatoInversion,
}: {
  centros: Centro[];
  activo: Centro | null;
  onSeleccionar: (c: Centro | null) => void;
  etiquetas: EtiquetasMapa;
  textoEstado: (estado: Centro["estado"]) => string;
  formatoInversion: (monto: number) => string;
}) {
  const agua = useGeoJSON("/geo/cuerpos-agua-latam.geojson");
  const rios = useGeoJSON("/geo/rios-latam.geojson");

  return (
    <MapContainer
      center={CENTRO_LATAM}
      zoom={3}
      minZoom={2}
      maxZoom={18}
      scrollWheelZoom
      className="h-[70vh] min-h-[420px] w-full rounded-lg"
      style={{ background: "#0b1a2b" }}
    >
      <VolarA centro={activo} />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name={etiquetas.satelite}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Imágenes &copy; Esri, Maxar, Earthstar Geographics"
            maxZoom={18}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name={etiquetas.sentinel}>
          <TileLayer
            url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg"
            attribution="Sentinel-2 cloudless 2020 por EOX IT Services (datos Copernicus modificados)"
            maxZoom={14}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name={etiquetas.claro}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap, &copy; CARTO"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name={etiquetas.agua}>
          <>{agua && <GeoJSON data={agua} style={() => estiloAgua} />}</>
        </LayersControl.Overlay>

        <LayersControl.Overlay name={etiquetas.rios}>
          <>{rios && <GeoJSON data={rios} style={() => estiloRios} />}</>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={etiquetas.centros}>
          <>
            {centros.map((c) => {
              const seleccionado = activo?.id === c.id;
              const inversion = c.inversionUsdMillones != null ? formatoInversion(c.inversionUsdMillones) : null;
              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={seleccionado ? 10 : 6}
                  pathOptions={{
                    color: "#ffffff",
                    weight: seleccionado ? 3 : 1.5,
                    fillColor: COLOR_ESTADO[c.estado] ?? "#1e2429",
                    fillOpacity: 1,
                  }}
                  eventHandlers={{ click: () => onSeleccionar(c) }}
                >
                  <Popup>
                    <strong>{c.nombre}</strong>
                    <br />
                    {[c.ciudad, c.pais].filter(Boolean).join(", ")}
                    {c.empresa && (
                      <>
                        <br />
                        {c.empresa}
                      </>
                    )}
                    <br />
                    <em>{textoEstado(c.estado)}</em>
                    {inversion && (
                      <>
                        <br />
                        {inversion}
                      </>
                    )}
                  </Popup>
                </CircleMarker>
              );
            })}
          </>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
