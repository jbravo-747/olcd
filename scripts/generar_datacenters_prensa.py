#!/usr/bin/env python3
"""
Genera el dataset del mapa a partir del consolidado curado por el equipo:
Limpieza/Data Centers consolidado.xlsx, hoja "Análisis" (una fila por centro de
datos, identidades ya resueltas, fases con fecha y acción, enlaces a las notas
de prensa y puntaje de completitud de información).

    python3 scripts/generar_datacenters_prensa.py

Salida: src/datos/datacenters-prensa.json

IMPORTANTE: esta información se recopiló de medios periodísticos (monitoreo
2020-2026 del Observatorio). Las ubicaciones son aproximadas: la fuente sólo da
municipio, parque industrial o entidad; las coordenadas de este archivo son la
cabecera municipal o un punto representativo de la entidad.

Histórico: las tablas anuales "Data Centers AAAA.xlsx" (registros por año) son
el insumo previo al consolidado y ya no se leen aquí.
"""

import json
import re
import sys
import unicodedata
from datetime import date
from urllib.parse import urlparse

import openpyxl

RAIZ = __file__.rsplit("/scripts/", 1)[0]
FUENTE = f"{RAIZ}/Limpieza/Data Centers consolidado.xlsx"
SALIDA = f"{RAIZ}/src/datos/datacenters-prensa.json"

VACIOS = ("", "-", "—", "Sin asignar", "sin asignar", "None")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", s.lower())).strip()


def limpio(v) -> str | None:
    t = str(v).strip() if v is not None else ""
    return t if t not in VACIOS else None


# ---------------------------------------------------------------------------
# Ubicaciones: texto exacto de la fuente → municipio / entidad / coordenadas.
# Coordenadas = cabecera municipal (o punto representativo de la entidad).
# Cuando la fuente lista varios sitios o parques sin municipio verificable, se
# asigna nivel entidad; si nombra un municipio dominante, ese municipio.
# ---------------------------------------------------------------------------
UBICACIONES = {
    '"Parque Industrial Aprobado por la UNESCO" San Miguel de Allende, Guanajuato': ("San Miguel de Allende", "Guanajuato", 20.914, -100.744, "municipio"),
    "Asia Pacific Park, Pesquería, Nuevo León": ("Pesquería", "Nuevo León", 25.786, -100.051, "municipio"),
    "Cancún": ("Benito Juárez (Cancún)", "Quintana Roo", 21.161, -86.851, "municipio"),
    "Ciudad de México": (None, "Ciudad de México", 19.433, -99.133, "entidad"),
    "Colón, Querétaro": ("Colón", "Querétaro", 20.781, -100.051, "municipio"),
    "Durango": (None, "Durango", 24.027, -104.653, "entidad"),
    "El Marqués, Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Guadalajara": ("Guadalajara", "Jalisco", 20.676, -103.347, "municipio"),
    "Ixtlahuaca": ("Ixtlahuaca", "Estado de México", 19.569, -99.766, "municipio"),
    "Lerdo, zona de La Comarca Lagunera, Durango": ("Lerdo", "Durango", 25.539, -103.524, "municipio"),
    "Metepec, Estado de México": ("Metepec", "Estado de México", 19.251, -99.603, "municipio"),
    "Monterrey": ("Monterrey", "Nuevo León", 25.673, -100.309, "municipio"),
    "Monterrey, Nuevo León": ("Monterrey", "Nuevo León", 25.673, -100.309, "municipio"),
    "Mérida": ("Mérida", "Yucatán", 20.967, -89.624, "municipio"),
    "Nogales, Sonora": ("Nogales", "Sonora", 31.308, -110.942, "municipio"),
    "Nuevo León": (None, "Nuevo León", 25.592, -99.996, "entidad"),
    "Nuevo Leon": (None, "Nuevo León", 25.592, -99.996, "entidad"),
    "Parque Industrial Amexhe, Apaseo el Grande, Guanajuato": ("Apaseo el Grande", "Guanajuato", 20.545, -100.684, "municipio"),
    "Parque Industrial El Marques, Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque Industrial El Marqués": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque Industrial PyME, Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Parque Industrial Querétaro": ("Querétaro", "Querétaro", 20.720, -100.450, "municipio"),
    "Parque Industrialix, Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Parque Innovación, El Marques, Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque industrial Amistad Chuy María, Apaseo el Grande, Guanajuato": ("Apaseo el Grande", "Guanajuato", 20.545, -100.684, "municipio"),
    "Parque industrial Nexxus, Apodaca, Nuevo León": ("Apodaca", "Nuevo León", 25.782, -100.189, "municipio"),
    "Pedro Escobedo, Colón y El Marqués": (None, "Querétaro", 20.850, -99.900, "entidad"),  # región AWS, tres municipios
    "Puebla": (None, "Puebla", 19.044, -98.198, "entidad"),
    "Queretaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Quintana Roo": (None, "Quintana Roo", 19.600, -88.050, "entidad"),
    "San Juan del Rio, Querétaro": ("San Juan del Río", "Querétaro", 20.389, -99.996, "municipio"),
    "San Juan del Río, Querétaro": ("San Juan del Río", "Querétaro", 20.389, -99.996, "municipio"),
    "Santa Fe, Ciudad de México": ("Cuajimalpa / Álvaro Obregón (Santa Fe)", "Ciudad de México", 19.359, -99.259, "municipio"),
    "Tepotzotlán": ("Tepotzotlán", "Estado de México", 19.716, -99.224, "municipio"),
    "Tepotzotlán, Edo. de México": ("Tepotzotlán", "Estado de México", 19.716, -99.224, "municipio"),
    "Tepozpark, Tepotzotlán": ("Tepotzotlán", "Estado de México", 19.716, -99.224, "municipio"),
    "Tultitlan, Estado de México": ("Tultitlán", "Estado de México", 19.645, -99.169, "municipio"),
    "Vesta Industrial Park, Colón, Querétaro": ("Colón", "Querétaro", 20.781, -100.051, "municipio"),
    "Zapopan": ("Zapopan", "Jalisco", 20.721, -103.392, "municipio"),
    "centro de datos de Telmex-Triara, Monterrey, Nuevo León": ("Monterrey", "Nuevo León", 25.673, -100.309, "municipio"),
    # Variantes multi-sitio del consolidado:
    "Apaseo el Grande, Guanajuato / Querétaro": ("Apaseo el Grande", "Guanajuato", 20.545, -100.684, "municipio"),
    "El Marqués ,PyME ,Industrialix, Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),  # tres parques distintos
    "El Marqués, Qro. / Tultitlán, Edo. de México": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),  # se toma el primero listado
    "Parque Innovación, El Marques, Querétaro | Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
}

# Centros sin ubicación en la fuente cuya sede es inequívoca por su nombre.
UBICACION_POR_NOMBRE = {
    "adip sectei alcaldia azcapotzalco": "Ciudad de México",  # instituciones de CDMX
}

MESES = {
    "enero": 1, "ene": 1, "febrero": 2, "feb": 2, "marzo": 3, "mar": 3, "abril": 4, "abr": 4,
    "mayo": 5, "may": 5, "junio": 6, "jun": 6, "julio": 7, "jul": 7, "agosto": 8, "ago": 8,
    "septiembre": 9, "sep": 9, "octubre": 10, "oct": 10, "noviembre": 11, "nov": 11,
    "diciembre": 12, "dic": 12,
}


def parsear_fase(texto: str | None) -> dict | None:
    """'Febrero de 2025 (Inversión)' → {texto, anio, accion}. Tolera 'ene-24'."""
    if not texto:
        return None
    anio = None
    m = re.search(r"(\d{4})", texto)
    if m:
        anio = int(m.group(1))
    else:
        m = re.search(r"([a-záé]+)[-/](\d{2})\b", texto.lower())
        if m and m.group(1)[:3] in MESES:
            anio = 2000 + int(m.group(2))
    acc = re.search(r"\(([^)]+)\)", texto)
    return {"texto": texto.strip(), "anio": anio, "accion": acc.group(1).strip() if acc else None}


def estado_de(fases: dict) -> str:
    """Estado del proyecto según las fases registradas (la más avanzada manda)."""
    construccion = fases.get("construccion") or {}
    expansion = fases.get("expansion") or {}
    texto_avanzado = norm((construccion.get("texto") or "") + " " + (expansion.get("texto") or ""))
    if re.search(r"inaugur|apertura|opera|expansion|mejoramiento|ampliacion|certificacion|reubicacion", texto_avanzado):
        return "en-operacion"
    if construccion.get("texto"):
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
}


def medio_de(url: str) -> str:
    d = urlparse(str(url).strip()).netloc.lower()
    d = d[4:] if d.startswith("www.") else d
    return MEDIOS.get(d, d) if d else ""


# Umbrales del semáforo de completitud (hoja "Pivot Table 2" del consolidado).
def semaforo_de(score: float) -> str:
    if score >= 8.25:
        return "verde"
    if score >= 5.5:
        return "amarillo"
    if score >= 2.75:
        return "naranja"
    return "rojo"


def main() -> None:
    wb = openpyxl.load_workbook(FUENTE, read_only=True, data_only=True)
    ws = wb["Análisis"]
    filas = list(ws.iter_rows(values_only=True))
    wb.close()
    cab = [str(c).strip() if c is not None else "" for c in filas[0]]
    ix = {c: i for i, c in enumerate(cab)}
    col_links = [ix[c] for c in cab if re.fullmatch(r"Link \d+", c)]

    centros, sin_ubicacion, sin_mapear = [], [], set()
    for f in filas[1:]:
        nombre = limpio(f[ix["Nombre"]])
        if not nombre:
            continue
        empresa = limpio(f[ix["Empresa"]]) or nombre
        ubic_txt = limpio(f[ix["Ubicación"]])
        if not ubic_txt:
            ubic_txt = UBICACION_POR_NOMBRE.get(norm(nombre))

        fases = {
            "anuncio": parsear_fase(limpio(f[ix["Anuncio / inversión"]])),
            "construccion": parsear_fase(limpio(f[ix["Construcción | Apertura"]])),
            "expansion": parsear_fase(limpio(f[ix["Expansión / mejoramiento"]])),
        }
        notas, vistos = [], set()
        for i in col_links:
            u = limpio(f[i])
            if u and u.startswith("http") and u not in vistos:
                vistos.add(u)
                notas.append({"url": u, "medio": medio_de(u)})

        score = float(f[ix["Sumatoria_DC"]] or 0)
        base = {
            "nombre": nombre,
            "variacion": limpio(f[ix["Variacion de nombre"]]),
            "empresa": empresa,
            "fases": fases,
            "monto": limpio(f[ix["Monto"]]),
            "electricidad": limpio(f[ix["Electricidad"]]),
            "tamano": limpio(f[ix["Tamaño"]]),
            "enfriamiento": limpio(f[ix["Enfriamiento"]]),
            "notas": notas,
            "score": score,
            "semaforo": semaforo_de(score),
        }

        if not ubic_txt:
            sin_ubicacion.append({"nombre": nombre, "empresa": empresa})
            continue
        info = UBICACIONES.get(ubic_txt)
        if info is None:
            sin_mapear.add(ubic_txt)
            continue
        municipio, entidad, lat, lng, precision = info

        anios = [fa["anio"] for fa in fases.values() if fa and fa["anio"]]
        acciones = [(fa["anio"] or 0, fa["accion"] or fa["texto"]) for fa in fases.values() if fa]
        ultima = max(acciones, key=lambda a: a[0]) if acciones else (None, None)
        centros.append({
            "id": norm(f"{empresa} {nombre} {entidad}").replace(" ", "-"),
            **base,
            "ubicacionFuente": ubic_txt,
            "municipio": municipio,
            "entidad": entidad,
            "lat": lat,
            "lng": lng,
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
            "descripcion": "Centros de datos en México identificados mediante monitoreo de medios periodísticos (2020-2026) del OLCD. Las ubicaciones son aproximadas (municipio o entidad); las coordenadas corresponden a la cabecera municipal o a un punto representativo de la entidad, no al predio.",
            "fuente": "Consolidado curado del monitoreo hemerográfico del Observatorio (Limpieza/Data Centers consolidado.xlsx, hoja Análisis).",
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
    if sin_mapear:
        print("¡UBICACIONES SIN MAPEAR! →", sin_mapear, file=sys.stderr)
        sys.exit(1)
    print(f"Escrito: {SALIDA}")


if __name__ == "__main__":
    main()
