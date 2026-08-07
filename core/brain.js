/**
 * ==========================================================
 * PARASITE
 * brain.js
 * ----------------------------------------------------------
 * Cerebro del organismo.
 *
 * En esta etapa:
 * 1. Recibe una lista de enlaces observados.
 * 2. Asigna una puntuación a cada enlace.
 * 3. Elige un único enlace.
 * 4. Explica el criterio de la elección.
 *
 * Todavía no modifica la navegación.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasiteBrain {
    constructor() {
      this.mentalState = {
        current: null,
        previous: null,

        pending: null,

        pendingSince: null,
        pendingSinceObservation: null,

        startedAt: null,
        startedAtObservation: null,

        intensity: 1,
      };
      console.log("[PARASITE] BRAIN ONLINE");
    }

    /**
     * Devuelve el estado mental actual del organismo.
     *
     * @returns {Object}
     */
    getMentalState() {
      return this.mentalState;
    }

    /**
     * Selecciona un estado mental según la interpretación cognitiva.
     *
     * Todavía no modifica el estado actual del organismo.
     *
     * @param {Object|null} interpretation
     * @returns {string}
     */
    selectMentalState(interpretation) {
      const familiarity = Number.isFinite(interpretation?.familiarity)
        ? interpretation.familiarity
        : 0;

      if (familiarity < 0.3) {
        return "CURIOUS";
      }

      if (familiarity < 0.7) {
        return "ABSORBED";
      }

      return "SYNTHESIZING";
    }

    /**
     * Determina si la transición pendiente tuvo suficiente
     * tiempo humano y suficiente experiencia del organismo.
     *
     * @param {Object|null} memory
     * @param {number} minimumDuration
     * @param {number} minimumObservations
     * @returns {boolean}
     */
    isTransitionReady(
      memory = null,
      minimumDuration = 20000,
      minimumObservations = 10,
    ) {
      if (
        this.mentalState.pending === null ||
        this.mentalState.pendingSince === null ||
        this.mentalState.pendingSinceObservation === null
      ) {
        return false;
      }

      const elapsedTime = Date.now() - this.mentalState.pendingSince;

      const currentObservations = Number.isFinite(memory?.observedPages)
        ? memory.observedPages
        : 0;

      const elapsedObservations =
        currentObservations - this.mentalState.pendingSinceObservation;

      const enoughTime = elapsedTime >= minimumDuration;

      const enoughExperience = elapsedObservations >= minimumObservations;

      return enoughTime && enoughExperience;
    }

    /**
     * Completa una transición de estado mental.
     *
     * @param {Object|null} memory
     * @returns {Object}
     */
    completeTransition(memory = null) {
      if (this.mentalState.pending === null) {
        return this.mentalState;
      }

      this.mentalState.previous = this.mentalState.current;

      this.mentalState.current = this.mentalState.pending;

      this.mentalState.startedAt = Date.now();

      this.mentalState.startedAtObservation = Number.isFinite(
        memory?.observedPages,
      )
        ? memory.observedPages
        : 0;

      this.mentalState.pending = null;
      this.mentalState.pendingSince = null;
      this.mentalState.pendingSinceObservation = null;

      console.log("[PARASITE] MENTAL STATE CHANGED", this.mentalState.current);

      return this.mentalState;
    }

    /**
     * Actualiza el estado mental del organismo.
     *
     * @param {Object|null} interpretation
     * @param {Object|null} memory
     * @returns {Object}
     */
    updateMentalState(interpretation, memory = null) {
      const proposedState = this.selectMentalState(interpretation);

      // Primer nacimiento del estado mental
      if (this.mentalState.current === null) {
        this.mentalState.current = proposedState;

        this.mentalState.startedAt = Date.now();

        this.mentalState.startedAtObservation = Number.isFinite(
          memory?.observedPages,
        )
          ? memory.observedPages
          : 0;

        console.log("[PARASITE] MENTAL STATE INITIALIZED", this.mentalState);

        return this.mentalState;
      }

      // Si la propuesta coincide con el estado actual,
      // abandonamos cualquier transición pendiente.
      if (proposedState === this.mentalState.current) {
        this.mentalState.pending = null;
        this.mentalState.pendingSince = null;
        this.mentalState.pendingSinceObservation = null;

        return this.mentalState;
      }

      // Si aparece una propuesta diferente por primera vez,
      // comenzamos una transición potencial.
      if (this.mentalState.pending === null) {
        this.mentalState.pending = proposedState;

        this.mentalState.pendingSince = Date.now();

        this.mentalState.pendingSinceObservation = Number.isFinite(
          memory?.observedPages,
        )
          ? memory.observedPages
          : 0;

        console.log("[PARASITE] CONSIDERING", proposedState);

        return this.mentalState;
      }

      // Si seguimos considerando el mismo cambio,
      // mantenemos la transición y sus tiempos originales.
      if (this.mentalState.pending === proposedState) {
        if (this.isTransitionReady(memory)) {
          return this.completeTransition(memory);
        }

        return this.mentalState;
      }

      // Si apareció otra propuesta distinta,
      // reemplazamos la transición anterior y reiniciamos sus tiempos.
      this.mentalState.pending = proposedState;

      this.mentalState.pendingSince = Date.now();

      this.mentalState.pendingSinceObservation = Number.isFinite(
        memory?.observedPages,
      )
        ? memory.observedPages
        : 0;

      console.log("[PARASITE] CHANGED MIND ABOUT PENDING STATE", proposedState);

      return this.mentalState;
    }

    /**
     * Decide qué práctica artística quiere desarrollar.
     *
     * @param {Object|null} habitat
     * @param {Object|null} memory
     * @returns {{
     *   organismState: string,
     *   practice: string
     * }}
     */
    // The artistic practice persists until its lifespan
    // (measured in observations) is exhausted.

    choosePractice(habitat = null, memory = null) {
      if (memory?.artisticState && typeof memory.artisticState === "object") {
        const startedAt = memory.artisticState.startedAt;
        const duration = memory.artisticState.duration;

        const startedAtObservation = memory.artisticState.startedAtObservation;

        const lifespanInObservations =
          memory.artisticState.lifespanInObservations;

        const humanTimeActive =
          Number.isFinite(startedAt) &&
          Number.isFinite(duration) &&
          Date.now() < startedAt + duration;

        const parasiteTimeActive =
          Number.isFinite(startedAtObservation) &&
          Number.isFinite(lifespanInObservations) &&
          Number.isFinite(memory?.observedPages) &&
          memory.observedPages < startedAtObservation + lifespanInObservations;

        const isStillActive = humanTimeActive && parasiteTimeActive;

        if (isStillActive) {
          console.log(
            "[PARASITE] EXISTING ARTISTIC STATE",
            memory.artisticState,
          );

          return memory.artisticState;
        }
        console.log(
          "[PARASITE] ARTISTIC PRACTICE EXPIRED",
          memory.artisticState,
        );
      }

      const selectedPractice = this.selectPractice(habitat);

      return {
        organismState: selectedPractice.organismState,
        practice: selectedPractice.practice,

        startedAt: Date.now(),
        duration: 24 * 60 * 60 * 1000,

        startedAtObservation: Number.isFinite(memory?.observedPages)
          ? memory.observedPages
          : 0,

        lifespanInObservations: 5,
      };
    }

    selectPractice(habitat = null) {
      const familiarity = Number.isFinite(habitat?.familiarity)
        ? habitat.familiarity
        : 0;

      if (familiarity < 0.3) {
        return {
          organismState: "CURIOUS",
          practice: "RESEARCHING",
        };
      }

      if (familiarity < 0.7) {
        return {
          organismState: "ABSORBED",
          practice: "CONTEMPLATING",
        };
      }

      return {
        organismState: "SYNTHESIZING",
        practice: "COMPOSING",
      };
    }

    /**
     * Elige un enlace entre todos los observados.
     *
     * @param {Array<Object>} links
     * @param {Object|null} currentPage
     * @param {Object|null} habitat
     * @returns {{
     *   chosen: Object,
     *   score: number,
     *   reason: string
     * }|null}
     */

    chooseLink(links, currentPage = null, habitat = null) {
      console.log("[PARASITE] BRAIN RECEIVED HABITAT", habitat);

      if (!Array.isArray(links) || links.length === 0) {
        console.warn("[PARASITE] BRAIN RECEIVED NO LINKS");

        return null;
      }

      const habitatFamiliarity = Number.isFinite(habitat?.familiarity)
        ? habitat.familiarity
        : 0;

      let habitatState = "UNKNOWN";

      if (habitatFamiliarity < 0.3) {
        habitatState = "UNFAMILIAR";
      } else if (habitatFamiliarity < 0.7) {
        habitatState = "FAMILIARIZING";
      } else {
        habitatState = "FAMILIAR";
      }

      console.log("[PARASITE] HABITAT STATE", habitatState);

      const candidates = links
        .filter((link) => this.isValidCandidate(link))
        .map((link) => {
          const evaluation = this.evaluateLink(link, currentPage);

          return {
            link,
            score: evaluation.score,
            reason: evaluation.reason,
          };
        });

      if (candidates.length === 0) {
        console.warn("[PARASITE] BRAIN FOUND NO VALID CANDIDATES");

        return null;
      }

      candidates.sort(
        (candidateA, candidateB) => candidateB.score - candidateA.score,
      );

      const highestScore = candidates[0].score;

      const strongestCandidates = candidates.filter(
        (candidate) => candidate.score === highestScore,
      );

      const chosenCandidate =
        strongestCandidates[
          Math.floor(Math.random() * strongestCandidates.length)
        ];

      console.log("[PARASITE] BRAIN CHOSE:", chosenCandidate);

      return {
        chosen: chosenCandidate.link,
        score: chosenCandidate.score,
        reason: chosenCandidate.reason,
      };
    }

    /**
     * Comprueba que un enlace pueda ser evaluado.
     *
     * @param {Object} link
     * @returns {boolean}
     */
    isValidCandidate(link) {
      if (!link || typeof link !== "object") {
        return false;
      }

      if (typeof link.href !== "string") {
        return false;
      }

      if (link.href.length === 0) {
        return false;
      }

      if (link.alive === false) {
        return false;
      }

      return true;
    }

    /**
     * Evalúa un enlace.
     *
     * Esta primera versión utiliza reglas simples.
     * Más adelante estas reglas serán reemplazadas
     * por relaciones infraestructurales.
     *
     * @param {Object} link
     * @param {Object|null} currentPage
     * @returns {{
     *   score: number,
     *   reason: string
     * }}
     */
    evaluateLink(link, currentPage) {
      let score = 0;
      const reasons = [];

      /*
       * Por ahora PARASITE privilegia enlaces externos.
       *
       * Esto evita que siempre permanezca dentro
       * del mismo dominio.
       */
      if (link.internal === false) {
        score += 5;
        reasons.push("external");
      }

      /*
       * Privilegia enlaces cuyo texto existe.
       */
      if (typeof link.text === "string" && link.text.trim().length > 0) {
        score += 2;
        reasons.push("has-text");
      }

      /*
       * Privilegia textos breves.
       *
       * Evita por ahora enlaces cuyo texto sea
       * un bloque completo de contenido.
       */
      if (
        typeof link.text === "string" &&
        link.text.trim().length > 0 &&
        link.text.trim().length <= 80
      ) {
        score += 2;
        reasons.push("short-text");
      }

      /*
       * Evita elegir la misma URL de la página actual.
       */
      if (
        currentPage &&
        typeof currentPage.url === "string" &&
        link.href === currentPage.url
      ) {
        score -= 100;
        reasons.push("same-page");
      }

      /*
       * Pequeña variación para que dos enlaces
       * equivalentes no produzcan siempre
       * exactamente la misma elección.
       */
      score += Math.random();

      return {
        score,
        reason: reasons.length > 0 ? reasons.join("+") : "neutral",
      };
    }
  }

  window.parasiteBrain = new ParasiteBrain();
})();
