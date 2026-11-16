"""API FastAPI (solo rutas y validación; la lógica del AG vive en api/_core)."""
import os
import sys

# Permite importar _core tanto en local como en la función de Vercel.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from typing import List, Literal, Optional, Union  # noqa: E402

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.exceptions import RequestValidationError  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402
from pydantic import BaseModel, Field, model_validator  # noqa: E402

from _core import servicio  # noqa: E402
from _core.errores import mensaje_validacion  # noqa: E402
from _core.motor import ParametrosAG  # noqa: E402

app = FastAPI(
    title="AG ODS 5",
    description="Algoritmo genético para elegir programas de igualdad de género (ODS 5).",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)


# ---------- Modelos ----------
class Programa(BaseModel):
    id: str
    nombre: str
    meta: str
    ambito: str
    costo: Union[int, float]
    beneficiarias: Union[int, float] = Field(ge=0)
    prioridad: float = Field(gt=0)


class Config(BaseModel):
    presupuesto: float = Field(1500, gt=0)
    pct_rural: float = Field(0.30, ge=0, le=1)
    alfa: float = Field(150, ge=0)
    beta: float = Field(5000, ge=0)
    gamma: float = Field(30, ge=0)


class Parametros(BaseModel):
    N: int = Field(50, ge=4, le=500)
    G: int = Field(100, ge=1, le=1000)
    pc: float = Field(0.8, ge=0, le=1)
    pm: float = Field(0.1, ge=0, le=1)
    cruce: Literal["un_punto", "uniforme"] = "un_punto"
    seleccion: Literal["ruleta", "torneo"] = "ruleta"
    torneo_t: int = Field(3, ge=2)
    semilla: Optional[int] = Field(42, ge=0)

    @model_validator(mode="after")
    def _t_menor_que_n(self):
        if self.torneo_t > self.N:
            raise ValueError("torneo_t debe estar entre 2 y N")
        return self


class Problema(BaseModel):
    programas: Optional[List[Programa]] = None
    config: Optional[Config] = None


class EjecutarIn(Problema):
    parametros: Optional[Parametros] = None


class CorridasIn(Problema):
    semilla: int = Field(42, ge=0)


def _problema(body: Problema):
    programas = [p.model_dump() for p in body.programas] if body.programas is not None else None
    config = body.config.model_dump() if body.config else None
    return servicio.resolver_problema(programas, config)


# ---------- Errores en español (422) ----------
@app.exception_handler(servicio.DatosInvalidos)
def _datos_invalidos(_: Request, exc: servicio.DatosInvalidos):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(RequestValidationError)
def _validacion(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": mensaje_validacion(exc.errors())})


# ---------- Rutas ----------
@app.get("/api/py/salud")
def salud():
    return {"ok": True}


@app.get("/api/py/programas")
def programas():
    """Programas y configuración por defecto, más los presets de las 4 corridas."""
    return servicio.datos_por_defecto()


@app.post("/api/py/ejecutar")
def ejecutar(body: Optional[EjecutarIn] = None):
    body = body or EjecutarIn()
    data, cfg = _problema(body)
    params = ParametrosAG(**(body.parametros or Parametros()).model_dump())
    return servicio.ejecutar(data, cfg, params)


@app.post("/api/py/optimo")
def optimo(body: Optional[Problema] = None):
    data, cfg = _problema(body or Problema())
    return servicio.optimo(data, cfg)


@app.post("/api/py/corridas-informe")
def corridas_informe(body: Optional[CorridasIn] = None):
    body = body or CorridasIn()
    data, cfg = _problema(body)
    return servicio.corridas_informe(data, cfg, body.semilla)
