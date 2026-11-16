// Historial de corridas guardadas en localStorage (todo acceso va en try/catch).
import type { ConfigProblema, Programa, ResultadoAG } from "@/lib/tipos";

const CLAVE = "ag-ods5:corridas";

export interface CorridaGuardada {
  id: string;
  nombre: string;
  fecha: string; // ISO
  parametros: ResultadoAG["parametros"];
  config: ConfigProblema;
  programas: Programa[];
  resultado: ResultadoAG;
}

export function leerCorridas(): CorridaGuardada[] {
  try {
    const texto = localStorage.getItem(CLAVE);
    const datos = texto ? JSON.parse(texto) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

/** Devuelve true si se pudo escribir. */
function escribir(corridas: CorridaGuardada[]): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(corridas));
    return true;
  } catch {
    return false;
  }
}

const nuevoId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

export function guardarCorrida(datos: Omit<CorridaGuardada, "id" | "fecha">): CorridaGuardada | null {
  const corrida: CorridaGuardada = { ...datos, id: nuevoId(), fecha: new Date().toISOString() };
  return escribir([corrida, ...leerCorridas()]) ? corrida : null;
}

export const renombrarCorrida = (id: string, nombre: string) =>
  escribir(leerCorridas().map((c) => (c.id === id ? { ...c, nombre } : c)));

export const borrarCorrida = (id: string) => escribir(leerCorridas().filter((c) => c.id !== id));
