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
  }

  // --- Sesiones demo ---
  if ((StorageService.load("sesiones") || []).length === 0) {
    StorageService.save("sesiones", []);
  }

  renderClientesSelect();
  renderEjerciciosCheckboxes();
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
    const ejerciciosAsignados = ejercicios.filter(e => s.ejerciciosIds.includes(e.id));

    const titulo = document.createElement("h3");
    titulo.textContent = s.titulo;

    const clienteP = document.createElement("p");
    clienteP.textContent = `Cliente: ${cliente ? cliente.nombre : "Desconocido"}`;

    const listaEj = document.createElement("ul");
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
      if (confirm(`¿Eliminar la sesión "${s.titulo}"?`)) eliminarSesion(s.id);
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

/* --- CRUD --- */
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

/* --- FORMULARIO --- */
function cargarFormularioSesion(sesion) {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (contenedor && contenedor.children.length === 0) {
    renderEjerciciosCheckboxes();
  }

  document.getElementById("titulo-sesion").value = sesion.titulo;
  document.getElementById("cliente-sesion").value = sesion.clienteId;

  const checkboxes = document.querySelectorAll("#ejercicios-sesion input[type='checkbox']");
  checkboxes.forEach(cb => {
    cb.checked = sesion.ejerciciosIds.includes(Number(cb.value));
  });

  editandoSesionId = sesion.id;
  document.querySelector("#form-sesion button").textContent = "Actualizar Sesión";
}
