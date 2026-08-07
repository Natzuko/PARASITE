/**
 * ==========================================================
 * PARASITE
 * links.js
 * ----------------------------------------------------------
 * Percibe las conexiones visibles de la página.
 *
 * Este módulo:
 * 1. Busca enlaces HTTP y HTTPS.
 * 2. Descarta enlaces invisibles o inválidos.
 * 3. Construye objetos simples.
 * 4. Entrega la colección al organismo.
 *
 * No guarda estado.
 * No modifica el DOM.
 * No intercepta clics.
 * ==========================================================
 */

(() => {
    "use strict";

    /**
     * Comprueba si un enlace ocupa espacio visible.
     *
     * @param {HTMLAnchorElement} element
     * @returns {boolean}
     */
    function isVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        if (style.display === "none") {
            return false;
        }

        if (style.visibility === "hidden") {
            return false;
        }

        if (Number(style.opacity) === 0) {
            return false;
        }

        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Convierte un elemento HTML en una conexión observada.
     *
     * @param {HTMLAnchorElement} element
     * @param {number} index
     * @returns {Object|null}
     */
    function createObservedLink(element, index) {
        let url;

        try {
            url = new URL(element.href);
        } catch (error) {
            return null;
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            return null;
        }

        if (!isVisible(element)) {
            return null;
        }

        return {
            id: `link-${index}`,
            href: url.href,
            hostname: url.hostname,
            text: element.textContent
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 200),
            internal: url.hostname === window.location.hostname,
            visible: true,
            alive: true,
            infected: false
        };
    }

    /**
     * Recolecta las conexiones presentes en la página.
     *
     * @returns {Array<Object>}
     */
    function collectLinks() {
        const elements = Array.from(
            document.querySelectorAll("a[href]")
        );

        return elements
            .map(createObservedLink)
            .filter((link) => link !== null);
    }

    /**
     * Entrega la percepción al organismo.
     */
    function observeConnections(attempt = 0) {
        if (!window.parasite) {
            console.error(
                "[PARASITE] links.js no encontró el organismo."
            );

            return;
        }

        const links = collectLinks();

        if (links.length === 0 && attempt < 5) {
            window.setTimeout(() => {
                observeConnections(attempt + 1);
            }, 1500);

            return;
        }

        window.parasite.observeLinks(links);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            observeConnections,
            { once: true }
        );
    } else {
        observeConnections();
    }
})();