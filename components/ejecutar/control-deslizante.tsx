"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Props {
  etiqueta: string;
  ayuda?: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  alCambiar: (v: number) => void;
}

/** Slider + campo numérico sincronizados. */
export function ControlDeslizante({ etiqueta, ayuda, valor, min, max, paso, alCambiar }: Props) {
  const id = useId();
  const [texto, setTexto] = useState(String(valor));
  const [previo, setPrevio] = useState(valor);
  // Si el valor cambia desde fuera (slider o preset), se actualiza el texto.
  if (valor !== previo) {
    setPrevio(valor);
    setTexto(String(valor));
  }
  const decimales = paso < 1 ? 2 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{etiqueta}</Label>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={paso}
          value={texto}
          className="h-7 w-20 text-right tabular-nums"
          onChange={(e) => {
            setTexto(e.target.value);
            const v = Number(e.target.value.replace(",", "."));
            if (e.target.value.trim() !== "" && Number.isFinite(v) && v >= min && v <= max) {
              const redondeado = Number(v.toFixed(decimales));
              setPrevio(redondeado);
              alCambiar(redondeado);
            }
          }}
          onBlur={() => setTexto(String(valor))}
        />
      </div>
      <Slider
        value={[valor]}
        min={min}
        max={max}
        step={paso}
        etiquetaThumb={etiqueta}
        onValueChange={(v) => alCambiar(Number((Array.isArray(v) ? v[0] : v).toFixed(decimales)))}
      />
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}
