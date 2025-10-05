// models/Ejercicio.js
// Representa un ejercicio físico dentro del catálogo

export default class Ejercicio {
  /**
   * @param {number} id - Identificador único
   * @param {string} nombre - Nombre del ejercicio
   * @param {string} descripcion - Descripción o indicaciones
   * @param {string} parteCuerpo - Parte del cuerpo involucrada
   * @param {string} elemento - Elemento o equipamiento necesario
   */
  constructor(id, nombre, descripcion, parteCuerpo = "", elemento = "") {
    this.id = Number(id);
    this.nombre = String(nombre || "").trim();
    this.descripcion = String(descripcion || "").trim();
    this.parteCuerpo = parteCuerpo?.toLowerCase() || "";
    this.elemento = elemento?.toLowerCase() || "";
  }

  /** Devuelve un texto descriptivo legible. */
  resumen() {
    return `${this.nombre} (${this.parteCuerpo || "general"}) - ${this.elemento || "sin equipo"}`;
  }

  /** Serializa la instancia a JSON plano. */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      parteCuerpo: this.parteCuerpo,
      elemento: this.elemento
    };
  }

  /** Crea una instancia desde un objeto JSON almacenado. */
  static fromJSON(obj) {
    if (!obj) return null;
    const { id, nombre, descripcion, parteCuerpo, elemento } = obj;
    return new Ejercicio(id, nombre, descripcion, parteCuerpo, elemento);
  }
}
