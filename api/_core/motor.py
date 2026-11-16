"""Motor del AG: subclase de pyeasyga.GeneticAlgorithm con elitismo."""
import copy
import random
import time
from dataclasses import asdict, dataclass, replace
from typing import Literal, Optional

from pyeasyga.pyeasyga import GeneticAlgorithm

from _core.datos import ConfigProblema
from _core.fitness import crear_funcion_fitness, fitness
from _core.operadores import cruce_un_punto, cruce_uniforme, mutacion_bitflip
from _core.representacion import crear_individuo, decodificar
from _core.seleccion import seleccion_ruleta, seleccion_torneo


@dataclass
class ParametrosAG:
    N: int = 50
    G: int = 100
    pc: float = 0.8
    pm: float = 0.1
    cruce: Literal["un_punto", "uniforme"] = "un_punto"
    seleccion: Literal["ruleta", "torneo"] = "ruleta"
    torneo_t: int = 3
    semilla: Optional[int] = 42  # None = aleatoria (se reporta la usada)


class AGODS5(GeneticAlgorithm):
    def __init__(self, data, cfg: ConfigProblema, params: ParametrosAG):
        super().__init__(
            data,
            population_size=params.N,
            generations=params.G,
            crossover_probability=params.pc,
            mutation_probability=params.pm,
            elitism=True,
            maximise_fitness=True,
        )
        self.create_individual = lambda d: crear_individuo(d, cfg)
        self.fitness_function = crear_funcion_fitness(cfg)
        self.crossover_function = cruce_un_punto if params.cruce == "un_punto" else cruce_uniforme
        self.mutate_function = mutacion_bitflip
        if params.seleccion == "torneo":
            self.tournament_size = params.torneo_t
            self.selection_function = lambda pob: seleccion_torneo(pob, self.tournament_size)
        else:
            self.selection_function = seleccion_ruleta

    def create_new_population(self):
        """Igual que pyeasyga, pero Pm se sortea para cada hijo por separado."""
        nueva = []
        elite = copy.deepcopy(self.current_generation[0])  # la población está ordenada
        while len(nueva) < self.population_size:
            h1 = copy.deepcopy(self.selection_function(self.current_generation))
            h2 = copy.deepcopy(self.selection_function(self.current_generation))
            h1.fitness = h2.fitness = 0
            if random.random() < self.crossover_probability:
                h1.genes, h2.genes = self.crossover_function(h1.genes, h2.genes)
            for hijo in (h1, h2):
                if random.random() < self.mutation_probability:
                    self.mutate_function(hijo.genes)
            nueva.append(h1)
            if len(nueva) < self.population_size:
                nueva.append(h2)
        if self.elitism:
            nueva[0] = elite
        self.current_generation = nueva


def _registrar(ga, generacion):
    fs = [c.fitness for c in ga.current_generation]
    return {
        "generacion": generacion,
        "mejor_fitness": max(fs),
        "promedio_fitness": round(sum(fs) / len(fs), 4),
        "peor_fitness": min(fs),
    }


def ejecutar_ag(data, cfg=None, params=None):
    """Corre P(0) + G generaciones y devuelve el mejor individuo y el historial (G+1 puntos)."""
    cfg = cfg or ConfigProblema()
    params = params or ParametrosAG()
    semilla = params.semilla if params.semilla is not None else random.SystemRandom().randrange(1_000_000)
    random.seed(semilla)

    inicio = time.perf_counter()
    ga = AGODS5(data, cfg, params)
    ga.create_first_generation()
    historial = [_registrar(ga, 0)]
    for g in range(1, params.G + 1):
        ga.create_next_generation()
        historial.append(_registrar(ga, g))
    tiempo = time.perf_counter() - inicio

    genes = ga.current_generation[0].genes
    mejor = decodificar(genes, data, cfg)
    mejor["fitness"] = fitness(genes, data, cfg)
    final = historial[-1]["mejor_fitness"]
    generacion_mejor = next(h["generacion"] for h in historial if h["mejor_fitness"] == final)

    return {
        "mejor": mejor,
        "historial": historial,
        "generacion_mejor": generacion_mejor,
        "tiempo_s": round(tiempo, 4),
        "semilla_usada": semilla,
        "parametros": asdict(replace(params, semilla=semilla)),
    }


# Las 4 corridas del informe: solo cambia un parámetro respecto de la base.
_BASE = ParametrosAG()
CORRIDAS_INFORME = [
    {"id": "base", "nombre": "Corrida 1: Base", "parametros": _BASE},
    {"id": "mutacion_alta", "nombre": "Corrida 2: Mutación alta (Pm = 0,30)", "parametros": replace(_BASE, pm=0.30)},
    {"id": "poblacion_pequena", "nombre": "Corrida 3: Población pequeña (N = 10)", "parametros": replace(_BASE, N=10)},
    {"id": "torneo", "nombre": "Corrida 4: Torneo (t = 3)", "parametros": replace(_BASE, seleccion="torneo", torneo_t=3)},
]
