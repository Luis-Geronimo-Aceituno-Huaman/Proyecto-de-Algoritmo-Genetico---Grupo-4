"""Representación binaria: gen i = 1 si se financia el programa i (orden de programas.json)."""
import random

from _core.datos import ConfigProblema


def prob_gen_inicial(data, cfg=None):
    """p1 = min(1, B / Σc): así el costo esperado de un individuo inicial ≈ B."""
    cfg = cfg or ConfigProblema()
    return min(1.0, cfg.presupuesto / sum(p["costo"] for p in data))


def crear_individuo(data, cfg=None):
    p1 = prob_gen_inicial(data, cfg)
    return [1 if random.random() < p1 else 0 for _ in data]


def decodificar(individuo, data, cfg=None):
    """Traduce el cromosoma a la cartera de programas y sus indicadores."""
    cfg = cfg or ConfigProblema()
    elegidos = [p for gen, p in zip(individuo, data) if gen == 1]
    metas = sorted({p["meta"] for p in data})
    cubiertas = sorted({p["meta"] for p in elegidos})
    costo = sum(p["costo"] for p in elegidos)
    costo_rural = sum(p["costo"] for p in elegidos if p["ambito"] == "Rural")
    z = round(sum(p["prioridad"] * p["beneficiarias"] for p in elegidos), 4)
    faltantes = [m for m in metas if m not in cubiertas]
    cumple_presupuesto = costo <= cfg.presupuesto
    cumple_rural = costo_rural >= cfg.pct_rural * cfg.presupuesto
    return {
        "cromosoma": "".join(str(g) for g in individuo),
        "seleccionados": [p["id"] for p in elegidos],
        "Z": z,
        "costo": costo,
        "costo_rural": costo_rural,
        "metas_cubiertas": cubiertas,
        "metas_faltantes": faltantes,
        "cumple_presupuesto": cumple_presupuesto,
        "cumple_rural": cumple_rural,
        "factible": cumple_presupuesto and not faltantes and cumple_rural,
    }
