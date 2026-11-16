// Parámetros del AG: valores por defecto, límites (iguales a la API) y comparación con presets.
import type { ParametrosAG, Preset } from "@/lib/tipos";

/** Debe coincidir con ParametrosAG en api/_core/motor.py. */
export const PARAMETROS_POR_DEFECTO: ParametrosAG = {
  N: 50,
  G: 100,
  pc: 0.8,
  pm: 0.1,
  cruce: "un_punto",
  seleccion: "ruleta",
  torneo_t: 3,
  semilla: 42,
};

/** Límites que valida la API (api/index.py). */
export const LIMITES = {
  N: { min: 4, max: 500, paso: 1 },
  G: { min: 1, max: 1000, paso: 1 },
  pc: { min: 0, max: 1, paso: 0.01 },
  pm: { min: 0, max: 1, paso: 0.01 },
} as const;

export const NOMBRE_CRUCE = { un_punto: "Un punto", uniforme: "Uniforme" } as const;
export const NOMBRE_SELECCION = { ruleta: "Ruleta", torneo: "Torneo" } as const;

/** Nombre corto del preset ("Corrida 2: Mutación alta (Pm = 0,30)" → "Mutación alta"). */
export const nombreCortoPreset = (p: Preset) => p.nombre.replace(/^Corrida \d+:\s*/, "").replace(/\s*\(.*\)$/, "");

const iguales = (a: ParametrosAG, b: ParametrosAG) =>
  a.N === b.N &&
  a.G === b.G &&
  a.pc === b.pc &&
  a.pm === b.pm &&
  a.cruce === b.cruce &&
  a.seleccion === b.seleccion &&
  (a.seleccion !== "torneo" || a.torneo_t === b.torneo_t);

/** Preset que coincide con los parámetros (sin contar la semilla), o null si son personalizados. */
export function presetActual(params: ParametrosAG, presets: Preset[]): Preset | null {
  return presets.find((p) => iguales(params, p.parametros)) ?? null;
}

/** Mensaje de error de validación local, o null si los parámetros son válidos. */
export function errorParametros(p: ParametrosAG): string | null {
  if (p.seleccion === "torneo" && (p.torneo_t < 2 || p.torneo_t > p.N)) return "El tamaño del torneo t debe estar entre 2 y N.";
  if (p.semilla !== null && (!Number.isInteger(p.semilla) || p.semilla < 0)) return "La semilla debe ser un entero ≥ 0.";
  return null;
}

export function describirParametros(p: ParametrosAG): string {
  const sel = p.seleccion === "torneo" ? `torneo t=${p.torneo_t}` : "ruleta";
  return `N=${p.N} · G=${p.G} · Pc=${p.pc} · Pm=${p.pm} · cruce ${NOMBRE_CRUCE[p.cruce].toLowerCase()} · ${sel} · semilla ${p.semilla ?? "aleatoria"}`;
}
