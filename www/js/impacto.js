const Impacto = {

    obtenerActividades() {
        return Storage.get("ecovida_actividades", []);
    },

    calcular() {
        const actividades = this.obtenerActividades();

        const resultado = {
            totalAcciones: 0,
            reciclajeKg: 0,
            aguaLitros: 0,
            energiaKwh: 0,
            transporteKm: 0,
            reutilizacion: 0,
            plasticos: 0,
            registrosMedidos: 0
        };

        actividades.forEach(actividad => {

            resultado.totalAcciones += Number(actividad.cantidad || 0);

            // Ignorar registros antiguos sin medición física.
            if (
                actividad.medicion === null ||
                actividad.medicion === undefined ||
                !Number.isFinite(Number(actividad.medicion))
            ) {
                return;
            }

            const medicion = Number(actividad.medicion);

            resultado.registrosMedidos++;

            switch (actividad.tipo) {

                case "reciclaje":
                    resultado.reciclajeKg += medicion;
                    break;

                case "agua":
                    resultado.aguaLitros += medicion;
                    break;

                case "energia":
                    resultado.energiaKwh += medicion;
                    break;

                case "transporte":
                    resultado.transporteKm += medicion;
                    break;

                case "reutilizacion":
                    resultado.reutilizacion += medicion;
                    break;

                case "plasticos":
                    resultado.plasticos += medicion;
                    break;
            }
        });

        return resultado;
    },

    formato(valor, decimales = 2) {
        return Number(valor).toLocaleString("es-CL", {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimales
        });
    },

    renderizar() {
        const contenedor = document.getElementById("impact-content");

        const datos = this.calcular();

        contenedor.innerHTML = `

            <article class="content-card impact-intro">
                <h2>Tu aporte al planeta</h2>

                <p>
                    Aquí puedes conocer las mediciones acumuladas
                    de tus actividades sostenibles.
                </p>
            </article>

            <div class="impact-grid">

                <article class="impact-card">
                    <span class="impact-icon">♻️</span>
                    <h3>${this.formato(datos.reciclajeKg)} kg</h3>
                    <p>Residuos reciclados</p>
                </article>

                <article class="impact-card">
                    <span class="impact-icon">💧</span>
                    <h3>${this.formato(datos.aguaLitros)} L</h3>
                    <p>Agua ahorrada</p>
                </article>

                <article class="impact-card">
                    <span class="impact-icon">⚡</span>
                    <h3>${this.formato(datos.energiaKwh)} kWh</h3>
                    <p>Electricidad ahorrada</p>
                </article>

                <article class="impact-card">
                    <span class="impact-icon">🚲</span>
                    <h3>${this.formato(datos.transporteKm)} km</h3>
                    <p>Movilidad sostenible</p>
                </article>

                <article class="impact-card">
                    <span class="impact-icon">🔄</span>
                    <h3>${this.formato(datos.reutilizacion)}</h3>
                    <p>Objetos reutilizados</p>
                </article>

                <article class="impact-card">
                    <span class="impact-icon">🌱</span>
                    <h3>${this.formato(datos.plasticos)}</h3>
                    <p>Plásticos evitados</p>
                </article>

            </div>

            <article class="content-card impact-summary">

                <h2>Resumen de tu actividad</h2>

                <div class="impact-summary-row">
                    <span>Acciones registradas</span>
                    <strong>${this.formato(datos.totalAcciones, 0)}</strong>
                </div>

                <div class="impact-summary-row">
                    <span>Registros con mediciones</span>
                    <strong>${datos.registrosMedidos}</strong>
                </div>

            </article>

            <article class="content-card impact-co2">

                <span class="impact-icon">🌍</span>

                <h2>Huella de carbono</h2>

                <p>
                    La estimación de CO₂ equivalente estará disponible
                    cuando incorporemos factores de emisión validados
                    para cada actividad.
                </p>

                <span class="impact-pending">
                    Pendiente de cálculo validado
                </span>

            </article>

            <p class="impact-disclaimer">
                Los resultados corresponden a las cantidades
                declaradas por el usuario. Son registros de actividad
                y no mediciones ambientales directas.
            </p>
        `;
    }
};
