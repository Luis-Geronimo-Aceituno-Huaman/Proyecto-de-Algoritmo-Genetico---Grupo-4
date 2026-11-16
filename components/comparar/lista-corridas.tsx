"use client";

import { Check, Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import { BadgeFactible } from "@/components/tarjeta-solucion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_SELECCION, type ItemCorrida } from "@/lib/comparar";
import { num } from "@/lib/formato";
import { describirParametros } from "@/lib/parametros";

const ORIGEN = { informe: "Corridas del informe", ultima: "Última ejecución", guardada: "Guardada" } as const;

interface Props {
  items: ItemCorrida[];
  seleccion: string[];
  colores: Record<string, string>;
  alAlternar: (id: string) => void;
  alRenombrar: (item: ItemCorrida, nombre: string) => void;
  alBorrar: (item: ItemCorrida) => void;
  alGuardar: (item: ItemCorrida) => void;
}

export function ListaCorridas({ items, seleccion, colores, alAlternar, alRenombrar, alBorrar, alGuardar }: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const lleno = seleccion.length >= MAX_SELECCION;

  return (
    <ul className="divide-y rounded-lg border">
      {items.map((it) => {
        const elegido = seleccion.includes(it.id);
        const r = it.resultado;
        return (
          <li key={it.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary"
                checked={elegido}
                disabled={!elegido && lleno}
                onChange={() => alAlternar(it.id)}
                aria-label={`Comparar ${it.nombre}`}
              />
              <span
                className="mt-2 h-0.5 w-4 shrink-0 rounded"
                style={{ background: elegido ? colores[it.id] : "transparent" }}
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-1">
                {editando === it.id ? (
                  <form
                    className="flex gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const nombre = String(new FormData(e.currentTarget).get("nombre") ?? "").trim();
                      if (nombre) alRenombrar(it, nombre);
                      setEditando(null);
                    }}
                  >
                    <Input name="nombre" defaultValue={it.nombre} autoFocus aria-label="Nuevo nombre" className="h-7" />
                    <Button type="submit" size="icon-sm" variant="ghost" aria-label="Confirmar nombre">
                      <Check />
                    </Button>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Cancelar" onClick={() => setEditando(null)}>
                      <X />
                    </Button>
                  </form>
                ) : (
                  <p className="truncate text-sm font-medium">{it.nombre}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <Badge variant="outline">{ORIGEN[it.origen]}</Badge>
                  <span className="tabular-nums">Z = {num(r.mejor.Z)}</span>
                  <BadgeFactible factible={r.mejor.factible} />
                  <span>{new Date(it.fecha).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <p className="text-xs text-muted-foreground">{describirParametros(it.parametros)}</p>
              </div>
            </div>
            <div className="flex gap-1 self-end sm:self-center">
              {it.origen !== "guardada" && (
                <Button size="icon-sm" variant="ghost" aria-label={`Guardar ${it.nombre}`} title="Guardar en el navegador" onClick={() => alGuardar(it)}>
                  <Save />
                </Button>
              )}
              <Button size="icon-sm" variant="ghost" aria-label={`Renombrar ${it.nombre}`} title="Renombrar" onClick={() => setEditando(it.id)}>
                <Pencil />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Borrar ${it.nombre}`} title="Borrar" onClick={() => alBorrar(it)}>
                <Trash2 />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
