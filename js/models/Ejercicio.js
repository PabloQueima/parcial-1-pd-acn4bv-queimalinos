// Clase Ejercicio
export default class Ejercicio {
  constructor(id, nombre, descripcion, imagen = "") {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.imagen = imagen;
  }

  info() {
    return `${this.nombre}: ${this.descripcion}`;
  }
}
