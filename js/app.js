// app.js
// Punto de entrada principal de la Plataforma de Entrenamiento

import { initUsuarios } from "./controllers/usuarios.js";
import { initEjercicios } from "./controllers/ejercicios.js";
import { initSesiones } from "./controllers/sesiones.js";

/**
 * Inicializa la aplicación completa.
 * Carga controladores y maneja errores globales.
 */
const initApp = async () => {
  console.log("Iniciando Plataforma de Entrenamiento...");

  try {
    // Esperamos que el DOM esté listo antes de iniciar módulos
    document.addEventListener("DOMContentLoaded", async () => {
      console.time("initApp");

      // Inicialización modular secuencial
      await initUsuarios();
      await initEjercicios();
      await initSesiones();

      console.timeEnd("initApp");
      console.log("Aplicación iniciada correctamente ✅");
    });

  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
    alert("Ocurrió un error al cargar la aplicación. Revisa la consola.");
  }
};

/**
 * Limpieza global (ejemplo de callback de confirmación)
 */
window.addEventListener("beforeunload", (e) => {
  const confirmMessage = "¿Seguro que querés salir? Los cambios no guardados se perderán.";
  e.preventDefault();
  e.returnValue = confirmMessage;
  return confirmMessage;
});

initApp();
