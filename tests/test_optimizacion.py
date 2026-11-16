import time

import numpy as np
import pytest

from _core import optimizacion
from _core.datos import ConfigProblema, cargar_programas
from _core.fitness import fitness
from _core.optimizacion import brecha, evaluar_todas, heuristica_voraz, optimo_exacto

DATA = cargar_programas()
CFG = ConfigProblema()
IDS_OPT = ["P01", "P02", "P04", "P06", "P07", "P10", "P12", "P13", "P16", "P18", "P20"]


@pytest.fixture(scope="module")
def exacto():
    optimizacion._CACHE.clear()
    inicio = time.perf_counter()
    r = optimo_exacto(DATA, CFG)
    r["_duracion"] = time.perf_counter() - inicio
    return r


def test_optimo_exacto(exacto):
    s = exacto["solucion"]
    assert s["Z"] == pytest.approx(39290)
    assert s["costo"] == 1465
    assert s["costo_rural"] == 535
    assert s["seleccionados"] == IDS_OPT
    assert s["factible"]
    assert exacto["n_factibles"] == 1269
    assert exacto["n_combinaciones"] == 2 ** 20


def test_enumeracion_rapida(exacto):
    assert exacto["_duracion"] < 3


def test_cache_devuelve_lo_mismo(exacto):
    inicio = time.perf_counter()
    r = optimo_exacto(DATA, CFG)
    assert time.perf_counter() - inicio < 0.1
    assert r["solucion"] == exacto["solucion"]


def test_argmax_fitness_es_el_optimo(exacto):
    ev = evaluar_todas(DATA, CFG)
    exceso = np.maximum(0, ev["costo"] - CFG.presupuesto)
    deficit = np.maximum(0, CFG.pct_rural * CFG.presupuesto - ev["rural"])
    f = np.maximum(1, ev["Z"] - CFG.alfa * exceso - CFG.beta * ev["U"] - CFG.gamma * deficit)
    k = int(np.argmax(f))
    genes = ev["bits"][k].tolist()
    assert "".join(map(str, genes)) == exacto["solucion"]["cromosoma"]
    assert f[k] == pytest.approx(fitness(genes, DATA, CFG))


def test_voraz():
    v = heuristica_voraz(DATA, CFG)
    assert v["seleccionados"] == ["P01", "P02", "P03", "P04", "P06", "P07", "P10", "P12", "P13", "P18", "P19"]
    assert v["Z"] == pytest.approx(40730)
    assert v["fitness"] == pytest.approx(30730)
    assert not v["factible"]
    assert v["metas_faltantes"] == ["5.a", "5.c"]


def test_n_mayor_a_22():
    grande = [dict(DATA[i % 20], id=f"X{i}") for i in range(23)]
    r = optimo_exacto(grande, CFG)
    assert r["solucion"] is None
    assert "22" in r["motivo"]


def test_brecha():
    assert brecha(39290, 39290) == 0
    assert brecha(37325.5, 39290) == pytest.approx(5.0)
    assert brecha(100, 0) is None
