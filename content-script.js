/**
 * PARASITE v0.1
 * Content script
 *
 * Esta primera versión:
 * 1. Detecta todos los enlaces de la página.
 * 2. Filtra enlaces válidos y visibles.
 * 3. Envía el resultado al service worker.
 * 4. No modifica todavía la navegación.
 */

console.log("================================");
console.log("[PARASITE] CONTENT SCRIPT CARGADO");
console.log("[PARASITE] URL:", window.location.href);
console.log("[PARASITE] Título:", document.title);
console.log("================================");

(() => {
    "use strict";

    /**
     * Convierte un enlace del DOM en un objeto simple.
     *
     * @param {HTMLAnchorElement} link
     * @returns {{
     *   href: string,
     *   text: string,
     *   internal: boolean
     * }}
     */
    function serializeLink(link) {
        const url = new URL(link.href);

        return {
            href: url.href,
            text: link.textContent.trim().replace(/\s+/g, " ").slice(0, 200),
            internal: url.hostname === window.location.hostname
        };
    }

    /**
     * Determina si el enlace es utilizable por PARASITE.
     *
     * Por ahora aceptamos únicamente enlaces HTTP y HTTPS.
     *
     * @param {HTMLAnchorElement} link
     * @returns {boolean}
     */
    function isValidLink(link) {
        if (!link.href) {
            return false;
        }

        let url;

        try {
            url = new URL(link.href);
        } catch (error) {
            return false;
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            return false;
        }

        if (url.href === window.location.href + "#") {
            return false;
        }

        return true;
    }

    /**
     * Determina si el enlace ocupa espacio visible en la página.
     *
     * @param {HTMLAnchorElement} link
     * @returns {boolean}
     */
    function isVisibleLink(link) {
        const style = window.getComputedStyle(link);
        const rect = link.getBoundingClientRect();

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
     * Busca y procesa los enlaces de la página.
     *
     * @returns {Array}
     */
    function collectLinks() {
        const allLinks = Array.from(
            document.querySelectorAll("a[href]")
        );

        return allLinks
            .filter(isValidLink)
            .filter(isVisibleLink)
            .map(serializeLink);
    }

    /**
     * Envía al service worker la información encontrada.
     */
    async function reportPage() {
        const links = collectLinks();

        const internalLinks = links.filter(
            (link) => link.internal
        );

        const externalLinks = links.filter(
            (link) => !link.internal
        );

        const pageData = {
            type: "PAGE_DISCOVERED",

            page: {
                url: window.location.href,
                hostname: window.location.hostname,
                title: document.title
            },

            counts: {
                total: links.length,
                internal: internalLinks.length,
                external: externalLinks.length
            },

            links
        };

        console.log(
            "[PARASITE] Página detectada:",
            pageData.page
        );

        console.log(
            "[PARASITE] Enlaces encontrados:",
            pageData.counts
        );

        console.log(
            "[PARASITE] Lista de enlaces:",
            links
        );

        try {
            const response = await chrome.runtime.sendMessage(
                pageData
            );

            console.log(
                "[PARASITE] Respuesta del service worker:",
                response
            );
        } catch (error) {
            console.error(
                "[PARASITE] No se pudo contactar al service worker:",
                error
            );
        }
    }

    reportPage();
})();