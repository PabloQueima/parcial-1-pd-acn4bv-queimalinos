// Punto de entrada
console.log("Plataforma de Entrenamiento iniciada");

import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";
import { DOMUtils } from "./ui/dom.js";

// --- Datos de prueba ---
const usuarios = [
  new Usuario(1, "Ana", "admin"),
  new Usuario(2, "Luis", "entrenador"),
  new Usuario(3, "Marta", "cliente")
];

const ejercicios = [
  new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
  new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
];

// Guardamos en localStorage
StorageService.save("usuarios", usuarios);
StorageService.save("ejercicios", ejercicios);

// Recuperamos
const usuariosGuardados = StorageService.load("usuarios");
const ejerciciosGuardados = StorageService.load("ejercicios");

// Mostramos en el DOM
DOMUtils.renderList("lista-usuarios", usuariosGuardados, u => `${u.nombre} (${u.rol})`);
DOMUtils.renderList("lista-ejercicios", ejerciciosGuardados, e => `${e.nombre} - ${e.descripcion}`);
