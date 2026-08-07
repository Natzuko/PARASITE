/**
 * ==========================================================
 * PARASITE
 * cognition.js
 * ----------------------------------------------------------
 * Sistema de cognición.
 *
 * Recibe el foco actual de Attention y produce una
 * interpretación sobre ese objetivo.
 *
 * Cognition no selecciona objetivos.
 * Cognition no modifica el DOM.
 * Cognition no ejecuta acciones.
 *
 * Solamente interpreta aquello que el organismo observa.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasiteCognition {
    constructor() {
      this.lastInterpretation = null;

      console.log("[PARASITE] COGNITION ONLINE");
    }

    /**
     * Interpreta el foco actual del organismo.
     *
     * @param {Object} currentFocus
     * @param {Object|null} state
     * @returns {Object|null}
     */
    interpretFocus(currentFocus, state = null) {
      if (!currentFocus || typeof currentFocus !== "object") {
        console.error("[PARASITE] COGNITION INVALID FOCUS");

        return null;
      }

      const target = currentFocus.target;

      if (!target) {
        console.warn("[PARASITE] COGNITION HAS NO TARGET");

        return null;
      }

      const subject = currentFocus.subject ?? "UNKNOWN";

      const familiarity = this.calculateFamiliarity(target, subject, state);

      const novelty = this.calculateNovelty(familiarity);

      const curiosity = this.calculateCuriosity(novelty, currentFocus.score);

      const confidence = this.calculateConfidence(currentFocus, target);

      const recommendation = this.chooseRecommendation({
        familiarity,
        novelty,
        curiosity,
        confidence,
      });

      const interpretation = {
        subject,

        targetType: this.describeTargetType(target),

        familiarity,

        novelty,

        curiosity,

        confidence,

        recommendation,

        interpretedAt: Date.now(),
      };

      this.lastInterpretation = interpretation;

      console.log("[PARASITE] COGNITION INTERPRETATION:", interpretation);

      return interpretation;
    }

    /**
     * Calcula cuán familiar resulta el objetivo.
     *
     * En esta primera versión utiliza la presencia del objetivo
     * dentro de la memoria del grafo.
     *
     * @param {Element} target
     * @param {string} subject
     * @param {Object|null} state
     * @returns {number}
     */
    calculateFamiliarity(target, subject, state) {
      if (!state?.graph?.nodes || !Array.isArray(state.graph.nodes)) {
        return 0;
      }

      const identity = this.extractTargetIdentity(target, subject);

      if (!identity) {
        return 0;
      }

      const occurrences = state.graph.nodes.filter((node) => {
        return (
          node.url === identity ||
          node.href === identity ||
          node.text === identity
        );
      }).length;

      return this.clamp(occurrences / 10);
    }

    /**
     * La novedad es el inverso de la familiaridad.
     *
     * @param {number} familiarity
     * @returns {number}
     */
    calculateNovelty(familiarity) {
      return this.clamp(1 - familiarity);
    }

    /**
     * Combina novedad y score de Attention.
     *
     * @param {number} novelty
     * @param {number} attentionScore
     * @returns {number}
     */
    calculateCuriosity(novelty, attentionScore) {
      const score = Number.isFinite(attentionScore) ? attentionScore : 0;

      return this.clamp(novelty * 0.7 + score * 0.3);
    }

    /**
     * Evalúa si el objetivo sigue siendo observable.
     *
     * @param {Object} currentFocus
     * @param {Element} target
     * @returns {number}
     */
    calculateConfidence(currentFocus, target) {
      let confidence = 0;

      if (target.isConnected) {
        confidence += 0.5;
      }

      if (target.ownerDocument === document) {
        confidence += 0.3;
      }

      if (Number.isFinite(currentFocus.score)) {
        confidence += currentFocus.score * 0.2;
      }

      return this.clamp(confidence);
    }

    /**
     * Produce una recomendación cognitiva.
     *
     * Todavía no ejecuta ninguna acción.
     *
     * @param {Object} interpretation
     * @returns {string}
     */
    chooseRecommendation(interpretation) {
      const { curiosity, confidence, familiarity } = interpretation;

      if (confidence < 0.4) {
        return "RELEASE_FOCUS";
      }

      if (curiosity > 0.65) {
        return "KEEP_OBSERVING";
      }

      if (familiarity > 0.7) {
        return "SEEK_NEW_TARGET";
      }

      return "CONTEMPLATE";
    }

    /**
     * Extrae una identidad comparable del objetivo.
     *
     * @param {Element} target
     * @param {string} subject
     * @returns {string|null}
     */
    extractTargetIdentity(target, subject) {
      switch (subject) {
        case "LINK":
          return target.href ?? null;

        case "IMAGE":
          return target.src ?? target.alt ?? null;

        case "TEXT":
          return target.textContent?.trim() ?? null;

        default:
          return null;
      }
    }

    /**
     * Describe el tipo real de elemento observado.
     *
     * @param {Element} target
     * @returns {string}
     */
    describeTargetType(target) {
      return target.tagName ? target.tagName.toUpperCase() : "UNKNOWN";
    }

    /**
     * Mantiene un número entre 0 y 1.
     *
     * @param {number} value
     * @returns {number}
     */
    clamp(value) {
      return Math.max(0, Math.min(1, value));
    }

    /**
     * Devuelve la interpretación más reciente.
     *
     * @returns {Object|null}
     */
    getLastInterpretation() {
      return this.lastInterpretation;
    }
  }

  window.parasiteCognition = new ParasiteCognition();
})();
