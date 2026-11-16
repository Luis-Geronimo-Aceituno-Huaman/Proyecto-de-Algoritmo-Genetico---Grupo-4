"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange"> {
  valor: number;
  /** Solo se llama con números válidos dentro de [min, max]. */
  alCambiar: (v: number) => void;
  min?: number;
  max?: number;
  /** El valor debe ser estrictamente mayor que min. */
  minExclusivo?: boolean;
}

/**
 * Input numérico no controlado: permite escribir "1," o dejarlo vacío sin perder lo tecleado.
 * Para reiniciarlo desde fuera, cambia su `key`.
 */
export function CampoNumero({ valor, alCambiar, min, max, minExclusivo, className, ...props }: Props) {
  const [invalido, setInvalido] = useState(false);
  return (
    <Input
      {...props}
      type="number"
      inputMode="decimal"
      defaultValue={valor}
      min={min}
      max={max}
      aria-invalid={invalido || undefined}
      className={cn("tabular-nums", className)}
      onChange={(e) => {
        const texto = e.target.value.replace(",", ".");
        const v = Number(texto);
        const ok =
          texto.trim() !== "" &&
          Number.isFinite(v) &&
          (min === undefined || (minExclusivo ? v > min : v >= min)) &&
          (max === undefined || v <= max);
        setInvalido(!ok);
        if (ok) alCambiar(v);
      }}
    />
  );
}
