"use client";

/**
 * Mapa de centros de datos con Leaflet y capas superponibles:
 *  - Base satelital: Esri World Imagery o Sentinel-2 cloudless (EOX), más un mapa claro.
 *  - Overlays de cuerpos de agua y ríos de INEGI (GeoJSON en /public/geo).
 *  - Centros de datos agrupados (leaflet.markercluster): como la fuente sólo da
 *    municipio o entidad, varios centros comparten coordenadas; el grupo
 *    muestra un número y al acercarse (o tocarlo en el zoom máximo) se separa
 *    en abanico.
 *
 * Alcance actual: México. La hidrografía viene del conjunto vectorial
 * topográfico 1:1 000 000 de INEGI (scripts/convertir-inegi.sh); los centros,
 * del monitoreo de medios (scripts/generar_datacenters_prensa.py).
 */

import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";
import L, { type PathOptions } from "leaflet";
import "leaflet.markercluster";
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { COLOR_ESTADO } from "@/lib/geo/centrosGeoJSON";
import type { CentroPrensa } from "@/datos/tipos";

const CENTRO_MEXICO: [number, number] = [23.8, -102.2];
const ATRIBUCION_INEGI =
  'Hidrografía: <a href="https://www.inegi.org.mx/temas/hidrografia/">INEGI</a>, serie topográfica 1:1 000 000';
const ATRIBUCION_CENTROS = "Centros de datos: monitoreo de medios periodísticos del OLCD (ubicaciones aproximadas)";

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
function VolarA({ centro }: { centro: CentroPrensa | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (centro) mapa.flyTo([centro.lat, centro.lng], Math.max(mapa.getZoom(), 9), { duration: 0.8 });
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

/** Icono del grupo: círculo oscuro con el número de centros de datos. */
function iconoGrupo(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount();
  const lado = n >= 10 ? 44 : 36;
  return L.divIcon({
    html: `<div style="width:${lado}px;height:${lado}px;border-radius:9999px;background:#1e2429;color:#f5f1e9;border:2.5px solid #f5f1e9;display:flex;align-items:center;justify-content:center;font:700 ${n >= 10 ? 15 : 14}px/1 system-ui,sans-serif;box-shadow:0 1px 6px rgba(0,0,0,.45)">${n}</div>`,
    className: "",
    iconSize: [lado, lado],
    iconAnchor: [lado / 2, lado / 2],
  });
}

/**
 * Capa de centros agrupados. leaflet.markercluster es imperativo, así que se
 * administra con un efecto: reconstruye el grupo cuando cambian los centros
 * filtrados o la selección.
 */
function CapaCentrosAgrupados({
  centros,
  activo,
  onSeleccionar,
  textoAproximada,
}: {
  centros: CentroPrensa[];
  activo: CentroPrensa | null;
  onSeleccionar: (c: CentroPrensa) => void;
  textoAproximada: string;
}) {
  const mapa = useMap();

  useEffect(() => {
    const grupo = L.markerClusterGroup({
      iconCreateFunction: iconoGrupo,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 44,
      spiderLegPolylineOptions: { color: "#f5f1e9", weight: 1.5, opacity: 0.8 },
      attribution: ATRIBUCION_CENTROS,
    });

    for (const c of centros) {
      const seleccionado = activo?.id === c.id;
      const marcador = L.circleMarker([c.lat, c.lng], {
        radius: seleccionado ? 11 : 8,
        color: "#ffffff",
        weight: seleccionado ? 3 : 1.5,
        fillColor: COLOR_ESTADO[c.estado] ?? "#1e2429",
        fillOpacity: 1,
      });
      const lugar = c.municipio ? `${c.municipio}, ${c.entidad}` : c.entidad;
      marcador.bindTooltip(
        `<strong>${c.empresa}${c.nombre ? ` · ${c.nombre}` : ""}</strong><br/>${lugar} <em>(${textoAproximada})</em>`,
        { direction: "top", offset: L.point(0, -8) },
      );
      marcador.on("click", () => onSeleccionar(c));
      grupo.addLayer(marcador);
    }

    mapa.addLayer(grupo);
    return () => {
      mapa.removeLayer(grupo);
    };
  }, [mapa, centros, activo, onSeleccionar, textoAproximada]);

  return null;
}

export default function MapaLeaflet({
  centros,
  activo,
  onSeleccionar,
  etiquetas,
  textoAproximada,
}: {
  centros: CentroPrensa[];
  activo: CentroPrensa | null;
  onSeleccionar: (c: CentroPrensa) => void;
  etiquetas: EtiquetasMapa;
  textoAproximada: string;
}) {
  const agua = useGeoJSON("/geo/cuerpos-agua-mx.geojson");
  const rios = useGeoJSON("/geo/rios-mx.geojson");

  return (
    <MapContainer
      center={CENTRO_MEXICO}
      zoom={5}
      minZoom={3}
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
          <>{agua && <GeoJSON data={agua} style={() => estiloAgua} attribution={ATRIBUCION_INEGI} />}</>
        </LayersControl.Overlay>

        <LayersControl.Overlay name={etiquetas.rios}>
          <>{rios && <GeoJSON data={rios} style={() => estiloRios} attribution={ATRIBUCION_INEGI} />}</>
        </LayersControl.Overlay>
      </LayersControl>

      <CapaCentrosAgrupados
        centros={centros}
        activo={activo}
        onSeleccionar={onSeleccionar}
        textoAproximada={textoAproximada}
      />
    </MapContainer>
  );
}
