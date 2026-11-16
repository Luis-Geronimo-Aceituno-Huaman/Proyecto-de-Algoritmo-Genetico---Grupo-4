import type { Metadata } from "next";
import { PantallaCompararCliente } from "@/components/comparar/cargador";

export const metadata: Metadata = { title: "Comparar corridas" };

export default function Page() {
  return <PantallaCompararCliente />;
}
