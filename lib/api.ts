// Cliente tipado de la API Python (/api/py/*).
import type {
  ConfigProblema,
  DatosPorDefecto,
  ParametrosAG,
  Programa,
  RespuestaCorridas,
  RespuestaOptimo,
  ResultadoAG,
} from "@/lib/tipos";

export class ErrorApi extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

async function pedir<T>(ruta: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/py/${ruta}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ErrorApi("No se pudo conectar con la API. ¿Está corriendo el servidor de Python?", 0);
  }
  if (!res.ok) {
    let mensaje = `Error ${res.status} en la API.`;
    try {
      const j = await res.json();
      if (typeof j?.detail === "string") mensaje = j.detail; // 422 en español
    } catch {
      /* respuesta sin JSON */
    }
    throw new ErrorApi(mensaje, res.status);
  }
  return res.json() as Promise<T>;
}

interface Problema {
  programas: Programa[];
  config: ConfigProblema;
}

export const obtenerDatosPorDefecto = () => pedir<DatosPorDefecto>("programas");

export const calcularOptimo = (p: Problema) => pedir<RespuestaOptimo>("optimo", p);

export const ejecutarAG = (p: Problema & { parametros: ParametrosAG }) =>
  pedir<ResultadoAG>("ejecutar", p);

export const ejecutarCorridasInforme = (p: Problema & { semilla: number }) =>
  pedir<RespuestaCorridas>("corridas-informe", p);

export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
}
