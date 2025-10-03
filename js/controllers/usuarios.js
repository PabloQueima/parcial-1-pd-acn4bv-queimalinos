import Usuario from "../models/Usuario.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoUsuarioId = null;
let filtroUsuarios = "";

export function initUsuarios() {
  const inputFiltro = document.getElementById("filtro-usuarios");
  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroUsuarios = e.target.value.toLowerCase();
      renderUsuarios();
    });
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

  if ((StorageService.load("usuarios") || []).length === 0) {
    const usuariosDemo = [
      new Usuario(1, "Ana", "admin"),
      new Usuario(2, "Luis", "entrenador"),
      new Usuario(3, "Marta", "cliente")
    ];
    StorageService.save("usuarios", usuariosDemo);
  }

  renderUsuarios();
}

function renderUsuarios() {
  let usuarios = StorageService.load("usuarios", []);
  if (filtroUsuarios) {
    usuarios = usuarios.filter(u =>
      (u.nombre || "").toLowerCase().includes(filtroUsuarios) ||
      (u.rol || "").toLowerCase().includes(filtroUsuarios)
    );
  }

  DOMUtils.renderList("lista-usuarios", usuarios, (u) => {
    const li = document.createElement("li");
    li.textContent = `${u.nombre} (${u.rol})`;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => cargarFormularioUsuario(u));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar el usuario "${u.nombre}"?`)) eliminarUsuario(u.id);
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
}

function guardarUsuario(nombre, rol) {
  const usuarios = StorageService.load("usuarios", []);
  usuarios.push(new Usuario(Date.now(), nombre, rol));
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

function actualizarUsuario(id, nombre, rol) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.map(u => u.id === id ? { ...u, nombre, rol } : u);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

function eliminarUsuario(id) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.filter(u => u.id !== id);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
}

function cargarFormularioUsuario(usuario) {
  document.getElementById("nombre-usuario").value = usuario.nombre;
  document.getElementById("rol-usuario").value = usuario.rol;
  editandoUsuarioId = usuario.id;
  document.querySelector("#form-usuario button").textContent = "Actualizar Usuario";
}
