import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { CIFRAS, REFERENCIAS } from "@/lib/contenido";

const PASOS = [
  { href: "/problema", titulo: "1. Problema", texto: "Los 20 programas, el presupuesto y el modelo matemático. Puedes editar los datos." },
  { href: "/ejecutar", titulo: "2. Ejecutar AG", texto: "Configura N, G, Pc, Pm, cruce y selección, y mira cómo evoluciona la población." },
  { href: "/comparar", titulo: "3. Comparar corridas", texto: "Las 4 corridas del informe frente al óptimo exacto y la heurística voraz." },
];

export default function Inicio() {
  const numero = (id: string) => CIFRAS.findIndex((c) => c.fuente === id) + 1;
  return (
    <div className="space-y-12 py-2 sm:py-6">
      <section className="max-w-3xl space-y-5">
        <p className="text-sm font-medium text-primary">Algoritmo genético · ODS 5: Igualdad de género</p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          ¿Qué programas de igualdad de género financiar con un presupuesto limitado?
        </h1>
        <p className="text-lg text-muted-foreground">
          Con S/ 1,5 millones solo alcanza para el 42 % de 20 programas candidatos. Un algoritmo genético busca la cartera
          que llega al mayor número ponderado de mujeres sin pasarse del presupuesto, cubriendo todas las metas del ODS 5 y
          con al menos 30 % de inversión rural.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/ejecutar" className={buttonVariants({ size: "lg" })}>
            Probar el algoritmo <ArrowRight />
          </Link>
          <Link href="/problema" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Ver el problema
          </Link>
        </div>
      </section>

      <section aria-labelledby="titulo-contexto" className="space-y-4">
        <h2 id="titulo-contexto" className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Por qué importa
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {CIFRAS.map((c, i) => (
            <li key={c.valor} className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">{c.meta}</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-primary tabular-nums">{c.valor}</p>
              <p className="mt-3 text-sm leading-relaxed">
                {c.texto}
                <sup>
                  <a href={`#fuente-${i + 1}`} className="ml-0.5 text-primary hover:underline" aria-label={`Fuente ${i + 1}`}>
                    {i + 1}
                  </a>
                </sup>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{c.cita}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-pasos" className="space-y-4">
        <h2 id="titulo-pasos" className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Cómo recorrer la aplicación
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group block h-full rounded-xl border p-5 transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <p className="flex items-center justify-between font-medium">
                  {p.titulo}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{p.texto}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t pt-4">
        <h2 className="mb-2 text-xs font-medium text-muted-foreground">Fuentes</h2>
        <ol className="space-y-1 text-xs text-muted-foreground">
          {CIFRAS.map((c, i) => {
            const r = REFERENCIAS.find((x) => x.id === c.fuente)!;
            return (
              <li key={c.fuente} id={`fuente-${numero(c.fuente)}`} className="flex gap-1.5">
                <span>{i + 1}.</span>
                <span>
                  {r.autor} <i>{r.titulo}</i>
                  {r.resto}{" "}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">
                      {r.url}
                    </a>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </footer>
    </div>
  );
}
