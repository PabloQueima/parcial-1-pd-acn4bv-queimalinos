# parcial-1-pd-acn4bv-queimalinos
Proyecto de Plataformas de Desarrollo - Pablo Queimaliños - ACN4BV - Da vinci.

# Plataforma de Entrenamiento
Aplicación web para la gestión de usuarios, ejercicios y sesiones de entrenamiento.  

---
## Funcionalidades

- **Gestión de Usuarios**: alta, baja y modificación de clientes, entrenadores y administradores.
- **Gestión de Ejercicios**:
  - CRUD completo.
  - Consumo de la API pública **ExerciseDB**.
  - Carga inicial de datos demo en caso de error de conexión.
- **Gestión de Sesiones de Entrenamiento**:
  - Crear sesiones para clientes seleccionando ejercicios.
  - Editar y eliminar sesiones.
  - Visualizar en tarjetas con detalle de cliente y ejercicios asignados.
- **Filtros y búsqueda**: en usuarios, ejercicios y sesiones.

---
## Diseño

- Paleta de colores:
  - Celeste: `#05A3CB`
  - Lila: `#BB81B6`
  - Azul oscuro: `#15114D`
  - Azul intermedio: `#0C3264`
  - Blanco: `#FFFFFF`

- Diseño responsive, minimalista y moderno.
- Secciones en tarjetas con sombras y bordes redondeados.
- Logo e imagen en el encabezado.

---
## Tecnologías

- **HTML, CSS, JS**
- **LocalStorage** para persistencia.
- **ExerciseDB API** para carga de ejercicios.
- Arquitectura modular:
  - `/models` → Clases `Usuario`, `Ejercicio`, `Sesion`.
  - `/services` → `StorageService`.
  - `/ui` → `DOMUtils`.

---
## Instalación

1. Clonar el repositorio.
2. Instalar dependencias si fuera necesario.
3. Abrir `index.html` en el navegador.

---
## Próximos pasos

- Separar tableros según perfil del usuario (admin, entrenador, cliente)
- Incorporar detalles e imágenes de los ejercicios
- Autenticación básica de usuarios.

---
