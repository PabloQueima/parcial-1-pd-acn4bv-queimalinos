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
    btnEdit.textContent = "✏️";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => {
      cargarFormularioUsuario(u);
    });

    // Botón eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "❌";
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

// --- Render inicial ---
if (!StorageService.load("usuarios")) {
  const usuariosDemo = [
    new Usuario(1, "Ana", "admin"),
    new Usuario(2, "Luis", "entrenador"),
    new Usuario(3, "Marta", "cliente")
  ];
  StorageService.save("usuarios", usuariosDemo);
}

renderUsuarios();
