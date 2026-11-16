// Tipos que reflejan las respuestas de la API (api/index.py y api/_core).

export type Ambito = "Urbano" | "Rural" | "Mixto";

export interface Programa {
  id: string;
  nombre: string;
  meta: string;
  ambito: Ambito;
  costo: number; // miles de soles
  beneficiarias: number;
  prioridad: number; // w
}

export interface ConfigProblema {
  presupuesto: number; // B
  pct_rural: number; // fracción de B (0..1)
  alfa: number;
  beta: number;
  gamma: number;
}

export type TipoCruce = "un_punto" | "uniforme";
export type TipoSeleccion = "ruleta" | "torneo";

export interface ParametrosAG {
  N: number;
  G: number;
  pc: number;
  pm: number;
  cruce: TipoCruce;
  seleccion: TipoSeleccion;
  torneo_t: number;
  semilla: number | null;
}

/** Resultado de decodificar un cromosoma. */
export interface Solucion {
  cromosoma: string;
  seleccionados: string[];
  Z: number;
  costo: number;
  costo_rural: number;
  metas_cubiertas: string[];
  metas_faltantes: string[];
  cumple_presupuesto: boolean;
  cumple_rural: boolean;
  factible: boolean;
  fitness: number;
}

export interface PuntoHistorial {
  generacion: number;
  mejor_fitness: number;
  promedio_fitness: number;
  peor_fitness: number;
}

export interface ResultadoAG {
  mejor: Solucion;
  historial: PuntoHistorial[];
  generacion_mejor: number;
  tiempo_s: number;
  semilla_usada: number;
  parametros: ParametrosAG;
  optimo_z: number | null;
  brecha: number | null;
}

export interface OptimoExacto {
  solucion: Solucion | null;
  motivo: string | null;
  n_factibles?: number;
  n_combinaciones?: number;
  tiempo_s?: number;
}

export interface RespuestaOptimo {
  exacto: OptimoExacto;
  voraz: Solucion;
}

export interface Preset {
  id: string;
  nombre: string;
  parametros: ParametrosAG;
}

export interface DatosPorDefecto {
  programas: Programa[];
  config: ConfigProblema;
  presets: Preset[];
}

export interface CorridaInforme extends ResultadoAG {
  id: string;
  nombre: string;
}

export interface RespuestaCorridas extends RespuestaOptimo {
  semilla: number;
  corridas: CorridaInforme[];
}
