// controllers/ejercicios.js
// Gestión del catálogo de ejercicios de la Plataforma de Entrenamiento

import Ejercicio from "../models/Ejercicio.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoEjercicioId = null;
let filtroNombre = "";
let filtroBodyPart = "";
let filtroEquipment = "";
let paginaActual = 1;
const ejerciciosPorPagina = 10;

// URL del JSON remoto (catálogo base)
const JSON_URL = "https://jsonblob.com/api/jsonBlob/1424456914355544064";

/**
 * Inicializa el módulo de ejercicios.
 * Configura eventos, carga datos y renderiza lista inicial.
 */
export const initEjercicios = async () => {
  console.group("InitEjercicios");

  try {
    const inputFiltro = document.getElementById("filtro-ejercicios");
    const selectBodyPart = document.getElementById("filtro-bodypart");
    const selectEquipment = document.getElementById("filtro-equipment");
    const btnActualizar = document.getElementById("btn-actualizar-api");
    const formEjercicio = document.getElementById("form-ejercicio");

    // --- Filtros dinámicos ---
    inputFiltro?.addEventListener("keyup", (e) => {
      filtroNombre = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });

    selectBodyPart?.addEventListener("change", (e) => {
      filtroBodyPart = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });

    selectEquipment?.addEventListener("change", (e) => {
      filtroEquipment = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });

    // --- Botón para recargar desde API ---
    btnActualizar?.addEventListener("click", async () => {
      const confirmado = await confirmarAccion("¿Deseas actualizar el catálogo de ejercicios desde el JSON remoto?");
      if (confirmado) {
        await cargarEjerciciosDesdeJSON();
        renderEjerciciosFiltrados();
      }
    });

    // --- Formulario (crear/editar) ---
    formEjercicio?.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre-ejercicio").value.trim();
      const descripcion = document.getElementById("descripcion-ejercicio").value.trim();
      const parteCuerpo = document.getElementById("partecuerpo-ejercicio").value.trim();
      const elemento = document.getElementById("elemento-ejercicio").value.trim();

      if (!nombre || !descripcion) {
        alert("Debe completar todos los campos.");
        return;
      }

      if (editandoEjercicioId) {
        actualizarEjercicio(editandoEjercicioId, nombre, descripcion, parteCuerpo, elemento);
        editandoEjercicioId = null;
        e.target.querySelector("button").textContent = "Agregar Ejercicio";
      } else {
        guardarEjercicio(nombre, descripcion, parteCuerpo, elemento);
      }
      e.target.reset();
    });

    await inicializarCatalogo();
    console.groupEnd();

  } catch (error) {
    console.error("Error en initEjercicios:", error);
    alert("No se pudo inicializar el módulo de ejercicios.");
  }
};

/**
 * Inicializa el catálogo local; si está vacío, lo carga desde JSON remoto.
 */
const inicializarCatalogo = async () => {
  const ejerciciosLocales = StorageService.load("ejerciciosBase", []);
  if (!ejerciciosLocales.length) await cargarEjerciciosDesdeJSON();
  renderEjerciciosFiltrados();
};

/**
 * Carga los ejercicios desde un JSON remoto.
 * Guarda la información en localStorage en formato JSON.
 */
const cargarEjerciciosDesdeJSON = async () => {
  const loading = document.getElementById("loading-ejercicios");
  if (loading) loading.style.display = "block";

  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("El JSON remoto no tiene formato de lista");

    const adaptados = data.map((e, i) =>
      new Ejercicio(
        i + 1,
        e.nombre,
        e.descripcion || `Ejercicio para ${e.parteCuerpo || "parte del cuerpo"}`,
        e.parteCuerpo?.toLowerCase() || "",
        e.elemento?.toLowerCase() || ""
      )
    );

    StorageService.save("ejerciciosBase", adaptados);
    StorageService.save("ejercicios", adaptados);
    console.info(`✅ Catálogo sincronizado (${adaptados.length} ejercicios).`);
  } catch (err) {
    console.error("❌ Error al sincronizar JSON remoto:", err);
    alert("No se pudieron cargar los ejercicios desde el JSON remoto.");
  } finally {
    if (loading) loading.style.display = "none";
  }
};

/**
 * Aplica los filtros activos y renderiza el listado visible.
 */
const renderEjerciciosFiltrados = () => {
  const ejercicios = StorageService.load("ejerciciosBase", []);
  let filtrados = [...ejercicios];

  if (filtroNombre)
    filtrados = filtrados.filter(e => e.nombre.toLowerCase().includes(filtroNombre));

  if (filtroBodyPart)
    filtrados = filtrados.filter(e => e.parteCuerpo === filtroBodyPart);

  if (filtroEquipment)
    filtrados = filtrados.filter(e => e.elemento === filtroEquipment);

  const inicio = (paginaActual - 1) * ejerciciosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + ejerciciosPorPagina);

  renderEjercicios(paginados, filtrados.length);
};

/**
 * Renderiza la lista de ejercicios en el DOM.
 */
const renderEjercicios = (ejercicios, totalFiltrados) => {
  DOMUtils.renderList("lista-ejercicios", ejercicios, (e) => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} - ${e.descripcion}`;

    // Botón editar
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.classList.add("edit");
    btnEdit.addEventListener("click", () => cargarFormularioEjercicio(e));

    // Botón eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.classList.add("delete");
    btnDelete.addEventListener("click", async () => {
      const confirmado = await confirmarAccion(`¿Eliminar el ejercicio "${e.nombre}"?`);
      if (confirmado) eliminarEjercicio(e.id);
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });

  renderPaginacion(totalFiltrados);

  // Dispara evento global personalizado
  const event = new CustomEvent("ejerciciosActualizados", { detail: { ejercicios } });
  window.dispatchEvent(event);
};

/**
 * Renderiza la paginación del listado.
 */
const renderPaginacion = (total) => {
  const container = document.getElementById("paginacion-ejercicios");
  if (!container) return;

  container.innerHTML = "";
  const totalPaginas = Math.ceil(total / ejerciciosPorPagina);

  const btnPrev = document.createElement("button");
  btnPrev.textContent = "Anterior";
  btnPrev.disabled = paginaActual === 1;
  btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderEjerciciosFiltrados();
    }
  });

  const btnNext = document.createElement("button");
  btnNext.textContent = "Siguiente";
  btnNext.disabled = paginaActual >= totalPaginas;
  btnNext.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderEjerciciosFiltrados();
    }
  });

  const span = document.createElement("span");
  span.textContent = ` Página ${paginaActual} de ${totalPaginas} `;

  container.append(btnPrev, span, btnNext);
};

/**
 * CRUD local: guardar / actualizar / eliminar ejercicios
 */
const guardarEjercicio = (nombre, descripcion, parteCuerpo, elemento) => {
  const ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios.push(new Ejercicio(Date.now(), nombre, descripcion, parteCuerpo, elemento));
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
};

const actualizarEjercicio = (id, nombre, descripcion, parteCuerpo, elemento) => {
  let ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios = ejercicios.map(e => e.id === id ? { ...e, nombre, descripcion, parteCuerpo, elemento } : e);
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
};

const eliminarEjercicio = (id) => {
  let ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
};

/**
 * Carga los datos de un ejercicio en el formulario para edición.
 */
const cargarFormularioEjercicio = (e) => {
  document.getElementById("nombre-ejercicio").value = e.nombre;
  document.getElementById("descripcion-ejercicio").value = e.descripcion;
  document.getElementById("partecuerpo-ejercicio").value = e.parteCuerpo;
  document.getElementById("elemento-ejercicio").value = e.elemento;
  editandoEjercicioId = e.id;
  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
};

/**
 * Confirmación asíncrona genérica (callback + promesa)
 */
const confirmarAccion = (mensaje) => {
  return new Promise((resolve) => {
    const confirmado = confirm(mensaje);
    resolve(confirmado);
  });
};
