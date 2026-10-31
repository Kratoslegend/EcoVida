
document.addEventListener("DOMContentLoaded", () => {

    const screens = document.querySelectorAll(".screen");
    const navigation = document.getElementById("bottom-navigation");

    function mostrarPantalla(nombre) {
        const destino = document.getElementById(`screen-${nombre}`);

        if (!destino) {
            console.error("Pantalla no encontrada:", nombre);
            return;
        }

        screens.forEach(screen => {
            screen.classList.remove("active");
        });

        destino.classList.add("active");

        const menuVisible = !["welcome", "register"].includes(nombre);
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
        const nombre = perfil ? perfil.nombre : "Usuario";

        document.getElementById("welcome-user").textContent =
            `¡Hola, ${nombre}!`;

        const actividades = Storage.get("ecovida_actividades", []);
        const metas = Storage.get("ecovida_metas", []);
        const puntos = Storage.get("ecovida_puntos", 0);

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
            contenedor.textContent = "No hay un perfil registrado.";
            return;
        }

        const tarjeta = document.createElement("article");
        tarjeta.className = "content-card";

        const titulo = document.createElement("h2");
        titulo.textContent = perfil.nombre;

        const correo = document.createElement("p");
        correo.textContent = perfil.correo;

        const boton = document.createElement("button");
        boton.id = "btn-logout";
        boton.className = "btn btn-secondary";
        boton.textContent = "Cerrar sesión";

        boton.addEventListener("click", () => {
            if (confirm("¿Deseas cerrar tu perfil en este dispositivo?")) {
                Storage.remove("ecovida_usuario");
                mostrarPantalla("welcome");
            }
        });

        tarjeta.append(titulo, correo, boton);
        contenedor.replaceChildren(tarjeta);
    }

    document.getElementById("btn-go-register")
        .addEventListener("click", () => mostrarPantalla("register"));

    document.getElementById("btn-go-login")
        .addEventListener("click", () => {
            if (Usuarios.obtenerPerfil()) {
                mostrarPantalla("home");
            } else {
                alert("Todavía no tienes un perfil registrado.");
                mostrarPantalla("register");
            }
        });

    document.getElementById("register-form")
        .addEventListener("submit", event => {
            event.preventDefault();

            const nombre =
                document.getElementById("register-name").value;

            const correo =
                document.getElementById("register-email").value;

            if (!nombre.trim() || !correo.trim()) {
                alert("Completa todos los campos.");
                return;
            }

            if (Usuarios.obtenerPerfil()) {
                alert("Ya existe un perfil en este dispositivo.");
                return;
            }

            const perfil = Usuarios.crearPerfil(nombre, correo);

            if (!perfil) {
                alert("No se pudo guardar el perfil.");
                return;
            }

            event.target.reset();
            alert("¡Perfil EcoVida creado correctamente!");
            mostrarPantalla("home");
        });

    document.querySelectorAll("[data-screen]").forEach(boton => {
        boton.addEventListener("click", () => {
            mostrarPantalla(boton.dataset.screen);
        });
    });

    const perfilExistente = Usuarios.obtenerPerfil();

    mostrarPantalla(perfilExistente ? "home" : "welcome");
});
