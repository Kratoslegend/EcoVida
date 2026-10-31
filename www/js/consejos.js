const Consejos = {
    categoriaActiva: "todos",

    recursos: [
        {
            categoria: "reciclaje",
            icono: "♻️",
            titulo: "Reciclar correctamente",
            descripcion: "Separar los residuos permite recuperar materiales y reducir la cantidad de basura que termina en vertederos.",
            consejos: [
                "Separa papel, cartón, vidrio, plástico y metales.",
                "Limpia los envases antes de depositarlos en los contenedores.",
                "Aplasta las botellas y cajas para ahorrar espacio.",
                "Revisa qué materiales recibe tu punto de reciclaje local."
            ]
        },
        {
            categoria: "agua",
            icono: "💧",
            titulo: "Cuidar el consumo de agua",
            descripcion: "El agua es un recurso esencial. Pequeños cambios en nuestros hábitos ayudan a evitar su desperdicio.",
            consejos: [
                "Cierra la llave mientras te cepillas los dientes.",
                "Prefiere duchas más cortas.",
                "Repara las filtraciones de llaves y cañerías.",
                "Utiliza el agua de forma responsable al lavar."
            ]
        },
        {
            categoria: "energia",
            icono: "⚡",
            titulo: "Ahorrar energía eléctrica",
            descripcion: "Reducir el consumo eléctrico ayuda a aprovechar mejor los recursos energéticos y disminuir las emisiones asociadas a su generación.",
            consejos: [
                "Apaga las luces cuando no sean necesarias.",
                "Desconecta cargadores que no estés utilizando.",
                "Prefiere ampolletas LED.",
                "Aprovecha la luz natural durante el día."
            ]
        },
        {
            categoria: "transporte",
            icono: "🚲",
            titulo: "Elegir movilidad sostenible",
            descripcion: "Elegir alternativas de transporte con menor impacto ambiental contribuye a reducir la contaminación.",
            consejos: [
                "Camina cuando las distancias sean cortas.",
                "Utiliza la bicicleta cuando sea seguro hacerlo.",
                "Prefiere el transporte público cuando sea una alternativa adecuada.",
                "Comparte el automóvil cuando sea posible."
            ]
        },
        {
            categoria: "consumo",
            icono: "🌱",
            titulo: "Consumir responsablemente",
            descripcion: "Tomar decisiones de compra conscientes permite reducir residuos y aprovechar mejor los productos.",
            consejos: [
                "Compra solamente lo que necesitas.",
                "Prefiere productos reutilizables.",
                "Evita los envases de un solo uso cuando existan alternativas.",
                "Reutiliza objetos antes de desecharlos."
            ]
        }
    ],

    filtrar(categoria) {
        this.categoriaActiva = categoria;
        this.renderizar();
    },

    renderizar() {
        const contenedor = document.getElementById("learn-content");

        if (!contenedor) return;

        const categorias = [
            { id: "todos", nombre: "Todos" },
            { id: "reciclaje", nombre: "Reciclaje" },
            { id: "agua", nombre: "Agua" },
            { id: "energia", nombre: "Energía" },
            { id: "transporte", nombre: "Transporte" },
            { id: "consumo", nombre: "Consumo" }
        ];

        const recursosFiltrados = this.categoriaActiva === "todos"
            ? this.recursos
            : this.recursos.filter(
                recurso => recurso.categoria === this.categoriaActiva
            );

        contenedor.innerHTML = `
            <div class="learn-intro">
                <span class="learn-eyebrow">CENTRO DE APRENDIZAJE</span>
                <h2>Aprende a cuidar el planeta</h2>
                <p>
                    Descubre hábitos sostenibles y encuentra nuevas
                    formas de reducir tu impacto ambiental.
                </p>
            </div>

            <div class="learn-category-section">
                <h3>Explorar por categoría</h3>

                <div class="learn-filters">
                    ${categorias.map(categoria => `
                        <button
                            class="learn-filter ${
                                this.categoriaActiva === categoria.id
                                    ? "active"
                                    : ""
                            }"
                            data-category="${categoria.id}">
                            ${categoria.nombre}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="learn-resources">
                ${recursosFiltrados.map((recurso, index) => `
                    <article class="learn-card">
                        <div class="learn-card-icon">
                            ${recurso.icono}
                        </div>

                        <div class="learn-card-content">
                            <span class="learn-card-category">
                                ${recurso.categoria.toUpperCase()}
                            </span>

                            <h3>${recurso.titulo}</h3>

                            <p>${recurso.descripcion}</p>

                            <details class="learn-details">
                                <summary>Ver consejos prácticos</summary>

                                <ul>
                                    ${recurso.consejos.map(consejo => `
                                        <li>${consejo}</li>
                                    `).join("")}
                                </ul>
                            </details>
                        </div>
                    </article>
                `).join("")}
            </div>

            <div class="learn-footer">
                <span>🌍</span>
                <div>
                    <strong>Un hábito a la vez</strong>
                    <p>Pequeñas acciones pueden generar grandes cambios.</p>
                </div>
            </div>
        `;

        contenedor.querySelectorAll(".learn-filter").forEach(boton => {
            boton.addEventListener("click", () => {
                this.filtrar(boton.dataset.category);
            });
        });
    }
};
