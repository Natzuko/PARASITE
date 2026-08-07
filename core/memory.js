/**
 * ==========================================================
 * PARASITE
 * memory.js
 * ----------------------------------------------------------
 * Memoria persistente del organismo.
 *
 * Este módulo:
 * 1. Lee el estado desde chrome.storage.local.
 * 2. Comprueba que la memoria tenga una estructura válida.
 * 3. Descarta automáticamente memorias antiguas incompatibles.
 * 4. Guarda el estado.
 * 5. Permite borrar la memoria durante las pruebas.
 *
 * No observa páginas.
 * No modifica enlaces.
 * No toma decisiones.
 * ==========================================================
 */

(() => {
    "use strict";

    const STORAGE_KEY = "parasiteState";
    const MEMORY_VERSION = 1;

    class ParasiteMemory {

        /**
         * Comprueba si el estado recuperado tiene
         * la estructura mínima que PARASITE necesita.
         *
         * @param {unknown} state
         * @returns {boolean}
         */
        isValidState(state) {
            if (!state || typeof state !== "object") {
                return false;
            }

            if (state.memoryVersion !== MEMORY_VERSION) {
                return false;
            }

            if (!state.graph || typeof state.graph !== "object") {
                return false;
            }

            if (!Array.isArray(state.graph.nodes)) {
                return false;
            }

            if (!Array.isArray(state.graph.edges)) {
                return false;
            }

            return true;
        }

        /**
         * Recupera el estado persistente.
         *
         * Si encuentra una memoria antigua o incompatible,
         * la elimina automáticamente.
         *
         * @returns {Promise<Object|null>}
         */
        async load() {
            try {
                const result = await chrome.storage.local.get(
                    STORAGE_KEY
                );

                const storedState =
                    result[STORAGE_KEY] ?? null;

                if (storedState === null) {
                    return null;
                }

                if (!this.isValidState(storedState)) {
                    console.warn(
                        "[PARASITE] INCOMPATIBLE MEMORY FOUND"
                    );

                    await chrome.storage.local.remove(
                        STORAGE_KEY
                    );

                    console.warn(
                        "[PARASITE] INCOMPATIBLE MEMORY REMOVED"
                    );

                    return null;
                }

                return storedState;

            } catch (error) {
                console.error(
                    "[PARASITE] MEMORY LOAD ERROR:",
                    error
                );

                return null;
            }
        }

        /**
         * Guarda el estado completo del organismo.
         *
         * Agrega una versión de memoria para poder
         * detectar cambios de estructura en el futuro.
         *
         * @param {Object} state
         * @returns {Promise<boolean>}
         */

        async save(state) {
            try {
                if (!state || typeof state !== "object") {
                    console.error(
                        "[PARASITE] INVALID STATE FOR SAVE:",
                        state
                    );

                    return false;
                }

                const stateToSave = {
                    ...state,

                    lastEcosystem: state.lastEcosystem
                        ? {
                            ...state.lastEcosystem,
                            links: []
                        }
                        : null,

                    memoryVersion: MEMORY_VERSION
                };

                await chrome.storage.local.set({
                    [STORAGE_KEY]: stateToSave
                });

                console.log(
                    "[PARASITE] MEMORY SAVED"
                );

                return true;

            } catch (error) {
                console.error(
                    "[PARASITE] MEMORY SAVE ERROR:",
                    error
                );

                return false;
            }
        }

        /**
         * Borra completamente la memoria.
         *
         * Se utilizará únicamente durante el desarrollo.
         *
         * @returns {Promise<boolean>}
         */

        async clear() {
            try {
                await chrome.storage.local.remove(
                    STORAGE_KEY
                );

                console.log(
                    "[PARASITE] MEMORY CLEARED"
                );

                return true;

            } catch (error) {
                console.error(
                    "[PARASITE] MEMORY CLEAR ERROR:",
                    error
                );

                return false;
            }
        }
    }

    window.parasiteMemory = new ParasiteMemory();

})();