/**
 * ==========================================================
 * PARASITE
 * observer.js
 * ----------------------------------------------------------
 * Observa cuándo la página está lista.
 *
 * No analiza enlaces.
 * No modifica el DOM.
 * No toma decisiones.
 *
 * Solamente informa a PARASITE que existe una página.
 * ==========================================================
 */

(() => {
    "use strict";

    /**
     * Construye la observación de la página actual
     * y la envía al organismo.
     */
    function observeCurrentPage() {

        if (!window.parasite) {
            console.error(
                "[PARASITE] No se encontró el organismo."
            );

            return;
        }

        const page = {
            url: window.location.href,
            hostname: window.location.hostname,
            title: document.title,
            timestamp: Date.now()
        };

        window.parasite.observePage(page);
    }

    /**
     * Si el DOM todavía está cargando, esperamos.
     * Si ya está listo, observamos inmediatamente.
     */
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            observeCurrentPage,
            { once: true }
        );

    } else {

        observeCurrentPage();

    }

})();