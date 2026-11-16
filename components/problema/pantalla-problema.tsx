"use client";

import { Calculator, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CampoNumero } from "@/components/campo-numero";
import { FaseAG } from "@/components/fase-ag";
import { ModeloMatematico } from "@/components/problema/modelo-matematico";
import { TablaProgramas } from "@/components/problema/tabla-programas";
import { useProblema } from "@/components/proveedor-problema";
import { TarjetaSolucion } from "@/components/tarjeta-solucion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { calcularOptimo, mensajeError } from "@/lib/api";
import { num, pct } from "@/lib/formato";
import { calcularIndicadores } from "@/lib/problema";
import type { RespuestaOptimo } from "@/lib/tipos";

export function PantallaProblema() {
  const { programas, config, version, editarConfig, restaurar, esPorDefecto } = useProblema();
  const ind = useMemo(() => calcularIndicadores(programas, config), [programas, config]);

  const [optimo, setOptimo] = useState<{ datos: RespuestaOptimo; programas: typeof programas; config: typeof config } | null>(null);
  const [cargando, setCargando] = useState(false);
  const desactualizado = optimo !== null && (optimo.programas !== programas || optimo.config !== config);

  async function calcular() {
    setCargando(true);
    try {
      const datos = await calcularOptimo({ programas, config });
      setOptimo({ datos, programas, config });
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">El problema</h1>
          <FaseAG fase="Antes del AG">
            Se define qué se optimiza y con qué restricciones. De aquí salen la representación (un gen por programa) y la
            función fitness.
          </FaseAG>
        </div>
        <Button variant="outline" onClick={restaurar} disabled={esPorDefecto} className="self-start">
          <RotateCcw /> Restaurar datos por defecto
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>¿Qué programas financiar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p>
              Un gobierno regional tiene {num(config.presupuesto)} mil soles para programas de igualdad de género (ODS 5),
              pero la cartera completa cuesta {num(ind.costoTotal)} mil soles.
            </p>
            <p>
              Hay que elegir qué programas financiar para llegar al mayor número ponderado de beneficiarias, sin pasarse
              del presupuesto, cubriendo todas las metas del ODS 5 presentes y destinando al menos el{" "}
              {pct(config.pct_rural, 0)} del presupuesto a zonas rurales.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modelo matemático</CardTitle>
            <CardDescription>Mochila 0-1 con restricciones; las restricciones entran al fitness como penalizaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <ModeloMatematico cfg={config} />
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="titulo-indicadores" className="space-y-3">
        <h2 id="titulo-indicadores" className="sr-only">
          Indicadores
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador etiqueta="Costo total de la cartera" valor={`Σc = ${num(ind.costoTotal)}`} nota="miles de soles" />
          <Indicador
            etiqueta="El presupuesto cubre"
            valor={pct(ind.coberturaPresupuesto)}
            nota={`de la cartera (B / Σc). p₁ inicial = ${num(Math.min(1, ind.coberturaPresupuesto), 3)}`}
          />
          <Indicador etiqueta="Metas presentes" valor={String(ind.metas.length)} nota={ind.metas.join(" · ")} />
          <Indicador
            etiqueta="Espacio de búsqueda"
            valor={`2^${ind.n} = ${num(ind.espacioBusqueda)}`}
            nota={`combinaciones posibles con n = ${ind.n} programas`}
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Programas candidatos</CardTitle>
          <CardDescription>
            Edita los datos para probar otros escenarios. Los cambios se usan también en «Ejecutar AG» y «Comparar
            corridas».
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-4" key={version}>
            <div className="space-y-1.5">
              <Label htmlFor="presupuesto">Presupuesto B (miles S/)</Label>
              <CampoNumero
                id="presupuesto"
                valor={config.presupuesto}
                min={0}
                minExclusivo
                step={50}
                alCambiar={(v) => editarConfig({ presupuesto: v })}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pct-rural">Mínimo rural (% de B)</Label>
              <CampoNumero
                id="pct-rural"
                valor={Math.round(config.pct_rural * 1000) / 10}
                min={0}
                max={100}
                step={5}
                alCambiar={(v) => editarConfig({ pct_rural: v / 100 })}
                className="w-40"
              />
            </div>
            <p className="self-end pb-1.5 text-sm text-muted-foreground">
              R3 exige al menos {num(ind.minimoRural)} en programas rurales (hay {num(ind.costoRuralTotal)} disponibles).
            </p>
          </div>
          <TablaProgramas />
        </CardContent>
      </Card>

      <section aria-labelledby="titulo-referencias" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 id="titulo-referencias" className="text-lg font-semibold">
              Soluciones de referencia
            </h2>
            <FaseAG fase="Evaluación">
              El óptimo exacto (Z*) prueba las 2^n combinaciones y sirve para medir la brecha del AG. La heurística voraz
              muestra qué pasa si se ignoran las restricciones R2 y R3.
            </FaseAG>
          </div>
          <Button onClick={calcular} disabled={cargando} className="self-start sm:self-auto">
            <Calculator /> {cargando ? "Calculando…" : "Calcular óptimo exacto y voraz"}
          </Button>
        </div>

        {desactualizado && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Los datos cambiaron desde el último cálculo. Vuelve a calcular para actualizar los resultados.
          </p>
        )}

        {!cargando && !optimo && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Pulsa «Calcular óptimo exacto y voraz» para ver la mejor cartera posible (Z*) y la que elige la heurística
            voraz con los datos actuales.
          </p>
        )}

        {cargando && !optimo && (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        )}

        {optimo && (
          <div className="grid gap-4 md:grid-cols-2">
            {optimo.datos.exacto.solucion ? (
              <TarjetaSolucion
                titulo="Óptimo exacto (Z*)"
                descripcion="Enumeración completa: la cartera factible de mayor Z."
                solucion={optimo.datos.exacto.solucion}
                programas={optimo.programas}
                cfg={optimo.config}
                pie={`${num(optimo.datos.exacto.n_factibles ?? 0)} combinaciones factibles de ${num(optimo.datos.exacto.n_combinaciones ?? 0)} · ${num(optimo.datos.exacto.tiempo_s ?? 0, 3)} s`}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Óptimo exacto (Z*)</CardTitle>
                  <CardDescription>{optimo.datos.exacto.motivo}</CardDescription>
                </CardHeader>
              </Card>
            )}
            <TarjetaSolucion
              titulo="Heurística voraz"
              descripcion="Ordena por w·b/c y agrega mientras quepa en el presupuesto."
              solucion={optimo.datos.voraz}
              programas={optimo.programas}
              cfg={optimo.config}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Indicador({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota: string }) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
        <p className="text-lg font-semibold tabular-nums sm:text-xl">{valor}</p>
        <p className="text-xs text-muted-foreground">{nota}</p>
      </CardContent>
    </Card>
  );
}
