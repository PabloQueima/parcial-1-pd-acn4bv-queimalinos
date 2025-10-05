// models/Usuario.js
// Representa un usuario del sistema: Admin, Entrenador o Cliente

export default class Usuario {
  /**
   * @param {number} id - Identificador único
   * @param {string} nombre - Nombre del usuario
   * @param {"admin"|"entrenador"|"cliente"} rol - Rol dentro de la plataforma
   */
  constructor(id, nombre, rol) {
    this.id = Number(id);
    this.nombre = String(nombre || "").trim();
    this.rol = rol?.toLowerCase() || "cliente";
  }

  /** Devuelve una breve descripción textual. */
  descripcion() {
    return `${this.nombre} (${this.rol})`;
  }

  /** Verifica si el usuario es cliente. */
  esCliente() {
    return this.rol === "cliente";
  }

  /** Verifica si el usuario es entrenador. */
  esEntrenador() {
    return this.rol === "entrenador";
  }

  /** Devuelve un objeto plano para guardar en JSON/localStorage. */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      rol: this.rol
    };
  }

  /** Restaura una instancia desde un objeto JSON. */
  static fromJSON(obj) {
    if (!obj) return null;
    return new Usuario(obj.id, obj.nombre, obj.rol);
  }
}
