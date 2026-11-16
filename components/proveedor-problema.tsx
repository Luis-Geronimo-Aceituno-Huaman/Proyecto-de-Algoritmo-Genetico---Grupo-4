"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  CONFIG_POR_DEFECTO,
  MAX_PROGRAMAS,
  MIN_PROGRAMAS,
  PROGRAMAS_POR_DEFECTO,
  nuevoPrograma,
} from "@/lib/problema";
import { PARAMETROS_POR_DEFECTO } from "@/lib/parametros";
import type {
  ConfigProblema,
  ParametrosAG,
  Programa,
  RespuestaCorridas,
  RespuestaOptimo,
  ResultadoAG,
} from "@/lib/tipos";

/** Las 4 corridas del informe junto con los datos con que se obtuvieron. */
export interface EjecucionInforme {
  respuesta: RespuestaCorridas;
  programas: Programa[];
  config: ConfigProblema;
  fecha: string;
}

/** Resultado de una ejecución junto con los datos con que se obtuvo. */
export interface Ejecucion {
  resultado: ResultadoAG;
  /** Óptimo exacto y heurística voraz de los mismos datos, para comparar. */
  referencia: RespuestaOptimo | null;
  programas: Programa[];
  config: ConfigProblema;
}

interface ContextoProblema {
  parametros: ParametrosAG;
  setParametros: (p: ParametrosAG) => void;
  ultimaEjecucion: Ejecucion | null;
  setUltimaEjecucion: (e: Ejecucion | null) => void;
  informe: EjecucionInforme | null;
  setInforme: (e: EjecucionInforme | null) => void;
  programas: Programa[];
  config: ConfigProblema;
  /** Cambia al restaurar: sirve de key para reiniciar los inputs no controlados. */
  version: number;
  editarPrograma: (id: string, cambios: Partial<Programa>) => void;
  agregarPrograma: () => void;
  quitarPrograma: (id: string) => void;
  editarConfig: (cambios: Partial<ConfigProblema>) => void;
  restaurar: () => void;
  esPorDefecto: boolean;
}

const Contexto = createContext<ContextoProblema | null>(null);

/** Programas y configuración editables, compartidos entre pantallas. */
export function ProveedorProblema({ children }: { children: ReactNode }) {
  const [programas, setProgramas] = useState<Programa[]>(PROGRAMAS_POR_DEFECTO);
  const [config, setConfig] = useState<ConfigProblema>(CONFIG_POR_DEFECTO);
  const [version, setVersion] = useState(0);
  const [parametros, setParametros] = useState<ParametrosAG>(PARAMETROS_POR_DEFECTO);
  const [ultimaEjecucion, setUltimaEjecucion] = useState<Ejecucion | null>(null);
  const [informe, setInforme] = useState<EjecucionInforme | null>(null);

  const valor = useMemo<ContextoProblema>(
    () => ({
      informe,
      setInforme,
      parametros,
      setParametros,
      ultimaEjecucion,
      setUltimaEjecucion,
      programas,
      config,
      version,
      editarPrograma: (id, cambios) =>
        setProgramas((ps) => ps.map((p) => (p.id === id ? { ...p, ...cambios } : p))),
      agregarPrograma: () =>
        setProgramas((ps) => (ps.length >= MAX_PROGRAMAS ? ps : [...ps, nuevoPrograma(ps)])),
      quitarPrograma: (id) =>
        setProgramas((ps) => (ps.length <= MIN_PROGRAMAS ? ps : ps.filter((p) => p.id !== id))),
      editarConfig: (cambios) => setConfig((c) => ({ ...c, ...cambios })),
      restaurar: () => {
        setProgramas(PROGRAMAS_POR_DEFECTO);
        setConfig(CONFIG_POR_DEFECTO);
        setVersion((v) => v + 1);
      },
      esPorDefecto: programas === PROGRAMAS_POR_DEFECTO && config === CONFIG_POR_DEFECTO,
    }),
    [programas, config, version, parametros, ultimaEjecucion, informe],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProblema() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useProblema debe usarse dentro de <ProveedorProblema>");
  return c;
}
