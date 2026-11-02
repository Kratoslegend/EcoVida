document.addEventListener("DOMContentLoaded", () => {

    const screens = document.querySelectorAll(".screen");
    const navigation = document.getElementById("bottom-navigation");

    const migracionCorrecta = Usuarios.migrarPerfilAnterior();

    if (!migracionCorrecta) {
        alert(
            "No fue posible completar la migración de tus datos. " +
            "La aplicación no continuará para proteger tu información."
        );
        return;
    }

    function mostrarPantalla(nombre) {

        const pantallasPublicas = [
            "welcome",
            "register",
            "login"
        ];

        if (
            !pantallasPublicas.includes(nombre) &&
            !Usuarios.obtenerPerfil()
        ) {
            alert("Debes iniciar sesión para continuar.");
            nombre = "welcome";
        }

        const destino = document.getElementById(`screen-${nombre}`);

        if (!destino) {
            console.error("Pantalla no encontrada:", nombre);
            return;
        }

        screens.forEach(screen => {
            screen.classList.remove("active");
        });

        destino.classList.add("active");

        const menuVisible =
            !pantallasPublicas.includes(nombre) &&
            Boolean(Usuarios.obtenerPerfil());

        navigation.classList.toggle("hidden", !menuVisible);

        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.screen === nombre
            );
        });

        if (nombre === "home") actualizarInicio();
        if (nombre === "profile") actualizarPerfil();
        if (nombre === "activities") Actividades.renderizar();
        if (nombre === "impact") Impacto.renderizar();
        if (nombre === "learn") Consejos.renderizar();
        if (nombre === "goals") Metas.renderizar();
        if (nombre === "awards") Reconocimientos.renderizar();
        if (nombre === "history") Historial.renderizar();
    }

    function actualizarInicio() {

        const perfil = Usuarios.obtenerPerfil();

        if (!perfil) return;

        const nombre = perfil.nombre;

        document.getElementById("welcome-user").textContent =
            `¡Hola, ${nombre}!`;

        const actividades = Actividades.obtenerTodas();
        const metas = Metas.obtenerTodas();

        const puntos = Storage.getUserData(
            "ecovida_puntos",
            0
        );

        document.getElementById("home-activities").textContent =
            actividades.length;

        document.getElementById("home-goals").textContent =
            metas.filter(meta => !Metas.estaCompletada(meta)).length;

        document.getElementById("home-points").textContent =
            puntos;
    }

    window.actualizarDashboard = actualizarInicio;

    function actualizarPerfil() {

        const perfil = Usuarios.obtenerPerfil();

        const contenedor = document.getElementById("profile-content");

        if (!perfil) {
            contenedor.textContent = "No hay una sesión activa.";
            return;
        }

        const tarjeta = document.createElement("article");
        tarjeta.className = "content-card";

        const titulo = document.createElement("h2");
        titulo.textContent = perfil.nombre;

        const correo = document.createElement("p");
        correo.textContent = perfil.correo;

        tarjeta.append(titulo, correo);

        if (!perfil.passwordHash) {

            const aviso = document.createElement("p");

            aviso.textContent =
                "Para proteger tu cuenta, configura una contraseña antes de cerrar sesión.";

            tarjeta.appendChild(aviso);

            const formulario = document.createElement("form");
            formulario.id = "legacy-password-form";

            formulario.innerHTML = `
                <label for="legacy-password">
                    Nueva contraseña
                </label>

                <input
                    type="password"
                    id="legacy-password"
                    minlength="8"
                    placeholder="Mínimo 8 caracteres"
                    required
                >

                <label for="legacy-password-confirm">
                    Confirmar contraseña
                </label>

                <input
                    type="password"
                    id="legacy-password-confirm"
                    minlength="8"
                    placeholder="Repite tu contraseña"
                    required
                >

                <button type="submit" class="btn btn-primary">
                    Configurar contraseña
                </button>
            `;

            formulario.addEventListener("submit", async event => {

                event.preventDefault();

                const password =
                    document.getElementById("legacy-password").value;

                const confirmacion =
                    document.getElementById("legacy-password-confirm").value;

                if (password.length < 8) {
                    alert("La contraseña debe tener al menos 8 caracteres.");
                    return;
                }

                if (password !== confirmacion) {
                    alert("Las contraseñas no coinciden.");
                    return;
                }

                try {

                    const guardado =
                        await Usuarios.establecerPassword(password);

                    if (!guardado) {
                        alert("No fue posible configurar la contraseña.");
                        return;
                    }

                    alert("¡Contraseña configurada correctamente!");

                    actualizarPerfil();

                } catch (error) {

                    console.error(error);

                    alert(
                        "No fue posible configurar la contraseña. " +
                        "Comprueba la compatibilidad del dispositivo."
                    );
                }
            });

            tarjeta.appendChild(formulario);
        }

        const boton = document.createElement("button");

        boton.id = "btn-logout";
        boton.className = "btn btn-secondary";
        boton.textContent = "Cerrar sesión";

        boton.addEventListener("click", () => {

            if (!perfil.passwordHash) {
                alert(
                    "Primero debes configurar una contraseña " +
                    "para poder volver a acceder a tu cuenta."
                );
                return;
            }

            if (confirm("¿Deseas cerrar sesión? Tus datos se conservarán.")) {

                Usuarios.cerrarSesion();

                mostrarPantalla("welcome");
            }
        });

        tarjeta.appendChild(boton);

        contenedor.replaceChildren(tarjeta);
    }

    document.getElementById("btn-go-register")
        .addEventListener("click", () => {
            mostrarPantalla("register");
        });

    document.getElementById("btn-go-login")
        .addEventListener("click", () => {
            mostrarPantalla("login");
        });

    document.getElementById("btn-register-login")
        .addEventListener("click", () => {
            mostrarPantalla("login");
        });

    document.getElementById("btn-login-register")
        .addEventListener("click", () => {
            mostrarPantalla("register");
        });

    document.getElementById("register-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const nombre =
                document.getElementById("register-name").value;

            const correo =
                document.getElementById("register-email").value;

            const password =
                document.getElementById("register-password").value;

            const confirmacion =
                document.getElementById("register-password-confirm").value;

            if (!nombre.trim() || !correo.trim()) {
                alert("Completa todos los campos.");
                return;
            }

            if (password.length < 8) {
                alert("La contraseña debe tener al menos 8 caracteres.");
                return;
            }

            if (password !== confirmacion) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            try {

                const perfil = await Usuarios.crearPerfil(
                    nombre,
                    correo,
                    password
                );

                if (!perfil) {
                    alert(
                        "No se pudo crear la cuenta. " +
                        "Comprueba si el correo ya está registrado."
                    );
                    return;
                }

                event.target.reset();

                alert("¡Tu cuenta EcoVida fue creada correctamente!");

                mostrarPantalla("home");

            } catch (error) {

                console.error("Error durante el registro:", error);

                alert(
                    "No fue posible crear la cuenta. " +
                    "Comprueba la compatibilidad del dispositivo."
                );
            }
        });

    document.getElementById("login-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const correo =
                document.getElementById("login-email").value;

            const password =
                document.getElementById("login-password").value;

            if (!correo.trim() || !password) {
                alert("Ingresa tu correo y contraseña.");
                return;
            }

            try {

                const perfil = await Usuarios.iniciarSesion(
                    correo,
                    password
                );

                if (!perfil) {
                    alert(
                        "Correo o contraseña incorrectos. " +
                        "Verifica tus datos e inténtalo nuevamente."
                    );
                    return;
                }

                event.target.reset();

                alert(`¡Bienvenido nuevamente, ${perfil.nombre}!`);

                mostrarPantalla("home");

            } catch (error) {

                console.error("Error durante el inicio de sesión:", error);

                alert(
                    "No fue posible iniciar sesión. " +
                    "Comprueba la compatibilidad del dispositivo."
                );
            }
        });


    document.querySelectorAll("[data-screen]").forEach(boton => {

        boton.addEventListener("click", () => {

            mostrarPantalla(boton.dataset.screen);

        });

    });


    const perfilExistente = Usuarios.obtenerPerfil();

    if (perfilExistente) {
        mostrarPantalla("home");
    } else {
        mostrarPantalla("welcome");
    }

});