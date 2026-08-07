/**
 * ==========================================================
 * PARASITE
 * audio/host.js
 * ----------------------------------------------------------
 * Recibe mensajes dentro del offscreen.
 * Coordina Physiology y AudioEngine.
 * ==========================================================
 */

(() => {
  "use strict";

  class AudioHost {
    constructor() {
      this.physiology = new globalThis.Physiology();

      this.engine = new globalThis.AudioEngine();

      this.listen();

      console.log("[PARASITE] AUDIO HOST ONLINE");
    }

    listen() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message?.type) {
          return;
        }

        switch (message.type) {
          case "PARASITE_AUDIO_START":
            this.engine
              .start()
              .then(() => {
                sendResponse({
                  ok: true,
                  action: "habitat-started",
                });
              })
              .catch((error) => {
                sendResponse({
                  ok: false,
                  error: error.message,
                });
              });

            return true;

          case "PARASITE_AUDIO_DISCOVERY_OFFSCREEN":

            this.engine.playClick01();

            sendResponse({
              ok: true,
              action: "discovery-played",
            });

            break;

          case "PARASITE_AUDIO_MUTATION_OFFSCREEN":

            this.engine.playClick02();

            sendResponse({
              ok: true,
              action: "mutation-played",
            });

            break;

          case "PARASITE_AUDIO_NOISE02_OFFSCREEN":

            this.engine.playNoise02();

            sendResponse({
              ok: true,
              action: "noise-02-played",
            });

            break;

          case "PARASITE_AUDIO_UPDATE": {
            const state = this.physiology.update(message.state);

            this.engine.update(state);

            console.log("[PARASITE] PHYSIOLOGY UPDATED", state);

            sendResponse({
              ok: true,
              state,
            });

            break;
          }
        }
      });
    }
  }

  globalThis.audioHost = new AudioHost();
})();
