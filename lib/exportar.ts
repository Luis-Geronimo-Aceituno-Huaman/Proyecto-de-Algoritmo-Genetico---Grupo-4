// Descargas: CSV compatible con Excel (separador ";" y UTF-8 con BOM) y PNG de un nodo del DOM.
import { toPng } from "html-to-image";
import type { PuntoHistorial } from "@/lib/tipos";

/** Número con coma decimal y sin separador de miles (Excel en español). */
const numCsv = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v).replace(".", ","));

const celda = (v: string | number | null | undefined) => {
  const t = typeof v === "number" ? numCsv(v) : (v ?? "");
  return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export function aCsv(encabezados: string[], filas: (string | number | null | undefined)[][]): string {
  return "﻿" + [encabezados, ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
}

export function historialCsv(historial: PuntoHistorial[]): string {
  return aCsv(
    ["generacion", "mejor_fitness", "promedio_fitness", "peor_fitness"],
    historial.map((h) => [h.generacion, h.mejor_fitness, h.promedio_fitness, h.peor_fitness]),
  );
}

function descargar(url: string, nombre: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function descargarTexto(contenido: string, nombre: string, tipo = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  descargar(url, nombre);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function descargarPng(nodo: HTMLElement, nombre: string) {
  const url = await toPng(nodo, { backgroundColor: "#ffffff", pixelRatio: 2, cacheBust: true });
  descargar(url, nombre);
}

/** "corrida-base-s42" → nombre de archivo seguro. */
export const nombreArchivo = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
