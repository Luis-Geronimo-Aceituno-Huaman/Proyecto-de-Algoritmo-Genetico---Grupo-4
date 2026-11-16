import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FilaResumen } from "@/lib/comparar";
import { num } from "@/lib/formato";

/** Tabla resumen con el formato de la Tabla 8.6 del informe. */
export function TablaResumen({ filas, colores }: { filas: (FilaResumen & { id?: string })[]; colores: Record<string, string> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Corrida</TableHead>
          <TableHead className="text-right">Z</TableHead>
          <TableHead className="text-right">Costo</TableHead>
          <TableHead>Factible</TableHead>
          <TableHead className="text-right">Brecha</TableHead>
          <TableHead className="text-right">Gen. del mejor</TableHead>
          <TableHead className="text-right">F promedio final</TableHead>
          <TableHead className="text-right">Tiempo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filas.map((f, i) => (
          <TableRow key={f.id ?? `ref-${i}`} className={f.referencia ? "bg-muted/50" : undefined}>
            <TableCell className="min-w-48 whitespace-normal">
              <span className="flex items-center gap-2">
                {f.id && <span className="h-0.5 w-4 shrink-0 rounded" style={{ background: colores[f.id] }} aria-hidden />}
                <span className={f.referencia ? "font-medium" : undefined}>{f.nombre}</span>
              </span>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">{num(f.Z)}</TableCell>
            <TableCell className="text-right tabular-nums">{num(f.costo)}</TableCell>
            <TableCell className={f.factible ? "" : "text-destructive"}>{f.factible ? "Sí" : "No"}</TableCell>
            <TableCell className="text-right tabular-nums">{f.brecha === null ? "—" : `${num(f.brecha, 2)} %`}</TableCell>
            <TableCell className="text-right tabular-nums">{f.generacionMejor ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">{f.promedioFinal === null ? "—" : num(f.promedioFinal, 1)}</TableCell>
            <TableCell className="text-right tabular-nums">{f.tiempo === null ? "—" : `${num(f.tiempo, 3)} s`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
