// Clase Ejercicio
export default class Ejercicio {
  constructor(id, nombre, descripcion, parteCuerpo = "", elemento = "") {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.parteCuerpo = parteCuerpo;
    this.elemento = elemento;
  }
}
