// Clase Sesion de entrenamiento
export default class Sesion {
  constructor(id, titulo, entrenadorId, clienteId) {
    this.id = id;
    this.titulo = titulo;
    this.entrenadorId = entrenadorId;
    this.clienteId = clienteId;
    this.ejercicios = [];
  }

  agregarEjercicio(ejercicio) {
    this.ejercicios.push(ejercicio);
  }

  listarEjercicios() {
    return this.ejercicios.map(e => e.info());
  }
}
