/**
 * Integridad del dataset de centros de datos recopilado de prensa
 * (src/datos/datacenters-prensa.json, generado por
 * scripts/generar_datacenters_prensa.py). Si el pipeline se corre de nuevo y
 * produce algo malformado, estos tests lo detienen antes de llegar al mapa.
 */
import { describe, expect, it } from "vitest";
import datos from "@/datos/datacenters-prensa.json";
import type { DatosPrensa } from "@/datos/tipos";

const d = datos as DatosPrensa;
const MX = { latMin: 14, latMax: 33, lngMin: -118, lngMax: -86 };

describe("dataset de centros de datos (prensa)", () => {
  it("meta y conteos coinciden con el contenido", () => {
    expect(d.meta.totalCentros).toBe(d.centros.length);
    expect(d.meta.totalMenciones).toBe(d.centros.reduce((s, c) => s + c.menciones.length, 0));
    expect(d.centros.length).toBeGreaterThan(40);
    expect(d.meta.medios.length).toBeGreaterThan(30);
  });

  it("todo centro tiene empresa, entidad, estado válido y coordenadas dentro de México", () => {
    for (const c of d.centros) {
      expect(c.empresa, c.id).toBeTruthy();
      expect(c.entidad, c.id).toBeTruthy();
      expect(["en-operacion", "en-construccion", "anunciado"], c.id).toContain(c.estado);
      expect(["municipio", "entidad"], c.id).toContain(c.precision);
      expect(c.lat, c.id).toBeGreaterThan(MX.latMin);
      expect(c.lat, c.id).toBeLessThan(MX.latMax);
      expect(c.lng, c.id).toBeGreaterThan(MX.lngMin);
      expect(c.lng, c.id).toBeLessThan(MX.lngMax);
      expect(c.menciones.length, c.id).toBeGreaterThan(0);
    }
  });

  it("los ids son únicos", () => {
    const ids = d.centros.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada nota tiene URL http y las menciones vienen ordenadas por año", () => {
    for (const c of d.centros) {
      const anios = c.menciones.map((m) => m.anio);
      expect(
        [...anios].sort((a, b) => a - b),
        c.id,
      ).toEqual(anios);
      for (const m of c.menciones) {
        for (const n of m.notas) expect(n.url, c.id).toMatch(/^https?:\/\//);
      }
    }
  });

  it("todo centro dice de qué medios se infirió su ubicación", () => {
    for (const c of d.centros) {
      expect(Array.isArray(c.fuentesUbicacion), c.id).toBe(true);
      expect(c.fuentesUbicacion.length, c.id).toBeGreaterThan(0);
      for (const f of c.fuentesUbicacion) {
        expect(f.medio, c.id).toBeTruthy();
        expect(f.url, c.id).toMatch(/^https?:\/\//);
      }
      // Y al menos una mención queda marcada como la que fija la ubicación.
      expect(
        c.menciones.some((m) => m.fijaUbicacion),
        c.id,
      ).toBe(true);
    }
  });

  it("la precisión de entidad implica municipio nulo, y viceversa", () => {
    for (const c of d.centros) {
      if (c.precision === "entidad") expect(c.municipio, c.id).toBeNull();
      else expect(c.municipio, c.id).toBeTruthy();
    }
  });
});
