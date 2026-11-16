# CONTEXTO DEL PROYECTO (leer antes de cada tarea)

## Qué es
App web que aplica un **algoritmo genético (AG)** para elegir qué programas de igualdad de género (ODS 5) financiar con presupuesto limitado. Trabajo del curso **Sistemas Inteligentes** (UNMSM, FISI, 2026-II, docente Rosa Sumactika Delgadillo Avila), **Grupo 4**: Aceituno Huamán, Arteaga Espinoza, Ocaña Suarez, Santos Sigüenza, Falcón Vilca, Gonzales Estela. Ya existe un informe escrito; **la app debe coincidir con él** (nombres, fórmulas, parámetros y números de abajo).

## Stack (todo gratuito)
- Frontend: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Recharts + html-to-image.
- Backend: Python 3.12, FastAPI en `api/index.py` (función serverless de Vercel), **pyeasyga 0.3.1**, numpy.
- Patrón: plantilla "Next.js FastAPI Starter" de Vercel. Rutas Python bajo `/api/py/*`; `next.config` reescribe `/api/py/:path*` → `http://127.0.0.1:8000` en desarrollo.
- Deploy: GitHub + Vercel Hobby. Tests: pytest. Sin base de datos: el historial de corridas se guarda en `localStorage`.

## Estructura
```
api/index.py            FastAPI (solo rutas, sin lógica)
api/_core/              lógica del AG (el "_" evita que Vercel la convierta en función)
  data/programas.json   datos (fuente única)
  datos.py representacion.py fitness.py operadores.py seleccion.py motor.py
  optimizacion.py       exacto (enumeración numpy) + voraz
tests/                  pytest (conftest agrega api/ a sys.path)
app/ components/ lib/   frontend
```

## Modelo (mochila 0-1 con restricciones)
- xᵢ∈{0,1}: se financia el programa i. Costos en **miles de soles**.
- Max Z = Σ wᵢ·bᵢ·xᵢ
- R1 Σcᵢxᵢ ≤ B (B=1500) · R2 cada meta presente en los datos tiene ≥1 programa · R3 Σ(rural)cᵢxᵢ ≥ pct_rural·B (0,30 → 450)
- **Fitness** F = max(1, Z − α·max(0,C−B) − β·U − γ·max(0, pct_rural·B − C_rural)), α=150, β=5000, γ=30, U = metas sin cubrir.

## AG (nombres de funciones obligatorios)
| Fase | Implementación |
|---|---|
| Representación | lista de 20 bits, orden = orden de programas.json |
| `crear_individuo(data)` | gen=1 con prob. p₁=B/Σcᵢ (≈0,416) |
| `decodificar(ind, data)` | → seleccionados, Z, costo, costo_rural, metas_cubiertas, metas_faltantes, factible |
| `fitness(ind, data)` | fórmula de arriba |
| `cruce_un_punto` / `cruce_uniforme` | punto k∈[1,n−1] / gen a gen con p=0,5 |
| `mutacion_bitflip` | invierte 1 bit al azar; **Pm se aplica a cada hijo por separado** |
| `seleccion_ruleta` / `seleccion_torneo` | proporcional a F / mejor de t=3 |
| Motor | subclase de `pyeasyga.GeneticAlgorithm`, elitismo, P(0) + G generaciones (historial de G+1 puntos), `random.seed(semilla)` |

Valores por defecto: N=50, G=100, Pc=0,8, Pm=0,1, cruce un punto, ruleta, semilla 42.

## Las 4 corridas del informe (solo cambia 1 parámetro)
1 Base · 2 Pm=0,30 · 3 N=10 · 4 torneo t=3. Las demás opciones quedan con los valores por defecto.

## Datos (id;nombre;meta;ámbito;costo;beneficiarias;w)
```
P01;Talleres de nuevas masculinidades en colegios;5.1;Urbano;120;3000;1.0
P02;Campaña regional contra estereotipos de género;5.1;Mixto;90;12000;1.0
P03;Consultorios jurídicos gratuitos para mujeres;5.1;Urbano;150;1800;1.1
P04;Brigadas itinerantes de atención a víctimas (CEM móvil);5.2;Rural;260;2200;1.5
P05;Hogar de refugio temporal para víctimas de violencia;5.2;Urbano;380;350;1.4
P06;Aplicación móvil de alerta temprana (botón de pánico);5.2;Mixto;140;6000;1.1
P07;Capacitación a policías y operadores de justicia;5.2;Mixto;110;1500;1.2
P08;Red de cunas comunitarias para madres trabajadoras;5.4;Urbano;320;900;1.2
P09;Cuidado diurno de adultos mayores dependientes;5.4;Urbano;240;500;1.1
P10;Programa de corresponsabilidad familiar;5.4;Mixto;80;2500;1.0
P11;Escuela regional de liderazgo político para mujeres;5.5;Mixto;130;400;1.2
P12;Mentoría para lideresas comunales y de rondas campesinas;5.5;Rural;95;600;1.5
P13;Consejería en salud sexual y reproductiva para adolescentes;5.6;Mixto;170;4000;1.3
P14;Fondo de microcréditos para emprendedoras;5.a;Mixto;400;1600;1.1
P15;Titulación de tierras a nombre de mujeres productoras;5.a;Rural;210;700;1.5
P16;Asistencia técnica y acceso a mercados para productoras agrarias;5.a;Rural;180;1100;1.4
P17;Bootcamp de programación para mujeres jóvenes;5.b;Urbano;160;300;1.0
P18;Clubes STEM para niñas en escuelas públicas;5.b;Mixto;100;1500;1.1
P19;Alfabetización digital para mujeres rurales;5.b;Rural;150;1200;1.5
P20;Observatorio regional de brechas de género y presupuesto con enfoque de género;5.c;Mixto;120;800;1.0
```
Solo "Rural" cuenta para R3; "Mixto" no cuenta.

## Valores de validación (los tests DEBEN reproducirlos)
- Σcostos=3605 · ΣwB=48780 · 8 metas · 1 269 combinaciones factibles de 2²⁰.
- **Óptimo Z\*=39290**, costo 1465, rural 535: P01 P02 P04 P06 P07 P10 P12 P13 P16 P18 P20. Es también el argmax de F.
- `11010110010110010110` → Z=40290, C=1495, Cr=685, U=1, F=35290. Con gen 20 = 1 → F=23840. Todos en 1 → F=1.
- Voraz (por wb/c): P01 P02 P03 P04 P06 P07 P10 P12 P13 P18 P19 → Z=40730, infactible (faltan 5.a y 5.c), F=30730.
- Brecha (%) = (Z\* − Z_AG)/Z\*·100.

## Reglas de trabajo
- Responde en español. En el código: identificadores en español y comentarios breves.
- No metas lógica en `api/index.py` ni en componentes React: va en `_core/` o en `lib/`.
- Cambios mínimos: no reescribas archivos enteros por un cambio pequeño ni pegues archivos completos en la respuesta.
- Al terminar cada tarea: corre los tests o el build, marca la casilla en **Estado** y resume en 10 líneas como máximo.
- La UI debe ser clara para la docente: cada pantalla explica brevemente qué fase del AG muestra.

## Estado
- [x] 0 Esqueleto y entorno
- [x] 1 Datos, representación y fitness
- [x] 2 Operadores, selección y motor
- [x] 3 Óptimo exacto y voraz
- [x] 4 API
- [x] 5 Frontend base y pantalla "Problema"
- [x] 6 Pantalla "Ejecutar AG"
- [x] 7 Pantalla "Comparar corridas"
- [x] 8 Pulido y "Acerca de"
- [x] 9 Despliegue en Vercel
- [ ] 10 Auditoría final y resultados para el informe
- URL de producción: https://proyecto-de-algoritmo-genetico-grup.vercel.app
- Repositorio: https://github.com/Luis-Geronimo-Aceituno-Huaman/Proyecto-de-Algoritmo-Genetico---Grupo-4 (Vercel despliega cada push a `main`)
