const Usuarios = {

    // Obtiene todas las cuentas registradas.
    obtenerUsuarios() {
        const usuarios = Storage.get("ecovida_usuarios", []);
        return Array.isArray(usuarios) ? usuarios : [];
    },

    // Obtiene el perfil de la sesión actual.
    obtenerPerfil() {
        const userId = localStorage.getItem("ecovida_sesion");

        if (!userId) {
            return null;
        }

        return this.obtenerUsuarios().find(
            usuario => String(usuario.id) === String(userId)
        ) || null;
    },

    // Comprueba que las funciones criptográficas estén disponibles.
    comprobarCriptografia() {
        if (
            !window.crypto ||
            !window.crypto.subtle ||
            !window.crypto.getRandomValues ||
            typeof TextEncoder === "undefined"
        ) {
            throw new Error(
                "El dispositivo no admite las funciones criptográficas necesarias."
            );
        }
    },

    // Genera una sal aleatoria.
    generarSalt() {
        this.comprobarCriptografia();

        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);

        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    },

    // Genera un hash mediante PBKDF2.
    async generarHash(password, salt) {
        this.comprobarCriptografia();

        const encoder = new TextEncoder();

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );

        const hash = await window.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: encoder.encode(salt),
                iterations: 120000,
                hash: "SHA-256"
            },
            keyMaterial,
            256
        );

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    },

    // Registra una nueva cuenta.
    async crearPerfil(nombre, correo, password) {
        try {
            nombre = nombre.trim();
            correo = correo.trim().toLowerCase();

            if (!nombre || !correo || !password) {
                return null;
            }

            if (password.length < 8) {
                return null;
            }

            const usuarios = this.obtenerUsuarios();

            const existe = usuarios.some(
                usuario =>
                    usuario.correo &&
                    usuario.correo.toLowerCase() === correo
            );

            if (existe) {
                return null;
            }

            const salt = this.generarSalt();

            const passwordHash = await this.generarHash(
                password,
                salt
            );

            const perfil = {
                id: `${Date.now()}_${salt.substring(0, 8)}`,
                nombre,
                correo,
                passwordSalt: salt,
                passwordHash,
                fechaRegistro: new Date().toISOString()
            };

            const datosIniciales = {
                ecovida_actividades: [],
                ecovida_metas: [],
                ecovida_puntos: 0
            };

            // Primero crea el espacio de datos del usuario.
            const claveDatos = `ecovida_datos_${perfil.id}`;

            if (!Storage.set(claveDatos, datosIniciales)) {
                return null;
            }

            // Comprueba que los datos se hayan guardado.
            const datosVerificados = Storage.get(claveDatos, null);

            if (
                !datosVerificados ||
                !Array.isArray(datosVerificados.ecovida_actividades) ||
                !Array.isArray(datosVerificados.ecovida_metas)
            ) {
                Storage.remove(claveDatos);
                return null;
            }

            // Después registra la cuenta.
            usuarios.push(perfil);

            if (!Storage.set("ecovida_usuarios", usuarios)) {
                Storage.remove(claveDatos);
                return null;
            }

            // Activa la sesión solamente cuando todo se guardó.
            localStorage.setItem("ecovida_sesion", String(perfil.id));

            return perfil;

        } catch (error) {
            console.error("Error al crear el perfil:", error);
            return null;
        }
    },

    // Inicia sesión con correo y contraseña.
    async iniciarSesion(correo, password) {
        try {
            correo = correo.trim().toLowerCase();

            const perfil = this.obtenerUsuarios().find(
                usuario =>
                    usuario.correo &&
                    usuario.correo.toLowerCase() === correo
            );

            if (
                !perfil ||
                !perfil.passwordHash ||
                !perfil.passwordSalt
            ) {
                return null;
            }

            const passwordHash = await this.generarHash(
                password,
                perfil.passwordSalt
            );

            if (passwordHash !== perfil.passwordHash) {
                return null;
            }

            // Verifica que exista el espacio de datos.
            const datos = Storage.get(
                `ecovida_datos_${perfil.id}`,
                null
            );

            if (!datos) {
                console.error("No se encontraron los datos del perfil.");
                return null;
            }

            localStorage.setItem(
                "ecovida_sesion",
                String(perfil.id)
            );

            return perfil;

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            return null;
        }
    },

    // Configura una contraseña para el perfil antiguo.
    async establecerPassword(password) {
        try {
            const perfil = this.obtenerPerfil();

            if (!perfil || perfil.passwordHash) {
                return false;
            }

            if (!password || password.length < 8) {
                return false;
            }

            const salt = this.generarSalt();

            const passwordHash = await this.generarHash(
                password,
                salt
            );

            const usuarios = this.obtenerUsuarios();

            const indice = usuarios.findIndex(
                usuario =>
                    String(usuario.id) === String(perfil.id)
            );

            if (indice === -1) {
                return false;
            }

            usuarios[indice].passwordSalt = salt;
            usuarios[indice].passwordHash = passwordHash;

            return Storage.set("ecovida_usuarios", usuarios);

        } catch (error) {
            console.error("Error al configurar contraseña:", error);
            return false;
        }
    },

    // Cierra la sesión sin eliminar la cuenta ni sus datos.
    cerrarSesion() {
        try {
            localStorage.removeItem("ecovida_sesion");
            return true;
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            return false;
        }
    },

    // Migra el perfil anterior y conserva sus datos.
    migrarPerfilAnterior() {
        try {

            // Evita repetir una migración ya completada.
            if (
                Storage.get(
                    "ecovida_migracion_multiperfil_v1",
                    false
                ) === true
            ) {
                return true;
            }

            const perfilAnterior = Storage.get(
                "ecovida_usuario",
                null
            );

            const usuarios = this.obtenerUsuarios();

            // Si no existe un perfil anterior, no hay datos que migrar.
            if (!perfilAnterior) {
                return Storage.set(
                    "ecovida_migracion_multiperfil_v1",
                    true
                );
            }

            if (
                perfilAnterior.id === undefined ||
                !perfilAnterior.correo
            ) {
                console.error("El perfil anterior tiene datos incompletos.");
                return false;
            }

            const correoAnterior =
                perfilAnterior.correo.trim().toLowerCase();

            // Busca la cuenta anterior por identificador o correo.
            let usuarioExistente = usuarios.find(
                usuario =>
                    String(usuario.id) === String(perfilAnterior.id)
            );

            if (!usuarioExistente) {
                usuarioExistente = usuarios.find(
                    usuario =>
                        usuario.correo &&
                        usuario.correo.toLowerCase() === correoAnterior
                );
            }

            let perfilMigrado = usuarioExistente;

            // Si no existe, incorpora el perfil anterior.
            if (!perfilMigrado) {

                perfilMigrado = {
                    ...perfilAnterior,
                    id: String(perfilAnterior.id),
                    correo: correoAnterior,
                    passwordSalt: null,
                    passwordHash: null
                };

                usuarios.push(perfilMigrado);
            }

            // Conserva los datos antiguos sin modificar las claves originales.
            const datosAnteriores = {
                ecovida_actividades: Storage.get(
                    "ecovida_actividades",
                    []
                ),
                ecovida_metas: Storage.get(
                    "ecovida_metas",
                    []
                ),
                ecovida_puntos: Storage.get(
                    "ecovida_puntos",
                    0
                )
            };

            // Comprueba la estructura de los datos recuperados.
            if (
                !Array.isArray(datosAnteriores.ecovida_actividades) ||
                !Array.isArray(datosAnteriores.ecovida_metas) ||
                !Number.isFinite(Number(datosAnteriores.ecovida_puntos))
            ) {
                console.error("Los datos antiguos no tienen el formato esperado.");
                return false;
            }

            const claveDatos =
                `ecovida_datos_${perfilMigrado.id}`;

            // No sobrescribe un espacio de datos que ya exista.
            const datosExistentes = Storage.get(claveDatos, null);

            if (datosExistentes === null) {

                if (!Storage.set(claveDatos, datosAnteriores)) {
                    return false;
                }
            }

            // Verifica que el espacio de datos exista.
            const datosVerificados = Storage.get(claveDatos, null);

            if (
                !datosVerificados ||
                !Array.isArray(datosVerificados.ecovida_actividades) ||
                !Array.isArray(datosVerificados.ecovida_metas)
            ) {
                console.error("No se pudieron verificar los datos migrados.");
                return false;
            }

            // Guarda la lista de usuarios.
            if (!Storage.set("ecovida_usuarios", usuarios)) {
                return false;
            }

            // Mantiene abierta la sesión del perfil anterior.
            localStorage.setItem(
                "ecovida_sesion",
                String(perfilMigrado.id)
            );

            // La migración se marca como completada al final.
            return Storage.set(
                "ecovida_migracion_multiperfil_v1",
                true
            );

        } catch (error) {
            console.error("Error durante la migración:", error);
            return false;
        }
    }
};
