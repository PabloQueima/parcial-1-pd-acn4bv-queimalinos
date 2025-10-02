import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";
import { DOMUtils } from "./ui/dom.js";

// --- Estado de edición ---
let editandoUsuarioId = null;
let editandoEjercicioId = null;

// --- Funciones auxiliares ---
function renderUsuarios() {
  const usuariosGuardados = StorageService.load("usuarios", []);

  DOMUtils.renderList("lista-usuarios", usuariosGuardados, (u) => {
    const li = document.createElement("li");
    li.textContent = `${u.nombre} (${u.rol}) `;

    // Botón editar
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => {
      cargarFormularioUsuario(u);
    });

    // Botón eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.style.marginLeft = "5px";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar el usuario "${u.nombre}"?`)) {
        eliminarUsuario(u.id);
      }
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
}

// --- CRUD Usuarios ---
function guardarUsuario(nombre, rol) {
  const usuarios = StorageService.load("usuarios", []);
  const nuevoUsuario = new Usuario(Date.now(), nombre, rol);
  usuarios.push(nuevoUsuario);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

function actualizarUsuario(id, nombre, rol) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.map(u =>
    u.id === id ? { ...u, nombre, rol } : u
  );
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

function eliminarUsuario(id) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.filter(u => u.id !== id);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

// --- Manejo de formulario usuarios ---
function cargarFormularioUsuario(usuario) {
  document.getElementById("nombre-usuario").value = usuario.nombre;
  document.getElementById("rol-usuario").value = usuario.rol;
  editandoUsuarioId = usuario.id;
  document.querySelector("#form-usuario button").textContent = "Actualizar Usuario";
}

document.getElementById("form-usuario").addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre-usuario").value.trim();
  const rol = document.getElementById("rol-usuario").value;

  if (!nombre || !rol) return;

  if (editandoUsuarioId) {
    actualizarUsuario(editandoUsuarioId, nombre, rol);
    editandoUsuarioId = null;
    document.querySelector("#form-usuario button").textContent = "Agregar Usuario";
  } else {
    guardarUsuario(nombre, rol);
  }

  event.target.reset();
});

// --- Funciones auxiliares para ejercicios ---
function renderEjercicios() {
  const ejerciciosGuardados = StorageService.load("ejercicios", []);

  DOMUtils.renderList("lista-ejercicios", ejerciciosGuardados, (e) => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} - ${e.descripcion} `;

    // Botón editar
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => {
      cargarFormularioEjercicio(e);
    });
    btnEdit.style.marginLeft = "10px";

    // Botón eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar el ejercicio "${e.nombre}"?`)) {
        eliminarEjercicio(e.id);
      }
    });
    btnDelete.style.marginLeft = "5px";

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
}

// --- CRUD ejercicios ---
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

// --- Manejo de formulario ejercicios ---
function cargarFormularioEjercicio(ejercicio) {
  document.getElementById("nombre-ejercicio").value = ejercicio.nombre;
  document.getElementById("descripcion-ejercicio").value = ejercicio.descripcion;
  editandoEjercicioId = ejercicio.id;
  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
}

document.getElementById("form-ejercicio").addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre-ejercicio").value.trim();
  const descripcion = document.getElementById("descripcion-ejercicio").value.trim();

  if (!nombre || !descripcion) return;

  if (editandoEjercicioId) {
    actualizarEjercicio(editandoEjercicioId, nombre, descripcion);
    editandoEjercicioId = null;
    document.querySelector("#form-ejercicio button").textContent = "Agregar Ejercicio";
  } else {
    guardarEjercicio(nombre, descripcion);
  }

  event.target.reset();
});

// --- Render inicial ---
if (!StorageService.load("usuarios")) {
  const usuariosDemo = [
    new Usuario(1, "Ana", "admin"),
    new Usuario(2, "Luis", "entrenador"),
    new Usuario(3, "Marta", "cliente")
  ];
  StorageService.save("usuarios", usuariosDemo);
}

if (!StorageService.load("ejercicios")) {
  const ejerciciosDemo = [
    new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
    new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
  ];
  StorageService.save("ejercicios", ejerciciosDemo);
}

renderUsuarios();
renderEjercicios();