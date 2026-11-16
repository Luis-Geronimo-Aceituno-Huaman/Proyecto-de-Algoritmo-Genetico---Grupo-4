import type { Metadata } from "next";
import { PantallaEjecutar } from "@/components/ejecutar/pantalla-ejecutar";

export const metadata: Metadata = { title: "Ejecutar AG" };

export default function Page() {
  return <PantallaEjecutar />;
}
