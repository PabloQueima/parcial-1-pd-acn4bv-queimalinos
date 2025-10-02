import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";
import { DOMUtils } from "./ui/dom.js";

// --- Estado de edición ---
let editandoUsuarioId = null;
let editandoEjercicioId = null;

// --- Estado de filtros ---
let filtroUsuarios = "";
let filtroEjercicios = "";

// --- Estado de sesiones ---
let editandoSesionId = null;
let filtroSesiones = "";

// --- Filtrado dinámico ---
document.getElementById("filtro-usuarios").addEventListener("keyup", (e) => {
  filtroUsuarios = e.target.value.toLowerCase();
  renderUsuarios();
});

document.getElementById("filtro-ejercicios").addEventListener("keyup", (e) => {
  filtroEjercicios = e.target.value.toLowerCase();
  renderEjercicios();
});

document.getElementById("filtro-sesiones").addEventListener("keyup", (e) => {
  filtroSesiones = e.target.value.toLowerCase();
  renderSesiones();
});

// --- Render usuarios con filtro ---
function renderUsuarios() {
  let usuariosGuardados = StorageService.load("usuarios", []);
  if (filtroUsuarios) {
    usuariosGuardados = usuariosGuardados.filter(u =>
      u.nombre.toLowerCase().includes(filtroUsuarios) || u.rol.toLowerCase().includes(filtroUsuarios)
    );
  }

  DOMUtils.renderList("lista-usuarios", usuariosGuardados, (u) => {
    const li = document.createElement("li");
    li.textContent = `${u.nombre} (${u.rol}) `;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => cargarFormularioUsuario(u));

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

// --- Render ejercicios con filtro ---
function renderEjercicios() {
  let ejerciciosGuardados = StorageService.load("ejercicios", []);
  if (filtroEjercicios) {
    ejerciciosGuardados = ejerciciosGuardados.filter(e =>
      e.nombre.toLowerCase().includes(filtroEjercicios) || e.descripcion.toLowerCase().includes(filtroEjercicios)
    );
  }

  DOMUtils.renderList("lista-ejercicios", ejerciciosGuardados, (e) => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} - ${e.descripcion} `;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => cargarFormularioEjercicio(e));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
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
}
);

// --- Render clientes en select ---
function renderClientesSelect() {
  const select = document.getElementById("cliente-sesion");
  if (!select) return; // seguridad
  const clientes = StorageService.load("usuarios", []).filter(u => u.rol === "cliente");
  select.innerHTML = '<option value="" disabled selected>Seleccionar cliente</option>';
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nombre;
    select.appendChild(option);
  });
}

// --- Render ejercicios en select múltiple ---
function renderEjerciciosSelect() {
  const select = document.getElementById("ejercicios-sesion");
  if (!select) return; // seguridad
  const ejercicios = StorageService.load("ejercicios", []);
  select.innerHTML = "";
  ejercicios.forEach(e => {
    const option = document.createElement("option");
    option.value = e.id;
    option.textContent = e.nombre;
    select.appendChild(option);
  });
}

// --- Render sesiones ---
function renderSesiones() {
  let sesiones = StorageService.load("sesiones", []);
  if (filtroSesiones) {
    sesiones = sesiones.filter(s => s.titulo.toLowerCase().includes(filtroSesiones));
  }

  DOMUtils.renderList("lista-sesiones", sesiones, (s) => {
    const li = document.createElement("li");

    const cliente = StorageService.load("usuarios", []).find(u => u.id === s.clienteId);
    const ejercicios = StorageService.load("ejercicios", []).filter(e => s.ejerciciosIds.includes(e.id));

    li.textContent = `${s.titulo} - Cliente: ${cliente ? cliente.nombre : "Desconocido"} - Ejercicios: ${ejercicios.map(e => e.nombre).join(", ")}`;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.style.marginLeft = "10px";
    btnEdit.addEventListener("click", () => cargarFormularioSesion(s));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.style.marginLeft = "5px";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar la sesión "${s.titulo}"?`)) {
        eliminarSesion(s.id);
      }
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });
}

// --- CRUD sesiones ---
function guardarSesion(titulo, clienteId, ejerciciosIds) {
  const sesiones = StorageService.load("sesiones", []);
  const nuevaSesion = new Sesion(Date.now(), titulo, null, clienteId);
  nuevaSesion.ejerciciosIds = ejerciciosIds;
  sesiones.push(nuevaSesion);
  StorageService.save("sesiones", sesiones);
  renderSesiones();
}

function actualizarSesion(id, titulo, clienteId, ejerciciosIds) {
  let sesiones = StorageService.load("sesiones", []);
  sesiones = sesiones.map(s =>
    s.id === id ? { ...s, titulo, clienteId, ejerciciosIds } : s
  );
  StorageService.save("sesiones", sesiones);
  renderSesiones();
}

function eliminarSesion(id) {
  let sesiones = StorageService.load("sesiones", []);
  sesiones = sesiones.filter(s => s.id !== id);
  StorageService.save("sesiones", sesiones);
  renderSesiones();
}

// --- Manejo de formulario sesiones ---
function cargarFormularioSesion(sesion) {
  document.getElementById("titulo-sesion").value = sesion.titulo;
  document.getElementById("cliente-sesion").value = sesion.clienteId;

  const selectEjercicios = document.getElementById("ejercicios-sesion");
  Array.from(selectEjercicios.options).forEach(opt => {
    opt.selected = sesion.ejerciciosIds.includes(Number(opt.value));
  });

  editandoSesionId = sesion.id;
  document.querySelector("#form-sesion button").textContent = "Actualizar Sesión";
}

document.getElementById("form-sesion").addEventListener("submit", (event) => {
  event.preventDefault();
  const titulo = document.getElementById("titulo-sesion").value.trim();
  const clienteId = Number(document.getElementById("cliente-sesion").value);
  const ejerciciosSelect = document.getElementById("ejercicios-sesion");
  const ejerciciosIds = Array.from(ejerciciosSelect.selectedOptions).map(o => Number(o.value));

  if (!titulo || !clienteId || ejerciciosIds.length === 0) return;

  if (editandoSesionId) {
    actualizarSesion(editandoSesionId, titulo, clienteId, ejerciciosIds);
    editandoSesionId = null;
    document.querySelector("#form-sesion button").textContent = "Agregar Sesión";
  } else {
    guardarSesion(titulo, clienteId, ejerciciosIds);
  }

  event.target.reset();
});

// --- Inicialización demo ---
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

if (!StorageService.load("sesiones")) {
  StorageService.save("sesiones", []);
}

// --- Render inicial ---
renderClientesSelect();
renderEjerciciosSelect();
renderUsuarios();
renderEjercicios();
renderSesiones();
