import Ejercicio from "../models/Ejercicio.js";
import { StorageService } from "../services/storage.js";
import { DOMUtils } from "../ui/dom.js";

let editandoEjercicioId = null;
let filtroNombre = "";
let filtroBodyPart = "";
let filtroEquipment = "";
let paginaActual = 1;
const ejerciciosPorPagina = 10;

// URL del JSON remoto
const JSON_URL = "https://jsonblob.com/api/jsonBlob/1424456914355544064";

// --- Inicialización ---
export function initEjercicios() {
  const inputFiltro = document.getElementById("filtro-ejercicios");
  const selectBodyPart = document.getElementById("filtro-bodypart");
  const selectEquipment = document.getElementById("filtro-equipment");
  const btnActualizar = document.getElementById("btn-actualizar-api");

  if (inputFiltro) {
    inputFiltro.addEventListener("keyup", (e) => {
      filtroNombre = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });
  }

  if (selectBodyPart) {
    selectBodyPart.addEventListener("change", (e) => {
      filtroBodyPart = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });
  }

  if (selectEquipment) {
    selectEquipment.addEventListener("change", (e) => {
      filtroEquipment = e.target.value.trim().toLowerCase();
      paginaActual = 1;
      renderEjerciciosFiltrados();
    });
  }

  if (btnActualizar) {
    btnActualizar.addEventListener("click", async () => {
      if (confirm("¿Deseas actualizar el catálogo de ejercicios desde el JSON remoto?")) {
        await cargarEjerciciosDesdeJSON();
        renderEjerciciosFiltrados();
      }
    });
  }

  // --- Formulario Ejercicio ---
  document.getElementById("form-ejercicio").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("nombre-ejercicio").value.trim();
    const descripcion = document.getElementById("descripcion-ejercicio").value.trim();
    const parteCuerpo = document.getElementById("partecuerpo-ejercicio").value.trim();
    const elemento = document.getElementById("elemento-ejercicio").value.trim();

    if (!nombre || !descripcion) return;

    if (editandoEjercicioId) {
      actualizarEjercicio(editandoEjercicioId, nombre, descripcion, parteCuerpo, elemento);
      editandoEjercicioId = null;
      document.querySelector("#form-ejercicio button").textContent = "Agregar Ejercicio";
    } else {
      guardarEjercicio(nombre, descripcion, parteCuerpo, elemento);
    }
    event.target.reset();
  });

  inicializarCatalogo();
}

// --- Carga inicial ---
async function inicializarCatalogo() {
  const ejerciciosLocales = StorageService.load("ejerciciosBase", []);
  if (ejerciciosLocales.length === 0) {
    await cargarEjerciciosDesdeJSON();
  }
  renderEjerciciosFiltrados();
}

// --- Carga desde JSON remoto ---
async function cargarEjerciciosDesdeJSON() {
  const loading = document.getElementById("loading-ejercicios");
  if (loading) loading.style.display = "block";

  try {
    const res = await fetch(JSON_URL, { method: "GET" });
    if (!res.ok) throw new Error(`Error al cargar JSON remoto (${res.status})`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("El JSON remoto no tiene formato de lista");

    const adaptados = data.map((e, i) => new Ejercicio(
      i + 1,
      e.nombre,
      e.descripcion || `Ejercicio para ${e.parteCuerpo}`,
      e.parteCuerpo ? e.parteCuerpo.toLowerCase() : "",
      e.elemento ? e.elemento.toLowerCase() : ""
    ));

    StorageService.save("ejerciciosBase", adaptados);
    StorageService.save("ejercicios", adaptados);
    console.log(`✅ Ejercicios cargados desde JSON: ${adaptados.length}`);
  } catch (err) {
    console.error("❌ Error al sincronizar JSON remoto:", err);
    alert("No se pudieron cargar los ejercicios desde el JSON remoto.");
  } finally {
    if (loading) loading.style.display = "none";
  }
}

// --- Filtros locales ---
function renderEjerciciosFiltrados() {
  const ejercicios = StorageService.load("ejerciciosBase", []);
  let filtrados = ejercicios;

  if (filtroNombre)
    filtrados = filtrados.filter(e => e.nombre.toLowerCase().includes(filtroNombre));

  if (filtroBodyPart)
    filtrados = filtrados.filter(e => e.parteCuerpo && e.parteCuerpo.toLowerCase() === filtroBodyPart);

  if (filtroEquipment)
    filtrados = filtrados.filter(e => e.elemento && e.elemento.toLowerCase() === filtroEquipment);

  const inicio = (paginaActual - 1) * ejerciciosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + ejerciciosPorPagina);

  renderEjercicios(paginados, filtrados.length);
}

// --- Render ---
function renderEjercicios(ejercicios, totalFiltrados) {
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

  renderPaginacion(totalFiltrados);

  const event = new CustomEvent("ejerciciosActualizados", { detail: { ejercicios } });
  window.dispatchEvent(event);
}

function renderPaginacion(total) {
  const container = document.getElementById("paginacion-ejercicios");
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

  container.appendChild(btnPrev);
  container.appendChild(span);
  container.appendChild(btnNext);
}

// --- CRUD local sobre la base ---
function guardarEjercicio(nombre, descripcion, parteCuerpo, elemento) {
  const ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios.push(new Ejercicio(Date.now(), nombre, descripcion, parteCuerpo, elemento));
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
}

function actualizarEjercicio(id, nombre, descripcion, parteCuerpo, elemento) {
  let ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios = ejercicios.map(e => e.id === id ? { ...e, nombre, descripcion, parteCuerpo, elemento } : e);
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
}

function eliminarEjercicio(id) {
  let ejercicios = StorageService.load("ejerciciosBase", []);
  ejercicios = ejercicios.filter(e => e.id !== id);
  StorageService.save("ejerciciosBase", ejercicios);
  renderEjerciciosFiltrados();
}

function cargarFormularioEjercicio(ejercicio) {
  document.getElementById("nombre-ejercicio").value = ejercicio.nombre;
  document.getElementById("descripcion-ejercicio").value = ejercicio.descripcion;
  document.getElementById("partecuerpo-ejercicio").value = ejercicio.parteCuerpo;
  document.getElementById("elemento-ejercicio").value = ejercicio.elemento;
  editandoEjercicioId = ejercicio.id;
  document.querySelector("#form-ejercicio button").textContent = "Actualizar Ejercicio";
}
