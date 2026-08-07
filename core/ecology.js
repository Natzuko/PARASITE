/**
 * ==========================================================
 * PARASITE
 * ecology.js
 * ----------------------------------------------------------
 * Ecología interna del organismo.
 *
 * En esta primera etapa:
 *
 * 1. Recibe los enlaces observados.
 * 2. Evalúa cada enlace.
 * 3. Le asigna un estado ecológico.
 * 4. Devuelve una clasificación completa.
 *
 * Todavía no modifica el DOM.
 * Todavía no elimina enlaces.
 * Todavía no intercepta clics.
 * ==========================================================
 */

(() => {
    "use strict";

    class ParasiteEcology {

        constructor() {
            this.states = {
                ALIVE: "alive",
                WEAK: "weak",
                DEAD: "dead",
                PREFERRED: "preferred"
            };

            console.log(
                "[PARASITE] ECOLOGY ONLINE"
            );
        }

        /**
         * Clasifica todos los enlaces observados.
         *
         * @param {Array<Object>} links
         * @param {Object|null} currentPage
         * @param {Object|null} decision
         *
         * @returns {Array<Object>}
         */
        classifyLinks(
            links,
            currentPage = null,
            decision = null,
            memory = null
        ) {

            if (!Array.isArray(links)) {
                console.error(
                    "[PARASITE] ECOLOGY RECEIVED INVALID LINKS:",
                    links
                );

                return [];
            }

            // ==========================================
            // CONSULTA A LA MEMORIA DEL ORGANISMO
            // ==========================================

            if (memory) {

                console.log(
                    "[PARASITE] ECOLOGY MEMORY:",
                    {
                        pages: memory.observedPages,
                        links: memory.observedLinks,
                        nodes: memory.graph.nodes.length,
                        edges: memory.graph.edges.length
                    }
                );

            }

            // ==========================================

            const ecosystem = links
                .filter((link) =>
                    this.isValidLink(link)
                )
                .map((link) =>
                    this.classifyLink(
                        link,
                        currentPage,
                        decision,
                        memory
                    )
                );

            console.log(
                `[PARASITE] ECOLOGY CLASSIFIED ${ecosystem.length} LINKS`
            );

            console.log(
                "[PARASITE] ECOSYSTEM:",
                ecosystem
            );

            return ecosystem;
        }

        /**
         * Clasifica un enlace individual.
         *
         * @param {Object} link
         * @param {Object|null} currentPage
         * @param {Object|null} decision
         *
         * @returns {Object}
         */
        classifyLink(
            link,
            currentPage = null,
            decision = null,
            memory = null
        ) {
            let survivalScore = 0.5;

            const reasons = [];

            /*
             * Los enlaces externos reciben una ventaja
             * porque permiten que PARASITE abandone
             * el territorio actual.
             */
            if (link.internal === false) {
                survivalScore += 0.2;
                reasons.push("external");
            }

            /*
             * Los enlaces internos conservan cierta
             * estabilidad dentro del ecosistema.
             */
            if (link.internal === true) {
                survivalScore += 0.05;
                reasons.push("internal");
            }

            /*
             * Los enlaces con texto visible poseen
             * una identidad más definida.
             */
            if (
                typeof link.text === "string" &&
                link.text.trim().length > 0
            ) {
                survivalScore += 0.1;
                reasons.push("has-text");
            }

            /*
             * Los textos excesivamente largos
             * pierden fuerza ecológica.
             */
            if (
                typeof link.text === "string" &&
                link.text.trim().length > 120
            ) {
                survivalScore -= 0.15;
                reasons.push("long-text");
            }

            /*
 * ======================================================
 * MEMORY PRESSURE
 * ------------------------------------------------------
 * Cuantas más veces apareció este destino en el grafo,
 * menos fuerza ecológica conserva.
 *
 * PARASITE comienza a desgastar las rutas demasiado
 * conocidas y favorece territorios menos explorados.
 * ======================================================
 */

            const memoryOccurrences =
                this.countDestinationOccurrences(
                    link.href,
                    memory
                );

            /*
             * ======================================================
             * CURIOSITY
             * ------------------------------------------------------
             * Los destinos nunca vistos representan
             * territorio inexplorado.
             *
             * PARASITE siente una ligera atracción
             * por aquello que aún no conoce.
             * ======================================================
             */

            if (memoryOccurrences === 0) {
                survivalScore += 0.25;
                reasons.push("unknown");
            }

            if (memoryOccurrences >= 1 && memoryOccurrences <= 2) {
                survivalScore -= 0.05;
                reasons.push("seen-1-2");
            }

            if (memoryOccurrences >= 3 && memoryOccurrences <= 5) {
                survivalScore -= 0.10;
                reasons.push("seen-3-5");
            }

            if (memoryOccurrences >= 6 && memoryOccurrences <= 10) {
                survivalScore -= 0.20;
                reasons.push("seen-6-10");
            }

            if (memoryOccurrences > 10) {
                survivalScore -= 0.30;
                reasons.push("overexposed");
            }

            /*
             * La página actual no puede ser considerada
             * un destino viable.
             */
            if (
                currentPage &&
                typeof currentPage.url === "string" &&
                link.href === currentPage.url
            ) {
                survivalScore = 0;
                reasons.push("same-page");
            }

            /*
             * El enlace elegido por el cerebro
             * pasa temporalmente a ser preferido.
             */
            const isPreferred =
                decision &&
                decision.chosen &&
                decision.chosen.href === link.href;

            if (isPreferred) {
                survivalScore = 1;
                reasons.push("brain-choice");
            }

            survivalScore =
                this.clamp(
                    survivalScore,
                    0,
                    1
                );

            const state =
                this.resolveState(
                    survivalScore,
                    isPreferred
                );

            return {
                href: link.href,

                hostname:
                    typeof link.hostname === "string"
                        ? link.hostname
                        : null,

                text:
                    typeof link.text === "string"
                        ? link.text
                        : "",

                internal:
                    link.internal === true,

                memoryOccurrences,

                survivalScore,

                state,

                reason:
                    reasons.length > 0
                        ? reasons.join("+")
                        : "neutral",

                evaluatedAt: Date.now()
            };
        }

        /**
         * Determina el estado ecológico
         * según la puntuación de supervivencia.
         *
         * @param {number} survivalScore
         * @param {boolean} isPreferred
         *
         * @returns {string}
         */
        resolveState(
            survivalScore,
            isPreferred = false
        ) {
            if (isPreferred) {
                return this.states.PREFERRED;
            }

            if (survivalScore >= 0.6) {
                return this.states.ALIVE;
            }

            if (survivalScore >= 0.3) {
                return this.states.WEAK;
            }

            return this.states.DEAD;
        }

        /**
         * Verifica que el enlace pueda ser evaluado.
         *
         * @param {Object} link
         * @returns {boolean}
         */
        isValidLink(link) {
            if (!link || typeof link !== "object") {
                return false;
            }

            if (
                typeof link.href !== "string" ||
                link.href.trim().length === 0
            ) {
                return false;
            }

            return true;
        }

        /**
         * Cuenta cuántas veces un destino aparece
         * dentro de las aristas del grafo.
         *
         * @param {string} href
         * @param {Object|null} memory
         *
         * @returns {number}
         */
        countDestinationOccurrences(
            href,
            memory
        ) {
            if (
                typeof href !== "string" ||
                href.trim().length === 0
            ) {
                return 0;
            }

            if (
                !memory ||
                !memory.graph ||
                !Array.isArray(memory.graph.nodes) ||
                !Array.isArray(memory.graph.edges)
            ) {
                return 0;
            }

            const destinationNode =
                memory.graph.nodes.find(
                    (node) =>
                        node &&
                        node.type === "destination" &&
                        node.url === href
                );

            if (!destinationNode) {
                return 0;
            }

            return memory.graph.edges.filter(
                (edge) =>
                    edge &&
                    edge.target === destinationNode.id
            ).length;
        }


        /**
         * Mantiene un valor dentro de un rango.
         *
         * @param {number} value
         * @param {number} minimum
         * @param {number} maximum
         *
         * @returns {number}
         */
        clamp(
            value,
            minimum,
            maximum
        ) {
            return Math.min(
                Math.max(value, minimum),
                maximum
            );
        }
    }

    window.parasiteEcology =
        new ParasiteEcology();

})();