## parcial-1-pd-acn4bv-queimalinos
Proyecto de Plataformas de Desarrollo – Pablo Queimaliños – ACN4BV – Da Vinci

## Plataforma de Entrenamiento
Aplicación web para la gestión de usuarios, ejercicios y sesiones de entrenamiento.

---
## Funcionalidades
Gestión de Usuarios
- Alta, baja y modificación de clientes, entrenadores y administradores.

Gestión de Ejercicios
- CRUD completo.
- Consumo de la API simulada con JSON Blob.

Gestión de Sesiones de Entrenamiento
- Crear sesiones para clientes seleccionando ejercicios.
- Editar y eliminar sesiones.
- Visualizar en tarjetas con detalle de cliente y ejercicios asignados.

Filtros y búsqueda en usuarios, ejercicios y sesiones.
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

---
## Tecnologías
HTML, CSS, JS
- LocalStorage para persistencia.
- JSON Blob para simular API para carga de ejercicios.

Arquitectura modular:
- /models → Clases Usuario, Ejercicio, Sesion.
/services → StorageService.
/ui → DOMUtils.
/controllers → Lógica de negocio separada:
usuarios.js
ejercicios.js
sesiones.js
app.js → punto de entrada que inicializa todos los controladores.

---
## Instalación
1. Clonar el repositorio.
2. Instalar dependencias si fuera necesario.
3. Abrir `index.html` en el navegador.

---
## Próximos pasos
- Autenticación básica de usuarios.
- Separar tableros según perfil del usuario (admin, entrenador, cliente)
- Incorporar imágenes de los ejercicios.
- 
---
