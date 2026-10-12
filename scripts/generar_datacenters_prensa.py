#!/usr/bin/env python3
"""
Consolida las tablas "Data Centers AAAA.xlsx" de Limpieza/ en un solo JSON para
el mapa: un registro por centro de datos único, con su historial de menciones
(año, acción, notas de prensa y medios), ubicación aproximada a nivel municipio
o entidad, y la lista de medios periodísticos de donde proviene todo.

    python3 scripts/generar_datacenters_prensa.py

Salida: src/datos/datacenters-prensa.json

IMPORTANTE: esta información se recopiló de medios periodísticos (monitoreo
2020-2026 del Observatorio). Las ubicaciones son aproximadas: la fuente sólo
da municipio, parque industrial o entidad; las coordenadas de este archivo son
la cabecera municipal o un punto representativo de la entidad.
"""

import glob
import json
import re
import sys
import unicodedata
from datetime import date
from urllib.parse import urlparse

import pandas as pd

RAIZ = __file__.rsplit("/scripts/", 1)[0]
SALIDA = f"{RAIZ}/src/datos/datacenters-prensa.json"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", s.lower())).strip()


# ---------------------------------------------------------------------------
# Ubicaciones: texto exacto de la fuente → municipio / entidad / coordenadas.
# Coordenadas = cabecera municipal (o punto representativo de la entidad
# cuando la fuente no da municipio). Precisión: "municipio" | "entidad".
# Cuando la nota sólo nombra un parque industrial cuya ubicación municipal no
# es verificable desde la propia fuente, se asigna sólo la entidad.
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
    "Parque Industrial Amexhe, Apaseo el Grande, Guanajuato": ("Apaseo el Grande", "Guanajuato", 20.545, -100.684, "municipio"),
    "Parque Industrial El Marques, Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque Industrial El Marqués": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque Industrial PyME, Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Parque Industrial Querétaro": ("Querétaro", "Querétaro", 20.720, -100.450, "municipio"),
    "Parque Industrialix, Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Parque Innovación, El Marques, Querétaro": ("El Marqués", "Querétaro", 20.620, -100.263, "municipio"),
    "Parque industrial Amistad Chuy María, Apaseo el Grande, Guanajuato": ("Apaseo el Grande", "Guanajuato", 20.545, -100.684, "municipio"),
    "Parque industrial Nexxus, Apodaca, Nuevo León": ("Apodaca", "Nuevo León", 25.782, -100.189, "municipio"),
    "Pedro Escobedo, Colón y El Marqués": (None, "Querétaro", 20.850, -99.900, "entidad"),  # tres municipios: región AWS
    "Puebla": (None, "Puebla", 19.044, -98.198, "entidad"),
    "Queretaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Querétaro": (None, "Querétaro", 20.850, -99.900, "entidad"),
    "Quintana Roo": (None, "Quintana Roo", 19.600, -88.050, "entidad"),
    "San Juan del Rio, Querétaro": ("San Juan del Río", "Querétaro", 20.389, -99.996, "municipio"),
    "Santa Fe, Ciudad de México": ("Cuajimalpa / Álvaro Obregón (Santa Fe)", "Ciudad de México", 19.359, -99.259, "municipio"),
    "Tepotzotlán": ("Tepotzotlán", "Estado de México", 19.716, -99.224, "municipio"),
    "Tepozpark, Tepotzotlán": ("Tepotzotlán", "Estado de México", 19.716, -99.224, "municipio"),
    "Tultitlan, Estado de México": ("Tultitlán", "Estado de México", 19.645, -99.169, "municipio"),
    "Vesta Industrial Park, Colón, Querétaro": ("Colón", "Querétaro", 20.781, -100.051, "municipio"),
    "Zapopan": ("Zapopan", "Jalisco", 20.721, -103.392, "municipio"),
    "centro de datos de Telmex-Triara, Monterrey, Nuevo León": ("Monterrey", "Nuevo León", 25.673, -100.309, "municipio"),
}

# ---------------------------------------------------------------------------
# Resolución de entidades: variantes de empresa y de nombre de DC que son el
# mismo centro. Clave canónica = (empresa, dc, entidad).
# ---------------------------------------------------------------------------
EMPRESAS = {
    "odata": "ODATA",
    "cloud hq": "CloudHQ",
    "cloudhq": "CloudHQ",
    "kio networks": "KIO",
    "kio data centers": "KIO",
    "amazon": "Amazon Web Services",
    "amazon web services": "Amazon Web Services",
    "telcel triara": "Triara (Telcel/Telmex)",
    "triara telmex": "Triara (Telcel/Telmex)",
    "telmex": "Triara (Telcel/Telmex)",
    "mtp": "MTP (México Telecom Partners)",
    "mtp mexico telecom partners": "MTP (México Telecom Partners)",
    "fermaca dreams": "Fermaca",
    "fermaca nvidia": "Fermaca",
    "terranova actis": "Actis (Terranova)",
    "actis": "Actis (Terranova)",
}

def canon_empresa(raw: str) -> str:
    n = norm(raw)
    return EMPRESAS.get(n, str(raw).strip())

def canon_dc(raw) -> str:
    """Normaliza el nombre del DC: 'MX 2'≡'MX02'≡'MX2'; 'DC QR01'≡'QR01'; 'EMO 2'≡'MO2'…"""
    n = norm(raw) if pd.notna(raw) else ""
    n = re.sub(r"^(dc|kio|hyperedge)\s+", "", n)
    n = n.replace(" ", "")
    n = re.sub(r"([a-z]+)0+(\d)", r"\1\2", n)  # mx02 → mx2, qro02 → qro2
    n = re.sub(r"^emo(\d)", r"mo\1", n)  # Equinix EMO2 ≡ MO2
    return n if n and n != "-" else ""

# Correcciones puntuales (empresa_norm, dc_norm, año) → ubicación de la fuente
# que debe usarse, para menciones sin ubicación que son de un DC ya conocido.
UBICACION_FORZADA = {
    ("google", "", "2022"): "Querétaro",  # la mención 2022 de Google trae "-" pero es el mismo proyecto Querétaro
    ("amazon web services", "", "2021"): "Querétaro",  # anuncio inicial de la región AWS, después ubicada en Querétaro
    ("adip sectei y alcaldia azcapotzalco", "", "2021"): "Ciudad de México",  # ADIP/Sectei/Azcapotzalco son CDMX
}

# Acción (texto libre) → estado del proyecto para el color del pin.
def estado_de(acciones: list[str]) -> str:
    texto = norm(" ".join(acciones))
    if re.search(r"inaugur|inicia operacion|inicio de operaciones|en operacion|certificacion|mejoramiento|ampliacion de operaciones", texto):
        return "en-operacion"
    if re.search(r"construccion|expansion|ampliacion", texto):
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


def main() -> None:
    marcos = []
    for f in sorted(glob.glob(f"{RAIZ}/Limpieza/Data Centers *.xlsx")):
        df = pd.read_excel(f)
        df.columns = [str(c).strip() for c in df.columns]
        df["__anio"] = re.search(r"(\d{4})", f).group(1)
        marcos.append(df)
    t = pd.concat(marcos, ignore_index=True)
    t = t[t["Empresa"].notna()].copy()

    cols_link = [c for c in t.columns if c.lower().startswith("link nota")]
    centros: dict[tuple, dict] = {}
    sin_ubicacion, sin_mapear = [], set()

    for _, r in t.iterrows():
        anio = r["__anio"]
        empresa = canon_empresa(r["Empresa"])
        dc = canon_dc(r["Nombre DC"])
        ubic_txt = str(r["Ubicación"]).strip() if pd.notna(r["Ubicación"]) else ""
        forzada = UBICACION_FORZADA.get((norm(r["Empresa"]), dc, anio))
        if forzada:
            ubic_txt = forzada
        info = UBICACIONES.get(ubic_txt)
        if ubic_txt and ubic_txt not in ("-",) and info is None:
            sin_mapear.add(ubic_txt)

        notas = []
        for c in cols_link:
            u = r.get(c)
            if pd.notna(u) and str(u).strip().startswith("http"):
                notas.append({"url": str(u).strip(), "medio": medio_de(u)})

        mencion = {
            "anio": int(anio),
            "fecha": str(r["Fecha"]).strip() if pd.notna(r["Fecha"]) else None,
            "accion": str(r["Acción"]).strip() if pd.notna(r["Acción"]) else None,
            "monto": str(r["Monto"]).strip() if pd.notna(r["Monto"]) else None,
            "ubicacionFuente": ubic_txt or None,
            "notas": notas,
        }

        if info is None:
            sin_ubicacion.append({"empresa": empresa, "dc": dc or None, **mencion})
            continue

        municipio, entidad, lat, lng, precision = info
        # Identidad del centro: con nombre de DC, empresa+nombre basta (la
        # ubicación puede corregirse entre años, p. ej. ODATA QR02 pasó de
        # "Querétaro" a "Apaseo el Grande, Guanajuato"); sin nombre, la entidad
        # distingue proyectos de la misma empresa (Amazon Qro/Zapopan/Mty).
        clave = (norm(empresa), dc) if dc else (norm(empresa), "", entidad)
        c = centros.setdefault(clave, {
            "empresaNorm": norm(empresa),
            "dcNorm": dc,
            "empresa": empresa,
            "nombre": None,
            "menciones": [],
        })
        # La ubicación resuelta viaja dentro de la mención para poder marcar,
        # tras elegir la definitiva, cuáles menciones la fijaron.
        mencion["_loc"] = {
            "municipio": municipio,
            "entidad": entidad,
            "lat": lat,
            "lng": lng,
            "precision": precision,
        }
        c["menciones"].append(mencion)
        if not c["nombre"] and pd.notna(r["Nombre DC"]) and str(r["Nombre DC"]).strip() not in ("-", "—"):
            c["nombre"] = str(r["Nombre DC"]).strip()

    def resolver_ubicacion(c: dict) -> None:
        """La mención más reciente con precisión de municipio gana; si ninguna
        la tiene, la más reciente a nivel entidad. Marca con fijaUbicacion las
        menciones cuya ubicación resolvió al lugar elegido, y resume sus medios
        en fuentesUbicacion."""
        ms = sorted(c["menciones"], key=lambda m: m["anio"])
        con_municipio = [m for m in ms if m["_loc"]["precision"] == "municipio"]
        elegida = (con_municipio or ms)[-1]["_loc"]
        for campo in ("municipio", "entidad", "lat", "lng", "precision"):
            c[campo] = elegida[campo]
        lugar = (elegida["municipio"], elegida["entidad"], elegida["precision"])
        fuentes, vistos = [], set()
        for m in ms:
            m["fijaUbicacion"] = (m["_loc"]["municipio"], m["_loc"]["entidad"], m["_loc"]["precision"]) == lugar
            if not m["fijaUbicacion"]:
                continue
            for n in m["notas"]:
                if n["medio"] and n["medio"] not in vistos:
                    vistos.add(n["medio"])
                    fuentes.append({"medio": n["medio"], "url": n["url"], "anio": m["anio"]})
        c["fuentesUbicacion"] = fuentes

    for c in centros.values():
        resolver_ubicacion(c)

    # Fusión: una entrada sin nombre de DC cuya empresa tiene un DC nombrado en
    # la MISMA entidad es seguimiento de ese DC, no un centro aparte (Microsoft
    # genérico → "México Central"; mención suelta de Ascenty → su DC más
    # reciente). Si hay varios nombrados, gana el de mención más reciente.
    genericas = [k for k in centros if k[1] == ""]
    for k in genericas:
        g = centros[k]
        hermanos = [
            c for kk, c in centros.items()
            if kk != k and kk[1] != "" and c["empresaNorm"] == g["empresaNorm"] and c["entidad"] == g["entidad"]
        ]
        if hermanos:
            destino = max(hermanos, key=lambda c: max(m["anio"] for m in c["menciones"]))
            # Las menciones del genérico traen su propia ubicación resuelta
            # (p. ej. Microsoft 2020-21 traía el municipio, Colón, que las del
            # DC nombrado no tenían): al refundir se re-resuelve.
            destino["menciones"].extend(g["menciones"])
            resolver_ubicacion(destino)
            del centros[k]

    lista = []
    for c in centros.values():
        c.pop("empresaNorm"), c.pop("dcNorm")
        for m in c["menciones"]:
            m.pop("_loc")
        c["menciones"].sort(key=lambda m: m["anio"])
        acciones = [m["accion"] for m in c["menciones"] if m["accion"]]
        c["estado"] = estado_de(acciones[-2:] or acciones)
        c["ultimaAccion"] = acciones[-1] if acciones else None
        c["ultimoAnio"] = c["menciones"][-1]["anio"]
        c["id"] = norm(f"{c['empresa']} {c['nombre'] or ''} {c['entidad']}").replace(" ", "-")
        lista.append(c)
    lista.sort(key=lambda c: (c["entidad"], c["empresa"]))

    conteo_medios: dict[str, int] = {}
    for c in lista:
        for m in c["menciones"]:
            for n in m["notas"]:
                if n["medio"]:
                    conteo_medios[n["medio"]] = conteo_medios.get(n["medio"], 0) + 1
    medios = [{"nombre": k, "notas": v} for k, v in sorted(conteo_medios.items(), key=lambda x: -x[1])]

    salida = {
        "meta": {
            "generado": date.today().isoformat(),
            "descripcion": "Centros de datos en México identificados mediante monitoreo de medios periodísticos (2020-2026) del OLCD. Las ubicaciones son aproximadas (municipio o entidad); las coordenadas corresponden a la cabecera municipal o a un punto representativo de la entidad, no al predio.",
            "fuente": "Monitoreo hemerográfico del Observatorio (carpeta Limpieza/, tablas 'Data Centers 2020-2026').",
            "totalCentros": len(lista),
            "totalMenciones": sum(len(c["menciones"]) for c in lista),
            "aniosCubiertos": [2020, 2026],
            "medios": medios,
            "sinUbicacion": sin_ubicacion,
        },
        "centros": lista,
    }

    with open(SALIDA, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)

    print(f"Centros únicos: {len(lista)}  (de {len(t)} registros; {len(sin_ubicacion)} menciones sin ubicación mapeable)")
    por_ent: dict[str, int] = {}
    for c in lista:
        por_ent[c["entidad"]] = por_ent.get(c["entidad"], 0) + 1
    for e, n in sorted(por_ent.items(), key=lambda x: -x[1]):
        print(f"  {n:3d}  {e}")
    print(f"Medios distintos citados: {len(medios)};  notas totales: {sum(m['notas'] for m in medios)}")
    if sin_mapear:
        print("¡UBICACIONES SIN MAPEAR! →", sin_mapear, file=sys.stderr)
        sys.exit(1)
    print(f"Escrito: {SALIDA}")


if __name__ == "__main__":
    main()
