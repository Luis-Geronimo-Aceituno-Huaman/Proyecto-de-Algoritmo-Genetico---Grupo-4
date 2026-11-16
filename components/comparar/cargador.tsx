"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Solo en el cliente: la pantalla lee las corridas guardadas en localStorage al iniciar.
export const PantallaCompararCliente = dynamic(
  () => import("@/components/comparar/pantalla-comparar").then((m) => m.PantallaComparar),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    ),
  },
);
