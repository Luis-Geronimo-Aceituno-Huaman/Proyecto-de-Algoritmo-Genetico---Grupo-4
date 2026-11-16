// Contenido institucional compartido por la portada y "Acerca de" (coincide con el informe).

export const CURSO = {
  universidad: "Universidad Nacional Mayor de San Marcos",
  facultad: "Facultad de Ingeniería de Sistemas e Informática",
  curso: "Sistemas Inteligentes",
  docente: "Delgadillo Avila, Rosa Sumactika",
  semestre: "2026-II",
  grupo: "Grupo 4",
};

export const INTEGRANTES = [
  "Aceituno Huamán, Luis Geronimo",
  "Arteaga Espinoza, Jeanpierre Alexander",
  "Ocaña Suarez, Manuel Pierce",
  "Santos Sigüenza, Yajhaira Dayana",
  "Falcón Vilca, Jairo Daniel",
  "Gonzales Estela, Luis Alonso",
];

export const OBJETIVO =
  "Diseñar, implementar y desplegar un algoritmo genético que determine la cartera de programas de igualdad de género que maximiza el número ponderado de mujeres beneficiarias, respetando el presupuesto, la cobertura de todas las metas del ODS 5 y la equidad territorial.";

export interface Referencia {
  id: string;
  autor: string;
  titulo: string;
  resto: string;
  url?: string;
}

/** Referencias principales (APA 7, como en el informe). */
export const REFERENCIAS: Referencia[] = [
  { id: "goldberg", autor: "Goldberg, D. E. (1989).", titulo: "Genetic algorithms in search, optimization, and machine learning", resto: ". Addison-Wesley." },
  { id: "holland", autor: "Holland, J. H. (1975).", titulo: "Adaptation in natural and artificial systems", resto: ". University of Michigan Press." },
  {
    id: "endes",
    autor: "Instituto Nacional de Estadística e Informática. (2025a, 24 de noviembre).",
    titulo: "52 de cada 100 mujeres de 15 a 49 años fueron alguna vez víctimas de violencia por parte de su esposo o compañero",
    resto: " [Nota de prensa, ENDES 2024].",
    url: "https://www.gob.pe/institucion/inei/noticias/1296342",
  },
  {
    id: "brechas",
    autor: "Instituto Nacional de Estadística e Informática. (2025c).",
    titulo: "Perú: Brechas de género 2025. Avances hacia la igualdad de mujeres y hombres",
    resto: ".",
    url: "https://www.gob.pe/institucion/inei/informes-publicaciones/7463589",
  },
  {
    id: "onu",
    autor: "ONU Mujeres & Departamento de Asuntos Económicos y Sociales de las Naciones Unidas. (2025).",
    titulo: "El progreso en el cumplimiento de los Objetivos de Desarrollo Sostenible: Panorama de género 2025",
    resto: ".",
    url: "https://www.unwomen.org/es/digital-library/publications/2025/09/el-progreso-en-el-cumplimiento-de-los-objetivos-de-desarrollo-sostenible-panorama-de-genero-2025",
  },
  {
    id: "pyeasyga",
    autor: "Remi-Omosowon, A. (2014).",
    titulo: "pyeasyga: A simple and easy-to-use implementation of a Genetic Algorithm library in Python",
    resto: " [Documentación].",
    url: "https://pyeasyga.readthedocs.io/",
  },
];

/** Cifras de contexto de la portada; `fuente` apunta a una referencia. */
export const CIFRAS = [
  {
    valor: "52 %",
    texto: "de las mujeres de 15 a 49 años fue alguna vez víctima de violencia por parte de su esposo o compañero.",
    meta: "Meta 5.2",
    fuente: "endes",
    cita: "INEI, ENDES 2024",
  },
  {
    valor: "24 %",
    texto: "menos ingresos perciben en promedio las mujeres que los hombres en el Perú.",
    meta: "Meta 5.a",
    fuente: "brechas",
    cita: "INEI, Brechas de género 2025",
  },
  {
    valor: "0",
    texto: "indicadores del ODS 5 van camino de cumplirse en 2030 a nivel mundial.",
    meta: "ODS 5",
    fuente: "onu",
    cita: "ONU Mujeres, 2025",
  },
];

/** Dónde se ve cada fase del AG en la aplicación. */
export const FASES = [
  { fase: "Representación cromosómica", donde: "Ejecutar AG → «Mejor cromosoma»: 20 casillas con 1/0. En Problema, cada fila de la tabla es un gen." },
  { fase: "Decodificación", donde: "Ejecutar AG → indicadores del mejor individuo y tabla «Programas financiados»." },
  { fase: "Función fitness con penalizaciones", donde: "Problema → «Modelo matemático». Ejecutar AG → «Fitness F» y bloque «Restricciones» (R1–R3 con la penalización aplicada)." },
  { fase: "Población inicial", donde: "Problema → indicador p₁ = B / Σc. Ejecutar AG → generación 0 del gráfico de convergencia." },
  { fase: "Selección (ruleta o torneo)", donde: "Ejecutar AG → panel de parámetros, campo «Selección» y tamaño del torneo t." },
  { fase: "Cruzamiento", donde: "Ejecutar AG → campo «Cruce» (un punto o uniforme) y probabilidad Pc." },
  { fase: "Mutación bit-flip", donde: "Ejecutar AG → probabilidad Pm (se sortea para cada hijo)." },
  { fase: "Elitismo", donde: "Ejecutar AG → «Convergencia»: la curva del mejor fitness nunca baja." },
  { fase: "Criterio de parada", donde: "Ejecutar AG → número de generaciones G e indicador «Generación del mejor»." },
  { fase: "Evaluación frente a otros métodos", donde: "Problema → óptimo exacto y heurística voraz. Ejecutar AG → «Comparación con otros métodos»." },
  { fase: "Análisis de parámetros", donde: "Comparar corridas → las 4 corridas del informe, tabla resumen y repetibilidad con 5 semillas." },
];
