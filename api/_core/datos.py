"""Carga y validación de los programas del ODS 5 y configuración del problema."""
import json
import os
from dataclasses import dataclass

RUTA_PROGRAMAS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "programas.json")
CAMPOS = ("id", "nombre", "meta", "ambito", "costo", "beneficiarias", "prioridad")
AMBITOS = {"Urbano", "Rural", "Mixto"}
MIN_PROGRAMAS, MAX_PROGRAMAS = 2, 40


@dataclass
class ConfigProblema:
    presupuesto: float = 1500   # B, en miles de soles
    pct_rural: float = 0.30     # fracción mínima de B en programas rurales (R3)
    alfa: float = 150           # penalización por exceso de presupuesto (R1)
    beta: float = 5000          # penalización por meta sin cubrir (R2)
    gamma: float = 30           # penalización por déficit rural (R3)


def cargar_programas():
    with open(RUTA_PROGRAMAS, encoding="utf-8") as f:
        return json.load(f)


def validar_programas(lista):
    """Lanza ValueError con un mensaje claro si los programas no son válidos."""
    if not isinstance(lista, list) or not (MIN_PROGRAMAS <= len(lista) <= MAX_PROGRAMAS):
        raise ValueError(f"Debe haber entre {MIN_PROGRAMAS} y {MAX_PROGRAMAS} programas.")
    ids = set()
    for i, p in enumerate(lista, start=1):
        faltan = [c for c in CAMPOS if c not in p or p[c] in (None, "")]
        if faltan:
            raise ValueError(f"Al programa {i} le faltan campos: {', '.join(faltan)}.")
        if p["id"] in ids:
            raise ValueError(f"El id '{p['id']}' está repetido.")
        ids.add(p["id"])
        if not isinstance(p["costo"], (int, float)) or p["costo"] <= 0:
            raise ValueError(f"El costo de {p['id']} debe ser mayor que 0.")
        if p["ambito"] not in AMBITOS:
            raise ValueError(f"El ámbito de {p['id']} debe ser Urbano, Rural o Mixto.")
    return lista
