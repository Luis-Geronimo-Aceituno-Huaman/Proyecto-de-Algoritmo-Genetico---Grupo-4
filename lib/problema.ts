// Datos por defecto e indicadores del problema (sin React).
import programasJson from "@/api/_core/data/programas.json";
import type { Ambito, ConfigProblema, Programa } from "@/lib/tipos";

/** Fuente única: el mismo programas.json que usa la API. */
export const PROGRAMAS_POR_DEFECTO = programasJson as Programa[];

/** Debe coincidir con ConfigProblema en api/_core/datos.py. */
export const CONFIG_POR_DEFECTO: ConfigProblema = {
  presupuesto: 1500,
  pct_rural: 0.3,
  alfa: 150,
  beta: 5000,
  gamma: 30,
};

export const AMBITOS: Ambito[] = ["Urbano", "Rural", "Mixto"];
export const METAS_ODS5 = ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.a", "5.b", "5.c"];
export const MIN_PROGRAMAS = 2;
export const MAX_PROGRAMAS = 40;

export interface Indicadores {
  n: number;
  costoTotal: number;
  coberturaPresupuesto: number; // B / Σc (fracción)
  metas: string[];
  espacioBusqueda: number; // 2^n
  minimoRural: number; // pct_rural · B
  costoRuralTotal: number;
}

export function calcularIndicadores(programas: Programa[], cfg: ConfigProblema): Indicadores {
  const costoTotal = programas.reduce((s, p) => s + (p.costo || 0), 0);
  return {
    n: programas.length,
    costoTotal,
    coberturaPresupuesto: costoTotal > 0 ? cfg.presupuesto / costoTotal : 0,
    metas: [...new Set(programas.map((p) => p.meta))].sort(),
    espacioBusqueda: 2 ** programas.length,
    minimoRural: cfg.pct_rural * cfg.presupuesto,
    costoRuralTotal: programas.filter((p) => p.ambito === "Rural").reduce((s, p) => s + (p.costo || 0), 0),
  };
}

/** Siguiente id libre: P21, P22, ... */
export function siguienteId(programas: Programa[]): string {
  const usados = new Set(programas.map((p) => p.id));
  let i = programas.length + 1;
  while (usados.has(`P${String(i).padStart(2, "0")}`)) i++;
  return `P${String(i).padStart(2, "0")}`;
}

export function nuevoPrograma(programas: Programa[]): Programa {
  return {
    id: siguienteId(programas),
    nombre: "Nuevo programa",
    meta: "5.1",
    ambito: "Urbano",
    costo: 100,
    beneficiarias: 1000,
    prioridad: 1,
  };
}

export const nombrePorId = (programas: Programa[]) => new Map(programas.map((p) => [p.id, p.nombre]));
