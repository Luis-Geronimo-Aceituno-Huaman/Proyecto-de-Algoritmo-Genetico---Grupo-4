"use client";

import { FileSpreadsheet, Repeat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FaseAG } from "@/components/fase-ag";
import { useProblema } from "@/components/proveedor-problema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ejecutarAG, mensajeError } from "@/lib/api";
import {
  SEMILLAS_REPETIBILIDAD,
  repetibilidadCsv,
  resumirRepetibilidad,
  type FilaRepetibilidad,
} from "@/lib/comparar";
import { descargarTexto } from "@/lib/exportar";
import { num } from "@/lib/formato";
import { describirParametros, nombreCortoPreset } from "@/lib/parametros";
import type { ParametrosAG, Preset } from "@/lib/tipos";

const TODAS = "todas";
const ACTUALES = "actuales";

/** Ejecuta una o varias configuraciones con las semillas 1..5 y resume media y desviación estándar. */
export function Repetibilidad({ presets }: { presets: Preset[] }) {
  const { programas, config, parametros } = useProblema();
  const [opcion, setOpcion] = useState<string>(TODAS);
  const [filas, setFilas] = useState<FilaRepetibilidad[]>([]);
  const [progreso, setProgreso] = useState<{ hechas: number; total: number } | null>(null);

  const items: Record<string, string> = {
    [TODAS]: "Las 4 corridas del informe",
    ...Object.fromEntries(presets.map((p) => [p.id, nombreCortoPreset(p)])),
    [ACTUALES]: "Parámetros actuales de «Ejecutar AG»",
  };

  function configuraciones(): { nombre: string; parametros: ParametrosAG }[] {
    if (opcion === TODAS) return presets.map((p) => ({ nombre: nombreCortoPreset(p), parametros: p.parametros }));
    if (opcion === ACTUALES) return [{ nombre: "Parámetros actuales", parametros }];
    const p = presets.find((x) => x.id === opcion);
    return p ? [{ nombre: nombreCortoPreset(p), parametros: p.parametros }] : [];
  }

  async function ejecutar() {
    const confs = configuraciones();
    const total = confs.length * SEMILLAS_REPETIBILIDAD.length;
    setProgreso({ hechas: 0, total });
    setFilas([]);
    try {
      const nuevas: FilaRepetibilidad[] = [];
      let hechas = 0;
      for (const c of confs) {
        const resultados = [];
        for (const semilla of SEMILLAS_REPETIBILIDAD) {
          resultados.push(await ejecutarAG({ programas, config, parametros: { ...c.parametros, semilla } }));
          setProgreso({ hechas: ++hechas, total });
        }
        nuevas.push(resumirRepetibilidad(c.nombre, resultados));
        setFilas([...nuevas]);
      }
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setProgreso(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repetibilidad</CardTitle>
        <FaseAG fase="Robustez">
          El AG es estocástico: una sola semilla puede tener suerte. Se repite con las semillas{" "}
          {SEMILLAS_REPETIBILIDAD.join(", ")} y se reportan la media y la desviación estándar muestral.
        </FaseAG>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="config-repetibilidad">Configuración</Label>
            <Select items={items} value={opcion} onValueChange={(v) => v && setOpcion(String(v))}>
              <SelectTrigger id="config-repetibilidad" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(items).map(([id, texto]) => (
                  <SelectItem key={id} value={id}>
                    {texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={ejecutar} disabled={progreso !== null || presets.length === 0}>
            <Repeat />
            {progreso ? `Ejecutando ${progreso.hechas}/${progreso.total}…` : "Ejecutar con 5 semillas"}
          </Button>
          {filas.length > 0 && progreso === null && (
            <Button variant="outline" onClick={() => descargarTexto(repetibilidadCsv(filas), "repetibilidad.csv")}>
              <FileSpreadsheet /> Descargar CSV
            </Button>
          )}
        </div>
        {opcion === ACTUALES && (
          <p className="text-xs text-muted-foreground">
            {describirParametros(parametros)} (la semilla se reemplaza por 1..5)
          </p>
        )}

        {filas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Configuración</TableHead>
                <TableHead>Z por semilla ({SEMILLAS_REPETIBILIDAD.join(", ")})</TableHead>
                <TableHead className="text-right">Z media ± DE</TableHead>
                <TableHead className="text-right">Brecha media ± DE</TableHead>
                <TableHead className="text-right">Factibles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((f) => (
                <TableRow key={f.nombre}>
                  <TableCell className="font-medium">{f.nombre}</TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {f.resultados.map((r) => num(r.mejor.Z)).join(" · ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {num(f.mediaZ, 1)} ± {num(f.deZ, 1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.mediaBrecha === null ? "—" : `${num(f.mediaBrecha, 2)} ± ${num(f.deBrecha ?? 0, 2)} %`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.factibles}/{f.resultados.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
