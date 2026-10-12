#!/usr/bin/env python3
"""
Genera el dataset del mapa a partir del consolidado geocodificado por el
equipo: Limpieza/"Data Centers con claves INEGI.csv" — una fila por centro de
datos con identidades resueltas, fases fechadas, enlaces a notas de prensa y
las claves geoestadísticas oficiales de INEGI (cve_ent, cve_mun, cvegeo) con
su precisión (centroide_municipal | centroide_estatal | sin_ubicacion).

    python3 scripts/generar_datacenters_prensa.py

Salida: src/datos/datacenters-prensa.json

Las columnas lat/lon del CSV vienen vacías: las coordenadas las pone este
script con un catálogo de centroides por clave (cabecera municipal o punto
representativo de la entidad). IMPORTANTE: la información proviene de medios
periodísticos; las ubicaciones son aproximadas por diseño.

El puntaje de completitud (score) se deriva aquí con la fórmula del consolidado
original: 1.25 puntos por cada uno de los 8 campos informativos presentes
(anuncio, construcción, expansión, monto, ubicación, electricidad, tamaño,
enfriamiento), con el semáforo de sus mismos umbrales.
"""

import csv
import json
import re
import sys
import unicodedata
from datetime import date
from urllib.parse import urlparse

RAIZ = __file__.rsplit("/scripts/", 1)[0]
FUENTE = f"{RAIZ}/Limpieza/Data Centers con claves INEGI.csv"
SALIDA = f"{RAIZ}/src/datos/datacenters-prensa.json"

VACIOS = ("", "-", "—", "Sin asignar", "sin asignar", "None")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", s.lower())).strip()


def limpio(v) -> str | None:
    t = str(v).strip() if v is not None else ""
    return t if t not in VACIOS else None


# ---------------------------------------------------------------------------
# Centroides por clave geoestadística de INEGI. Municipal: cabecera municipal
# aproximada; estatal: punto representativo de la entidad. Al aparecer una
# clave nueva en el CSV, el script falla y se añade aquí.
# ---------------------------------------------------------------------------
CENTROIDES_MUNICIPALES = {
    "9002": (19.4847, -99.1838),  # Azcapotzalco, CDMX
    "11003": (20.914, -100.744),  # San Miguel de Allende, Gto.
    "11005": (20.545, -100.684),  # Apaseo el Grande, Gto.
    "14039": (20.676, -103.347),  # Guadalajara, Jal.
    "15054": (19.251, -99.603),  # Metepec, Edomex
    "15095": (19.716, -99.224),  # Tepotzotlán, Edomex
    "19006": (25.782, -100.189),  # Apodaca, N.L.
    "19039": (25.673, -100.309),  # Monterrey, N.L.
    "19041": (25.786, -100.051),  # Pesquería, N.L.
    "22005": (20.781, -100.051),  # Colón, Qro.
    "22011": (20.620, -100.263),  # El Marqués, Qro.
    "22012": (20.498, -100.139),  # Pedro Escobedo, Qro.
    "22014": (20.593, -100.392),  # Querétaro, Qro.
    "22016": (20.389, -99.996),  # San Juan del Río, Qro.
    "26043": (31.308, -110.942),  # Nogales, Son.
}

CENTROIDES_ESTATALES = {
    "9": (19.433, -99.133),  # Ciudad de México
    "10": (24.027, -104.653),  # Durango
    "19": (25.592, -99.996),  # Nuevo León
    "21": (19.044, -98.198),  # Puebla
    "22": (20.850, -99.900),  # Querétaro
    "23": (19.600, -88.050),  # Quintana Roo
    "26": (29.830, -110.670),  # Sonora
}

MESES = {
    "enero": 1, "ene": 1, "febrero": 2, "feb": 2, "marzo": 3, "mar": 3, "abril": 4, "abr": 4,
    "mayo": 5, "may": 5, "junio": 6, "jun": 6, "julio": 7, "jul": 7, "agosto": 8, "ago": 8,
    "septiembre": 9, "sep": 9, "octubre": 10, "oct": 10, "noviembre": 11, "nov": 11,
    "diciembre": 12, "dic": 12,
}


def anio_de(texto: str) -> int | None:
    """Extrae el año de texto libre: 'Febrero 2024 (…)', 'dic-23',
    '2026-02-24 00:00:00' o un serial de Excel ('46165')."""
    m = re.search(r"\b(20\d{2})\b", texto)
    if m:
        return int(m.group(1))
    m = re.search(r"([a-záé]+)[-/](\d{2})\b", texto.lower())
    if m and m.group(1)[:3] in MESES:
        return 2000 + int(m.group(2))
    m = re.fullmatch(r"\s*(\d{5})(?:\.0)?\s*", texto)
    if m:  # serial de Excel (días desde 1899-12-30)
        from datetime import datetime, timedelta
        return (datetime(1899, 12, 30) + timedelta(days=int(m.group(1)))).year
    return None


def parsear_fase(texto: str | None) -> dict | None:
    """Una fase puede traer varios eventos separados por '|'; se conserva el
    texto completo, con el año más reciente y la primera acción entre
    paréntesis como resumen."""
    if not texto:
        return None
    anios = [a for parte in texto.split("|") if (a := anio_de(parte))]
    acc = re.search(r"\(([^)]+)\)", texto)
    return {
        "texto": texto.strip(),
        "anio": max(anios) if anios else None,
        "accion": acc.group(1).strip() if acc else None,
    }


def estado_de(fases: dict) -> str:
    """Estado del proyecto según las fases registradas (la más avanzada manda)."""
    anuncio = (fases.get("anuncio") or {}).get("texto") or ""
    construccion = (fases.get("construccion") or {}).get("texto") or ""
    expansion = (fases.get("expansion") or {}).get("texto") or ""
    # Señales de operación en construcción/expansión, o una inauguración
    # reportada ya desde la columna de anuncio ("algunos dicen inauguración").
    if re.search(
        r"inaugur|apertura|opera|expansion|mejoramiento|megoramiento|ampliacion|certificacion|reubicacion",
        norm(construccion + " " + expansion),
    ) or re.search(r"inaugur|apertura", norm(anuncio)):
        return "en-operacion"
    if construccion:
        return "en-construccion"
    return "anunciado"


# Dominio del enlace → nombre del medio.
MEDIOS = {
    "datacenterdynamics.com": "Data Center Dynamics",
    "news.google.com": "Google News (agregador)",
    "bnamericas.com": "BNamericas",
    "eleconomista.com.mx": "El Economista",
    "dplnews.com": "DPL News",
    "oem.com.mx": "El Sol de México (OEM)",
    "mexicoindustry.com": "Mexico Industry",
    "liderempresarial.com": "Líder Empresarial",
    "milenio.com": "Milenio",
    "expansion.mx": "Expansión",
    "itmastersmag.com": "IT Masters Mag",
    "somosindustria.com": "Somos Industria",
    "forbes.com.mx": "Forbes México",
    "realestatemarket.com.mx": "Real Estate Market",
    "elfinanciero.com.mx": "El Financiero",
    "news.microsoft.com": "Microsoft (sala de prensa)",
    "newsroom.equinix.com": "Equinix (sala de prensa)",
    "infochannel.info": "Infochannel",
    "esemanal.mx": "eSemanal",
    "eluniversalqueretaro.mx": "El Universal Querétaro",
    "eluniversal.com.mx": "El Universal",
    "energia.reporteindigo.com": "Reporte Índigo",
    "reporteindigo.com": "Reporte Índigo",
    "tecnoempresa.mx": "Tecnoempresa",
    "mobiletime.la": "Mobile Time Latinoamérica",
    "aldialogo.mx": "Al Diálogo",
    "reforma.com": "Reforma",
    "infobae.com": "Infobae",
    "computerweekly.com": "Computer Weekly",
    "aboutamazon.mx": "Amazon (sala de prensa)",
    "clusterindustrial.com.mx": "Clúster Industrial",
    "es.wired.com": "Wired en Español",
    "blog.google": "Google (blog oficial)",
    "elpais.com": "El País",
    "nl.gob.mx": "Gobierno de Nuevo León",
    "elmarques.gob.mx": "Gobierno de El Marqués",
    "xataka.com.mx": "Xataka México",
    "lopezdoriga.com": "López-Dóriga Digital",
    "elceo.com": "EL CEO",
    "mvsnoticias.com": "MVS Noticias",
    "mundoejecutivo.com.mx": "Mundo Ejecutivo",
    "itsitio.com": "ITSitio",
    "tuinterfaz.mx": "Tu Interfaz",
    "arenapublica.com": "Arena Pública",
    "corresponsables.com": "Corresponsables",
    "kioscomayor.com": "Kiosco Mayor",
    "produ.com": "PRODU",
    "tusbuenasnoticias.com": "Tus Buenas Noticias",
    "kiodatacenters.com": "KIO (sitio oficial)",
}


def medio_de(url: str) -> str:
    d = urlparse(str(url).strip()).netloc.lower()
    d = d[4:] if d.startswith("www.") else d
    return MEDIOS.get(d, d) if d else ""


# Umbrales del semáforo de completitud (consolidado del equipo).
def semaforo_de(score: float) -> str:
    if score >= 8.25:
        return "verde"
    if score >= 5.5:
        return "amarillo"
    if score >= 2.75:
        return "naranja"
    return "rojo"


def main() -> None:
    with open(FUENTE, newline="", encoding="utf-8") as fh:
        filas = list(csv.DictReader(fh))

    centros, sin_ubicacion, claves_sin_centroide = [], [], set()
    for f in filas:
        nombre = limpio(f["Nombre"])
        if not nombre:
            continue
        empresa = limpio(f["Empresa"]) or nombre

        fases = {
            "anuncio": parsear_fase(limpio(f["Anuncio / inversión"])),
            "construccion": parsear_fase(limpio(f["Construcción"])),
            "expansion": parsear_fase(limpio(f["Expansión / mejoramiento"])),
        }
        notas, vistos = [], set()
        for i in range(1, 11):
            u = limpio(f.get(f"Link {i}"))
            if u and u.startswith("http") and u not in vistos:
                vistos.add(u)
                notas.append({"url": u, "medio": medio_de(u)})

        campos_info = [
            fases["anuncio"], fases["construccion"], fases["expansion"],
            limpio(f["Monto"]), limpio(f["Ubicación"]), limpio(f["Electricidad"]),
            limpio(f["Tamaño"]), limpio(f["Enfriamiento"]),
        ]
        score = round(1.25 * sum(1 for c in campos_info if c), 2)

        base = {
            "nombre": nombre,
            "variacion": limpio(f["Variacion de nombre"]),
            "empresa": empresa,
            "fases": fases,
            "monto": limpio(f["Monto"]),
            "electricidad": limpio(f["Electricidad"]),
            "tamano": limpio(f["Tamaño"]),
            "enfriamiento": limpio(f["Enfriamiento"]),
            "notas": notas,
            "score": score,
            "semaforo": semaforo_de(score),
        }

        precision_csv = (f["precision"] or "").strip()
        if precision_csv == "sin_ubicacion" or not limpio(f["entidad"]):
            sin_ubicacion.append({"nombre": nombre, "empresa": empresa})
            continue

        cve_ent = (f["cve_ent"] or "").strip()
        cve_mun = (f["cve_mun"] or "").strip()
        cvegeo = (f["cvegeo"] or "").strip()
        if precision_csv == "centroide_municipal":
            coords = CENTROIDES_MUNICIPALES.get(cvegeo)
            precision = "municipio"
        else:
            coords = CENTROIDES_ESTATALES.get(cve_ent)
            precision = "entidad"
        if coords is None:
            claves_sin_centroide.add(cvegeo or cve_ent)
            continue

        entidad = f["entidad"].strip()
        municipio = limpio(f["municipio"]) if precision == "municipio" else None
        anios = [fa["anio"] for fa in fases.values() if fa and fa["anio"]]
        acciones = [(fa["anio"] or 0, fa["accion"] or fa["texto"]) for fa in fases.values() if fa]
        ultima = max(acciones, key=lambda a: a[0]) if acciones else (None, None)
        centros.append({
            "id": norm(f"{empresa} {nombre} {entidad}").replace(" ", "-"),
            **base,
            "ubicacionFuente": limpio(f["Ubicación"]) or entidad,
            "cveEnt": cve_ent,
            "cveMun": cve_mun or None,
            "cvegeo": cvegeo or None,
            "municipio": municipio,
            "entidad": entidad,
            "lat": coords[0],
            "lng": coords[1],
            "precision": precision,
            "estado": estado_de(fases),
            "ultimaAccion": ultima[1],
            "ultimoAnio": max(anios) if anios else None,
        })

    centros.sort(key=lambda c: (c["entidad"], c["empresa"], c["nombre"]))

    conteo_medios: dict[str, int] = {}
    for c in centros:
        for n in c["notas"]:
            if n["medio"]:
                conteo_medios[n["medio"]] = conteo_medios.get(n["medio"], 0) + 1
    medios = [{"nombre": k, "notas": v} for k, v in sorted(conteo_medios.items(), key=lambda x: -x[1])]

    salida = {
        "meta": {
            "generado": date.today().isoformat(),
            "descripcion": "Centros de datos en México identificados mediante monitoreo de medios periodísticos (2020-2026) del OLCD. Las ubicaciones son aproximadas: cada centro se geocodificó con las claves geoestadísticas de INEGI y se ubica en el centroide de su municipio o entidad, no en el predio.",
            "fuente": "Consolidado geocodificado del monitoreo hemerográfico del Observatorio (Limpieza/Data Centers con claves INEGI.csv).",
            "totalCentros": len(centros),
            "totalNotas": sum(len(c["notas"]) for c in centros),
            "aniosCubiertos": [2020, 2026],
            "medios": medios,
            "sinUbicacion": sin_ubicacion,
            "umbralesSemaforo": {"verde": 8.25, "amarillo": 5.5, "naranja": 2.75},
        },
        "centros": centros,
    }

    with open(SALIDA, "w", encoding="utf-8") as fh:
        json.dump(salida, fh, ensure_ascii=False, indent=1)

    print(f"Centros: {len(centros)}  (+{len(sin_ubicacion)} sin ubicación, fuera del mapa)")
    por_ent: dict[str, int] = {}
    for c in centros:
        por_ent[c["entidad"]] = por_ent.get(c["entidad"], 0) + 1
    for e, n in sorted(por_ent.items(), key=lambda x: -x[1]):
        print(f"  {n:3d}  {e}")
    sem: dict[str, int] = {}
    for c in centros:
        sem[c["semaforo"]] = sem.get(c["semaforo"], 0) + 1
    print("Semáforo de información:", sem)
    print(f"Medios distintos: {len(medios)}; notas totales: {sum(m['notas'] for m in medios)}")
    if claves_sin_centroide:
        print("¡CLAVES SIN CENTROIDE! →", claves_sin_centroide, file=sys.stderr)
        sys.exit(1)
    print(f"Escrito: {SALIDA}")


if __name__ == "__main__":
    main()
