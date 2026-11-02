const Reconocimientos = {
    obtenerActividades() {
        return Actividades.obtenerTodas();
    },

    obtenerLogros() {
        const actividades = this.obtenerActividades();

        const totalActividades = actividades.length;

        const actividadesReciclaje = actividades.filter(
            actividad => actividad.tipo === "reciclaje"
        ).length;

        const actividadesAgua = actividades.filter(
            actividad => actividad.tipo === "agua"
        ).length;

        const totalPuntos = actividades.reduce(
            (total, actividad) => total + Number(actividad.puntos || 0),
            0
        );

        return [
            {
                id: "primeros_pasos",
                icono: "🌱",
                nombre: "Primeros pasos",
                descripcion: "Registra tu primera actividad sostenible.",
                condicion: "1 actividad registrada",
                progreso: Math.min(totalActividades, 1),
                objetivo: 1,
                desbloqueado: totalActividades >= 1
            },
            {
                id: "eco_principiante",
                icono: "🌿",
                nombre: "Eco principiante",
                descripcion: "Comienza tu camino hacia una vida más sostenible.",
                condicion: "5 actividades registradas",
                progreso: Math.min(totalActividades, 5),
                objetivo: 5,
                desbloqueado: totalActividades >= 5
            },
            {
                id: "reciclador_activo",
                icono: "♻️",
                nombre: "Reciclador activo",
                descripcion: "Demuestra tu compromiso con el reciclaje.",
                condicion: "10 registros de reciclaje",
                progreso: Math.min(actividadesReciclaje, 10),
                objetivo: 10,
                desbloqueado: actividadesReciclaje >= 10
            },
            {
                id: "guardian_agua",
                icono: "💧",
                nombre: "Guardián del agua",
                descripcion: "Registra acciones para cuidar este recurso.",
                condicion: "10 registros de ahorro de agua",
                progreso: Math.min(actividadesAgua, 10),
                objetivo: 10,
                desbloqueado: actividadesAgua >= 10
            },
            {
                id: "ecovida_destacado",
                icono: "🏆",
                nombre: "EcoVida destacado",
                descripcion: "Alcanza una puntuación de 100 puntos.",
                condicion: "100 puntos acumulados",
                progreso: Math.min(totalPuntos, 100),
                objetivo: 100,
                desbloqueado: totalPuntos >= 100
            }
        ];
    },

    obtenerEstadisticas() {
        const logros = this.obtenerLogros();

        return {
            total: logros.length,
            desbloqueados: logros.filter(
                logro => logro.desbloqueado
            ).length
        };
    },

    renderizar() {
        const contenedor = document.getElementById("awards-content");

        if (!contenedor) return;

        const logros = this.obtenerLogros();
        const estadisticas = this.obtenerEstadisticas();

        contenedor.innerHTML = `
            <div class="awards-intro">
                <span class="awards-eyebrow">TUS LOGROS ECOLÓGICOS</span>
                <h2>¡Cada acción cuenta!</h2>
                <p>
                    Completa desafíos sostenibles, desbloquea
                    reconocimientos y continúa avanzando.
                </p>
            </div>

            <div class="awards-summary">
                <div class="awards-summary-icon">🏆</div>
                <div>
                    <strong>${estadisticas.desbloqueados} de ${estadisticas.total}</strong>
                    <p>Reconocimientos desbloqueados</p>
                </div>
            </div>

            <div class="awards-progress">
                <div class="awards-progress-label">
                    <span>Tu progreso</span>
                    <strong>
                        ${Math.round(
                            estadisticas.desbloqueados /
                            estadisticas.total * 100
                        )}%
                    </strong>
                </div>

                <div class="awards-progress-track">
                    <div class="awards-progress-fill"
                        style="width: ${
                            estadisticas.desbloqueados /
                            estadisticas.total * 100
                        }%">
                    </div>
                </div>
            </div>

            <h3 class="awards-section-title">Mis reconocimientos</h3>

            <div class="awards-grid">
                ${logros.map(logro => `
                    <article class="award-card ${
                        logro.desbloqueado ? "unlocked" : "locked"
                    }">

                        <div class="award-card-top">
                            <div class="award-icon">
                                ${logro.desbloqueado ? logro.icono : "🔒"}
                            </div>

                            <span class="award-status ${
                                logro.desbloqueado ? "status-unlocked" : ""
                            }">
                                ${logro.desbloqueado
                                    ? "Desbloqueado"
                                    : "Bloqueado"}
                            </span>
                        </div>

                        <h4>${logro.nombre}</h4>

                        <p class="award-description">
                            ${logro.descripcion}
                        </p>

                        <div class="award-condition">
                            ${logro.condicion}
                        </div>

                        <div class="award-card-progress">
                            <div class="award-progress-track">
                                <div class="award-progress-fill"
                                    style="width: ${
                                        logro.progreso /
                                        logro.objetivo * 100
                                    }%">
                                </div>
                            </div>

                            <span>
                                ${logro.progreso}/${logro.objetivo}
                            </span>
                        </div>
                    </article>
                `).join("")}
            </div>

            <div class="awards-footer">
                <span>🌍</span>
                <div>
                    <strong>Sigue haciendo la diferencia</strong>
                    <p>
                        Cada actividad sostenible te acerca
                        a un nuevo reconocimiento.
                    </p>
                </div>
            </div>
        `;
    }
};
