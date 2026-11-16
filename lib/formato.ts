// Formato numérico del informe: coma decimal y espacio como separador de miles
// (los números de 4 cifras no se separan, según la RAE).

const ESPACIO = " ";

export function num(valor: number, decimales = 0): string {
  if (!Number.isFinite(valor)) return "—";
  const [entero, dec] = Math.abs(valor).toFixed(decimales).split(".");
  const agrupado = entero.length > 4 ? entero.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACIO) : entero;
  return `${valor < 0 ? "−" : ""}${agrupado}${dec ? `,${dec}` : ""}`;
}

/** Fracción 0..1 → "41,6 %". */
export const pct = (fraccion: number, decimales = 1) => `${num(fraccion * 100, decimales)}${ESPACIO}%`;
