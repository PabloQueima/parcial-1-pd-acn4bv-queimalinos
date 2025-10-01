// Punto de entrada
console.log("Plataforma de Entrenamiento iniciada");

import Usuario from "./models/Usuario.js";
import Ejercicio from "./models/Ejercicio.js";
import Sesion from "./models/Sesion.js";

const admin = new Usuario(1, "Pablo", "admin");
const entrenador = new Usuario(2, "Luis", "entrenador");
const cliente = new Usuario(3, "Marta", "cliente");

console.log(admin.descripcion());
console.log(entrenador.descripcion());
console.log(cliente.descripcion());

const sentadillas = new Ejercicio(1, "Sentadillas", "Ejercicio de piernas", "sentadillas.png");
const flexiones = new Ejercicio(2, "Flexiones", "Ejercicio de pecho", "flexiones.png");

const sesion1 = new Sesion(1, "Rutina inicial", entrenador.id, cliente.id);
sesion1.agregarEjercicio(sentadillas);
sesion1.agregarEjercicio(flexiones);

console.log("Sesión:", sesion1.titulo);
console.log("Ejercicios:", sesion1.listarEjercicios());
