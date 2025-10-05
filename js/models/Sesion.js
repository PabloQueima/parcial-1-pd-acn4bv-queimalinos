// Clase Sesion de entrenamiento
export default class Sesion {
  constructor(id, titulo, entrenadorId, clienteId, ejerciciosAsignados = []) {
    this.id = id;
    this.titulo = titulo;
    this.entrenadorId = entrenadorId;
    this.clienteId = clienteId;
    this.ejerciciosAsignados = ejerciciosAsignados;
  }

  agregarEjercicio(ejercicioId, nombre, series, repeticiones) {
    this.ejerciciosAsignados.push({ ejercicioId, nombre, series, repeticiones });
  }

  listarEjercicios() {
    return this.ejerciciosAsignados.map(
      e => `${e.nombre} - ${e.series}x${e.repeticiones}`
    );
  }
}
