// Punto de entrada
console.log("Plataforma de Entrenamiento iniciada");

import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";
import { StorageService } from "./services/storage.js";

const admin = new Usuario(1, "Ana", "admin");
const entrenador = new Usuario(2, "Luis", "entrenador");
const cliente = new Usuario(3, "Marta", "cliente");

const usuarios = [admin, entrenador, cliente];

// Guardar usuarios
StorageService.save("usuarios", usuarios);

// Recuperar usuarios
const usuariosGuardados = StorageService.load("usuarios");
console.log("Usuarios guardados:", usuariosGuardados);

// Ejercicios
const ejercicios = [
  new Ejercicio(1, "Sentadillas", "Ejercicio de piernas"),
  new Ejercicio(2, "Flexiones", "Ejercicio de pecho")
];

StorageService.save("ejercicios", ejercicios);
console.log("Ejercicios guardados:", StorageService.load("ejercicios"));
