const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error("Error al leer almacenamiento:", error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Error al guardar datos:", error);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};
