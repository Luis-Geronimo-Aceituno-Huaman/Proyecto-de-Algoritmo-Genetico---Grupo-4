// Lógica de la pantalla "Comparar corridas": lista unificada, colores estables, tabla 8.6 y repetibilidad.
import { COLORES_SERIES } from "@/lib/colores";
import type { CorridaGuardada } from "@/lib/corridas";
import { aCsv } from "@/lib/exportar";
import { desviacion, media } from "@/lib/estadistica";
import type { ConfigProblema, Programa, RespuestaCorridas, ResultadoAG, Solucion } from "@/lib/tipos";

export const MAX_SELECCION = COLORES_SERIES.length;

export type Origen = "informe" | "ultima" | "guardada";
export interface ItemCorrida extends CorridaGuardada {
  origen: Origen;
}

export function itemsDelInforme(
  r: RespuestaCorridas,
  programas: Programa[],
  config: ConfigProblema,
  fecha: string,
): ItemCorrida[] {
  return r.corridas.map((c) => ({
    id: `informe-${c.id}`,
    nombre: `${c.nombre} · semilla ${c.semilla_usada}`,
    fecha,
    parametros: c.parametros,
    config,
    programas,
    resultado: c,
    origen: "informe",
  }));
}

/**
 * Color estable por corrida: las que siguen elegidas conservan su color y las nuevas toman
 * el primer color libre (orden fijo de la paleta, nunca cíclico).
 */
export function asignarColores(previos: Record<string, string>, seleccion: string[]): Record<string, string> {
  const nuevos: Record<string, string> = {};
  for (const id of seleccion) if (previos[id]) nuevos[id] = previos[id];
  for (const id of seleccion) {
    if (nuevos[id]) continue;
    const libre = COLORES_SERIES.find((c) => !Object.values(nuevos).includes(c));
    if (libre) nuevos[id] = libre;
  }
  return nuevos;
}

/** Filas { generacion, [id]: mejor_fitness } para superponer varias corridas. */
export function datosSuperpuestos(items: ItemCorrida[]): Record<string, number | null>[] {
  const maxG = Math.max(0, ...items.map((i) => i.resultado.historial.length - 1));
  return Array.from({ length: maxG + 1 }, (_, g) => {
    const fila: Record<string, number | null> = { generacion: g };
    for (const i of items) fila[i.id] = i.resultado.historial[g]?.mejor_fitness ?? null;
    return fila;
  });
}

/** Una fila de la tabla resumen (formato de la Tabla 8.6 del informe). */
export interface FilaResumen {
  nombre: string;
  Z: number;
  costo: number;
  factible: boolean;
  brecha: number | null;
  generacionMejor: number | null;
  promedioFinal: number | null;
  tiempo: number | null;
  referencia?: boolean;
}

const brecha = (z: number, zOpt: number | null) => (zOpt ? ((zOpt - z) / zOpt) * 100 : null);

export function filasReferencia(r: { exacto: { solucion: Solucion | null; tiempo_s?: number }; voraz: Solucion }): FilaResumen[] {
  const zOpt = r.exacto.solucion?.Z ?? null;
  const filas: FilaResumen[] = [];
  if (r.exacto.solucion) {
    const s = r.exacto.solucion;
    filas.push({ nombre: "Óptimo exacto", Z: s.Z, costo: s.costo, factible: s.factible, brecha: 0, generacionMejor: null, promedioFinal: null, tiempo: r.exacto.tiempo_s ?? null, referencia: true });
  }
  const v = r.voraz;
  filas.push({ nombre: "Heurística voraz", Z: v.Z, costo: v.costo, factible: v.factible, brecha: brecha(v.Z, zOpt), generacionMejor: null, promedioFinal: null, tiempo: null, referencia: true });
  return filas;
}

export const filaDeCorrida = (i: ItemCorrida): FilaResumen => ({
  nombre: i.nombre,
  Z: i.resultado.mejor.Z,
  costo: i.resultado.mejor.costo,
  factible: i.resultado.mejor.factible,
  brecha: i.resultado.brecha,
  generacionMejor: i.resultado.generacion_mejor,
  promedioFinal: i.resultado.historial.at(-1)?.promedio_fitness ?? null,
  tiempo: i.resultado.tiempo_s,
});

export function tablaResumenCsv(filas: FilaResumen[]): string {
  return aCsv(
    ["Corrida", "Z", "Costo (miles S/)", "Factible", "Brecha (%)", "Generación del mejor", "Fitness promedio final", "Tiempo (s)"],
    filas.map((f) => [
      f.nombre,
      f.Z,
      f.costo,
      f.factible ? "Sí" : "No",
      f.brecha === null ? "" : Number(f.brecha.toFixed(2)),
      f.generacionMejor,
      f.promedioFinal === null ? "" : Number(f.promedioFinal.toFixed(2)),
      f.tiempo === null ? "" : Number(f.tiempo.toFixed(4)),
    ]),
  );
}

// ---------- Repetibilidad ----------
export const SEMILLAS_REPETIBILIDAD = [1, 2, 3, 4, 5];

export interface FilaRepetibilidad {
  nombre: string;
  resultados: ResultadoAG[];
  mediaZ: number;
  deZ: number;
  mediaBrecha: number | null;
  deBrecha: number | null;
  factibles: number;
}

export function resumirRepetibilidad(nombre: string, resultados: ResultadoAG[]): FilaRepetibilidad {
  const zs = resultados.map((r) => r.mejor.Z);
  const brechas = resultados.map((r) => r.brecha).filter((b): b is number => b !== null);
  return {
    nombre,
    resultados,
    mediaZ: media(zs),
    deZ: desviacion(zs),
    mediaBrecha: brechas.length === resultados.length ? media(brechas) : null,
    deBrecha: brechas.length === resultados.length ? desviacion(brechas) : null,
    factibles: resultados.filter((r) => r.mejor.factible).length,
  };
}

export function repetibilidadCsv(filas: FilaRepetibilidad[]): string {
  const r2 = (x: number | null) => (x === null ? "" : Number(x.toFixed(2)));
  return aCsv(
    ["Configuración", ...SEMILLAS_REPETIBILIDAD.map((s) => `Z (semilla ${s})`), "Media Z", "DE Z", "Media brecha (%)", "DE brecha (%)", "Factibles"],
    filas.map((f) => [f.nombre, ...f.resultados.map((r) => r.mejor.Z), r2(f.mediaZ), r2(f.deZ), r2(f.mediaBrecha), r2(f.deBrecha), `${f.factibles}/${f.resultados.length}`]),
  );
}
