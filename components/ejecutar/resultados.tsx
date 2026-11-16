"use client";

import { Check, X } from "lucide-react";

import { BadgeFactible } from "@/components/tarjeta-solucion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { num } from "@/lib/formato";
import type { ConfigProblema, Programa, ResultadoAG } from "@/lib/tipos";

/** Tarjetas KPI del mejor individuo. */
export function TarjetasKPI({ r, cfg, programas }: { r: ResultadoAG; cfg: ConfigProblema; programas: Programa[] }) {
  const m = r.mejor;
  const totalMetas = new Set(programas.map((p) => p.meta)).size;
  const kpis: { etiqueta: string; valor: string; nota?: string; destacado?: boolean; mal?: boolean }[] = [
    { etiqueta: "Z (beneficiarias ponderadas)", valor: num(m.Z), destacado: true },
    { etiqueta: "Fitness F", valor: num(m.fitness), nota: m.fitness < m.Z ? "con penalización" : "sin penalización" },
    { etiqueta: "Costo / presupuesto", valor: `${num(m.costo)} / ${num(cfg.presupuesto)}`, mal: !m.cumple_presupuesto },
    {
      etiqueta: "Gasto rural / mínimo",
      valor: `${num(m.costo_rural)} / ${num(cfg.pct_rural * cfg.presupuesto)}`,
      mal: !m.cumple_rural,
    },
    { etiqueta: "Metas cubiertas", valor: `${m.metas_cubiertas.length} / ${totalMetas}`, mal: m.metas_faltantes.length > 0 },
    {
      etiqueta: "Brecha vs Z*",
      valor: r.brecha === null ? "—" : `${num(r.brecha, 2)} %`,
      nota: r.optimo_z === null ? "sin óptimo exacto" : `Z* = ${num(r.optimo_z)}`,
    },
    { etiqueta: "Generación del mejor", valor: String(r.generacion_mejor), nota: `de ${r.parametros.G}` },
    {
      etiqueta: "Fitness promedio final",
      valor: num(r.historial.at(-1)?.promedio_fitness ?? NaN, 1),
      nota: `población de la generación ${r.parametros.G}`,
    },
    { etiqueta: "Tiempo", valor: `${num(r.tiempo_s, 3)} s`, nota: `semilla ${r.semilla_usada}` },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {kpis.map((k) => (
        <Card key={k.etiqueta} size="sm">
          <CardContent className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{k.etiqueta}</p>
            <p
              className={`tabular-nums ${k.destacado ? "text-2xl font-semibold text-primary" : "text-xl font-semibold"} ${k.mal ? "text-destructive" : ""}`}
            >
              {k.valor}
              {k.mal && <span className="sr-only"> (no cumple)</span>}
            </p>
            {k.nota && <p className="text-xs text-muted-foreground">{k.nota}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** R1, R2 y R3 con ✓/✗. */
export function Restricciones({ r, cfg }: { r: ResultadoAG; cfg: ConfigProblema }) {
  const m = r.mejor;
  const minRural = cfg.pct_rural * cfg.presupuesto;
  const filas = [
    {
      ok: m.cumple_presupuesto,
      nombre: "R1 · Presupuesto",
      detalle: `${num(m.costo)} ≤ ${num(cfg.presupuesto)}`,
      falla: `exceso de ${num(m.costo - cfg.presupuesto)} → −α·exceso = −${num(cfg.alfa * (m.costo - cfg.presupuesto))}`,
    },
    {
      ok: m.metas_faltantes.length === 0,
      nombre: "R2 · Cobertura de metas",
      detalle: "todas las metas tienen al menos un programa",
      falla: `falta ${m.metas_faltantes.join(", ")} → −β·U = −${num(cfg.beta * m.metas_faltantes.length)}`,
    },
    {
      ok: m.cumple_rural,
      nombre: "R3 · Mínimo rural",
      detalle: `${num(m.costo_rural)} ≥ ${num(minRural)}`,
      falla: `déficit de ${num(minRural - m.costo_rural)} → −γ·déficit = −${num(cfg.gamma * (minRural - m.costo_rural))}`,
    },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        La solución es <BadgeFactible factible={m.factible} />
      </div>
      <ul className="space-y-2">
        {filas.map((f) => (
          <li key={f.nombre} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${f.ok ? "bg-exito/15 text-exito" : "bg-destructive/10 text-destructive"}`}
            >
              {f.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              <span className="sr-only">{f.ok ? "Cumple" : "No cumple"}</span>
            </span>
            <span>
              <span className="font-medium">{f.nombre}</span>
              <span className="text-muted-foreground"> · {f.ok ? f.detalle : f.falla}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fenotipo: los programas financiados por el mejor cromosoma. */
export function TablaSeleccionados({ ids, programas }: { ids: string[]; programas: Programa[] }) {
  const elegidos = programas.filter((p) => ids.includes(p.id));
  const total = (k: "costo" | "beneficiarias") => elegidos.reduce((s, p) => s + p[k], 0);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Programa</TableHead>
          <TableHead>Meta</TableHead>
          <TableHead>Ámbito</TableHead>
          <TableHead className="text-right">Costo</TableHead>
          <TableHead className="text-right">Beneficiarias</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {elegidos.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs">{p.id}</TableCell>
            <TableCell className="min-w-56 whitespace-normal">{p.nombre}</TableCell>
            <TableCell>{p.meta}</TableCell>
            <TableCell>{p.ambito}</TableCell>
            <TableCell className="text-right tabular-nums">{num(p.costo)}</TableCell>
            <TableCell className="text-right tabular-nums">{num(p.beneficiarias)}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-medium">
          <TableCell colSpan={4}>Total ({elegidos.length} programas)</TableCell>
          <TableCell className="text-right tabular-nums">{num(total("costo"))}</TableCell>
          <TableCell className="text-right tabular-nums">{num(total("beneficiarias"))}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
