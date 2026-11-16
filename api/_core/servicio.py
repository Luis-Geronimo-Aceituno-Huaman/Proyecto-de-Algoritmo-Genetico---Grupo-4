"""Casos de uso que expone la API (index.py solo valida y llama a estas funciones)."""
from dataclasses import asdict, replace

from _core.datos import ConfigProblema, cargar_programas, validar_programas
from _core.motor import CORRIDAS_INFORME, ParametrosAG, ejecutar_ag
from _core.optimizacion import brecha, heuristica_voraz, optimo_exacto


class DatosInvalidos(ValueError):
    """Los programas enviados no pasan validar_programas (la API responde 422)."""


def resolver_problema(programas=None, config=None):
    """Devuelve (data, cfg): los valores enviados o, si faltan, los de por defecto."""
    data = programas if programas is not None else cargar_programas()
    try:
        validar_programas(data)
    except ValueError as e:
        raise DatosInvalidos(str(e)) from e
    cfg = ConfigProblema(**config) if config else ConfigProblema()
    return data, cfg


def presets():
    return [{"id": c["id"], "nombre": c["nombre"], "parametros": asdict(c["parametros"])} for c in CORRIDAS_INFORME]


def datos_por_defecto():
    return {"programas": cargar_programas(), "config": asdict(ConfigProblema()), "presets": presets()}


def _z_optimo(data, cfg):
    s = optimo_exacto(data, cfg)["solucion"]  # usa la caché
    return s["Z"] if s else None


def ejecutar(data, cfg, params: ParametrosAG, z_opt="calcular"):
    """ejecutar_ag + optimo_z y brecha (null si no hay óptimo exacto)."""
    if z_opt == "calcular":
        z_opt = _z_optimo(data, cfg)
    r = ejecutar_ag(data, cfg, params)
    r["optimo_z"] = z_opt
    r["brecha"] = brecha(r["mejor"]["Z"], z_opt) if z_opt is not None else None
    return r


def optimo(data, cfg):
    return {"exacto": optimo_exacto(data, cfg), "voraz": heuristica_voraz(data, cfg)}


def corridas_informe(data, cfg, semilla=42):
    """Las 4 corridas del informe con la misma semilla, más el óptimo y la voraz."""
    ref = optimo(data, cfg)
    z_opt = ref["exacto"]["solucion"]["Z"] if ref["exacto"]["solucion"] else None
    corridas = []
    for c in CORRIDAS_INFORME:
        params = replace(c["parametros"], semilla=semilla)
        corridas.append({"id": c["id"], "nombre": c["nombre"], **ejecutar(data, cfg, params, z_opt)})
    return {"semilla": semilla, "corridas": corridas, **ref}
