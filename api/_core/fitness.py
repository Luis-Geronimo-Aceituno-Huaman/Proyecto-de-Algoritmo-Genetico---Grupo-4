"""Función de aptitud con penalizaciones."""
from _core.datos import ConfigProblema
from _core.representacion import decodificar


def fitness(individuo, data, cfg=None):
    """F = max(1, Z − α·max(0, C−B) − β·U − γ·max(0, pct_rural·B − C_rural))."""
    cfg = cfg or ConfigProblema()
    d = decodificar(individuo, data, cfg)
    exceso = max(0, d["costo"] - cfg.presupuesto)
    deficit_rural = max(0, cfg.pct_rural * cfg.presupuesto - d["costo_rural"])
    u = len(d["metas_faltantes"])
    f = d["Z"] - cfg.alfa * exceso - cfg.beta * u - cfg.gamma * deficit_rural
    return max(1, round(f, 4))


def crear_funcion_fitness(cfg=None):
    """Devuelve f(individuo, data), la firma que espera pyeasyga."""
    cfg = cfg or ConfigProblema()
    return lambda individuo, data: fitness(individuo, data, cfg)
