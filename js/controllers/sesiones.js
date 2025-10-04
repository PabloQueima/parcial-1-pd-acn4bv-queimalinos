import Sesion from "../models/Sesion.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoSesionId = null;
let filtroSesiones = "";

export function initSesiones() {
  // --- Filtro ---
  const inputFiltro = document.getElementById("filtro-sesiones");
  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroSesiones = e.target.value.toLowerCase();
      renderSesiones();
    });
  }

  // --- Formulario ---
  const form = document.getElementById("form-sesion");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const titulo = document.getElementById("titulo-sesion").value.trim();
      const clienteId = Number(document.getElementById("cliente-sesion").value);

      if (!titulo || !clienteId) return;

      if (editandoSesionId) {
        actualizarSesion(editandoSesionId, titulo, clienteId);
        editandoSesionId = null;
        document.querySelector("#form-sesion button").textContent = "Agregar Sesión";
      } else {
        guardarSesion(titulo, clienteId);
      }

      event.target.reset();
    });
  }

  // --- Inicialización ---
  if ((StorageService.load("sesiones") || []).length === 0) {
    StorageService.save("sesiones", []);
  }

  renderClientesSelect();
  renderSesiones();
}

/* --- RENDER --- */
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

function renderSesiones() {
  let sesiones = StorageService.load("sesiones", []);
  if (filtroSesiones) {
    sesiones = sesiones.filter(s => (s.titulo || "").toLowerCase().includes(filtroSesiones));
  }

  const usuarios = StorageService.load("usuarios", []);

  DOMUtils.renderList("lista-sesiones", sesiones, (s) => {
    const li = document.createElement("li");
    li.className = "card";

    const cliente = usuarios.find(u => u.id === s.clienteId);

    const titulo = document.createElement("h3");
    titulo.textContent = s.titulo;

    const clienteP = document.createElement("p");
    clienteP.textContent = `Cliente: ${cliente ? cliente.nombre : "Desconocido"}`;

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => cargarFormularioSesion(s));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar la sesión "${s.titulo}"?`)) eliminarSesion(s.id);
    });

    acciones.appendChild(btnEdit);
    acciones.appendChild(btnDelete);

    li.appendChild(titulo);
    li.appendChild(clienteP);
    li.appendChild(acciones);

    return li;
  });
}

/* --- CRUD --- */
function guardarSesion(titulo, clienteId) {
  const sesiones = StorageService.load("sesiones", []);
  const nuevaSesion = new Sesion(Date.now(), titulo, null, clienteId);
  sesiones.push(nuevaSesion);
  StorageService.save("sesiones", sesiones);
  renderSesiones();
}

function actualizarSesion(id, titulo, clienteId) {
  let sesiones = StorageService.load("sesiones", []);
  sesiones = sesiones.map(s =>
    s.id === id ? { ...s, titulo, clienteId } : s
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

/* --- FORMULARIO --- */
function cargarFormularioSesion(sesion) {
  document.getElementById("titulo-sesion").value = sesion.titulo;
  document.getElementById("cliente-sesion").value = sesion.clienteId;
  editandoSesionId = sesion.id;
  document.querySelector("#form-sesion button").textContent = "Actualizar Sesión";
}
