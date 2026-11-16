"""Operadores genéticos (solo módulo random, para que la semilla los haga reproducibles)."""
import random


def cruce_un_punto(p1, p2):
    """Corta en k ∈ [1, n−1] e intercambia las colas."""
    k = random.randint(1, len(p1) - 1)
    return p1[:k] + p2[k:], p2[:k] + p1[k:]


def cruce_uniforme(p1, p2):
    """Cada gen se intercambia entre los padres con p = 0,5."""
    h1, h2 = list(p1), list(p2)
    for i in range(len(p1)):
        if random.random() < 0.5:
            h1[i], h2[i] = h2[i], h1[i]
    return h1, h2


def mutacion_bitflip(ind):
    """Invierte un bit al azar, en el lugar (como espera pyeasyga)."""
    i = random.randrange(len(ind))
    ind[i] = 1 - ind[i]
