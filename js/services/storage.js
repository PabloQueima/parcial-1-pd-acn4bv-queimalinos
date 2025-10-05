// services/storage.js
// Servicio centralizado para manejo de almacenamiento local seguro y estructurado

export const StorageService = {
  /**
   * Guarda datos en localStorage (serializados como JSON).
   * @param {string} key - Clave de almacenamiento
   * @param {any} data - Datos a guardar (objeto, array, etc.)
   */
  save(key, data) {
    try {
      const json = JSON.stringify(data, null, 2);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error(`❌ Error al guardar "${key}" en localStorage:`, error);
    }
  },

  /**
   * Carga datos desde localStorage.
   * Si se proporciona un modelClass con método fromJSON, se reconstruyen las instancias.
   * @param {string} key - Clave de almacenamiento
   * @param {Array|Object} [fallback=[]] - Valor por defecto si no existe o hay error
   * @param {Function} [modelClass] - Clase con método estático fromJSON (opcional)
   * @returns {Array|Object}
   */
  load(key, fallback = [], modelClass = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);

      if (modelClass && typeof modelClass.fromJSON === "function") {
        if (Array.isArray(parsed)) {
          return parsed.map(item => modelClass.fromJSON(item));
        } else {
          return modelClass.fromJSON(parsed);
        }
      }

      return parsed;
    } catch (error) {
      console.error(`⚠️ Error al leer "${key}" de localStorage:`, error);
      return fallback;
    }
  },

  /**
   * Elimina una clave específica.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`⚠️ Error al eliminar "${key}":`, error);
    }
  },

  /**
   * Limpia todo el almacenamiento local.
   */
  clear() {
    try {
      localStorage.clear();
      console.log("🧹 localStorage limpiado correctamente.");
    } catch (error) {
      console.error("⚠️ Error al limpiar localStorage:", error);
    }
  }
};
