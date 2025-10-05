import Sesion from "../models/Sesion.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoSesionId = null;
let filtroSesiones = "";

export function initSesiones() {
  const inputFiltro = document.getElementById("filtro-sesiones");
  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroSesiones = e.target.value.toLowerCase();
      renderSesiones();
    });
  }

  const form = document.getElementById("form-sesion");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const titulo = document.getElementById("titulo-sesion").value.trim();
      const clienteId = Number(document.getElementById("cliente-sesion").value);
      if (!titulo || !clienteId) return;

      const ejerciciosSeleccionados = obtenerEjerciciosSeleccionados();
      if (ejerciciosSeleccionados.length === 0) {
        alert("Debe seleccionar al menos un ejercicio con sus series y repeticiones.");
        return;
      }

      if (editandoSesionId) {
        actualizarSesion(editandoSesionId, titulo, clienteId, ejerciciosSeleccionados);
        editandoSesionId = null;
        document.querySelector("#form-sesion button").textContent = "Agregar Sesión";
      } else {
        guardarSesion(titulo, clienteId, ejerciciosSeleccionados);
      }

      event.target.reset();
      renderEjerciciosCheckboxes(); // reset visual
    });
  }

  if ((StorageService.load("sesiones") || []).length === 0) {
    StorageService.save("sesiones", []);
  }

  renderClientesSelect();
  renderEjerciciosCheckboxes();
  renderSesiones();
}

/* --- RENDER CLIENTES --- */
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

/* --- RENDER EJERCICIOS PARA SELECCIONAR --- */
function renderEjerciciosCheckboxes() {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (!contenedor) return;

  const ejercicios = StorageService.load("ejercicios", []);
  contenedor.innerHTML = "";

  ejercicios.forEach(e => {
    const row = document.createElement("div");
    row.className = "ejercicio-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = e.id;

    const label = document.createElement("label");
    label.textContent = e.nombre;

    const inputSeries = document.createElement("input");
    inputSeries.type = "number";
    inputSeries.min = 1;
    inputSeries.placeholder = "Series";
    inputSeries.className = "input-mini";

    const inputReps = document.createElement("input");
    inputReps.type = "number";
    inputReps.min = 1;
    inputReps.placeholder = "Reps";
    inputReps.className = "input-mini";

    row.appendChild(checkbox);
    row.appendChild(label);
    row.appendChild(inputSeries);
    row.appendChild(inputReps);
    contenedor.appendChild(row);
  });
}

/* --- OBTENER EJERCICIOS SELECCIONADOS --- */
function obtenerEjerciciosSeleccionados() {
  const rows = document.querySelectorAll("#ejercicios-sesion .ejercicio-item");
  const seleccionados = [];

  rows.forEach(row => {
    const cb = row.querySelector("input[type='checkbox']");
    if (cb.checked) {
      const series = Number(row.querySelector("input[placeholder='Series']").value);
      const reps = Number(row.querySelector("input[placeholder='Reps']").value);
      if (series > 0 && reps > 0) {
        const ejercicios = StorageService.load("ejercicios", []);
        const ejercicio = ejercicios.find(e => e.id === Number(cb.value));
        if (ejercicio) {
          seleccionados.push({
            ejercicioId: ejercicio.id,
            nombre: ejercicio.nombre,
            series,
            repeticiones: reps
          });
        }
      }
    }
  });

  return seleccionados;
}

/* --- RENDER SESIONES --- */
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

    const listaEj = document.createElement("ul");
    listaEj.className = "ejercicios-lista";
    (s.ejerciciosAsignados || []).forEach(e => {
      const liEj = document.createElement("li");
      liEj.textContent = `${e.nombre} - ${e.series}x${e.repeticiones}`;
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
function guardarSesion(titulo, clienteId, ejerciciosAsignados) {
  const sesiones = StorageService.load("sesiones", []);
  const nuevaSesion = new Sesion(Date.now(), titulo, null, clienteId);
  nuevaSesion.ejerciciosAsignados = ejerciciosAsignados;
  sesiones.push(nuevaSesion);
  StorageService.save("sesiones", sesiones);
  renderSesiones();
}

function actualizarSesion(id, titulo, clienteId, ejerciciosAsignados) {
  let sesiones = StorageService.load("sesiones", []);
  sesiones = sesiones.map(s =>
    s.id === id ? { ...s, titulo, clienteId, ejerciciosAsignados } : s
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

  renderEjerciciosCheckboxes();

  const rows = document.querySelectorAll("#ejercicios-sesion .ejercicio-item");
  rows.forEach(row => {
    const cb = row.querySelector("input[type='checkbox']");
    const sesEj = sesion.ejerciciosAsignados?.find(e => e.ejercicioId === Number(cb.value));
    if (sesEj) {
      cb.checked = true;
      row.querySelector("input[placeholder='Series']").value = sesEj.series;
      row.querySelector("input[placeholder='Reps']").value = sesEj.repeticiones;
    }
  });
}
