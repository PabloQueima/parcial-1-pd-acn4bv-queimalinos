// controllers/usuarios.js
// Controlador de gestión de usuarios de la Plataforma de Entrenamiento

import Usuario from "../models/Usuario.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoUsuarioId = null;
let filtroUsuarios = "";

/**
 * Inicializa el módulo de usuarios:
 * - Configura eventos
 * - Carga datos desde storage
 * - Renderiza la lista inicial
 */
export const initUsuarios = async () => {
  try {
    console.group("InitUsuarios");

    const inputFiltro = document.getElementById("filtro-usuarios");
    const formUsuario = document.getElementById("form-usuario");

    if (!inputFiltro || !formUsuario) {
      console.warn("No se encontró el formulario o el campo de filtro de usuarios.");
      return;
    }

    // Filtro en tiempo real (evento keyup)
    inputFiltro.addEventListener("keyup", (e) => {
      filtroUsuarios = e.target.value.toLowerCase();
      renderUsuarios();
    });

    // Envío del formulario (crear o editar)
    formUsuario.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre-usuario").value.trim();
      const rol = document.getElementById("rol-usuario").value;

      if (!nombre || !rol) {
        alert("Debe completar todos los campos.");
        return;
      }

      if (editandoUsuarioId) {
        actualizarUsuario(editandoUsuarioId, nombre, rol);
        editandoUsuarioId = null;
        formUsuario.querySelector("button").textContent = "Agregar Usuario";
      } else {
        guardarUsuario(nombre, rol);
      }

      e.target.reset();
    });

    // Inicialización de datos demo si el almacenamiento está vacío
    const data = StorageService.load("usuarios", []);
    if (!data || data.length === 0) {
      const usuariosDemo = [
        new Usuario(1, "Ana", "admin"),
        new Usuario(2, "Luis", "entrenador"),
        new Usuario(3, "Marta", "cliente")
      ];
      StorageService.save("usuarios", usuariosDemo);
    }

    renderUsuarios();
    console.groupEnd();

  } catch (error) {
    console.error("Error en initUsuarios:", error);
  }
};

/**
 * Renderiza la lista de usuarios en el DOM
 */
const renderUsuarios = () => {
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

    // Botón de editar
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.classList.add("edit");
    btnEdit.addEventListener("click", () => cargarFormularioUsuario(u));

    // Botón de eliminar con callback de confirmación
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.classList.add("delete");
    btnDelete.addEventListener("click", async () => {
      const confirmado = await confirmarAccion(`¿Eliminar al usuario "${u.nombre}"?`);
      if (confirmado) eliminarUsuario(u.id);
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
};

/**
 * Guarda un nuevo usuario en localStorage
 */
const guardarUsuario = (nombre, rol) => {
  const usuarios = StorageService.load("usuarios", []);
  const nuevoUsuario = new Usuario(Date.now(), nombre, rol);
  usuarios.push(nuevoUsuario);

  StorageService.save("usuarios", usuarios);
  renderUsuarios();
};

/**
 * Actualiza un usuario existente
 */
const actualizarUsuario = (id, nombre, rol) => {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.map(u => (u.id === id ? { ...u, nombre, rol } : u));
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
};

/**
 * Elimina un usuario por id
 */
const eliminarUsuario = (id) => {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.filter(u => u.id !== id);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
};

/**
 * Carga los datos del usuario en el formulario para edición
 */
const cargarFormularioUsuario = (usuario) => {
  document.getElementById("nombre-usuario").value = usuario.nombre;
  document.getElementById("rol-usuario").value = usuario.rol;
  editandoUsuarioId = usuario.id;
  document.querySelector("#form-usuario button").textContent = "Actualizar Usuario";
};

/**
 * Muestra una confirmación asíncrona con promesa
 * Ejemplo de uso de callback y async/await
 */
const confirmarAccion = (mensaje) => {
  return new Promise((resolve) => {
    const confirmado = confirm(mensaje);
    resolve(confirmado);
  });
};
