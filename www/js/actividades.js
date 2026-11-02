const Actividades = {

    catalogo: [
        {
            id: "reciclaje",
            nombre: "Reciclaje",
            icono: "♻️",
            unidad: "kg",
            etiqueta: "Cantidad reciclada",
            material: true
        },
        {
            id: "transporte",
            nombre: "Transporte sostenible",
            icono: "🚲",
            unidad: "km",
            etiqueta: "Distancia recorrida"
        },
        {
            id: "agua",
            nombre: "Ahorro de agua",
            icono: "💧",
            unidad: "L",
            etiqueta: "Litros ahorrados"
        },
        {
            id: "energia",
            nombre: "Ahorro de electricidad",
            icono: "⚡",
            unidad: "kWh",
            etiqueta: "Electricidad ahorrada"
        },
        {
            id: "reutilizacion",
            nombre: "Reutilización",
            icono: "🔄",
            unidad: "unidades",
            etiqueta: "Objetos reutilizados"
        },
        {
            id: "plasticos",
            nombre: "Evitar plásticos",
            icono: "🌱",
            unidad: "unidades",
            etiqueta: "Plásticos evitados"
        }
    ],

    obtenerTodas() {
        return Storage.getUserData("ecovida_actividades", []);
    },

    guardarTodas(actividades) {
        return Storage.setUserData("ecovida_actividades", actividades);
    },

    actualizarPuntos(actividades) {
    const total = actividades.reduce(
        (suma, actividad) => suma + Number(actividad.puntos || 0),
        0
    );

    Storage.setUserData("ecovida_puntos", total);
},

    registrar(datos) {
        const actividades = this.obtenerTodas();

        const categoria = this.catalogo.find(
            item => item.id === datos.tipo
        );

        if (!categoria) return false;

        const nuevaActividad = {
            id: Date.now(),
            tipo: datos.tipo,
            nombre: categoria.nombre,

            // Se conserva para puntos y seguimiento de metas.
            cantidad: Number(datos.cantidad),

            // Medición física para la futura calculadora.
            medicion: datos.medicion !== ""
                ? Number(datos.medicion)
                : null,

            unidad: datos.medicion !== ""
                ? categoria.unidad
                : null,

            material: datos.material || null,

            descripcion: datos.descripcion.trim(),
            fecha: datos.fecha,
            puntos: Number(datos.cantidad) * 5
        };

        actividades.unshift(nuevaActividad);

        if (!this.guardarTodas(actividades)) {
            return false;
        }

        this.actualizarPuntos(actividades);

        return true;
    },

    eliminar(id) {
        const actividades = this.obtenerTodas();

        const actualizadas = actividades.filter(
            actividad => actividad.id !== Number(id)
        );

        if (!this.guardarTodas(actualizadas)) {
            return false;
        }

        this.actualizarPuntos(actualizadas);

        return true;
    },

    escapar(texto) {
        return String(texto).replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[caracter]);
    },

    obtenerFechaActual() {
        const fecha = new Date();

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    },

    renderizar() {
        const contenedor = document.getElementById("activities-content");
        const actividades = this.obtenerTodas();

        const opciones = this.catalogo.map(item => `
            <option value="${item.id}">
                ${item.icono} ${item.nombre}
            </option>
        `).join("");

        const formulario = `
            <article class="content-card">

                <h2>Registrar nueva actividad</h2>

                <p class="section-description">
                    Registra tus acciones y mide tu aporte al planeta.
                </p>

                <form id="activity-form">

                    <label for="activity-type">
                        Tipo de actividad
                    </label>

                    <select id="activity-type" required>
                        ${opciones}
                    </select>

                    <label for="activity-quantity">
                        Cantidad de acciones
                    </label>

                    <input
                        type="number"
                        id="activity-quantity"
                        min="1"
                        max="1000"
                        value="1"
                        required
                    >

                    <div id="measurement-fields">

                        <label id="measurement-label" for="activity-measurement">
                            Cantidad reciclada (kg)
                        </label>

                        <input
                            type="number"
                            id="activity-measurement"
                            min="0.01"
                            max="100000"
                            step="0.01"
                            placeholder="Ej.: 2.5"
                        >

                        <p class="measurement-hint">
                            Opcional. Ingresa una cantidad que hayas medido
                            o puedas estimar razonablemente.
                        </p>

                        <div id="material-container">

                            <label for="activity-material">
                                Material reciclado
                            </label>

                            <select id="activity-material">
                                <option value="papel">Papel</option>
                                <option value="carton">Cartón</option>
                                <option value="vidrio">Vidrio</option>
                                <option value="plastico">Plástico</option>
                                <option value="metal">Metal</option>
                                <option value="organico">Residuos orgánicos</option>
                                <option value="mixto">Material mixto</option>
                            </select>

                        </div>

                    </div>

                    <label for="activity-date">Fecha</label>

                    <input
                        type="date"
                        id="activity-date"
                        value="${this.obtenerFechaActual()}"
                        required
                    >

                    <label for="activity-description">
                        Descripción (opcional)
                    </label>

                    <input
                        type="text"
                        id="activity-description"
                        maxlength="120"
                        placeholder="Describe tu acción sostenible"
                    >

                    <button type="submit" class="btn btn-primary">
                        Guardar actividad
                    </button>

                </form>

            </article>
        `;

        let historial = `
            <h2>Mis actividades registradas</h2>
        `;

        if (actividades.length === 0) {

            historial += `
                <article class="content-card">
                    <p>Todavía no tienes actividades registradas.</p>

                    <p class="section-description">
                        ¡Registra tu primera acción sostenible!
                    </p>
                </article>
            `;

        } else {

            historial += actividades.map(actividad => {

                const item = this.catalogo.find(
                    elemento => elemento.id === actividad.tipo
                );

                const icono = item ? item.icono : "🌱";

                const medicionHTML =
                    actividad.medicion !== null &&
                    actividad.medicion !== undefined
                        ? `<p>Medición: ${actividad.medicion} ${this.escapar(actividad.unidad)}</p>`
                        : `<p class="measurement-hint">Sin medición ambiental registrada.</p>`;

                const materialHTML = actividad.material
                    ? `<p>Material: ${this.escapar(actividad.material)}</p>`
                    : "";

                return `
                    <article class="content-card activity-card">

                        <div class="activity-heading">

                            <h3>
                                ${icono}
                                ${this.escapar(actividad.nombre)}
                            </h3>

                            <span class="activity-points">
                                +${actividad.puntos} pts
                            </span>

                        </div>

                        <p>Cantidad de acciones: ${actividad.cantidad}</p>

                        ${medicionHTML}

                        ${materialHTML}

                        <p>Fecha: ${this.escapar(actividad.fecha)}</p>

                        ${actividad.descripcion ? `
                            <p>${this.escapar(actividad.descripcion)}</p>
                        ` : ""}

                        <button
                            class="btn btn-secondary btn-delete-activity"
                            data-id="${actividad.id}"
                            type="button"
                        >
                            Eliminar registro
                        </button>

                    </article>
                `;

            }).join("");
        }

        contenedor.innerHTML = formulario + historial;

        const tipoSelect = document.getElementById("activity-type");
        const medicionLabel = document.getElementById("measurement-label");
        const medicionInput = document.getElementById("activity-measurement");
        const materialContainer = document.getElementById("material-container");

        // Actualizar los campos según la categoría seleccionada.
        const actualizarCampos = () => {

            const categoria = this.catalogo.find(
                item => item.id === tipoSelect.value
            );

            if (!categoria) return;

            medicionLabel.textContent =
                `${categoria.etiqueta} (${categoria.unidad})`;

            medicionInput.placeholder =
                `Ej.: 2 ${categoria.unidad}`;

            materialContainer.classList.toggle(
                "hidden",
                !categoria.material
            );
        };

        tipoSelect.addEventListener("change", actualizarCampos);

        actualizarCampos();

        // Guardar actividad.
        document.getElementById("activity-form")
            .addEventListener("submit", event => {

                event.preventDefault();

                const tipo = tipoSelect.value;

                const cantidad =
                    document.getElementById("activity-quantity").value;

                const medicion = medicionInput.value;

                const material =
                    document.getElementById("activity-material").value;

                const fecha =
                    document.getElementById("activity-date").value;

                const descripcion =
                    document.getElementById("activity-description").value;

                if (
                    !tipo ||
                    !fecha ||
                    Number(cantidad) < 1 ||
                    Number(cantidad) > 1000
                ) {
                    alert("Revisa los datos de la actividad.");
                    return;
                }

                if (
                    medicion !== "" &&
                    (!Number.isFinite(Number(medicion)) ||
                     Number(medicion) <= 0)
                ) {
                    alert("La medición debe ser un número mayor que cero.");
                    return;
                }

                const guardado = this.registrar({
                    tipo,
                    cantidad,
                    medicion,
                    material: tipo === "reciclaje" ? material : null,
                    fecha,
                    descripcion
                });

                if (!guardado) {
                    alert("No fue posible guardar la actividad.");
                    return;
                }

                alert("¡Actividad registrada correctamente!");

                this.renderizar();

                if (typeof actualizarDashboard === "function") {
                    actualizarDashboard();
                }
            });

        // Eliminar actividad.
        contenedor.querySelectorAll(".btn-delete-activity")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    if (!confirm("¿Deseas eliminar esta actividad?")) {
                        return;
                    }

                    const eliminado = this.eliminar(boton.dataset.id);

                    if (eliminado) {

                        this.renderizar();

                        if (typeof actualizarDashboard === "function") {
                            actualizarDashboard();
                        }

                    } else {
                        alert("No fue posible eliminar el registro.");
                    }
                });
            });
    }
};
