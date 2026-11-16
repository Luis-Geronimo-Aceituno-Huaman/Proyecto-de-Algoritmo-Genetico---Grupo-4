"""Selección de padres sobre una lista de pyeasyga.Chromosome (con .fitness)."""
import random


def seleccion_ruleta(poblacion):
    """Probabilidad de ser elegido proporcional a F (F ≥ 1 siempre)."""
    total = sum(c.fitness for c in poblacion)
    r = random.random()
    acumulada = 0.0
    for c in poblacion:
        acumulada += c.fitness / total
        if r < acumulada:
            return c
    return poblacion[-1]  # por redondeo de la suma acumulada


def seleccion_torneo(poblacion, t=3):
    """Elige t individuos al azar (sin reemplazo) y devuelve el de mayor F."""
    return max(random.sample(poblacion, t), key=lambda c: c.fitness)
