// controllers/sesiones.js
// Gestión de sesiones de entrenamiento con selección de ejercicios, series y repeticiones

import Sesion from "../models/Sesion.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoSesionId = null;
let filtroSesiones = "";

// Filtros de ejercicios
let filtroEjercicioNombre = "";
let filtroEjercicioBodyPart = "";
let filtroEjercicioEquipment = "";

// Ejercicios seleccionados para la sesión (persisten aunque se cambie el filtro)
let ejerciciosSeleccionados = [];

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
      renderListaEjercicios();
    });

    document.getElementById("filtro-ejercicio-bodypart")?.addEventListener("change", (e) => {
      filtroEjercicioBodyPart = e.target.value;
      renderListaEjercicios();
    });

    document.getElementById("filtro-ejercicio-equipment")?.addEventListener("change", (e) => {
      filtroEjercicioEquipment = e.target.value;
      renderListaEjercicios();
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

      ejerciciosSeleccionados = [];
      e.target.reset();
      renderListaEjercicios();
      renderEjerciciosSeleccionados();
    });

    // Asegurar estructura inicial
    if (!Array.isArray(StorageService.load("sesiones"))) {
      StorageService.save("sesiones", []);
    }

    renderClientesSelect();
    renderListaEjercicios();
    renderEjerciciosSeleccionados();
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
   LISTA DE EJERCICIOS FILTRABLE
   ============================================================ */
const renderListaEjercicios = () => {
  const contenedor = document.getElementById("ejercicios-sesion");
  if (!contenedor) return;

  let ejercicios = StorageService.load("ejerciciosBase", []);

  if (filtroEjercicioNombre)
    ejercicios = ejercicios.filter(e => e.nombre.toLowerCase().includes(filtroEjercicioNombre));
  if (filtroEjercicioBodyPart)
    ejercicios = ejercicios.filter(e => e.parteCuerpo === filtroEjercicioBodyPart);
  if (filtroEjercicioEquipment)
    ejercicios = ejercicios.filter(e => e.elemento === filtroEjercicioEquipment);

  contenedor.innerHTML = "";

  ejercicios.forEach((e) => {
    const wrapper = document.createElement("div");
    wrapper.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `ej-${e.id}`;
    checkbox.value = e.id;

    // Mantener checkeo si ya está seleccionado
    checkbox.checked = ejerciciosSeleccionados.some(sel => sel.id === e.id);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        agregarEjercicioSeleccionado(e);
      } else {
        quitarEjercicioSeleccionado(e.id);
      }
      renderEjerciciosSeleccionados();
    });

    const label = document.createElement("label");
    label.textContent = e.nombre;
    label.setAttribute("for", checkbox.id);

    wrapper.append(checkbox, label);
    contenedor.appendChild(wrapper);
  });
};

/* ============================================================
   EJERCICIOS SELECCIONADOS PARA LA SESIÓN
   ============================================================ */
const renderEjerciciosSeleccionados = () => {
  const contenedor = document.getElementById("ejercicios-seleccionados");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  if (ejerciciosSeleccionados.length === 0) {
    contenedor.textContent = "No hay ejercicios seleccionados.";
    return;
  }

  ejerciciosSeleccionados.forEach((e) => {
    const wrapper = document.createElement("div");
    wrapper.className = "seleccionado-item";

    const nombre = document.createElement("span");
    nombre.textContent = e.nombre;

    const inputSeries = document.createElement("input");
    inputSeries.type = "number";
    inputSeries.min = 1;
    inputSeries.max = 10;
    inputSeries.value = e.series || 1;
    inputSeries.className = "series-input";
    inputSeries.addEventListener("input", (ev) => {
      e.series = Number(ev.target.value) || 1;
    });

    const inputReps = document.createElement("input");
    inputReps.type = "number";
    inputReps.min = 1;
    inputReps.max = 50;
    inputReps.value = e.reps || 10;
    inputReps.className = "reps-input";
    inputReps.addEventListener("input", (ev) => {
      e.reps = Number(ev.target.value) || 10;
    });

    const btnQuitar = document.createElement("button");
    btnQuitar.textContent = "❌";
    btnQuitar.title = "Quitar ejercicio";
    btnQuitar.addEventListener("click", () => {
      quitarEjercicioSeleccionado(e.id);
      renderListaEjercicios();
      renderEjerciciosSeleccionados();
    });

    wrapper.append(nombre, inputSeries, inputReps, btnQuitar);
    contenedor.appendChild(wrapper);
  });
};

/* ============================================================
   FUNCIONES DE MANEJO DE EJERCICIOS SELECCIONADOS
   ============================================================ */
const agregarEjercicioSeleccionado = (ejercicio) => {
  if (!ejerciciosSeleccionados.some(e => e.id === ejercicio.id)) {
    ejerciciosSeleccionados.push({
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      series: 1,
      reps: 10
    });
  }
};

const quitarEjercicioSeleccionado = (id) => {
  ejerciciosSeleccionados = ejerciciosSeleccionados.filter(e => e.id !== id);
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

  ejerciciosSeleccionados = sesion.ejercicios.map(e => {
    const ejercicioBase = StorageService.load("ejerciciosBase", []).find(ex => ex.id === e.id);
    return {
      id: e.id,
      nombre: ejercicioBase ? ejercicioBase.nombre : "Ejercicio desconocido",
      series: e.series,
      reps: e.reps
    };
  });

  renderListaEjercicios();
  renderEjerciciosSeleccionados();
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
