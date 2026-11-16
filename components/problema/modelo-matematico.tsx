import { num } from "@/lib/formato";
import type { ConfigProblema } from "@/lib/tipos";

const Var = ({ children }: { children: React.ReactNode }) => <i className="font-serif">{children}</i>;

/** Modelo de mochila 0-1 con restricciones y la función fitness con penalizaciones. */
export function ModeloMatematico({ cfg }: { cfg: ConfigProblema }) {
  const minRural = cfg.pct_rural * cfg.presupuesto;
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        Variable de decisión: <Var>x</Var>
        <sub>i</sub> ∈ {"{0, 1}"} (1 = se financia el programa <Var>i</Var>). Costos en miles de soles.
      </p>
      <dl className="space-y-2 rounded-lg bg-muted/60 p-4 font-mono text-[0.8rem] sm:text-sm">
        <Fila etiqueta="Objetivo">
          max <Var>Z</Var> = Σ <Var>w</Var>
          <sub>i</sub>·<Var>b</Var>
          <sub>i</sub>·<Var>x</Var>
          <sub>i</sub>
        </Fila>
        <Fila etiqueta="R1 · Presupuesto">
          Σ <Var>c</Var>
          <sub>i</sub>·<Var>x</Var>
          <sub>i</sub> ≤ <Var>B</Var> = {num(cfg.presupuesto)}
        </Fila>
        <Fila etiqueta="R2 · Cobertura">cada meta presente en los datos tiene ≥ 1 programa financiado</Fila>
        <Fila etiqueta="R3 · Equidad rural">
          Σ<sub>rural</sub> <Var>c</Var>
          <sub>i</sub>·<Var>x</Var>
          <sub>i</sub> ≥ {num(cfg.pct_rural, 2)}·<Var>B</Var> = {num(minRural)}
        </Fila>
        <Fila etiqueta="Fitness">
          <Var>F</Var> = max(1, <Var>Z</Var> − α·max(0, <Var>C</Var> − <Var>B</Var>) − β·<Var>U</Var> − γ·max(0,{" "}
          {num(cfg.pct_rural, 2)}·<Var>B</Var> − <Var>C</Var>
          <sub>rural</sub>))
        </Fila>
      </dl>
      <p className="text-muted-foreground">
        <Var>w</Var>
        <sub>i</sub> = prioridad, <Var>b</Var>
        <sub>i</sub> = beneficiarias, <Var>C</Var> = costo de la cartera, <Var>U</Var> = metas sin cubrir.
        Penalizaciones: α = {num(cfg.alfa)} por cada mil soles de exceso, β = {num(cfg.beta)} por meta sin cubrir,
        γ = {num(cfg.gamma)} por cada mil soles de déficit rural. Solo el ámbito «Rural» cuenta para R3.
      </p>
    </div>
  );
}

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-4 sm:grid-cols-[10rem_1fr]">
      <dt className="font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase sm:pt-0.5">
        {etiqueta}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
