// Almacenamiento en localStorage
const StorageService = {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  load(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (error) {
      console.error("Error al cargar de localStorage:", error);
      return fallback;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

export { StorageService };
