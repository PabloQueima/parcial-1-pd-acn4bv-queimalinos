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

if (!StorageService.load("ejercicios")) {
  const ejercicios = [
    new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
    new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
  ];
  StorageService.save("ejercicios", ejercicios);
}

// --- Estado de edición ---
let editandoId = null;

// --- Funciones auxiliares ---
function renderEjercicios() {
  const ejerciciosGuardados = StorageService.load("ejercicios", []);

  DOMUtils.renderList("lista-ejercicios", ejerciciosGuardados, (e) => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} - ${e.descripcion} `;

    // Botón editar
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "✏️";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => {
      cargarFormulario(e);
    });

    // Botón eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "❌";
    btnDelete.style.marginLeft = "5px";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar el ejercicio "${e.nombre}"?`)) {
        eliminarEjercicio(e.id);
      }
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
}

function renderUsuarios() {
  const usuariosGuardados = StorageService.load("usuarios", []);
  DOMUtils.renderList("lista-usuarios", usuariosGuardados, (u) => {
    const li = document.createElement("li");
    li.textContent = `${u.nombre} (${u.rol})`;
    return li;
  });
}

// --- CRUD Ejercicios ---
function guardarEjercicio(nombre, descripcion) {
  const ejercicios = StorageService.load("ejercicios", []);
  const nuevoEjercicio = new Ejercicio(Date.now(), nombre, descripcion);
  ejercicios.push(nuevoEjercicio);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

function actualizarEjercicio(id, nombre, descripcion) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.map(e => 
    e.id === id ? { ...e, nombre, descripcion } : e
  );
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

function eliminarEjercicio(id) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

// --- Manejo de formulario ---
function cargarFormulario(ejercicio) {
  document.getElementById("nombre-ejercicio").value = ejercicio.nombre;
  document.getElementById("descripcion-ejercicio").value = ejercicio.descripcion;
  editandoId = ejercicio.id;

  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
}

document.getElementById("form-ejercicio").addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre-ejercicio").value.trim();
  const descripcion = document.getElementById("descripcion-ejercicio").value.trim();
  if (!nombre || !descripcion) return;

  if (editandoId) {
    actualizarEjercicio(editandoId, nombre, descripcion);
    editandoId = null;
    document.querySelector("#form-ejercicio button").textContent = "Agregar Ejercicio";
  } else {
    guardarEjercicio(nombre, descripcion);
  }

  event.target.reset();
});

// --- Render inicial ---
renderUsuarios();
renderEjercicios();
