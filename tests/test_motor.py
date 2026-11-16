import random
from dataclasses import replace

import pytest
from pyeasyga.pyeasyga import Chromosome

from _core.datos import ConfigProblema, cargar_programas
from _core.motor import CORRIDAS_INFORME, ParametrosAG, ejecutar_ag
from _core.operadores import cruce_un_punto, cruce_uniforme, mutacion_bitflip
from _core.seleccion import seleccion_ruleta, seleccion_torneo

DATA = cargar_programas()
CFG = ConfigProblema()
Z_OPT = 39290


@pytest.fixture(scope="module")
def base():
    return ejecutar_ag(DATA, CFG, ParametrosAG())


def test_misma_semilla_mismo_resultado(base):
    otra = ejecutar_ag(DATA, CFG, ParametrosAG())
    assert otra["mejor"] == base["mejor"]
    assert otra["historial"] == base["historial"]


def test_elitismo_mejor_no_decreciente(base):
    mejores = [h["mejor_fitness"] for h in base["historial"]]
    assert all(b >= a for a, b in zip(mejores, mejores[1:]))


def test_historial_g_mas_uno():
    r = ejecutar_ag(DATA, CFG, ParametrosAG(G=7))
    assert len(r["historial"]) == 8
    assert [h["generacion"] for h in r["historial"]] == list(range(8))


def test_semilla_aleatoria_se_reporta():
    r = ejecutar_ag(DATA, CFG, ParametrosAG(G=2, semilla=None))
    assert isinstance(r["semilla_usada"], int)
    assert r["parametros"]["semilla"] == r["semilla_usada"]


def test_ruleta_proporcional():
    random.seed(1)
    a, b = Chromosome([1]), Chromosome([0])
    a.fitness, b.fitness = 3, 1
    elegidos_a = sum(seleccion_ruleta([a, b]) is a for _ in range(10_000))
    assert 0.72 <= elegidos_a / 10_000 <= 0.78


def test_torneo_elige_al_mejor_de_t():
    pob = []
    for f in range(10):
        c = Chromosome([f])
        c.fitness = f
        pob.append(c)
    random.seed(3)
    for _ in range(200):
        assert seleccion_torneo(pob, t=10).fitness == 9


@pytest.mark.parametrize("cruce", [cruce_un_punto, cruce_uniforme])
def test_cruce_conserva_genes(cruce):
    random.seed(5)
    p1, p2 = [0] * 20, [1] * 20
    for _ in range(50):
        h1, h2 = cruce(p1, p2)
        assert len(h1) == len(h2) == 20
        assert all({h1[i], h2[i]} == {p1[i], p2[i]} for i in range(20))


def test_mutacion_cambia_un_bit():
    ind = [0] * 20
    mutacion_bitflip(ind)
    assert sum(ind) == 1


def test_corridas_informe():
    assert [c["id"] for c in CORRIDAS_INFORME] == ["base", "mutacion_alta", "poblacion_pequena", "torneo"]
    base_p = ParametrosAG()
    assert CORRIDAS_INFORME[0]["parametros"] == base_p
    assert CORRIDAS_INFORME[1]["parametros"] == replace(base_p, pm=0.30)
    assert CORRIDAS_INFORME[2]["parametros"] == replace(base_p, N=10)
    assert CORRIDAS_INFORME[3]["parametros"] == replace(base_p, seleccion="torneo")


def test_corrida_base_cerca_del_optimo(base):
    m = base["mejor"]
    print(f"\nBase s=42: Z={m['Z']} F={m['fitness']} costo={m['costo']} rural={m['costo_rural']} "
          f"factible={m['factible']} gen_mejor={base['generacion_mejor']} {m['seleccionados']}")
    assert m["factible"]
    assert m["Z"] >= 0.95 * Z_OPT
