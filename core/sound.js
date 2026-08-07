/**
 * ==========================================================
 * PARASITE
 * core/sound.js
 * ----------------------------------------------------------
 * Desbloqueo inicial del sistema sonoro.
 *
 * No genera audio.
 * No crea AudioContext.
 * Solo activa una vez el motor persistente.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasiteSound {
    constructor() {
      this.started = false;

      this.handleFirstInteraction = this.handleFirstInteraction.bind(this);

      window.addEventListener("pointerdown", this.handleFirstInteraction, {
        once: true,
      });

      console.log("[PARASITE] SOUND CONTROLLER ONLINE");
    }

    async handleFirstInteraction() {
      if (this.started) {
        return;
      }

      this.started = true;

      try {
        const response = await globalThis.audioBridge.start();

        console.log("[PARASITE] PERSISTENT AUDIO UNLOCKED", response);
      } catch (error) {
        this.started = false;

        console.error("[PARASITE] AUDIO UNLOCK ERROR", error);
      }
    }
  }

  globalThis.parasiteSound = new ParasiteSound();
})();
