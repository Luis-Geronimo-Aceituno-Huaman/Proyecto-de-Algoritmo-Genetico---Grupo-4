"""Traduce los errores de validación de Pydantic a un mensaje en español."""

_PLANTILLAS = {
    "missing": "es obligatorio",
    "greater_than_equal": "debe ser mayor o igual que {ge}",
    "less_than_equal": "debe ser menor o igual que {le}",
    "greater_than": "debe ser mayor que {gt}",
    "less_than": "debe ser menor que {lt}",
    "int_parsing": "debe ser un número entero",
    "int_from_float": "debe ser un número entero",
    "int_type": "debe ser un número entero",
    "float_parsing": "debe ser un número",
    "float_type": "debe ser un número",
    "string_type": "debe ser texto",
    "list_type": "debe ser una lista",
    "dict_type": "debe ser un objeto",
    "literal_error": "debe ser uno de: {expected}",
    "json_invalid": "el JSON no es válido",
}


def mensaje_validacion(errores):
    partes = []
    for e in errores:
        campo = ".".join(str(x) for x in e.get("loc", ()) if x != "body")
        if e["type"] == "value_error":
            texto = str(e.get("ctx", {}).get("error", e["msg"]))
        else:
            try:
                texto = _PLANTILLAS[e["type"]].format(**e.get("ctx", {}))
            except (KeyError, IndexError):
                texto = e["msg"]
        partes.append(f"{campo}: {texto}" if campo else texto)
    return "Datos inválidos. " + "; ".join(partes)
