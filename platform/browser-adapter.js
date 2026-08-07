/**
 * ==========================================================
 * PARASITE
 * platform/browser-adapter.js
 * ----------------------------------------------------------
 * Capa de compatibilidad entre PARASITE y el navegador.
 * ==========================================================
 */

(() => {

    "use strict";

    const runtime =
        globalThis.browser?.runtime ||
        globalThis.chrome?.runtime ||
        null;

    class BrowserAdapter {

        sendMessage(message) {

            if (!runtime) {

                console.error(
                    "[PARASITE] BROWSER RUNTIME NOT AVAILABLE"
                );

                return Promise.reject(
                    new Error("Browser runtime not available")
                );
            }

            return runtime.sendMessage(message);

        }

        addMessageListener(handler) {
            if (!runtime?.onMessage) {
                console.error(
                    "[PARASITE] BROWSER MESSAGE LISTENER NOT AVAILABLE",
                );

                return;
            }

            runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    handler(message, sender, sendResponse);
                },
            );
        }

    }

    globalThis.browserAdapter =
        new BrowserAdapter();

})();