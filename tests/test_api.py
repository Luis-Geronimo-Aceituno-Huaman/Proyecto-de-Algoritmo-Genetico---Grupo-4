import pytest
from fastapi.testclient import TestClient

from _core.datos import cargar_programas
from index import app

cliente = TestClient(app)


def test_programas():
    r = cliente.get("/api/py/programas")
    assert r.status_code == 200
    j = r.json()
    assert len(j["programas"]) == 20
    assert j["config"]["presupuesto"] == 1500
    assert [p["id"] for p in j["presets"]] == ["base", "mutacion_alta", "poblacion_pequena", "torneo"]


def test_ejecutar_por_defecto():
    r = cliente.post("/api/py/ejecutar", json={})
    assert r.status_code == 200
    j = r.json()
    assert len(j["historial"]) == 101
    assert j["optimo_z"] == pytest.approx(39290)
    assert j["brecha"] == pytest.approx(0)
    assert j["semilla_usada"] == 42


def test_ejecutar_sin_body():
    assert cliente.post("/api/py/ejecutar").status_code == 200


def test_ejecutar_con_parametros():
    r = cliente.post("/api/py/ejecutar", json={"parametros": {"N": 20, "G": 10, "seleccion": "torneo", "cruce": "uniforme"}})
    assert r.status_code == 200
    assert len(r.json()["historial"]) == 11


@pytest.mark.parametrize("parametros, texto", [
    ({"N": 3}, "N: debe ser mayor o igual que 4"),
    ({"G": 0}, "G: debe ser mayor o igual que 1"),
    ({"pm": 1.5}, "pm: debe ser menor o igual que 1"),
    ({"N": 5, "torneo_t": 6}, "torneo_t debe estar entre 2 y N"),
    ({"cruce": "dos_puntos"}, "cruce: debe ser uno de"),
])
def test_ejecutar_422(parametros, texto):
    r = cliente.post("/api/py/ejecutar", json={"parametros": parametros})
    assert r.status_code == 422
    assert texto in r.json()["detail"]


def test_programas_invalidos_422():
    programas = cargar_programas()
    programas[0]["ambito"] = "Selva"
    r = cliente.post("/api/py/optimo", json={"programas": programas})
    assert r.status_code == 422
    assert "Urbano, Rural o Mixto" in r.json()["detail"]

    r = cliente.post("/api/py/optimo", json={"programas": programas[:1]})
    assert r.status_code == 422
    assert "entre 2 y 40" in r.json()["detail"]


def test_optimo():
    r = cliente.post("/api/py/optimo", json={})
    assert r.status_code == 200
    j = r.json()
    assert j["exacto"]["solucion"]["Z"] == pytest.approx(39290)
    assert j["voraz"]["Z"] == pytest.approx(40730)


def test_optimo_con_config():
    r = cliente.post("/api/py/optimo", json={"config": {"presupuesto": 1000}})
    assert r.status_code == 200
    assert r.json()["exacto"]["solucion"]["costo"] <= 1000


def test_corridas_informe():
    r = cliente.post("/api/py/corridas-informe", json={})
    assert r.status_code == 200
    j = r.json()
    assert len(j["corridas"]) == 4
    assert all(len(c["historial"]) == 101 for c in j["corridas"])
    assert all(c["semilla_usada"] == 42 for c in j["corridas"])
    assert j["exacto"]["solucion"]["Z"] == pytest.approx(39290)
    print()
    for c in j["corridas"]:
        m = c["mejor"]
        print(f"{c['nombre']}: Z={m['Z']} factible={m['factible']} brecha={c['brecha']} gen={c['generacion_mejor']}")
