// models/Sesion.js
// Representa una sesión de entrenamiento con varios ejercicios

export default class Sesion {
  /**
   * @param {number} id - Identificador único de la sesión
   * @param {string} titulo - Título de la sesión
   * @param {Array<{id:number, series:number, reps:number}>} ejercicios - Lista de ejercicios
   * @param {number} clienteId - ID del cliente asignado
   * @param {number|null} entrenadorId - (opcional) ID del entrenador
   */
  constructor(id, titulo, ejercicios = [], clienteId, entrenadorId = null) {
    this.id = id;
    this.titulo = titulo;
    this.ejercicios = Array.isArray(ejercicios) ? ejercicios : [];
    this.clienteId = clienteId;
    this.entrenadorId = entrenadorId;
  }

  /**
   * Agrega un ejercicio a la sesión con sus series y repeticiones.
   * Si el ejercicio ya existe, lo actualiza.
   */
  agregarEjercicio(ejercicioId, series = 3, reps = 10) {
    const existente = this.ejercicios.find(e => e.id === ejercicioId);
    if (existente) {
      existente.series = series;
      existente.reps = reps;
    } else {
      this.ejercicios.push({ id: ejercicioId, series, reps });
    }
  }

  /**
   * Elimina un ejercicio de la sesión.
   */
  eliminarEjercicio(ejercicioId) {
    this.ejercicios = this.ejercicios.filter(e => e.id !== ejercicioId);
  }

  /**
   * Devuelve un listado legible de los ejercicios.
   */
  listarEjercicios(ejerciciosBase = []) {
    return this.ejercicios.map(e => {
      const ref = ejerciciosBase.find(ex => ex.id === e.id);
      const nombre = ref ? ref.nombre : `Ejercicio ${e.id}`;
      return `${nombre} - ${e.series}x${e.reps}`;
    });
  }

  /**
   * Devuelve un objeto plano listo para guardar en JSON/localStorage.
   */
  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      clienteId: this.clienteId,
      entrenadorId: this.entrenadorId,
      ejercicios: this.ejercicios.map(e => ({
        id: e.id,
        series: e.series,
        reps: e.reps
      }))
    };
  }

  /**
   * Reconstruye una instancia Sesion desde un objeto JSON almacenado.
   */
  static fromJSON(obj) {
    if (!obj) return null;
    const { id, titulo, clienteId, entrenadorId, ejercicios = [] } = obj;
    return new Sesion(id, titulo, ejercicios, clienteId, entrenadorId);
  }
}
