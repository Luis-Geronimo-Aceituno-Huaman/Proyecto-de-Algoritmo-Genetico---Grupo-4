"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/problema", texto: "Problema" },
  { href: "/ejecutar", texto: "Ejecutar AG" },
  { href: "/comparar", texto: "Comparar corridas" },
  { href: "/acerca", texto: "Acerca de" },
];

export function Encabezado() {
  const ruta = usePathname();
  return (
    <header className="border-b bg-card">
      {/* Franja con el color oficial del ODS 5, usado con moderación */}
      <div className="h-1 bg-ods" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <Link href="/" className="flex items-center gap-3 pb-3 sm:pb-4">
          {/* Texto grande (20 px en negrita): el blanco sobre #FF3A21 cumple AA para texto grande */}
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-ods text-xl font-bold text-white" aria-hidden>
            5
          </span>
          <span className="text-base leading-tight font-semibold tracking-tight sm:text-lg">
            Algoritmo genético para el ODS 5: Igualdad de género
          </span>
        </Link>
        <nav aria-label="Secciones" className="-mx-3 sm:mx-0">
          <ul className="flex flex-wrap text-sm whitespace-nowrap sm:gap-1">
            {ENLACES.map((e) => {
              const activo = ruta === e.href || ruta.startsWith(`${e.href}/`);
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "inline-block border-b-2 px-2.5 pt-1 pb-2.5 sm:px-3 sm:pb-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                      activo
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {e.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
