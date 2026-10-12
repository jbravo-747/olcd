/**
 * Integridad del dataset de centros de datos recopilado de prensa
 * (src/datos/datacenters-prensa.json, generado por
 * scripts/generar_datacenters_prensa.py desde el consolidado curado). Si el
 * pipeline se corre de nuevo y produce algo malformado, estos tests lo
 * detienen antes de llegar al mapa.
 */
import { describe, expect, it } from "vitest";
import datos from "@/datos/datacenters-prensa.json";
import type { DatosPrensa } from "@/datos/tipos";

const d = datos as unknown as DatosPrensa;
const MX = { latMin: 14, latMax: 33, lngMin: -118, lngMax: -86 };

describe("dataset de centros de datos (prensa)", () => {
  it("meta y conteos coinciden con el contenido", () => {
    expect(d.meta.totalCentros).toBe(d.centros.length);
    expect(d.meta.totalNotas).toBe(d.centros.reduce((s, c) => s + c.notas.length, 0));
    expect(d.centros.length).toBeGreaterThan(40);
    expect(d.meta.medios.length).toBeGreaterThan(25);
  });

  it("todo centro tiene nombre, empresa, entidad, estado válido y coordenadas dentro de México", () => {
    for (const c of d.centros) {
      expect(c.nombre, c.id).toBeTruthy();
      expect(c.empresa, c.id).toBeTruthy();
      expect(c.entidad, c.id).toBeTruthy();
      expect(["en-operacion", "en-construccion", "anunciado"], c.id).toContain(c.estado);
      expect(["municipio", "entidad"], c.id).toContain(c.precision);
      expect(c.lat, c.id).toBeGreaterThan(MX.latMin);
      expect(c.lat, c.id).toBeLessThan(MX.latMax);
      expect(c.lng, c.id).toBeGreaterThan(MX.lngMin);
      expect(c.lng, c.id).toBeLessThan(MX.lngMax);
    }
  });

  it("los ids son únicos", () => {
    const ids = d.centros.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda fase registrada trae texto, y las notas URLs http", () => {
    // Hay centros sin ninguna fase fechada en el consolidado (p. ej. Pemex):
    // las fases son opcionales, pero si existen deben traer texto.
    for (const c of d.centros) {
      const fases = [c.fases.anuncio, c.fases.construccion, c.fases.expansion].filter(Boolean);
      for (const f of fases) expect(f!.texto, c.id).toBeTruthy();
      for (const n of c.notas) expect(n.url, c.id).toMatch(/^https?:\/\//);
    }
  });

  it("score en [0,10] con semáforo coherente a los umbrales", () => {
    const u = d.meta.umbralesSemaforo;
    for (const c of d.centros) {
      expect(c.score, c.id).toBeGreaterThanOrEqual(0);
      expect(c.score, c.id).toBeLessThanOrEqual(10);
      const esperado =
        c.score >= u.verde ? "verde" : c.score >= u.amarillo ? "amarillo" : c.score >= u.naranja ? "naranja" : "rojo";
      expect(c.semaforo, c.id).toBe(esperado);
    }
  });

  it("la precisión de entidad implica municipio nulo, y viceversa", () => {
    for (const c of d.centros) {
      if (c.precision === "entidad") expect(c.municipio, c.id).toBeNull();
      else expect(c.municipio, c.id).toBeTruthy();
    }
  });
});
