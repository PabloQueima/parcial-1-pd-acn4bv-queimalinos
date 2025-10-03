import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";
import { DOMUtils } from "./ui/dom.js";

// --- Estados iniciales ---
let editandoUsuarioId = null;
let editandoEjercicioId = null;
let filtroUsuarios = "";
let filtroEjercicios = "";
let editandoSesionId = null;
let filtroSesiones = "";

/* -- FILTRADO -- */
const inputFiltroUsuarios = document.getElementById("filtro-usuarios");
const inputFiltroEjercicios = document.getElementById("filtro-ejercicios");
const inputFiltroSesiones = document.getElementById("filtro-sesiones");

if (inputFiltroUsuarios) {
  inputFiltroUsuarios.addEventListener("keyup", (e) => {
    filtroUsuarios = e.target.value.toLowerCase();
    renderUsuarios();
  });
}
if (inputFiltroEjercicios) {
  inputFiltroEjercicios.addEventListener("keyup", (e) => {
    filtroEjercicios = e.target.value.toLowerCase();
    renderEjercicios();
  });
}
if (inputFiltroSesiones) {
  inputFiltroSesiones.addEventListener("keyup", (e) => {
    filtroSesiones = e.target.value.toLowerCase();
    renderSesiones();
  });
}

/* -- USUARIOS -- */
function renderUsuarios() {
  let usuariosGuardados = StorageService.load("usuarios", []);
  if (filtroUsuarios) {
    usuariosGuardados = usuariosGuardados.filter(u =>
      (u.nombre || "").toLowerCase().includes(filtroUsuarios) ||
      (u.rol || "").toLowerCase().includes(filtroUsuarios)
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

function guardarUsuario(nombre, rol) {
  const usuarios = StorageService.load("usuarios", []);
  const nuevoUsuario = new Usuario(Date.now(), nombre, rol);
  usuarios.push(nuevoUsuario);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
  renderClientesSelect();
}

function actualizarUsuario(id, nombre, rol) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.map(u =>
    u.id === id ? { ...u, nombre, rol } : u
  );
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
  renderClientesSelect();
}

function eliminarUsuario(id) {
  let usuarios = StorageService.load("usuarios", []);
  usuarios = usuarios.filter(u => u.id !== id);
  StorageService.save("usuarios", usuarios);
  renderUsuarios();
  renderClientesSelect();
}

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

/* -- EJERCICIOS -- */
function renderEjercicios() {
  let ejerciciosGuardados = StorageService.load("ejercicios", []);
  if (filtroEjercicios) {
    ejerciciosGuardados = ejerciciosGuardados.filter(e =>
      (e.nombre || "").toLowerCase().includes(filtroEjercicios) ||
      (e.descripcion || "").toLowerCase().includes(filtroEjercicios)
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

function guardarEjercicio(nombre, descripcion) {
  const ejercicios = StorageService.load("ejercicios", []);
  const nuevoEjercicio = new Ejercicio(Date.now(), nombre, descripcion);
  ejercicios.push(nuevoEjercicio);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
  renderEjerciciosCheckboxes();
}

function actualizarEjercicio(id, nombre, descripcion) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.map(e =>
    e.id === id ? { ...e, nombre, descripcion } : e
  );
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
  renderEjerciciosCheckboxes();
}

function eliminarEjercicio(id) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
  renderEjerciciosCheckboxes();
}

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

/* -- SESIONES -- */

// render clientes en el select
function renderClientesSelect() {
  const select = document.getElementById("cliente-sesion");
  if (!select) return;
  const clientes = StorageService.load("usuarios", []).filter(u => u.rol === "cliente");
  select.innerHTML = '<option value="" disabled selected>Seleccionar cliente</option>';
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nombre;
    select.appendChild(option);
  });
}

// render ejercicios
function renderEjerciciosCheckboxes() {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (!contenedor) return;
  const ejercicios = StorageService.load("ejercicios", []);
  contenedor.innerHTML = "";

  ejercicios.forEach(e => {
    const label = document.createElement("label");
    label.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = e.id;
    checkbox.dataset.ejercicioNombre = e.nombre;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + e.nombre));

    contenedor.appendChild(label);
  });
}

function renderSesiones() {
  let sesiones = StorageService.load("sesiones", []);
  if (filtroSesiones) {
    sesiones = sesiones.filter(s => (s.titulo || "").toLowerCase().includes(filtroSesiones));
  }

  const usuarios = StorageService.load("usuarios", []);
  const ejercicios = StorageService.load("ejercicios", []);

  DOMUtils.renderList("lista-sesiones", sesiones, (s) => {
    const li = document.createElement("li");
    li.className = "card";

    const cliente = usuarios.find(u => u.id === s.clienteId);
    const sesEjIds = Array.isArray(s.ejerciciosIds) ? s.ejerciciosIds : (Array.isArray(s.ejercicios) ? s.ejercicios : []);

    const ejerciciosAsignados = ejercicios.filter(e => sesEjIds.includes(e.id));

    const titulo = document.createElement("h3");
    titulo.textContent = s.titulo;

    const clienteP = document.createElement("p");
    clienteP.textContent = `Cliente: ${cliente ? cliente.nombre : "Desconocido"}`;

    const listaEj = document.createElement("ul");
    listaEj.className = "ejercicios-lista";
    ejerciciosAsignados.forEach(e => {
      const liEj = document.createElement("li");
      liEj.textContent = e.nombre;
      listaEj.appendChild(liEj);
    });

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => cargarFormularioSesion(s));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar la sesión "${s.titulo}"?`)) {
        eliminarSesion(s.id);
      }
    });

    acciones.appendChild(btnEdit);
    acciones.appendChild(btnDelete);

    li.appendChild(titulo);
    li.appendChild(clienteP);
    li.appendChild(listaEj);
    li.appendChild(acciones);

    return li;
  });
}

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

function cargarFormularioSesion(sesion) {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (contenedor && contenedor.children.length === 0) {
    renderEjerciciosCheckboxes();
  }

  document.getElementById("titulo-sesion").value = sesion.titulo;
  document.getElementById("cliente-sesion").value = sesion.clienteId;

  const checkboxes = document.querySelectorAll("#ejercicios-sesion input[type='checkbox']");
  const sesEjIds = Array.isArray(sesion.ejerciciosIds) ? sesion.ejerciciosIds : (Array.isArray(sesion.ejercicios) ? sesion.ejercicios : []);
  checkboxes.forEach(cb => {
    cb.checked = sesEjIds.includes(Number(cb.value));
  });

  editandoSesionId = sesion.id;
  document.querySelector("#form-sesion button").textContent = "Actualizar Sesión";
}

// Submit para crear/editar sesión
document.getElementById("form-sesion").addEventListener("submit", (event) => {
  event.preventDefault();
  const titulo = document.getElementById("titulo-sesion").value.trim();
  const clienteId = Number(document.getElementById("cliente-sesion").value);

  const ejerciciosIds = Array.from(document.querySelectorAll("#ejercicios-sesion input:checked"))
    .map(cb => Number(cb.value));

  if (!titulo || !clienteId || ejerciciosIds.length === 0) return;

  if (editandoSesionId) {
    actualizarSesion(editandoSesionId, titulo, clienteId, ejerciciosIds);
    editandoSesionId = null;
    document.querySelector("#form-sesion button").textContent = "Agregar Sesión";
  } else {
    guardarSesion(titulo, clienteId, ejerciciosIds);
  }

  event.target.reset();
  document.querySelectorAll("#ejercicios-sesion input[type='checkbox']").forEach(cb => cb.checked = false);
});

/* -- INICIALIZACIÓN DE DATOS -- */
async function cargarEjerciciosDesdeAPI() {
  const loader = document.getElementById("loading-ejercicios");
  if (loader) loader.style.display = "block";
  try {
    const res = await fetch("https://exercisedb.p.rapidapi.com/exercises", {
      headers: {
        "X-RapidAPI-Key": "ed00eae7f7mshca4bc4bb46631f3p140c1djsn93547d7fa4ec",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
      }
    });
    if (!res.ok) throw new Error("Error al cargar ejercicios");

    const data = await res.json();
    const ejerciciosAdaptados = data.map((e, i) =>
      new Ejercicio(i + 1, e.name, e.target ? `Trabaja: ${e.target}` : "Sin descripción")
    );

    StorageService.save("ejercicios", ejerciciosAdaptados);
    renderEjercicios();
    renderEjerciciosCheckboxes();
  } catch (err) {
    console.error("No se pudo cargar la API:", err);
    if ((StorageService.load("ejercicios") || []).length === 0) {
      const ejerciciosDemo = [
        new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
        new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
      ];
      StorageService.save("ejercicios", ejerciciosDemo);
      renderEjercicios();
      renderEjerciciosCheckboxes();
    }
  } finally {
    if (loader) loader.style.display = "none";
  }
}

// Usuarios demo
if ((StorageService.load("usuarios") || []).length === 0) {
  const usuariosDemo = [
    new Usuario(1, "Ana", "admin"),
    new Usuario(2, "Luis", "entrenador"),
    new Usuario(3, "Marta", "cliente")
  ];
  StorageService.save("usuarios", usuariosDemo);
}

// Sesiones demo
if ((StorageService.load("sesiones") || []).length === 0) {
  StorageService.save("sesiones", []);
}

// 🚀 Inicialización
cargarEjerciciosDesdeAPI();
renderClientesSelect();
renderUsuarios();
renderSesiones();
