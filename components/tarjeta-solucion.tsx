import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { num } from "@/lib/formato";
import type { ConfigProblema, Programa, Solucion } from "@/lib/tipos";

interface Props {
  titulo: string;
  descripcion: ReactNode;
  solucion: Solucion;
  programas: Programa[];
  cfg: ConfigProblema;
  pie?: ReactNode;
}

export function BadgeFactible({ factible }: { factible: boolean }) {
  return factible ? (
    <Badge className="bg-exito/10 text-exito">
      <Check /> Factible
    </Badge>
  ) : (
    <Badge variant="destructive">
      <X /> Infactible
    </Badge>
  );
}

/** Resumen de una cartera decodificada (Z, F, costo, rural, metas y programas). */
export function TarjetaSolucion({ titulo, descripcion, solucion: s, programas, cfg, pie }: Props) {
  const nombres = new Map(programas.map((p) => [p.id, p.nombre]));
  const minRural = cfg.pct_rural * cfg.presupuesto;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{titulo}</CardTitle>
          <BadgeFactible factible={s.factible} />
        </div>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Dato etiqueta="Z" valor={num(s.Z)} destacado />
          <Dato etiqueta="Fitness F" valor={num(s.fitness)} />
          <Dato
            etiqueta="Costo / B"
            valor={`${num(s.costo)} / ${num(cfg.presupuesto)}`}
            mal={!s.cumple_presupuesto}
          />
          <Dato etiqueta="Rural / mín." valor={`${num(s.costo_rural)} / ${num(minRural)}`} mal={!s.cumple_rural} />
        </dl>
        {s.metas_faltantes.length > 0 && (
          <p className="text-sm text-destructive">Metas sin cubrir: {s.metas_faltantes.join(", ")}</p>
        )}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {s.seleccionados.length} programas financiados
          </p>
          <ul className="space-y-0.5 text-sm">
            {s.seleccionados.map((id) => (
              <li key={id} className="flex gap-2">
                <span className="w-8 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{id}</span>
                <span>{nombres.get(id) ?? "—"}</span>
              </li>
            ))}
          </ul>
        </div>
        {pie && <div className="border-t pt-3 text-xs text-muted-foreground">{pie}</div>}
      </CardContent>
    </Card>
  );
}

function Dato({ etiqueta, valor, destacado, mal }: { etiqueta: string; valor: string; destacado?: boolean; mal?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd
        className={`tabular-nums ${destacado ? "text-xl font-semibold text-primary" : "text-base font-medium"} ${mal ? "text-destructive" : ""}`}
      >
        {valor}
        {mal !== undefined && (
          <span className="sr-only">{mal ? " (no cumple)" : " (cumple)"}</span>
        )}
      </dd>
    </div>
  );
}
