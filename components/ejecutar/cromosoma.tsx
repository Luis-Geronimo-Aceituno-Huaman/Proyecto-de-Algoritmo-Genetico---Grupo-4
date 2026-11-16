"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Programa } from "@/lib/tipos";

/** Un gen por programa: 1 = se financia (color), 0 = no (gris). Muestra también el dígito. */
export function Cromosoma({ cromosoma, programas }: { cromosoma: string; programas: Programa[] }) {
  return (
    <div className="space-y-2">
      <ol className="flex flex-wrap gap-1.5" aria-label={`Cromosoma ${cromosoma}`}>
        {cromosoma.split("").map((bit, i) => {
          const p = programas[i];
          const uno = bit === "1";
          return (
            <li key={i}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`Gen ${i + 1}: ${p?.id} ${p?.nombre}, ${uno ? "financiado" : "no financiado"}`}
                      className={cn(
                        "grid size-9 place-items-center rounded-md border font-mono text-sm font-semibold tabular-nums transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-10",
                        uno
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    />
                  }
                >
                  {bit}
                </TooltipTrigger>
                <TooltipContent>
                  <span className="font-mono">{p?.id}</span> · {p?.nombre}
                </TooltipContent>
              </Tooltip>
              <span className="mt-0.5 block text-center text-[10px] text-muted-foreground tabular-nums" aria-hidden>
                {i + 1}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="font-mono text-xs break-all text-muted-foreground">{cromosoma}</p>
    </div>
  );
}
