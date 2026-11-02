const Storage = {
    // Obtiene información general del almacenamiento.
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error("Error al leer almacenamiento:", error);
            return defaultValue;
        }
    },

    // Guarda información general.
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Error al guardar datos:", error);
            return false;
        }
    },

    // Elimina una clave general.
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Error al eliminar almacenamiento:", error);
        }
    },

    // Obtiene los datos del perfil que tiene la sesión activa.
    getUserData(key, defaultValue = null) {
        try {
            const userId = localStorage.getItem("ecovida_sesion");

            if (!userId) {
                return defaultValue;
            }

            const storageKey = `ecovida_datos_${userId}`;
            const userData = this.get(storageKey, {});

            return Object.prototype.hasOwnProperty.call(userData, key)
                ? userData[key]
                : defaultValue;

        } catch (error) {
            console.error("Error al leer datos del perfil:", error);
            return defaultValue;
        }
    },

    // Guarda información exclusivamente para el perfil activo.
    setUserData(key, value) {
        try {
            const userId = localStorage.getItem("ecovida_sesion");

            if (!userId) {
                console.error("No existe una sesión activa.");
                return false;
            }

            const storageKey = `ecovida_datos_${userId}`;
            const userData = this.get(storageKey, {});

            userData[key] = value;

            return this.set(storageKey, userData);

        } catch (error) {
            console.error("Error al guardar datos del perfil:", error);
            return false;
        }
    }
};
