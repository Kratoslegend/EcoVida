const Historial = {
    obtenerActividades() {
        return Actividades.obtenerTodas();
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

    formatoFecha(fecha) {
        if (!fecha) return "Fecha no disponible";

        const fechaLocal = new Date(fecha + "T00:00:00");

        if (Number.isNaN(fechaLocal.getTime())) {
            return this.escapar(fecha);
        }

        return fechaLocal.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    },

    obtenerResumen() {
        const actividades = this.obtenerActividades();

        return {
            total: actividades.length,
            puntos: actividades.reduce(
                (total, actividad) =>
                    total + Number(actividad.puntos || 0),
                0
            )
        };
    },

    eliminar(id) {
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este registro?"
    );

    if (!confirmar) return;

    const eliminado = Actividades.eliminar(id);

    if (!eliminado) {
        alert("No fue posible eliminar el registro.");
        return;
    }

    if (typeof actualizarDashboard === "function") {
        actualizarDashboard();
    }

    this.renderizar();
},

    renderizar() {
        const contenedor = document.getElementById("history-content");

        if (!contenedor) return;

        const actividades = this.obtenerActividades();
        const resumen = this.obtenerResumen();

        const ordenadas = [...actividades].sort((a, b) => {
            const fechaA = new Date(a.fecha || "1970-01-01");
            const fechaB = new Date(b.fecha || "1970-01-01");

            return fechaB - fechaA;
        });

        const iconos = {
            reciclaje: "♻️",
            transporte: "🚲",
            agua: "💧",
            energia: "⚡",
            reutilizacion: "🌱",
            plasticos: "🌍"
        };

        const nombres = {
            reciclaje: "Reciclaje",
            transporte: "Transporte sostenible",
            agua: "Ahorro de agua",
            energia: "Ahorro de energía",
            reutilizacion: "Reutilización",
            plasticos: "Reducción de plásticos"
        };

        contenedor.innerHTML = `
            <div class="history-intro">
                <span class="history-eyebrow">REGISTRO DE ACTIVIDADES</span>
                <h2>Tu camino sostenible</h2>
                <p>
                    Consulta tus acciones, revisa tus avances
                    y descubre cuánto has contribuido.
                </p>
            </div>

            <div class="history-summary">
                <div class="history-stat">
                    <span>📋</span>
                    <strong>${resumen.total}</strong>
                    <small>Actividades registradas</small>
                </div>

                <div class="history-stat">
                    <span>⭐</span>
                    <strong>${resumen.puntos}</strong>
                    <small>Puntos acumulados</small>
                </div>
            </div>

            <h3 class="history-section-title">
                Mis registros
            </h3>

            ${
                ordenadas.length === 0
                    ? `
                        <div class="history-empty">
                            <span>🌱</span>
                            <h3>Aún no tienes actividades</h3>
                            <p>
                                Registra tu primera acción sostenible
                                y aparecerá aquí.
                            </p>
                        </div>
                    `
                    : `
                        <div class="history-list">
                            ${ordenadas.map(actividad => {
                                const tipo = this.escapar(actividad.tipo);
                                const nombre = nombres[tipo] || "Actividad sostenible";
                                const icono = iconos[tipo] || "🌿";

                                const medicionDisponible =
                                    actividad.medicion !== null &&
                                    actividad.medicion !== undefined &&
                                    actividad.medicion !== "" &&
                                    Number.isFinite(Number(actividad.medicion));

                                const detalleMedicion = medicionDisponible
                                    ? `${this.escapar(actividad.medicion)} ${this.escapar(actividad.unidad || "")}`
                                    : "Sin medición ambiental";

                                return `
                                    <article class="history-card">
                                        <div class="history-card-top">
                                            <div class="history-icon">
                                                ${icono}
                                            </div>

                                            <div class="history-card-info">
                                                <h4>${this.escapar(actividad.nombre || nombre)}</h4>
                                                <span>${nombre}</span>
                                            </div>

                                            <span class="history-points">
                                                +${Number(actividad.puntos || 0)} pts
                                            </span>
                                        </div>

                                        <div class="history-details">
                                            <div>
                                                <small>Fecha</small>
                                                <span>${this.formatoFecha(actividad.fecha)}</span>
                                            </div>

                                            <div>
                                                <small>Acciones</small>
                                                <span>${Number(actividad.cantidad || 0)}</span>
                                            </div>

                                            <div>
                                                <small>Medición</small>
                                                <span>${detalleMedicion}</span>
                                            </div>
                                        </div>

                                        ${
                                            actividad.descripcion
                                                ? `<p class="history-description">${this.escapar(actividad.descripcion)}</p>`
                                                : ""
                                        }

                                        <button
                                            class="history-delete"
                                            data-id="${this.escapar(actividad.id)}">
                                            Eliminar registro
                                        </button>
                                    </article>
                                `;
                            }).join("")}
                        </div>
                    `
            }
        `;

        contenedor.querySelectorAll(".history-delete").forEach(boton => {
            boton.addEventListener("click", () => {
                this.eliminar(boton.dataset.id);
            });
        });
    }
};
