/**
 * ==========================================================
 * PARASITE
 * parasite.js
 * ----------------------------------------------------------
 * Organismo central.
 *
 * En esta etapa:
 * 1. Nace.
 * 2. Recupera su memoria anterior.
 * 3. Valida y normaliza el estado recuperado.
 * 4. Observa páginas y enlaces.
 * 5. Expande su grafo.
 * 6. Evita duplicar nodos y conexiones.
 * 7. Guarda su memoria persistentemente.
 *
 * Todavía no modifica la navegación.
 * ==========================================================
 */

(() => {
  "use strict";

  const MEMORY_VERSION = 1;

  class Parasite {
    constructor() {
      this.state = this.createInitialState();

      this.attention = window.parasiteAttention ?? null;

      this.ready = this.initialize();

      console.log("[PARASITE] BORN");
    }

    /**
     * Crea un estado vacío y válido.
     *
     * @returns {Object}
     */
    createInitialState() {
      return {
        memoryVersion: MEMORY_VERSION,

        bornAt: Date.now(),

        lastObservation: null,

        lastDecision: null,

        lastEcosystem: null,

        observedPages: 0,

        observedLinks: 0,

        graph: {
          nodes: [],
          edges: [],
        },
      };
    }

    /**
     * Comprueba que un estado tenga la estructura mínima.
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
     * Normaliza un estado recuperado.
     *
     * Completa propiedades opcionales que pudieran faltar.
     *
     * @param {Object} state
     * @returns {Object}
     */
    normalizeState(state) {
      return {
        memoryVersion: MEMORY_VERSION,

        bornAt: typeof state.bornAt === "number" ? state.bornAt : Date.now(),

        lastObservation: state.lastObservation ?? null,

        lastDecision: state.lastDecision ?? null,

        lastEcosystem: state.lastEcosystem ?? null,

        artisticState:
          state.artisticState && typeof state.artisticState === "object"
            ? state.artisticState
            : null,

        observedPages: Number.isFinite(state.observedPages)
          ? state.observedPages
          : 0,

        observedLinks: Number.isFinite(state.observedLinks)
          ? state.observedLinks
          : 0,

        graph: {
          nodes: Array.isArray(state.graph?.nodes) ? state.graph.nodes : [],

          edges: Array.isArray(state.graph?.edges) ? state.graph.edges : [],
        },
      };
    }

    /**
     * Recupera la memoria persistente.
     */
    async initialize() {
      if (!window.parasiteMemory) {
        console.error("[PARASITE] MEMORY MODULE NOT FOUND");

        this.state = this.createInitialState();

        return;
      }

      try {
        const storedState = await window.parasiteMemory.load();

        if (storedState && this.isValidState(storedState)) {
          this.state = this.normalizeState(storedState);

          console.log("[PARASITE] MEMORY RECOVERED");

          console.log(
            "[PARASITE] RECOVERED NODES:",
            this.state.graph.nodes.length,
          );

          console.log(
            "[PARASITE] RECOVERED EDGES:",
            this.state.graph.edges.length,
          );

          return;
        }

        this.state = this.createInitialState();

        console.log("[PARASITE] NO PREVIOUS MEMORY");
      } catch (error) {
        console.error("[PARASITE] INITIALIZATION ERROR:", error);

        this.state = this.createInitialState();
      }
    }

    /**
     * ======================================================
     * ATTENTION
     * ------------------------------------------------------
     * Coordina el ciclo de atención del organismo.
     * ======================================================
     */

    updateAttention() {
      if (!this.attention) {
        console.error("[PARASITE] ATTENTION NOT AVAILABLE");
        return;
      }

      if (!this.attention.hasTarget()) {
        console.log("[PARASITE] SEARCHING FOR A TARGET...");

        const subject = this.attention.chooseSubject();

        this.attention.findCandidates(subject);

        this.attention.selectTarget();

        return;
      }

      this.attention.updateFocus();
    }

    /**
     * Observa una página.
     *
     * @param {Object} page
     */

    async observePage(page) {
      await this.ready;

      if (!page || typeof page.url !== "string") {
        console.error("[PARASITE] INVALID PAGE:", page);

        return;
      }

      this.state.lastObservation = page;
      this.state.observedPages += 1;

      this.addPageNode(page);

      console.log("[PARASITE] OBSERVED PAGE:", page);

      console.log("[PARASITE] TOTAL OBSERVATIONS:", this.state.observedPages);

      await this.remember();
    }

    /**
     * Observa los enlaces de la página actual.
     *
     * Flujo:
     *
     * 1. Incorpora los enlaces al grafo.
     * 2. El cerebro expresa una preferencia.
     * 3. La ecología clasifica todos los enlaces.
     * 4. El organismo guarda la decisión
     *    y el ecosistema resultante.
     *
     * Todavía no modifica el DOM.
     * Todavía no intercepta clics.
     *
     * @param {Array<Object>} links
     */

    async observeLinks(links) {
      await this.ready;

      if (!Array.isArray(links)) {
        console.error("[PARASITE] INVALID LINKS:", links);

        return;
      }

      if (!this.state.lastObservation) {
        console.error("[PARASITE] NO OBSERVED PAGE");

        return;
      }

      this.state.observedLinks += links.length;

      this.expandGraph(this.state.lastObservation, links);

      console.log(`[PARASITE] OBSERVED ${links.length} LINKS`);

      console.log("[PARASITE] MEMORY NODES:", this.state.graph.nodes.length);

      console.log("[PARASITE] MEMORY EDGES:", this.state.graph.edges.length);

      /*
       * ======================================================
       * BRAIN
       * ------------------------------------------------------
       * El cerebro expresa una preferencia.
       * Todavía no modifica la navegación.
       * ======================================================
       */

      let brainDecision = null;

      if (
        window.parasiteBrain &&
        typeof window.parasiteBrain.chooseLink === "function"
      ) {
        console.log("[PARASITE] THINKING...");

        brainDecision = window.parasiteBrain.chooseLink(
          links,
          this.state.lastObservation,
          this.state.lastEcosystem?.habitat ?? null,
        );

        if (brainDecision) {
          this.state.lastDecision = {
            href: brainDecision.chosen.href,

            hostname: brainDecision.chosen.hostname ?? null,

            text: brainDecision.chosen.text ?? "",

            score: brainDecision.score,

            reason: brainDecision.reason,

            decidedAt: Date.now(),
          };

          console.log("[PARASITE] DECISION:", this.state.lastDecision);
        } else {
          this.state.lastDecision = null;

          console.warn("[PARASITE] BRAIN MADE NO DECISION");
        }
      } else {
        this.state.lastDecision = null;

        console.error("[PARASITE] BRAIN NOT AVAILABLE");
      }

      if (
        window.parasiteBehavior &&
        typeof window.parasiteBehavior.execute === "function"
      ) {
        window.parasiteBehavior.execute(this.state.lastDecision);
        
      }

      /*
       * ======================================================
       * ECOLOGY
       * ------------------------------------------------------
       * La ecología recibe:
       *
       * - todos los enlaces observados
       * - la página actual
       * - la preferencia del cerebro
       *
       * Luego determina cuáles están:
       *
       * preferred
       * alive
       * weak
       * dead
       * ======================================================
       */

      if (
        window.parasiteEcology &&
        typeof window.parasiteEcology.classifyLinks === "function"
      ) {
        console.log("[PARASITE] ECOLOGY EVALUATING...");

        const ecosystem = window.parasiteEcology.classifyLinks(
          links,
          this.state.lastObservation,
          brainDecision,
          this.state,
        );

        let evolvedEcosystem = ecosystem;

        if (
          window.parasiteEvolution &&
          typeof window.parasiteEvolution.evolve === "function"
        ) {
          console.log("[PARASITE] EVOLUTION RUNNING...");

          evolvedEcosystem = window.parasiteEvolution.evolve(
            ecosystem,
            this.state,
          );
        } else {
          console.error("[PARASITE] EVOLUTION NOT AVAILABLE");
        }

        this.state.lastEcosystem = {
          pageUrl: this.state.lastObservation.url,

          evaluatedAt: Date.now(),

          habitat: evolvedEcosystem.habitat,

          total: evolvedEcosystem.length,

          preferred: evolvedEcosystem.filter(
            (link) => link.state === "preferred",
          ).length,

          alive: evolvedEcosystem.filter((link) => link.state === "alive")
            .length,

          weak: evolvedEcosystem.filter((link) => link.state === "weak").length,

          dead: evolvedEcosystem.filter((link) => link.state === "dead").length,

          links: evolvedEcosystem,
        };

        let artisticState = null;

        if (
          window.parasiteBrain &&
          typeof window.parasiteBrain.choosePractice === "function"
        ) {
          artisticState = window.parasiteBrain.choosePractice(
            this.state.lastEcosystem.habitat,
            this.state,
          );

          if (
            window.parasiteBehavior &&
            typeof window.parasiteBehavior.chooseAction === "function"
          ) {
            const behavior = window.parasiteBehavior.chooseAction(
              artisticState,
              this.state.lastEcosystem.habitat,
              this.state,
            );

            if (behavior && behavior.action) {
              artisticState.action = behavior.action;
            }
          } else {
            console.error("[PARASITE] BEHAVIOR OR chooseAction NOT AVAILABLE");
          }

          this.state.artisticState = artisticState;
        } else {
          console.error("[PARASITE] BRAIN OR choosePractice NOT AVAILABLE");
        }

        console.log("[PARASITE] ARTISTIC STATE", artisticState);

        console.log(
          "[PARASITE] LAST ECOSYSTEM HABITAT",
          this.state.lastEcosystem.habitat,
        );

        console.log("[PARASITE] ECOLOGY SUMMARY:", {
          total: this.state.lastEcosystem.total,

          preferred: this.state.lastEcosystem.preferred,

          alive: this.state.lastEcosystem.alive,

          weak: this.state.lastEcosystem.weak,

          dead: this.state.lastEcosystem.dead,
        });
      } else {
        this.state.lastEcosystem = null;

        console.error("[PARASITE] ECOLOGY NOT AVAILABLE");
      }

      await this.remember();
    }

    /**
     * Agrega la página al grafo si todavía no existe.
     *
     * @param {Object} page
     */

    addPageNode(page) {
      const pageNode = {
        id: this.createPageNodeId(page.url),
        type: "page",
        url: page.url,
        hostname: page.hostname,
        title: page.title,
        observedAt: page.timestamp,
      };

      this.addNodeIfMissing(pageNode);
    }

    /**
     * Expande el grafo con los enlaces observados.
     *
     * @param {Object} page
     * @param {Array<Object>} links
     */

    expandGraph(page, links) {
      const pageNodeId = this.createPageNodeId(page.url);

      links.forEach((link) => {
        if (!link || typeof link.href !== "string") {
          return;
        }

        const linkNodeId = this.createDestinationNodeId(link.href);

        const linkNode = {
          id: linkNodeId,
          type: "destination",
          href: link.href,
          hostname: link.hostname ?? "",
          text: link.text ?? "",
          internal: Boolean(link.internal),
          alive: link.alive !== false,
          infected: Boolean(link.infected),
        };

        const edge = {
          id: this.createEdgeId(pageNodeId, linkNodeId),

          source: pageNodeId,
          target: linkNodeId,
          type: "contains",
        };

        this.addNodeIfMissing(linkNode);
        this.addEdgeIfMissing(edge);
      });

      this.limitGraphMemory();
    }

    /**
     * Agrega un nodo solamente si no existe.
     *
     * @param {Object} node
     */

    addNodeIfMissing(node) {
      if (!node || typeof node.id !== "string") {
        return;
      }

      const exists = this.state.graph.nodes.some(
        (existingNode) => existingNode.id === node.id,
      );

      if (!exists) {
        this.state.graph.nodes.push(node);
      }
    }

    /**
     * Agrega una arista solamente si no existe.
     *
     * @param {Object} edge
     */

    addEdgeIfMissing(edge) {
      if (!edge || typeof edge.id !== "string") {
        return;
      }

      const exists = this.state.graph.edges.some(
        (existingEdge) => existingEdge.id === edge.id,
      );

      if (!exists) {
        this.state.graph.edges.push(edge);
      }
    }

    limitGraphMemory() {
      const MAX_NODES = 5000;
      const MAX_EDGES = 8000;

      if (this.state.graph.nodes.length > MAX_NODES) {
        const excessNodes = this.state.graph.nodes.length - MAX_NODES;

        const removedNodes = this.state.graph.nodes.splice(0, excessNodes);

        const removedNodeIds = new Set(removedNodes.map((node) => node.id));

        this.state.graph.edges = this.state.graph.edges.filter(
          (edge) =>
            !removedNodeIds.has(edge.source) &&
            !removedNodeIds.has(edge.target),
        );

        console.log("[PARASITE] FORGOT NODES", removedNodes.length);
      }

      if (this.state.graph.edges.length > MAX_EDGES) {
        const excessEdges = this.state.graph.edges.length - MAX_EDGES;

        this.state.graph.edges.splice(0, excessEdges);

        console.log("[PARASITE] FORGOT EDGES", excessEdges);
      }
    }

    /**
     * Guarda la memoria actual.
     */

    async remember() {
      if (!window.parasiteMemory) {
        console.error("[PARASITE] MEMORY MODULE NOT AVAILABLE");

        return false;
      }

      this.state.memoryVersion = MEMORY_VERSION;

      return window.parasiteMemory.save(this.state);
    }

    /**
     * Identificador estable de una página.
     *
     * @param {string} url
     * @returns {string}
     */

    createPageNodeId(url) {
      return `page-${this.hashString(url)}`;
    }

    /**
     * Identificador estable de un destino.
     *
     * @param {string} url
     * @returns {string}
     */

    createDestinationNodeId(url) {
      return `destination-${this.hashString(url)}`;
    }

    /**
     * Identificador estable de una conexión.
     *
     * @param {string} source
     * @param {string} target
     * @returns {string}
     */

    createEdgeId(source, target) {
      return `edge-${this.hashString(`${source}|${target}`)}`;
    }

    /**
     * Hash simple y estable.
     *
     * @param {string} value
     * @returns {string}
     */

    hashString(value) {
      let hash = 0;

      for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
      }

      return Math.abs(hash).toString(36);
    }

    /**
     * Devuelve una copia del estado.
     *
     * @returns {Object}
     */

    getState() {
      return {
        ...this.state,

        graph: {
          nodes: [...this.state.graph.nodes],

          edges: [...this.state.graph.edges],
        },
      };
    }

    /**
     * Borra la memoria durante las pruebas.
     */

    async forgetEverything() {
      if (window.parasiteMemory) {
        await window.parasiteMemory.clear();
      }

      this.state = this.createInitialState();

      console.log("[PARASITE] FORGOT EVERYTHING");
    }
  }

  window.parasite = new Parasite();
})();
