"use client";

import { Download, FileSpreadsheet, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Cromosoma } from "@/components/ejecutar/cromosoma";
import { PanelParametros } from "@/components/ejecutar/panel-parametros";
import { Restricciones, TablaSeleccionados, TarjetasKPI } from "@/components/ejecutar/resultados";
import { FaseAG } from "@/components/fase-ag";
import { GraficoConvergencia } from "@/components/grafico-convergencia";
import { useProblema } from "@/components/proveedor-problema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablaResumen } from "@/components/comparar/tabla-resumen";
import { calcularOptimo, ejecutarAG, mensajeError, obtenerDatosPorDefecto } from "@/lib/api";
import { filasReferencia } from "@/lib/comparar";
import { COLOR_MEJOR, COLOR_PROMEDIO } from "@/lib/colores";
import { guardarCorrida } from "@/lib/corridas";
import { descargarPng, descargarTexto, historialCsv, nombreArchivo } from "@/lib/exportar";
import { describirParametros, nombreCortoPreset, presetActual } from "@/lib/parametros";
import type { Preset } from "@/lib/tipos";

const SERIES = [
  { clave: "mejor", nombre: "Mejor fitness", color: COLOR_MEJOR },
  { clave: "promedio", nombre: "Fitness promedio", color: COLOR_PROMEDIO },
];

export function PantallaEjecutar() {
  const { programas, config, parametros, ultimaEjecucion: ej, setUltimaEjecucion } = useProblema();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [cargando, setCargando] = useState(false);
  const grafico = useRef<HTMLDivElement>(null);

  // Los presets vienen de CORRIDAS_INFORME (api/_core/motor.py).
  useEffect(() => {
    obtenerDatosPorDefecto()
      .then((d) => setPresets(d.presets))
      .catch((e) => toast.error(`No se pudieron cargar los presets. ${mensajeError(e)}`));
  }, []);

  const datosGrafico = useMemo(
    () => ej?.resultado.historial.map((h) => ({ generacion: h.generacion, mejor: h.mejor_fitness, promedio: h.promedio_fitness })) ?? [],
    [ej],
  );
  const desactualizado = ej !== null && (ej.programas !== programas || ej.config !== config);

  async function ejecutar() {
    if (cargando) return; // evita doble envío
    setCargando(true);
    try {
      const [resultado, referencia] = await Promise.all([
        ejecutarAG({ programas, config, parametros }),
        calcularOptimo({ programas, config }).catch(() => null), // la comparación es opcional
      ]);
      setUltimaEjecucion({ resultado, referencia, programas, config });
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }

  const nombreCorrida = () => {
    if (!ej) return "";
    const p = presetActual(ej.resultado.parametros, presets);
    return `${p ? nombreCortoPreset(p) : "Personalizada"} · semilla ${ej.resultado.semilla_usada}`;
  };

  async function bajarPng() {
    if (!grafico.current) return;
    try {
      await descargarPng(grafico.current, `convergencia-${nombreArchivo(nombreCorrida())}.png`);
    } catch (e) {
      toast.error(`No se pudo generar el PNG. ${mensajeError(e)}`);
    }
  }

  function bajarCsv() {
    if (ej) descargarTexto(historialCsv(ej.resultado.historial), `historial-${nombreArchivo(nombreCorrida())}.csv`);
  }

  function guardar() {
    if (!ej) return;
    const c = guardarCorrida({
      nombre: nombreCorrida(),
      parametros: ej.resultado.parametros,
      config: ej.config,
      programas: ej.programas,
      resultado: ej.resultado,
    });
    if (c) toast.success(`Corrida «${c.nombre}» guardada. Puedes verla en «Comparar corridas».`);
    else toast.error("No se pudo guardar: el almacenamiento del navegador no está disponible o está lleno.");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Ejecutar el algoritmo genético</h1>
        <FaseAG fase="Ciclo del AG">
          P(0) aleatoria → evaluar fitness → selección → cruce → mutación → elitismo, durante G generaciones.
        </FaseAG>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <PanelParametros presets={presets} cargando={cargando} alEjecutar={ejecutar} />

        <div className="min-w-0 space-y-6" aria-live="polite" aria-busy={cargando}>
          {!ej && !cargando && (
            <Card>
              <CardHeader>
                <CardTitle>Aún no hay resultados</CardTitle>
                <CardDescription>
                  Elige un preset o ajusta los parámetros y pulsa «Ejecutar AG». Con el preset Base y la semilla 42 se
                  reproduce la corrida 1 del informe.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {cargando && !ej && (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-80" />
            </div>
          )}

          {ej && (
            <div className={cargando ? "space-y-6 opacity-60 transition-opacity" : "space-y-6"}>
              {desactualizado && (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Los programas o la configuración cambiaron después de esta ejecución. Vuelve a ejecutar para
                  actualizar.
                </p>
              )}
              <p className="text-xs text-muted-foreground">{describirParametros(ej.resultado.parametros)}</p>

              <Bloque titulo="Mejor cromosoma" fase="Representación" texto="Cada gen es un programa, en el orden de la tabla; 1 = se financia. Pasa el cursor para ver el programa.">
                <Cromosoma cromosoma={ej.resultado.mejor.cromosoma} programas={ej.programas} />
              </Bloque>

              <section className="space-y-3" aria-labelledby="titulo-kpi">
                <div className="space-y-1">
                  <h2 id="titulo-kpi" className="text-lg font-semibold">
                    Indicadores del mejor individuo
                  </h2>
                  <FaseAG fase="Decodificación y fitness">
                    El cromosoma se traduce a una cartera; F = Z menos las penalizaciones por incumplir restricciones.
                  </FaseAG>
                </div>
                <TarjetasKPI r={ej.resultado} cfg={ej.config} programas={ej.programas} />
              </section>

              {ej.referencia && (
                <Bloque
                  titulo="Comparación con otros métodos"
                  fase="Evaluación"
                  texto="El AG frente al óptimo exacto (enumeración de las 2^n combinaciones) y la heurística voraz por w·b/c."
                >
                  <TablaResumen
                    colores={{}}
                    filas={[
                      ...filasReferencia(ej.referencia),
                      {
                        nombre: "Algoritmo genético (esta corrida)",
                        Z: ej.resultado.mejor.Z,
                        costo: ej.resultado.mejor.costo,
                        factible: ej.resultado.mejor.factible,
                        brecha: ej.resultado.brecha,
                        generacionMejor: ej.resultado.generacion_mejor,
                        promedioFinal: ej.resultado.historial.at(-1)?.promedio_fitness ?? null,
                        tiempo: ej.resultado.tiempo_s,
                      },
                    ]}
                  />
                </Bloque>
              )}

              <Bloque titulo="Restricciones" fase="Penalizaciones" texto="Cada restricción incumplida resta del fitness en lugar de descartar al individuo.">
                <Restricciones r={ej.resultado} cfg={ej.config} />
              </Bloque>
              <Bloque titulo="Programas financiados" fase="Fenotipo" texto="La solución expresada como cartera de programas.">
                <TablaSeleccionados ids={ej.resultado.mejor.seleccionados} programas={ej.programas} />
              </Bloque>

              <Card>
                <CardHeader>
                  <CardTitle>Convergencia</CardTitle>
                  <FaseAG fase="Evolución">
                    Selección, cruce y mutación mejoran la población; el elitismo hace que el mejor fitness nunca baje.
                  </FaseAG>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div ref={grafico} className="bg-white p-2">
                    <p className="px-2 text-sm font-medium">
                      Fitness por generación · {nombreCorrida()}
                    </p>
                    <GraficoConvergencia datos={datosGrafico} series={SERIES} zOptimo={ej.resultado.optimo_z} />
                    <p className="px-2 text-xs text-muted-foreground">
                      {datosGrafico.length} puntos (generación 0 a {ej.resultado.parametros.G}). Línea punteada: óptimo
                      exacto Z*.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={bajarPng}>
                      <Download /> Descargar gráfico PNG
                    </Button>
                    <Button variant="outline" onClick={bajarCsv}>
                      <FileSpreadsheet /> Descargar historial CSV
                    </Button>
                    <Button onClick={guardar}>
                      <Save /> Guardar corrida
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bloque({ titulo, fase, texto, children }: { titulo: string; fase: string; texto: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <FaseAG fase={fase}>{texto}</FaseAG>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
