// Ejecuta Python del entorno virtual .venv (Windows o Unix) sin tener que activarlo.
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const candidatos = [".venv/Scripts/python.exe", ".venv/bin/python"];
const python = candidatos.find((p) => existsSync(p)) ?? "python";

const proc = spawn(python, process.argv.slice(2), { stdio: "inherit" });
proc.on("exit", (codigo) => process.exit(codigo ?? 1));
