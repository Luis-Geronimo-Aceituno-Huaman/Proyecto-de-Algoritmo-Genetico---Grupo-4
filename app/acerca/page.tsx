import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CURSO, FASES, INTEGRANTES, OBJETIVO, REFERENCIAS } from "@/lib/contenido";

export const metadata: Metadata = { title: "Acerca de" };

const TECNOLOGIAS = [
  ["Algoritmo", "Python 3.12, pyeasyga 0.3.1 (subclase de GeneticAlgorithm) y NumPy para el óptimo exacto"],
  ["API", "FastAPI, como función serverless de Vercel"],
  ["Interfaz", "Next.js, React, TypeScript, Tailwind CSS, shadcn/ui y Recharts"],
  ["Pruebas", "pytest: verifican Z* = 39 290, la heurística voraz y los ejemplos de fitness del informe"],
];

export default function Acerca() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Acerca del trabajo</h1>
        <p className="text-muted-foreground">
          Trabajo de aplicación de algoritmos genéticos del curso {CURSO.curso}, {CURSO.universidad}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{CURSO.grupo}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-1.5 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {INTEGRANTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Curso</dt>
              <dd>{CURSO.curso}</dd>
              <dt className="text-muted-foreground">Docente</dt>
              <dd>{CURSO.docente}</dd>
              <dt className="text-muted-foreground">Semestre</dt>
              <dd>{CURSO.semestre}</dd>
              <dt className="text-muted-foreground">Facultad</dt>
              <dd>
                {CURSO.facultad}, {CURSO.universidad}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="titulo-objetivo" className="space-y-2">
        <h2 id="titulo-objetivo" className="text-lg font-semibold">
          Objetivo
        </h2>
        <p className="max-w-3xl leading-relaxed">{OBJETIVO}</p>
      </section>

      <section aria-labelledby="titulo-fases" className="space-y-3">
        <h2 id="titulo-fases" className="text-lg font-semibold">
          Fases del AG en la aplicación
        </h2>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-56 pl-4">Fase del AG</TableHead>
                <TableHead>Dónde se ve en la app</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FASES.map((f) => (
                <TableRow key={f.fase}>
                  <TableCell className="pl-4 align-top font-medium whitespace-normal">{f.fase}</TableCell>
                  <TableCell className="min-w-64 whitespace-normal text-muted-foreground">{f.donde}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section aria-labelledby="titulo-tecnologia" className="space-y-3">
        <h2 id="titulo-tecnologia" className="text-lg font-semibold">
          Tecnología
        </h2>
        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
          {TECNOLOGIAS.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-medium">{k}</dt>
              <dd className="text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="titulo-referencias" className="space-y-3">
        <h2 id="titulo-referencias" className="text-lg font-semibold">
          Referencias principales
        </h2>
        <ul className="space-y-2.5 text-sm">
          {REFERENCIAS.map((r) => (
            <li key={r.id} className="pl-8 -indent-8 leading-relaxed">
              {r.autor} <i>{r.titulo}</i>
              {r.resto}{" "}
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">
                  {r.url}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
