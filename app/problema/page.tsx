import type { Metadata } from "next";
import { PantallaProblema } from "@/components/problema/pantalla-problema";

export const metadata: Metadata = { title: "Problema" };

export default function Page() {
  return <PantallaProblema />;
}
