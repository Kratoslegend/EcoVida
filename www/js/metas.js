
const Metas = {

    obtenerTodas() {
        return Storage.getUserData("ecovida_metas", []);
    },

    guardarTodas(metas) {
        return Storage.setUserData("ecovida_metas", metas);
    },

    obtenerProgreso(meta) {
    const actividades = Actividades.obtenerTodas();

    const actividadesCategoria = actividades.filter(
        actividad => actividad.tipo === meta.tipo
    );

    // Compatibilidad: las metas anteriores son por acciones.
    const modo = meta.modo || "acciones";

    if (modo === "medicion") {
        return actividadesCategoria.reduce((total, actividad) => {
            const medicion = actividad.medicion;

            if (
                medicion === null ||
                medicion === undefined ||
                medicion === "" ||
                !Number.isFinite(Number(medicion))
            ) {
                return total;
            }

            return total + Number(medicion);
        }, 0);
    }

    return actividadesCategoria.reduce(
        (total, actividad) =>
            total + Number(actividad.cantidad || 0),
        0
    );
},

    estaCompletada(meta) {
        return this.obtenerProgreso(meta) >= Number(meta.objetivo);
    },

    crear(datos) {
        const metas = this.obtenerTodas();

        const nuevaMeta = {
            id: Date.now(),
            nombre: datos.nombre.trim(),
            tipo: datos.tipo,
            modo: datos.modo || "acciones",
            objetivo: Number(datos.objetivo),
            unidad: datos.unidad || null,
            fechaInicio: this.obtenerFechaActual(),
            completada: false,
            fechaCreacion: new Date().toISOString()
        };

        metas.unshift(nuevaMeta);

        return this.guardarTodas(metas);
    },

    cambiarEstado(id) {
        const metas = this.obtenerTodas();
        const meta = metas.find(item => item.id === Number(id));

        if (!meta) return false;

        meta.completada = !meta.completada;

        return this.guardarTodas(metas);
    },

    eliminar(id) {
        const metas = this.obtenerTodas();

        const actualizadas = metas.filter(
            meta => meta.id !== Number(id)
        );

        return this.guardarTodas(actualizadas);
    },

    obtenerFechaActual() {
        const fecha = new Date();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    },

    escapar(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[caracter]);
    },

    formatoNumero(valor) {
        return Number(valor).toLocaleString("es-CL", {
            maximumFractionDigits: 2
        });
    },

    actualizarFormulario() {
        const modo = document.getElementById("goal-mode").value;
        const tipo = document.getElementById("goal-type").value;
        const objetivo = document.getElementById("goal-target");
        const etiqueta = document.getElementById("goal-target-label");
        const ayuda = document.getElementById("goal-target-help");

        const actividad = Actividades.catalogo.find(
            item => item.id === tipo
        );

        if (modo === "medicion") {
            const unidad = actividad?.unidad || "unidades";

            etiqueta.textContent = `Cantidad objetivo (${unidad})`;
            objetivo.min = "0.01";
            objetivo.step = "any";
            objetivo.placeholder = "Ej.: 100";

            ayuda.textContent =
                `Se sumarán las mediciones registradas en ${unidad}.`;
        } else {
            etiqueta.textContent = "Cantidad de acciones objetivo";
            objetivo.min = "1";
            objetivo.step = "1";
            objetivo.placeholder = "Ej.: 10";

            ayuda.textContent =
                "Se sumará la cantidad de acciones registradas.";
        }
    },

    renderizar() {
        const contenedor = document.getElementById("goals-content");

        if (!contenedor) return;

        const metas = this.obtenerTodas();
        const catalogo = Actividades.catalogo;

        const opciones = catalogo.map(item => `
            <option value="${this.escapar(item.id)}">
                ${item.icono} ${this.escapar(item.nombre)}
            </option>
        `).join("");

        const formulario = `
            <article class="content-card">
                <h2>Crear nueva meta</h2>

                <p class="section-description">
                    Define objetivos sostenibles y mide tu progreso.
                </p>

                <form id="goal-form">

                    <label for="goal-name">Nombre de la meta</label>

                    <input
                        type="text"
                        id="goal-name"
                        maxlength="60"
                        placeholder="Ej.: Ahorrar agua en casa"
                        required
                    >

                    <label for="goal-type">Categoría</label>

                    <select id="goal-type" required>
                        ${opciones}
                    </select>

                    <label for="goal-mode">Tipo de objetivo</label>

                    <select id="goal-mode" required>
                        <option value="acciones">Por cantidad de acciones</option>
                        <option value="medicion">Por medición ambiental</option>
                    </select>

                    <label for="goal-target" id="goal-target-label">
                        Cantidad de acciones objetivo
                    </label>

                    <input
                        type="number"
                        id="goal-target"
                        min="1"
                        max="1000000"
                        step="1"
                        placeholder="Ej.: 10"
                        required
                    >

                    <p id="goal-target-help" class="section-description">
                        Se sumará la cantidad de acciones registradas.
                    </p>

                    <button type="submit" class="btn btn-primary">
                        Crear meta
                    </button>

                </form>
            </article>
        `;

        let listado = `<h2>Mis objetivos</h2>`;

        if (metas.length === 0) {
            listado += `
                <article class="content-card">
                    <p>Aún no tienes metas creadas.</p>
                    <p class="section-description">
                        ¡Define tu primer objetivo sostenible!
                    </p>
                </article>
            `;
        } else {
            listado += metas.map(meta => {

                const actividad = catalogo.find(
                    item => item.id === meta.tipo
                );

                const modo = meta.modo || "acciones";
                const progreso = this.obtenerProgreso(meta);
                const objetivo = Number(meta.objetivo);

                const porcentaje = Math.min(
                    100,
                    Math.round((progreso / objetivo) * 100)
                );

                const completada = progreso >= objetivo;

                const unidad = modo === "medicion"
                    ? (meta.unidad || actividad?.unidad || "unidades")
                    : "acciones";

                const etiquetaModo = modo === "medicion"
                    ? "Objetivo por medición"
                    : "Objetivo por acciones";

                return `
                    <article class="content-card goal-card">

                        <div class="goal-heading">
                            <h3>
                                ${actividad ? actividad.icono : "🎯"}
                                ${this.escapar(meta.nombre)}
                            </h3>

                            <span class="goal-status ${completada ? "completed" : ""}">
                                ${completada ? "Completada" : "En progreso"}
                            </span>
                        </div>

                        <p class="goal-category">
                            ${actividad ? this.escapar(actividad.nombre) : "Actividad"}
                            · ${etiquetaModo}
                        </p>

                        <div class="goal-progress-text">
                            <strong>
                                ${this.formatoNumero(progreso)} /
                                ${this.formatoNumero(objetivo)}
                                ${unidad}
                            </strong>

                            <span>${porcentaje}%</span>
                        </div>

                        <div class="goal-progress-bar">
                            <div
                                class="goal-progress-fill"
                                style="width: ${porcentaje}%"
                            ></div>
                        </div>

                        <div class="goal-actions">
                            ${completada ? `
                                <p class="goal-completed-message">
                                    ¡Felicitaciones! Has alcanzado tu objetivo.
                                </p>
                            ` : `
                                <p class="goal-hint">
                                    Sigue registrando actividades para completar tu meta.
                                </p>
                            `}

                            <button
                                type="button"
                                class="btn btn-delete-goal"
                                data-id="${meta.id}"
                            >
                                Eliminar meta
                            </button>
                        </div>

                    </article>
                `;
            }).join("");
        }

        contenedor.innerHTML = formulario + listado;

        const formularioMeta = document.getElementById("goal-form");

        const selectorModo = document.getElementById("goal-mode");
        const selectorTipo = document.getElementById("goal-type");

        selectorModo.addEventListener("change", () => {
            this.actualizarFormulario();
        });

        selectorTipo.addEventListener("change", () => {
            this.actualizarFormulario();
        });

        formularioMeta.addEventListener("submit", event => {
            event.preventDefault();

            const nombre =
                document.getElementById("goal-name").value;

            const tipo =
                document.getElementById("goal-type").value;

            const modo =
                document.getElementById("goal-mode").value;

            const objetivo =
                Number(document.getElementById("goal-target").value);

            const actividad = catalogo.find(
                item => item.id === tipo
            );

            if (
                !nombre.trim() ||
                !actividad ||
                !Number.isFinite(objetivo) ||
                objetivo <= 0
            ) {
                alert("Revisa los datos de tu meta.");
                return;
            }

            if (modo === "acciones" && !Number.isInteger(objetivo)) {
                alert("La cantidad de acciones debe ser un número entero.");
                return;
            }

            const guardado = this.crear({
                nombre,
                tipo,
                modo,
                objetivo,
                unidad: modo === "medicion" ? actividad.unidad : null
            });

            if (!guardado) {
                alert("No fue posible guardar la meta.");
                return;
            }

            alert("¡Tu nueva meta ha sido creada!");

            this.renderizar();
            actualizarDashboard();
        });

        contenedor.querySelectorAll(".btn-delete-goal")
            .forEach(boton => {
                boton.addEventListener("click", () => {

                    if (!confirm("¿Deseas eliminar esta meta?")) {
                        return;
                    }

                    if (this.eliminar(boton.dataset.id)) {
                        this.renderizar();
                        actualizarDashboard();
                    }
                });
            });

        this.actualizarFormulario();
    }
};
