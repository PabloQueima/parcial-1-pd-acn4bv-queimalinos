// controllers/sesiones.js
// Gestión de sesiones de entrenamiento con selección de ejercicios, series y repeticiones

import Sesion from "../models/Sesion.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoSesionId = null;
let filtroSesiones = "";

// Filtros y paginación de ejercicios
let filtroEjercicioNombre = "";
let filtroEjercicioBodyPart = "";
let filtroEjercicioEquipment = "";
let paginaEjercicios = 1;
const ejerciciosPorPagina = 10;

/**
 * Inicializa el módulo de sesiones.
 */
export const initSesiones = async () => {
  console.group("InitSesiones");

  try {
    const inputFiltroSesiones = document.getElementById("filtro-sesiones");
    const form = document.getElementById("form-sesion");

    // Filtro de sesiones por título
    inputFiltroSesiones?.addEventListener("keyup", (e) => {
      filtroSesiones = e.target.value.toLowerCase();
      renderSesiones();
    });

    // Filtros de ejercicios
    document.getElementById("filtro-ejercicio-nombre")?.addEventListener("keyup", (e) => {
      filtroEjercicioNombre = e.target.value.toLowerCase();
      paginaEjercicios = 1;
      renderCheckboxesEjercicios();
    });

    document.getElementById("filtro-ejercicio-bodypart")?.addEventListener("change", (e) => {
      filtroEjercicioBodyPart = e.target.value;
      paginaEjercicios = 1;
      renderCheckboxesEjercicios();
    });

    document.getElementById("filtro-ejercicio-equipment")?.addEventListener("change", (e) => {
      filtroEjercicioEquipment = e.target.value;
      paginaEjercicios = 1;
      renderCheckboxesEjercicios();
    });

    // Formulario principal
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const titulo = document.getElementById("titulo-sesion").value.trim();
      const clienteId = Number(document.getElementById("cliente-sesion").value);
      if (!titulo || !clienteId) {
        alert("Debes completar el título y seleccionar un cliente.");
        return;
      }

      const ejerciciosSeleccionados = obtenerEjerciciosSeleccionados();
      if (ejerciciosSeleccionados.length === 0) {
        alert("Debes agregar al menos un ejercicio a la sesión.");
        return;
      }

      if (editandoSesionId) {
        actualizarSesion(editandoSesionId, titulo, clienteId, ejerciciosSeleccionados);
        editandoSesionId = null;
        form.querySelector("button").textContent = "Agregar Sesión";
      } else {
        guardarSesion(titulo, clienteId, ejerciciosSeleccionados);
      }

      e.target.reset();
      renderCheckboxesEjercicios();
    });

    // Asegurar estructura inicial
    if (!Array.isArray(StorageService.load("sesiones"))) {
      StorageService.save("sesiones", []);
    }

    renderClientesSelect();
    renderCheckboxesEjercicios();
    renderSesiones();

  } catch (error) {
    console.error("Error en initSesiones:", error);
  }

  console.groupEnd();
};

/* ============================================================
   CLIENTES
   ============================================================ */
const renderClientesSelect = () => {
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
};

/* ============================================================
   EJERCICIOS DISPONIBLES CON FILTROS Y PAGINACIÓN
   ============================================================ */
const renderCheckboxesEjercicios = () => {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (!contenedor) return;

  let ejercicios = StorageService.load("ejerciciosBase", []);

  // Aplicar filtros
  if (filtroEjercicioNombre)
    ejercicios = ejercicios.filter(e => e.nombre.toLowerCase().includes(filtroEjercicioNombre));
  if (filtroEjercicioBodyPart)
    ejercicios = ejercicios.filter(e => e.parteCuerpo === filtroEjercicioBodyPart);
  if (filtroEjercicioEquipment)
    ejercicios = ejercicios.filter(e => e.elemento === filtroEjercicioEquipment);

  // Paginación
  const inicio = (paginaEjercicios - 1) * ejerciciosPorPagina;
  const paginados = ejercicios.slice(inicio, inicio + ejerciciosPorPagina);

  contenedor.innerHTML = "";
  paginados.forEach((e) => {
    const wrapper = document.createElement("div");
    wrapper.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `ej-${e.id}`;
    checkbox.value = e.id;

    const label = document.createElement("label");
    label.textContent = e.nombre;
    label.setAttribute("for", checkbox.id);

    const inputSeries = document.createElement("input");
    inputSeries.type = "number"; inputSeries.min = 1; inputSeries.max = 10;
    inputSeries.placeholder = "Series"; inputSeries.classList.add("series-input"); inputSeries.disabled = true;

    const inputReps = document.createElement("input");
    inputReps.type = "number"; inputReps.min = 1; inputReps.max = 50;
    inputReps.placeholder = "Reps"; inputReps.classList.add("reps-input"); inputReps.disabled = true;

    checkbox.addEventListener("change", () => {
      const enabled = checkbox.checked;
      inputSeries.disabled = !enabled;
      inputReps.disabled = !enabled;
      if (!enabled) { inputSeries.value = ""; inputReps.value = ""; }
    });

    wrapper.append(checkbox, label, inputSeries, inputReps);
    contenedor.appendChild(wrapper);
  });

  renderPaginacionEjercicios(ejercicios.length);
};

const renderPaginacionEjercicios = (total) => {
  const container = document.getElementById("paginacion-ejercicios-sesion");
  if (!container) return;

  container.innerHTML = "";
  const totalPaginas = Math.ceil(total / ejerciciosPorPagina);

  const btnPrev = document.createElement("button");
  btnPrev.textContent = "Anterior";
  btnPrev.disabled = paginaEjercicios === 1;
  btnPrev.addEventListener("click", () => { if (paginaEjercicios > 1) { paginaEjercicios--; renderCheckboxesEjercicios(); } });

  const btnNext = document.createElement("button");
  btnNext.textContent = "Siguiente";
  btnNext.disabled = paginaEjercicios >= totalPaginas;
  btnNext.addEventListener("click", () => { if (paginaEjercicios < totalPaginas) { paginaEjercicios++; renderCheckboxesEjercicios(); } });

  const span = document.createElement("span");
  span.textContent = ` Página ${paginaEjercicios} de ${totalPaginas} `;

  container.append(btnPrev, span, btnNext);
};

/**
 * Devuelve un array con los ejercicios seleccionados,
 * incluyendo series y repeticiones.
 */
const obtenerEjerciciosSeleccionados = () => {
  const seleccionados = [];
  document.querySelectorAll("#ejercicios-sesion .checkbox-item").forEach((item) => {
    const checkbox = item.querySelector("input[type='checkbox']");
    const series = item.querySelector(".series-input").value;
    const reps = item.querySelector(".reps-input").value;

    if (checkbox.checked) {
      seleccionados.push({
        id: Number(checkbox.value),
        series: Number(series) || 0,
        reps: Number(reps) || 0,
      });
    }
  });
  return seleccionados;
};

/* ============================================================
   SESIONES
   ============================================================ */
const renderSesiones = () => {
  let sesiones = StorageService.load("sesiones", []);
  if (filtroSesiones) {
    sesiones = sesiones.filter(s => (s.titulo || "").toLowerCase().includes(filtroSesiones));
  }

  const usuarios = StorageService.load("usuarios", []);
  const ejerciciosBase = StorageService.load("ejerciciosBase", []);

  DOMUtils.renderList("lista-sesiones", sesiones, (s) => {
    const li = document.createElement("li");
    li.className = "card";

    const cliente = usuarios.find(u => u.id === s.clienteId);
    const titulo = document.createElement("h3");
    titulo.textContent = s.titulo;

    const clienteP = document.createElement("p");
    clienteP.textContent = `Cliente: ${cliente ? cliente.nombre : "Desconocido"}`;

    const ejerciciosP = document.createElement("div");
    ejerciciosP.className = "ejercicios-lista";

    if (Array.isArray(s.ejercicios) && s.ejercicios.length > 0) {
      const ul = document.createElement("ul");
      s.ejercicios.forEach(e => {
        const ejercicio = ejerciciosBase.find(ex => ex.id === e.id);
        const liEj = document.createElement("li");
        liEj.textContent = `${ejercicio ? ejercicio.nombre : "Ejercicio desconocido"} - ${e.series}x${e.reps}`;
        ul.appendChild(liEj);
      });
      ejerciciosP.appendChild(ul);
    } else {
      ejerciciosP.textContent = "Sin ejercicios asignados.";
    }

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => cargarFormularioSesion(s));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", async () => {
      const confirmado = await confirmarAccion(`¿Eliminar la sesión "${s.titulo}"?`);
      if (confirmado) eliminarSesion(s.id);
    });

    acciones.append(btnEdit, btnDelete);
    li.append(titulo, clienteP, ejerciciosP, acciones);
    return li;
  });
};

/* ============================================================
   CRUD SESIONES
   ============================================================ */
const guardarSesion = (titulo, clienteId, ejercicios) => {
  const sesiones = StorageService.load("sesiones", []);
  const nuevaSesion = new Sesion(Date.now(), titulo, null, clienteId);
  nuevaSesion.ejercicios = ejercicios;
  StorageService.save("sesiones", [...sesiones, nuevaSesion]);
  renderSesiones();
};

const actualizarSesion = (id, titulo, clienteId, ejercicios) => {
  const sesiones = StorageService.load("sesiones", []).map(s =>
    s.id === id ? { ...s, titulo, clienteId, ejercicios } : s
  );
  StorageService.save("sesiones", sesiones);
  renderSesiones();
};

const eliminarSesion = (id) => {
  const sesiones = StorageService.load("sesiones", []).filter(s => s.id !== id);
  StorageService.save("sesiones", sesiones);
  renderSesiones();
};

/* ============================================================
   FORMULARIO DE EDICIÓN
   ============================================================ */
const cargarFormularioSesion = (sesion) => {
  document.getElementById("titulo-sesion").value = sesion.titulo;
  document.getElementById("cliente-sesion").value = sesion.clienteId;
  editandoSesionId = sesion.id;
  document.querySelector("#form-sesion button").textContent = "Actualizar Sesión";

  // Marcar ejercicios actuales
  renderCheckboxesEjercicios();
  if (Array.isArray(sesion.ejercicios)) {
    sesion.ejercicios.forEach((e) => {
      const checkbox = document.querySelector(`#ej-${e.id}`);
      const inputSeries = checkbox?.parentElement.querySelector(".series-input");
      const inputReps = checkbox?.parentElement.querySelector(".reps-input");
      if (checkbox) {
        checkbox.checked = true;
        if (inputSeries) { inputSeries.disabled = false; inputSeries.value = e.series; }
        if (inputReps) { inputReps.disabled = false; inputReps.value = e.reps; }
      }
    });
  }
};

/* ============================================================
   CONFIRMACIÓN ASÍNCRONA
   ============================================================ */
const confirmarAccion = (mensaje) => {
  return new Promise((resolve) => {
    const confirmado = confirm(mensaje);
    resolve(confirmado);
  });
};
