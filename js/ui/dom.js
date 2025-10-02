// Funciones para interactuar con el DOM
export const DOMUtils = {
  renderList(elementId, items, rendererFn) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";

    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = rendererFn(item);
      container.appendChild(li);
    });
  }
};