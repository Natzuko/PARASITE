/**
 * ==========================================================
 * PARASITE
 * audio/bridge.js
 * ----------------------------------------------------------
 * Puente entre el organismo y la infraestructura de audio.
 *
 * NO genera sonido.
 * NO conoce AudioContext.
 * NO conoce Chrome directamente.
 * ==========================================================
 */

(() => {

    "use strict";

    class AudioBridge {

        start() {

            return globalThis.browserAdapter.sendMessage({
                type: "PARASITE_AUDIO_START"
            });

        }

    }

    globalThis.audioBridge =
        new AudioBridge();

})();