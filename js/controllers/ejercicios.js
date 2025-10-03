import Ejercicio from "../models/Ejercicio.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoEjercicioId = null;
let filtroEjercicios = "";

export function initEjercicios() {
  const inputFiltro = document.getElementById("filtro-ejercicios");
  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroEjercicios = e.target.value.toLowerCase();
      renderEjercicios();
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

function renderEjercicios() {
  let ejercicios = StorageService.load("ejercicios", []);
  if (filtroEjercicios) {
    ejercicios = ejercicios.filter(e =>
      (e.nombre || "").toLowerCase().includes(filtroEjercicios) ||
      (e.descripcion || "").toLowerCase().includes(filtroEjercicios)
    );
  }

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
}

function guardarEjercicio(nombre, descripcion) {
  const ejercicios = StorageService.load("ejercicios", []);
  ejercicios.push(new Ejercicio(Date.now(), nombre, descripcion));
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

function actualizarEjercicio(id, nombre, descripcion) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.map(e => e.id === id ? { ...e, nombre, descripcion } : e);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

function eliminarEjercicio(id) {
  let ejercicios = StorageService.load("ejercicios", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejercicios", ejercicios);
  renderEjercicios();
}

function cargarFormularioEjercicio(ejercicio) {
  document.getElementById("nombre-ejercicio").value = ejercicio.nombre;
  document.getElementById("descripcion-ejercicio").value = ejercicio.descripcion;
  editandoEjercicioId = ejercicio.id;
  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
}

// --- API ---
async function cargarEjerciciosDesdeAPI() {
  try {
    const res = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=10", {
      headers: {
        "X-RapidAPI-Key": "TU_API_KEY_AQUI",
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
  } catch (err) {
    console.error("No se pudo cargar la API:", err);
    if ((StorageService.load("ejercicios") || []).length === 0) {
      const ejerciciosDemo = [
        new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
        new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
      ];
      StorageService.save("ejercicios", ejerciciosDemo);
      renderEjercicios();
    }
  }
}
