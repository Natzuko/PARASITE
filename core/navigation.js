/**
 * ==========================================================
 * PARASITE
 * navigation.js
 * ----------------------------------------------------------
 * Permite navegar mediante los nodos de Platform View.
 *
 * No dibuja.
 * No agrega textos.
 * No modifica la estética.
 *
 * Solo actúa durante PLATFORM.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasiteNavigation {
    constructor() {
      this.locked = false;

      window.addEventListener(
        "click",
        (event) => {
          this.handleClick(event);
        },
        true,
      );

      console.log("[PARASITE] NAVIGATION ONLINE");
    }

    handleClick(event) {
      if (this.locked) {
        return;
      }

      const behavior = globalThis.parasiteBehavior;

      const platformView = globalThis.parasitePlatformView;

      if (
        !behavior ||
        !platformView ||
        behavior.platformTranslation?.phase !== "PLATFORM"
      ) {
        return;
      }

      const navigationNode = platformView.getNavigationTarget?.(
        event.clientX,
        event.clientY,
      );

      if (!navigationNode || !navigationNode.element?.href) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.locked = true;

      const destination = navigationNode.element.href;

      console.log(
        navigationNode.element.target,
        navigationNode.element.rel
      );

      platformView.beginConsumption?.(navigationNode);

      globalThis.browserAdapter
        .sendMessage({
          type: "PARASITE_COLONIZE_ALL",
        })
        .catch((error) => {
          console.error(
            "[PARASITE] GLOBAL COLONIZATION REQUEST ERROR",
            error,
          );
        });

      console.log("[PARASITE] PLATFORM ROUTE", {
        destination,
      });

      const currentUrl = window.location.href;

      window.setTimeout(() => {
        window.location.assign(destination);
      }, 80);

      window.setTimeout(() => {
        if (window.location.href === currentUrl) {
          this.locked = false;

          console.warn(
            "[PARASITE] NAVIGATION UNLOCKED",
          );
        }
      }, 5000);

    }
  }

  globalThis.parasiteNavigation = new ParasiteNavigation();
})();
