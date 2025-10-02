// Punto de entrada
console.log("Plataforma de Entrenamiento iniciada");

import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";
import { DOMUtils } from "./ui/dom.js";

// --- Datos de prueba ---
const usuarios = [
  new Usuario(1, "Ana", "admin"),
  new Usuario(2, "Luis", "entrenador"),
  new Usuario(3, "Marta", "cliente")
];
StorageService.save("usuarios", usuarios);

// Chequea si hay ejercicios
if (!StorageService.load("ejercicios")) {
  const ejercicios = [
    new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
    new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
  ];
  StorageService.save("ejercicios", ejercicios);
}

// --- Funciones render ---
function renderEjercicios() {
  const ejerciciosGuardados = StorageService.load("ejercicios", []);
  DOMUtils.renderList("lista-ejercicios", ejerciciosGuardados, e => `${e.nombre} - ${e.descripcion}`);
}

function renderUsuarios() {
  const usuariosGuardados = StorageService.load("usuarios", []);
  DOMUtils.renderList("lista-usuarios", usuariosGuardados, u => `${u.nombre} (${u.rol})`);
}

// --- Formulario ---
document.getElementById("form-ejercicio").addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre-ejercicio").value.trim();
  const descripcion = document.getElementById("descripcion-ejercicio").value.trim();

  if (!nombre || !descripcion) return;

  const ejercicios = StorageService.load("ejercicios", []);
  const nuevoEjercicio = new Ejercicio(Date.now(), nombre, descripcion);

  ejercicios.push(nuevoEjercicio);
  StorageService.save("ejercicios", ejercicios);

  renderEjercicios();
  event.target.reset();
});

renderUsuarios();
renderEjercicios();
