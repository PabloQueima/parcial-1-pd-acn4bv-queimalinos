import Ejercicio from "../models/Ejercicio.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoEjercicioId = null;
let filtroNombre = "";
let filtroBodyPart = "";
let filtroEquipment = "";
let paginaActual = 1;
const ejerciciosPorPagina = 10;

export function initEjercicios() {
  const inputFiltro = document.getElementById("filtro-ejercicios");
  const selectBodyPart = document.getElementById("filtro-bodypart");
  const selectEquipment = document.getElementById("filtro-equipment");

  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroNombre = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      cargarEjerciciosDesdeAPI();
    });
  }

  if (selectBodyPart) {
    selectBodyPart.addEventListener("change", (e) => {
      filtroBodyPart = e.target.value;
      paginaActual = 1;
      cargarEjerciciosDesdeAPI();
    });
  }

  if (selectEquipment) {
    selectEquipment.addEventListener("change", (e) => {
      filtroEquipment = e.target.value;
      paginaActual = 1;
      cargarEjerciciosDesdeAPI();
    });
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

  cargarEjerciciosDesdeAPI();
}

async function cargarEjerciciosDesdeAPI() {
  const loading = document.getElementById("loading-ejercicios");
  loading.style.display = "block";

  try {
    let url = "";

    // Determinar endpoint según los filtros activos
    if (filtroNombre) {
      url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(filtroNombre)}?limit=${ejerciciosPorPagina}&offset=${(paginaActual - 1) * ejerciciosPorPagina}`;
    } else if (filtroBodyPart) {
      url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(filtroBodyPart)}?limit=${ejerciciosPorPagina}&offset=${(paginaActual - 1) * ejerciciosPorPagina}`;
    } else if (filtroEquipment) {
      url = `https://exercisedb.p.rapidapi.com/exercises/equipment/${encodeURIComponent(filtroEquipment)}?limit=${ejerciciosPorPagina}&offset=${(paginaActual - 1) * ejerciciosPorPagina}`;
    } else {
      url = `https://exercisedb.p.rapidapi.com/exercises?limit=${ejerciciosPorPagina}&offset=${(paginaActual - 1) * ejerciciosPorPagina}`;
    }

    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": "ed00eae7f7mshca4bc4bb46631f3p140c1djsn93547d7fa4ec",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
      }
    });

    if (!res.ok) throw new Error("Error al cargar ejercicios");

    const data = await res.json();

    const ejerciciosAdaptados = data.map(
      (e, i) =>
        new Ejercicio(
          i + 1 + (paginaActual - 1) * ejerciciosPorPagina,
          e.name,
          e.bodyPart ? `Trabaja: ${e.bodyPart} (${e.equipment || "sin equipo"})` : "Sin descripción"
        )
    );

    StorageService.save("ejercicios", ejerciciosAdaptados);
    renderEjercicios(ejerciciosAdaptados);

  } catch (err) {
    console.error("No se pudo cargar la API:", err);
    const ejerciciosLocales = StorageService.load("ejercicios", []);
    if (ejerciciosLocales.length) {
      renderEjercicios(ejerciciosLocales);
    } else {
      const ejerciciosDemo = [
        new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
        new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
      ];
      StorageService.save("ejercicios", ejerciciosDemo);
      renderEjercicios(ejerciciosDemo);
    }
  } finally {
    loading.style.display = "none";
  }
}

function renderEjercicios(ejercicios) {
  DOMUtils.renderList("lista-ejercicios", ejercicios, (e) => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} - ${e.descripcion}`;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => cargarFormularioEjercicio(e));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => {
      if (confirm(`¿Eliminar el ejercicio "${e.nombre}"?`)) eliminarEjercicio(e.id);
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    return li;
  });

  renderPaginacion();
}

function renderPaginacion() {
  const container = document.getElementById("paginacion-ejercicios");
  container.innerHTML = "";

  const btnPrev = document.createElement("button");
  btnPrev.textContent = "Anterior";
  btnPrev.disabled = paginaActual === 1;
  btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarEjerciciosDesdeAPI();
    }
  });

  const btnNext = document.createElement("button");
  btnNext.textContent = "Siguiente";
  btnNext.addEventListener("click", () => {
    paginaActual++;
    cargarEjerciciosDesdeAPI();
  });

  const span = document.createElement("span");
  span.textContent = ` Página ${paginaActual} `;

  container.appendChild(btnPrev);
  container.appendChild(span);
  container.appendChild(btnNext);
}

// CRUD local
function guardarEjercicio(nombre, descripcion) {
  const ejercicios = StorageService.load("ejercicios", []);
  ejercicios.push(new Ejercicio(Date.now(), nombre, descripcion));
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios(ejercicios);
}

function actualizarEjercicio(id, nombre, descripcion) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.map(e => e.id === id ? { ...e, nombre, descripcion } : e);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios(ejercicios);
}

function eliminarEjercicio(id) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios(ejercicios);
}

function cargarFormularioEjercicio(ejercicio) {
  document.getElementById("nombre-ejercicio").value = ejercicio.nombre;
  document.getElementById("descripcion-ejercicio").value = ejercicio.descripcion;
  editandoEjercicioId = ejercicio.id;
  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
}
