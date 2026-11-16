"use client";

import { ChevronDown, Play } from "lucide-react";

import { CampoNumero } from "@/components/campo-numero";
import { ControlDeslizante } from "@/components/ejecutar/control-deslizante";
import { FaseAG } from "@/components/fase-ag";
import { useProblema } from "@/components/proveedor-problema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LIMITES,
  NOMBRE_CRUCE,
  NOMBRE_SELECCION,
  errorParametros,
  nombreCortoPreset,
  presetActual,
} from "@/lib/parametros";
import type { ParametrosAG, Preset, TipoCruce, TipoSeleccion } from "@/lib/tipos";

interface Props {
  presets: Preset[];
  cargando: boolean;
  alEjecutar: () => void;
}

const PERSONALIZADO = "personalizado";

export function PanelParametros({ presets, cargando, alEjecutar }: Props) {
  const { parametros: p, setParametros, config, editarConfig, version } = useProblema();
  const cambiar = (c: Partial<ParametrosAG>) => setParametros({ ...p, ...c });
  const preset = presetActual(p, presets);
  const error = errorParametros(p);
  const nombresPreset: Record<string, string> = {
    [PERSONALIZADO]: "Personalizado",
    ...Object.fromEntries(presets.map((x) => [x.id, nombreCortoPreset(x)])),
  };

  return (
    <Card className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <CardHeader>
        <CardTitle>Parámetros del AG</CardTitle>
        <FaseAG fase="Configuración">Tamaño de la población, generaciones y operadores genéticos.</FaseAG>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="preset">Preset (corridas del informe)</Label>
          <Select
            items={nombresPreset}
            value={preset?.id ?? PERSONALIZADO}
            onValueChange={(id) => {
              const elegido = presets.find((x) => x.id === id);
              if (elegido) setParametros({ ...elegido.parametros, semilla: p.semilla });
            }}
          >
            <SelectTrigger id="preset" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((x) => (
                <SelectItem key={x.id} value={x.id}>
                  {nombreCortoPreset(x)}
                </SelectItem>
              ))}
              {!preset && <SelectItem value={PERSONALIZADO}>Personalizado</SelectItem>}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Cambia un solo parámetro respecto de la corrida Base.</p>
        </div>

        <ControlDeslizante
          etiqueta="Población N"
          valor={p.N}
          {...rango(LIMITES.N)}
          alCambiar={(N) => cambiar({ N })}
          ayuda="Individuos (carteras) por generación."
        />
        <ControlDeslizante
          etiqueta="Generaciones G"
          valor={p.G}
          {...rango(LIMITES.G)}
          alCambiar={(G) => cambiar({ G })}
          ayuda="El historial tiene G + 1 puntos (incluye P(0))."
        />
        <ControlDeslizante
          etiqueta="Prob. de cruce Pc"
          valor={p.pc}
          {...rango(LIMITES.pc)}
          alCambiar={(pc) => cambiar({ pc })}
        />
        <ControlDeslizante
          etiqueta="Prob. de mutación Pm"
          valor={p.pm}
          {...rango(LIMITES.pm)}
          alCambiar={(pm) => cambiar({ pm })}
          ayuda="Se sortea para cada hijo por separado."
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cruce">Cruce</Label>
            <Select items={NOMBRE_CRUCE} value={p.cruce} onValueChange={(v) => v && cambiar({ cruce: v as TipoCruce })}>
              <SelectTrigger id="cruce" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="un_punto">Un punto</SelectItem>
                <SelectItem value="uniforme">Uniforme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seleccion">Selección</Label>
            <Select
              items={NOMBRE_SELECCION}
              value={p.seleccion}
              onValueChange={(v) => v && cambiar({ seleccion: v as TipoSeleccion })}
            >
              <SelectTrigger id="seleccion" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ruleta">Ruleta</SelectItem>
                <SelectItem value="torneo">Torneo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {p.seleccion === "torneo" && (
            <div className="space-y-1.5">
              <Label htmlFor="torneo-t">Tamaño del torneo t</Label>
              <CampoNumero
                key={`t-${preset?.id ?? PERSONALIZADO}`}
                id="torneo-t"
                valor={p.torneo_t}
                min={2}
                max={p.N}
                step={1}
                alCambiar={(t) => Number.isInteger(t) && cambiar({ torneo_t: t })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="semilla">Semilla</Label>
            <Input
              id="semilla"
              inputMode="numeric"
              placeholder="aleatoria"
              defaultValue={p.semilla === null || Number.isNaN(p.semilla) ? "" : p.semilla}
              key={`s-${p.semilla === null ? "n" : "v"}`}
              onChange={(e) => {
                const t = e.target.value.trim();
                cambiar({ semilla: t === "" ? null : /^\d+$/.test(t) ? Number(t) : NaN });
              }}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">Con la misma semilla se obtiene el mismo resultado. Vacía = aleatoria.</p>

        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary">
            Avanzado: penalizaciones α, β, γ
            <ChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3" key={version}>
            <p className="text-xs text-muted-foreground">
              Entran en el fitness: F = Z − α·exceso − β·U − γ·déficit rural. Se comparten con la pantalla Problema.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["alfa", "α (exceso)"],
                  ["beta", "β (meta)"],
                  ["gamma", "γ (rural)"],
                ] as const
              ).map(([clave, texto]) => (
                <div key={clave} className="space-y-1.5">
                  <Label htmlFor={clave} className="text-xs">
                    {texto}
                  </Label>
                  <CampoNumero id={clave} valor={config[clave]} min={0} alCambiar={(v) => editarConfig({ [clave]: v })} />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button size="lg" className="w-full" onClick={alEjecutar} disabled={cargando || error !== null}>
          <Play /> {cargando ? "Ejecutando…" : "Ejecutar AG"}
        </Button>
      </CardContent>
    </Card>
  );
}

const rango = (l: { min: number; max: number; paso: number }) => ({ min: l.min, max: l.max, paso: l.paso });
