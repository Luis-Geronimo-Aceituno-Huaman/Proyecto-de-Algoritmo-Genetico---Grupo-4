import random

import pytest

from _core.datos import ConfigProblema, cargar_programas, validar_programas
from _core.fitness import crear_funcion_fitness, fitness
from _core.representacion import crear_individuo, decodificar, prob_gen_inicial

DATA = cargar_programas()
CFG = ConfigProblema()
EJEMPLO = [int(c) for c in "11010110010110010110"]


def test_sumas_y_metas():
    assert len(DATA) == 20
    assert sum(p["costo"] for p in DATA) == 3605
    assert sum(p["prioridad"] * p["beneficiarias"] for p in DATA) == pytest.approx(48780)
    assert len({p["meta"] for p in DATA}) == 8
    assert prob_gen_inicial(DATA, CFG) == pytest.approx(1500 / 3605)


def test_cromosoma_ejemplo():
    d = decodificar(EJEMPLO, DATA, CFG)
    assert d["Z"] == pytest.approx(40290)
    assert d["costo"] == 1495
    assert d["costo_rural"] == 685
    assert d["metas_faltantes"] == ["5.c"]
    assert not d["factible"]
    assert fitness(EJEMPLO, DATA, CFG) == pytest.approx(35290)


def test_ejemplo_con_gen20():
    ind = EJEMPLO[:-1] + [1]
    assert fitness(ind, DATA, CFG) == pytest.approx(23840)


def test_todos_en_uno():
    assert fitness([1] * 20, DATA, CFG) == 1


def test_funcion_para_pyeasyga():
    f = crear_funcion_fitness(CFG)
    assert f(EJEMPLO, DATA) == pytest.approx(35290)


def test_crear_individuo():
    random.seed(0)
    for _ in range(100):
        ind = crear_individuo(DATA, CFG)
        assert len(ind) == 20
        assert set(ind) <= {0, 1}


@pytest.mark.parametrize("cambio, mensaje", [
    (lambda l: l[:1], "entre 2 y 40"),
    (lambda l: l + [dict(l[0])], "repetido"),
    (lambda l: [dict(l[0], costo=0)] + l[1:], "mayor que 0"),
    (lambda l: [dict(l[0], ambito="Selva")] + l[1:], "ámbito"),
    (lambda l: [{k: v for k, v in l[0].items() if k != "meta"}] + l[1:], "meta"),
])
def test_validar_programas(cambio, mensaje):
    validar_programas(DATA)
    with pytest.raises(ValueError, match=mensaje):
        validar_programas(cambio(DATA))
