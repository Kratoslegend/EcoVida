const Usuarios = {
    obtenerPerfil() {
        return Storage.get("ecovida_usuario");
    },

    crearPerfil(nombre, correo) {
        const perfil = {
            id: Date.now(),
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            fechaRegistro: new Date().toISOString()
        };

        const guardado = Storage.set("ecovida_usuario", perfil);

        return guardado ? perfil : null;
    }
};
