"use client";

import { Plus, Trash2 } from "lucide-react";

import { CampoNumero } from "@/components/campo-numero";
import { useProblema } from "@/components/proveedor-problema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AMBITOS, MAX_PROGRAMAS, METAS_ODS5, MIN_PROGRAMAS } from "@/lib/problema";
import type { Ambito } from "@/lib/tipos";

/** Tabla editable: el orden de las filas es el orden de los genes del cromosoma. */
export function TablaProgramas() {
  const { programas, version, editarPrograma, agregarPrograma, quitarPrograma } = useProblema();

  return (
    <div className="space-y-3">
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Gen</TableHead>
            <TableHead className="w-14">Id</TableHead>
            <TableHead>Programa</TableHead>
            <TableHead className="w-24">Meta</TableHead>
            <TableHead className="w-28">Ámbito</TableHead>
            <TableHead className="w-24 text-right">Costo (miles S/)</TableHead>
            <TableHead className="w-28 text-right">Beneficiarias</TableHead>
            <TableHead className="w-20 text-right">Prioridad w</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Quitar</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programas.map((p, i) => (
            <TableRow key={`${version}-${p.id}`}>
              <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
              <TableCell className="font-mono text-xs">{p.id}</TableCell>
              <TableCell>
                <Input
                  aria-label={`Nombre de ${p.id}`}
                  defaultValue={p.nombre}
                  onChange={(e) => editarPrograma(p.id, { nombre: e.target.value })}
                  className="min-w-56"
                />
              </TableCell>
              <TableCell>
                <Select value={p.meta} onValueChange={(v) => v && editarPrograma(p.id, { meta: String(v) })}>
                  <SelectTrigger aria-label={`Meta de ${p.id}`} className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METAS_ODS5.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select value={p.ambito} onValueChange={(v) => v && editarPrograma(p.id, { ambito: v as Ambito })}>
                  <SelectTrigger aria-label={`Ámbito de ${p.id}`} className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AMBITOS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <CampoNumero
                  aria-label={`Costo de ${p.id}`}
                  valor={p.costo}
                  min={0}
                  minExclusivo
                  alCambiar={(v) => editarPrograma(p.id, { costo: v })}
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <CampoNumero
                  aria-label={`Beneficiarias de ${p.id}`}
                  valor={p.beneficiarias}
                  min={0}
                  step={100}
                  alCambiar={(v) => editarPrograma(p.id, { beneficiarias: v })}
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <CampoNumero
                  aria-label={`Prioridad de ${p.id}`}
                  valor={p.prioridad}
                  min={0}
                  minExclusivo
                  step={0.1}
                  alCambiar={(v) => editarPrograma(p.id, { prioridad: v })}
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${p.id}`}
                  disabled={programas.length <= MIN_PROGRAMAS}
                  onClick={() => quitarPrograma(p.id)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={agregarPrograma} disabled={programas.length >= MAX_PROGRAMAS}>
          <Plus /> Agregar programa
        </Button>
        <span className="text-xs text-muted-foreground">
          Entre {MIN_PROGRAMAS} y {MAX_PROGRAMAS} programas. Cada fila es un gen del cromosoma.
        </span>
      </div>
    </div>
  );
}
