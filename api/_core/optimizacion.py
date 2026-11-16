"""Referencias para evaluar el AG: óptimo exacto (enumeración con numpy) y heurística voraz."""
import copy
import hashlib
import json
import time
from dataclasses import asdict

import numpy as np

from _core.datos import ConfigProblema
from _core.fitness import fitness
from _core.representacion import decodificar

N_MAX_EXACTO = 22
EPS = 1e-9
_CACHE = {}


def matriz_bits(n):
    """Matriz 2^n × n (uint8). La fila k es el cromosoma cuyo string binario vale k (gen 0 = bit más alto)."""
    idx = np.arange(2 ** n, dtype=np.uint32)
    bits = np.empty((2 ** n, n), dtype=np.uint8)
    for i in range(n):
        bits[:, i] = (idx >> (n - 1 - i)) & 1
    return bits


def evaluar_todas(data, cfg):
    """Z, costo, costo_rural, metas sin cubrir (U) y factibilidad de las 2^n combinaciones."""
    n = len(data)
    bits = matriz_bits(n)
    z = np.zeros(2 ** n)
    costo = np.zeros(2 ** n)
    rural = np.zeros(2 ** n)
    cubiertas = {m: np.zeros(2 ** n, dtype=bool) for m in {p["meta"] for p in data}}
    for i, p in enumerate(data):  # columna a columna: evita copias float de toda la matriz
        col = bits[:, i].astype(np.float64)  # uint8 × costo desbordaría en NumPy 2
        z += col * (p["prioridad"] * p["beneficiarias"])
        costo += col * p["costo"]
        if p["ambito"] == "Rural":
            rural += col * p["costo"]
        cubiertas[p["meta"]] |= bits[:, i].astype(bool)
    u = sum((~c).astype(np.int64) for c in cubiertas.values())
    minimo_rural = cfg.pct_rural * cfg.presupuesto
    factible = (costo <= cfg.presupuesto + EPS) & (u == 0) & (rural >= minimo_rural - EPS)
    return {"bits": bits, "Z": z, "costo": costo, "rural": rural, "U": u, "factible": factible}


def _clave(data, cfg):
    texto = json.dumps([data, asdict(cfg)], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def optimo_exacto(data, cfg=None):
    """Enumera las 2^n carteras y toma la factible de mayor Z (solo n ≤ 22). Usa caché en memoria."""
    cfg = cfg or ConfigProblema()
    n = len(data)
    if n > N_MAX_EXACTO:
        return {"solucion": None, "motivo": f"Con n = {n} hay 2^{n} combinaciones; la enumeración solo se hace para n ≤ {N_MAX_EXACTO}."}

    clave = _clave(data, cfg)
    if clave not in _CACHE:
        inicio = time.perf_counter()
        ev = evaluar_todas(data, cfg)
        n_factibles = int(ev["factible"].sum())
        solucion = None
        if n_factibles:
            k = int(np.argmax(np.where(ev["factible"], ev["Z"], -np.inf)))
            genes = ev["bits"][k].tolist()
            solucion = decodificar(genes, data, cfg)
            solucion["fitness"] = fitness(genes, data, cfg)
        _CACHE[clave] = {
            "solucion": solucion,
            "motivo": None if n_factibles else "No existe ninguna combinación factible.",
            "n_factibles": n_factibles,
            "n_combinaciones": 2 ** n,
            "tiempo_s": round(time.perf_counter() - inicio, 4),
        }
    return copy.deepcopy(_CACHE[clave])


def heuristica_voraz(data, cfg=None):
    """Ordena por w·b/c (de mayor a menor) y agrega cada programa si aún cabe en el presupuesto."""
    cfg = cfg or ConfigProblema()
    orden = sorted(range(len(data)),
                   key=lambda i: data[i]["prioridad"] * data[i]["beneficiarias"] / data[i]["costo"],
                   reverse=True)
    genes, gasto = [0] * len(data), 0
    for i in orden:
        if gasto + data[i]["costo"] <= cfg.presupuesto + EPS:
            genes[i] = 1
            gasto += data[i]["costo"]
    solucion = decodificar(genes, data, cfg)
    solucion["fitness"] = fitness(genes, data, cfg)
    return solucion


def brecha(z_ag, z_opt):
    """Brecha (%) = (Z* − Z_AG) / Z* · 100."""
    if not z_opt:
        return None
    return round((z_opt - z_ag) / z_opt * 100, 4)
