// Clase Usuario: Admin, Entrenador o Cliente
export default class Usuario {
  constructor(id, nombre, rol) {
    this.id = id;
    this.nombre = nombre;
    this.rol = rol; 
  }

  descripcion() {
    return `${this.nombre} (${this.rol})`;
  }
}
