/**
 * S5 · Proyección Mercator recortada a América Latina (src/lib/proyeccion.ts).
 * Valores esperados calculados aparte: y_merc(lat) = ln(tan(π/4 + lat/2)),
 * con límites lng ∈ [-118, -34], lat ∈ [-56, 33]:
 *   y_merc(33) ≈ 0.61074, y_merc(-56) ≈ -1.18509, rango lng = 84° ≈ 1.46608 rad
 *   ALTO = round(1000 · 1.79583 / 1.46608) = 1225.
 */
import { describe, expect, it } from "vitest";
import { ALTO, ANCHO, LIMITES, anilloAPath, proyectar } from "@/lib/proyeccion";

describe("proyectar", () => {
  it("el viewBox mide 1000 × 1225 para el recorte de América Latina", () => {
    expect(ANCHO).toBe(1000);
    expect(ALTO).toBe(1225);
  });

  it("la esquina noroeste del recorte cae en (0, 0)", () => {
    const { x, y } = proyectar(LIMITES.latMax, LIMITES.lngMin);
    expect(x).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0, 6);
  });

  it("la esquina sureste del recorte cae en (ANCHO, ALTO)", () => {
    const { x, y } = proyectar(LIMITES.latMin, LIMITES.lngMax);
    expect(x).toBeCloseTo(1000, 6);
    expect(y).toBeCloseTo(1225, 6);
  });

  it("la longitud es lineal: -76° (centro del recorte) → x = 500", () => {
    expect(proyectar(0, -76).x).toBeCloseTo(500, 6);
  });

  it("el ecuador queda a y ≈ 416.6 (Mercator no es lineal en latitud)", () => {
    expect(proyectar(0, -76).y).toBeCloseTo(416.6, 0);
  });

  it("Ciudad de México (19.43, -99.13) → (≈224.6, ≈180.7)", () => {
    const { x, y } = proyectar(19.43, -99.13);
    expect(x).toBeCloseTo(224.6, 0);
    expect(y).toBeCloseTo(180.7, 0);
  });
});

describe("anilloAPath", () => {
  it("emite M para el primer punto, L para los demás y cierra con Z, con un decimal", () => {
    const anillo = [
      [LIMITES.lngMin, LIMITES.latMax],
      [LIMITES.lngMax, LIMITES.latMax],
      [LIMITES.lngMax, LIMITES.latMin],
    ];
    expect(anilloAPath(anillo)).toBe("M0.0 0.0L1000.0 0.0L1000.0 1225.0Z");
  });
});
