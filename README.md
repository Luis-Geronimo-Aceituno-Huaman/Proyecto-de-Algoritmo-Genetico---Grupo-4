# Algoritmo genético para el ODS 5

App web que usa un algoritmo genético para elegir qué programas de igualdad de género financiar con un presupuesto limitado.
Curso Sistemas Inteligentes · UNMSM · FISI · Grupo 4 · 2026-II.

- **Aplicación:** https://proyecto-de-algoritmo-genetico-grup.vercel.app
- **Documentación de la API:** https://proyecto-de-algoritmo-genetico-grup.vercel.app/api/py/docs

Desplegada en Vercel (plan Hobby): cada push a `main` publica una nueva versión.

## Requisitos
- Node.js 20 o superior
- Python 3.12

## Instalación
```bash
# 1. Dependencias de Node
npm install

# 2. Entorno virtual de Python
python -m venv .venv            # en Windows: py -3.12 -m venv .venv
# Windows:      .venv\Scripts\python -m pip install -r requirements-dev.txt
# macOS/Linux:  .venv/bin/python -m pip install -r requirements-dev.txt
```

## Uso
| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta Next.js (http://localhost:3000) y FastAPI (puerto 8000) a la vez |
| `npm run fastapi-dev` | Solo la API |
| `npm run test:py` | Tests de Python (pytest) |
| `npm run build` | Build de producción |

Los scripts usan automáticamente el Python de `.venv`, así que no hace falta activarlo.

- Salud de la API: http://localhost:3000/api/py/salud
- Documentación interactiva: http://localhost:3000/api/py/docs

## Capturas para el informe
Todas las corridas usan la **semilla 42**. Los gráficos se descargan con el botón «Descargar gráfico PNG» de cada pantalla.

| Figura | Pantalla | Qué capturar |
|---|---|---|
| 7.1 | Problema | Pantalla completa del navegador **con la URL pública visible** (`*.vercel.app`): modelo y tabla de programas. |
| 7.2 | Ejecutar AG | Panel «Parámetros del AG» con el preset **Base**. |
| 7.3 | Ejecutar AG | Resultados de la corrida Base: mejor cromosoma, indicadores y «Comparación con otros métodos». |
| 7.4 | Ejecutar AG | Gráfico de convergencia de la corrida Base (PNG descargado). |
| 8.1–8.4 | Ejecutar AG | Resultados de cada corrida (presets Base, Mutación alta, Población pequeña y Torneo) con el panel de parámetros visible. |
| 8.5–8.8 | Ejecutar AG | Gráfico de convergencia de cada corrida (PNG descargado). |
| 8.9 | Comparar corridas | «Ejecutar las 4 corridas del informe» y descargar el gráfico superpuesto (PNG). |

La tabla resumen (Tabla 8.6) y la repetibilidad con 5 semillas (Tabla 8.7) se descargan en CSV desde «Comparar corridas».

## Estructura
- `api/index.py`: rutas FastAPI (función serverless en Vercel).
- `api/_core/`: lógica del algoritmo genético.
- `tests/`: pruebas con pytest.
- `app/`, `components/`, `lib/`: frontend.
