"use client";

import { Download, FileSpreadsheet, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ListaCorridas } from "@/components/comparar/lista-corridas";
import { Repetibilidad } from "@/components/comparar/repetibilidad";
import { TablaResumen } from "@/components/comparar/tabla-resumen";
import { FaseAG } from "@/components/fase-ag";
import { GraficoConvergencia } from "@/components/grafico-convergencia";
import { useProblema } from "@/components/proveedor-problema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { calcularOptimo, ejecutarCorridasInforme, mensajeError, obtenerDatosPorDefecto } from "@/lib/api";
import {
  MAX_SELECCION,
  asignarColores,
  datosSuperpuestos,
  filaDeCorrida,
  filasReferencia,
  itemsDelInforme,
  tablaResumenCsv,
  type ItemCorrida,
} from "@/lib/comparar";
import { borrarCorrida, guardarCorrida, leerCorridas, renombrarCorrida, type CorridaGuardada } from "@/lib/corridas";
import { descargarPng, descargarTexto } from "@/lib/exportar";
import { nombreCortoPreset } from "@/lib/parametros";
import type { Preset, RespuestaOptimo } from "@/lib/tipos";

const ID_ULTIMA = "ultima";

/** Se monta solo en el cliente (lee localStorage al iniciar). */
export function PantallaComparar() {
  const { programas, config, informe, setInforme, ultimaEjecucion } = useProblema();
  const [guardadas, setGuardadas] = useState<CorridaGuardada[]>(() => leerCorridas());
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [renombres, setRenombres] = useState<Record<string, string>>({});
  const [fechaUltima] = useState(() => new Date().toISOString());
  const [presets, setPresets] = useState<Preset[]>([]);
  const [referencia, setReferencia] = useState<RespuestaOptimo | null>(informe?.respuesta ?? null);
  const [semilla, setSemilla] = useState(informe?.respuesta.semilla ?? 42);
  const [cargando, setCargando] = useState(false);
  const grafico = useRef<HTMLDivElement>(null);

  const items = useMemo<ItemCorrida[]>(() => {
    const sesion: ItemCorrida[] = [];
    if (informe) sesion.push(...itemsDelInforme(informe.respuesta, informe.programas, informe.config, informe.fecha));
    if (ultimaEjecucion)
      sesion.push({
        id: ID_ULTIMA,
        nombre: "Última ejecución de «Ejecutar AG» (sin guardar)",
        fecha: fechaUltima,
        parametros: ultimaEjecucion.resultado.parametros,
        config: ultimaEjecucion.config,
        programas: ultimaEjecucion.programas,
        resultado: ultimaEjecucion.resultado,
        origen: "ultima",
      });
    return [
      ...sesion.filter((i) => !ocultas.includes(i.id)).map((i) => ({ ...i, nombre: renombres[i.id] ?? i.nombre })),
      ...guardadas.map((g) => ({ ...g, origen: "guardada" as const })),
    ];
  }, [informe, ultimaEjecucion, guardadas, ocultas, renombres, fechaUltima]);

  const [seleccion, setSeleccion] = useState<string[]>(() => items.slice(0, 4).map((i) => i.id));
  const [colores, setColores] = useState<Record<string, string>>(() => asignarColores({}, seleccion));

  // Presets (nombres cortos) y óptimo/voraz de los datos actuales (la API los tiene en caché).
  useEffect(() => {
    obtenerDatosPorDefecto()
      .then((d) => setPresets(d.presets))
      .catch(() => {});
  }, []);
  useEffect(() => {
    calcularOptimo({ programas, config })
      .then(setReferencia)
      .catch((e) => toast.error(mensajeError(e)));
  }, [programas, config]);

  const elegir = (ids: string[]) => {
    setSeleccion(ids);
    setColores((c) => asignarColores(c, ids));
  };

  // En el orden de la lista (no en el orden en que se marcaron).
  const elegidos = items.filter((i) => seleccion.includes(i.id));
  const etiquetaCorta = (it: ItemCorrida) => {
    const p = it.origen === "informe" ? presets.find((x) => it.id === `informe-${x.id}`) : undefined;
    if (p) return nombreCortoPreset(p);
    return it.nombre.length > 18 ? `${it.nombre.slice(0, 17)}…` : it.nombre;
  };
  const series = elegidos.map((it) => ({ clave: it.id, nombre: it.nombre, color: colores[it.id], etiqueta: etiquetaCorta(it) }));
  const datos = useMemo(() => datosSuperpuestos(elegidos), [elegidos]);
  const zOptimo = referencia?.exacto.solucion?.Z ?? null;
  const filas = [
    ...(referencia ? filasReferencia(referencia) : []),
    ...elegidos.map((it) => ({ ...filaDeCorrida(it), id: it.id })),
  ];
  const datosDistintos = elegidos.some((it) => it.programas !== programas || it.config !== config);

  async function ejecutarInforme() {
    if (cargando) return;
    setCargando(true);
    try {
      const respuesta = await ejecutarCorridasInforme({ programas, config, semilla });
      setInforme({ respuesta, programas, config, fecha: new Date().toISOString() });
      setReferencia(respuesta);
      const ids = respuesta.corridas.map((c) => `informe-${c.id}`);
      setOcultas((o) => o.filter((id) => !ids.includes(id)));
      setRenombres((r) => Object.fromEntries(Object.entries(r).filter(([id]) => !ids.includes(id))));
      elegir(ids);
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }

  function alternar(id: string) {
    if (seleccion.includes(id)) elegir(seleccion.filter((x) => x !== id));
    else if (seleccion.length < MAX_SELECCION) elegir([...seleccion, id]);
  }

  function renombrar(it: ItemCorrida, nombre: string) {
    if (it.origen === "guardada") {
      if (!renombrarCorrida(it.id, nombre)) toast.error("No se pudo renombrar: el almacenamiento no está disponible.");
      setGuardadas(leerCorridas());
    } else setRenombres((r) => ({ ...r, [it.id]: nombre }));
  }

  function borrar(it: ItemCorrida) {
    if (it.origen === "guardada") {
      borrarCorrida(it.id);
      setGuardadas(leerCorridas());
    } else setOcultas((o) => [...o, it.id]);
    elegir(seleccion.filter((x) => x !== it.id));
  }

  function guardar(it: ItemCorrida) {
    const nueva = guardarCorrida({ nombre: it.nombre, parametros: it.parametros, config: it.config, programas: it.programas, resultado: it.resultado });
    if (!nueva) return toast.error("No se pudo guardar: el almacenamiento del navegador no está disponible o está lleno.");
    setGuardadas(leerCorridas());
    setOcultas((o) => [...o, it.id]);
    // La copia guardada hereda el lugar y el color de la original.
    const ids = seleccion.map((x) => (x === it.id ? nueva.id : x));
    setSeleccion(ids);
    setColores((c) => {
      const { [it.id]: color, ...resto } = c;
      return color ? { ...resto, [nueva.id]: color } : resto;
    });
    toast.success(`«${nueva.nombre}» guardada en el navegador.`);
  }

  async function bajarPng() {
    if (!grafico.current) return;
    try {
      await descargarPng(grafico.current, "comparacion-corridas.png");
    } catch (e) {
      toast.error(`No se pudo generar el PNG. ${mensajeError(e)}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Comparar corridas</h1>
        <FaseAG fase="Análisis de parámetros">
          Cada corrida del informe cambia un solo parámetro respecto de la Base, con la misma semilla, para ver su efecto
          en la convergencia y en la calidad de la solución.
        </FaseAG>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Las 4 corridas del informe</CardTitle>
          <CardDescription>Base · Mutación alta (Pm = 0,30) · Población pequeña (N = 10) · Torneo (t = 3).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="semilla-informe">Semilla</Label>
            <Input
              id="semilla-informe"
              type="number"
              min={0}
              step={1}
              value={semilla}
              onChange={(e) => setSemilla(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
              className="w-32"
            />
          </div>
          <Button onClick={ejecutarInforme} disabled={cargando}>
            <Play /> {cargando ? "Ejecutando…" : "Ejecutar las 4 corridas del informe"}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3" aria-labelledby="titulo-lista">
        <div className="space-y-1">
          <h2 id="titulo-lista" className="text-lg font-semibold">
            Corridas disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            Marca hasta {MAX_SELECCION} para compararlas. Las corridas de esta sesión se pierden al recargar la página si
            no las guardas.
          </p>
        </div>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no hay corridas. Ejecuta las 4 del informe o guarda una desde «Ejecutar AG».
          </p>
        ) : (
          <ListaCorridas
            items={items}
            seleccion={seleccion}
            colores={colores}
            alAlternar={alternar}
            alRenombrar={renombrar}
            alBorrar={borrar}
            alGuardar={guardar}
          />
        )}
      </section>

      {cargando && elegidos.length === 0 && <Skeleton className="h-96" />}

      {elegidos.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Convergencia comparada</CardTitle>
              <FaseAG fase="Evolución">
                Mejor fitness por generación de cada corrida elegida. Cuanto antes llega a Z*, más rápido converge.
              </FaseAG>
            </CardHeader>
            <CardContent className="space-y-3">
              <div ref={grafico} className="bg-white p-2">
                <p className="px-2 text-sm font-medium">Mejor fitness por generación</p>
                <GraficoConvergencia datos={datos} series={series} zOptimo={zOptimo} alto={380} />
                <p className="px-2 text-xs text-muted-foreground">
                  Línea punteada: óptimo exacto Z* de los datos actuales. Las corridas que terminan en el mismo valor se
                  superponen.
                </p>
              </div>
              <Button variant="outline" onClick={bajarPng}>
                <Download /> Descargar gráfico PNG
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabla resumen</CardTitle>
              <CardDescription>
                Formato de la Tabla 8.6 del informe. Brecha = (Z* − Z) / Z* · 100; una brecha negativa indica una solución
                infactible con Z mayor que el óptimo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {datosDistintos && (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Alguna corrida elegida usó datos distintos de los actuales: su brecha se calculó con su propio Z*.
                </p>
              )}
              <TablaResumen filas={filas} colores={colores} />
              <Button variant="outline" onClick={() => descargarTexto(tablaResumenCsv(filas), "tabla-resumen-corridas.csv")}>
                <FileSpreadsheet /> Descargar tabla CSV
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <Repetibilidad presets={presets} />
    </div>
  );
}
