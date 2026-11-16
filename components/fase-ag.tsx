import type { ReactNode } from "react";

/** Línea que explica qué fase del AG muestra un bloque o pantalla. */
export function FaseAG({ fase, children }: { fase: string; children: ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="mr-1.5 inline-block rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
        {fase}
      </span>
      {children}
    </p>
  );
}
