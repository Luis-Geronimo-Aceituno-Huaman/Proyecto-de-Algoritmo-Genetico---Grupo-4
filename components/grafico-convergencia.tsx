"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import { COLOR_EJE, COLOR_GRILLA, COLOR_REFERENCIA } from "@/lib/colores";
import { num } from "@/lib/formato";

export interface SerieGrafico {
  clave: string;
  nombre: string;
  color: string;
  /** Texto corto para la etiqueta al final de la línea. */
  etiqueta?: string;
}

/**
 * Etiquetas al final de cada línea: las series que terminan en valores casi iguales
 * comparten una sola etiqueta ("Base / Mutación alta") para que no se encimen.
 */
function etiquetasFinales(datos: Record<string, number | null>[], series: SerieGrafico[]) {
  const finales = series
    .map((s) => {
      const fila = [...datos].reverse().find((d) => d[s.clave] !== null && d[s.clave] !== undefined);
      return { s, v: fila ? Number(fila[s.clave]) : NaN, g: fila ? Number(fila.generacion) : -1 };
    })
    .filter((f) => Number.isFinite(f.v))
    .sort((a, b) => b.v - a.v);
  const valores = datos.flatMap((d) => series.map((s) => d[s.clave])).filter((v): v is number => typeof v === "number");
  const umbral = (Math.max(...valores) - Math.min(...valores)) * 0.05;
  const texto: Record<string, { texto: string; generacion: number }> = {};
  let grupo: typeof finales = [];
  const cerrar = () => {
    if (grupo.length) texto[grupo[0].s.clave] = { texto: grupo.map((f) => f.s.etiqueta ?? f.s.nombre).join(" / "), generacion: grupo[0].g };
    grupo = [];
  };
  for (const f of finales) {
    if (grupo.length && grupo[0].v - f.v > umbral) cerrar();
    grupo.push(f);
  }
  cerrar();
  return texto;
}

interface Props {
  /** Una fila por generación: { generacion, [clave]: valor }. */
  datos: Record<string, number | null>[];
  series: SerieGrafico[];
  zOptimo: number | null;
  alto?: number;
}

/** Fitness por generación (eje X = 0..G) con la línea punteada de Z*. */
export function GraficoConvergencia({ datos, series, zOptimo, alto = 340 }: Props) {
  const [ancho, setAncho] = useState(0);
  const ultimo = datos.length - 1;
  // En pantallas estrechas basta la leyenda: las etiquetas finales aplastarían el gráfico.
  const etiquetaFinal = series.length <= 4 && ancho >= 560;
  const etiquetas = etiquetaFinal ? etiquetasFinales(datos, series) : {};
  const largo = Math.max(0, ...Object.values(etiquetas).map((e) => e.texto.length));
  const margenDerecho = etiquetaFinal ? Math.min(220, 16 + largo * 6.2) : 16;

  return (
    <div style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" onResize={(w) => setAncho(w)}>
        <LineChart data={datos} margin={{ top: 16, right: margenDerecho, bottom: 20, left: 8 }}>
          <CartesianGrid stroke={COLOR_GRILLA} vertical={false} />
          <XAxis
            dataKey="generacion"
            type="number"
            domain={[0, ultimo]}
            allowDecimals={false}
            tick={{ fill: COLOR_EJE, fontSize: 12 }}
            stroke={COLOR_GRILLA}
            label={{ value: "Generación", position: "insideBottom", offset: -12, fill: COLOR_EJE, fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: COLOR_EJE, fontSize: 12 }}
            stroke={COLOR_GRILLA}
            width={64}
            tickFormatter={(v: number) => num(v)}
            domain={["auto", "auto"]}
            label={{ value: "Fitness F", angle: -90, position: "insideLeft", offset: 4, fill: COLOR_EJE, fontSize: 12, dy: 30 }}
          />
          <Tooltip
            content={(p) => <Contenido {...p} series={series} />}
            cursor={{ stroke: COLOR_EJE, strokeDasharray: "3 3" }}
            isAnimationActive={false}
          />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="plainline"
            itemSorter={null} // respeta el orden de las series (Recharts ordena alfabéticamente por defecto)
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
            formatter={(valor) => <span style={{ color: COLOR_REFERENCIA }}>{valor}</span>}
          />
          {zOptimo !== null && (
            <ReferenceLine
              y={zOptimo}
              stroke={COLOR_REFERENCIA}
              strokeDasharray="6 4"
              strokeWidth={1.5}
              ifOverflow="extendDomain"
              label={{ value: `Z* = ${num(zOptimo)}`, position: "insideBottomRight", fill: COLOR_REFERENCIA, fontSize: 12 }}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.clave}
              dataKey={s.clave}
              name={s.etiqueta ?? s.nombre}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
              isAnimationActive={false}
              connectNulls
              label={
                etiquetas[s.clave]
                  ? ({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) =>
                      index === etiquetas[s.clave].generacion ? (
                        <text x={Number(x) + 6} y={Number(y)} dy={4} fontSize={11} fill={COLOR_REFERENCIA}>
                          {etiquetas[s.clave].texto}
                        </text>
                      ) : null
                  : undefined
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Contenido({ active, payload, label, series }: TooltipContentProps & { series: SerieGrafico[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">Generación {label}</p>
      {series.map((s) => {
        const v = payload.find((p) => p.dataKey === s.clave)?.value;
        if (v === undefined || v === null) return null;
        return (
          <p key={s.clave} className="flex items-center gap-2 tabular-nums">
            <span className="inline-block h-0.5 w-3" style={{ background: s.color }} aria-hidden />
            <span className="text-muted-foreground">{s.nombre}:</span> {num(Number(v), 1)}
          </p>
        );
      })}
    </div>
  );
}
