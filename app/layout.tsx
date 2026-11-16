import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Encabezado } from "@/components/encabezado";
import { ProveedorProblema } from "@/components/proveedor-problema";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Algoritmo genético para el ODS 5",
    template: "%s · AG ODS 5",
  },
  description:
    "Algoritmo genético que elige qué programas de igualdad de género financiar con un presupuesto limitado. UNMSM · FISI · Sistemas Inteligentes · Grupo 4.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ProveedorProblema>
          <TooltipProvider>
            <Encabezado />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
            <footer className="border-t py-5 text-center text-xs text-muted-foreground">
              UNMSM · FISI · Sistemas Inteligentes · Grupo 4 · 2026-II
            </footer>
            <Toaster theme="light" position="top-center" richColors />
          </TooltipProvider>
        </ProveedorProblema>
      </body>
    </html>
  );
}
