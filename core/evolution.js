/**
 * ==========================================================
 * PARASITE
 * evolution.js
 * ----------------------------------------------------------
 * Evolución temporal del organismo.
 *
 * En esta primera etapa:
 *
 * 1. Recibe el ecosistema actual.
 * 2. Lee la memoria acumulada.
 * 3. Prepara la futura persistencia de estados vitales.
 *
 * Todavía no modifica enlaces.
 * Todavía no cambia la navegación.
 * Todavía no altera el ecosistema.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasiteEvolution {
    constructor() {
      this.anatomy = {
        maturity: 0,

        bodySize: 1,
        bodyElongation: 0,

        membraneComplexity: 1,
        membraneTension: 0.5,

        tendrilCount: 8,
        tendrilLength: 1,
        branching: 0,

        nucleusSize: 1,
        pulseSpeed: 1,
        opacity: 1,
      };

      this.genome = {
        stage: 0,
        mutations: [],
      };

      console.log("[PARASITE] EVOLUTION ONLINE");
    }

    /**
     * Incrementa la edad persistente de un nodo.
     */
    updateAge(link, memory) {
      if (!memory || !memory.graph || !Array.isArray(memory.graph.nodes)) {
        return 1;
      }

      const node = memory.graph.nodes.find(
        (n) => n && n.type === "destination" && n.href === link.href,
      );

      if (!node) {
        return 1;
      }

      if (!Number.isFinite(node.age)) {
        node.age = 1;
      } else {
        node.age += 1;
      }

      return node.age;
    }

    calculateFamiliarity(age) {
      if (!Number.isFinite(age) || age <= 0) {
        return 0;
      }

      return Math.min(1, Math.log1p(age) / Math.log1p(100));
    }
    calculateNovelty(familiarity) {
      if (!Number.isFinite(familiarity)) {
        return 1;
      }

      return Math.max(0, Math.min(1, 1 - familiarity));
    }

    clamp(value, min = 0, max = 1) {
      return Math.max(min, Math.min(max, value));
    }

    lerp(current, target, amount) {
      return current + (target - current) * amount;
    }

    hasMutation(mutationName) {
      return this.genome.mutations.includes(mutationName);
    }

    addMutation(mutationName) {
      if (this.hasMutation(mutationName)) {
        return;
      }

      this.genome.mutations.push(mutationName);

      console.log("[PARASITE] NEW MUTATION:", mutationName);
    }

    updateGenome(anatomy) {
      if (!anatomy) {
        return this.getGenome();
      }

      const maturity = this.clamp(anatomy.maturity ?? 0);

      const complexity = Math.max(1, anatomy.membraneComplexity ?? 1);

      const branching = this.clamp(anatomy.branching ?? 0);

      let desiredStage = 0;

      /*
       * ETAPA 1
       * Aparecen órganos internos.
       */
      if (maturity >= 0.1 || complexity >= 1.8) {
        desiredStage = 1;
        this.addMutation("internal_organs");
      }

      /*
       * ETAPA 2
       * Los órganos forman una red vascular.
       */
      if (maturity >= 0.25 || complexity >= 2.4) {
        desiredStage = 2;
        this.addMutation("vascular_network");
      }

      /*
       * ETAPA 3
       * Aparecen ramificaciones internas.
       */
      if (maturity >= 0.4 || branching >= 0.4) {
        desiredStage = 3;
        this.addMutation("internal_branching");
      }

      /*
       * ETAPA 4
       * El núcleo comienza a dividirse.
       */
      if (maturity >= 0.58 || complexity >= 3.5) {
        desiredStage = 4;
        this.addMutation("double_nucleus");
      }

      /*
       * ETAPA 5
       * La membrana adquiere una estructura avanzada.
       */
      if (maturity >= 0.75 || complexity >= 4.4) {
        desiredStage = 5;
        this.addMutation("complex_membrane");
      }

      /*
       * ETAPA 6
       * Los órganos adquieren movimiento autónomo.
       */
      if (maturity >= 0.9 && branching >= 0.7) {
        desiredStage = 6;
        this.addMutation("mobile_organs");
      }

      /*
       * Las etapas son irreversibles.
       */
      if (desiredStage > this.genome.stage) {
        this.genome.stage = desiredStage;

        console.log("[PARASITE] MUTATION STAGE:", this.genome.stage);
      }

      return this.getGenome();
    }

    getGenome() {
      return {
        stage: this.genome.stage,
        mutations: [...this.genome.mutations],
      };
    }

    updateAnatomy(metabolism, habitat = null) {
      if (!metabolism) {
        return this.anatomy;
      }

      const energy = this.clamp(metabolism.energy ?? 0.5);
      const curiosity = this.clamp(metabolism.curiosity ?? 0.5);
      const stress = this.clamp(metabolism.stress ?? 0);
      const hunger = this.clamp(metabolism.hunger ?? 0);

      const familiarity = this.clamp(habitat?.familiarity ?? 0);

      const habitatMemory = Math.max(0, habitat?.memory ?? 0);

      const maturity = this.clamp(Math.log1p(habitatMemory) / Math.log1p(500));

      const targetAnatomy = {
        maturity,

        bodySize: 0.75 + energy * 0.35 + maturity * 0.3,

        bodyElongation: stress * 0.55 + hunger * 0.25,

        membraneComplexity: 1 + curiosity * 2 + maturity * 3,

        membraneTension: 0.25 + stress * 0.65,

        tendrilCount: Math.round(4 + curiosity * 8 + maturity * 10),

        tendrilLength: 0.6 + curiosity * 0.7 + hunger * 0.45,

        branching: curiosity * 0.45 + maturity * 0.55,

        nucleusSize: 0.75 + hunger * 0.35 + maturity * 0.4,

        pulseSpeed: 0.55 + energy * 0.8 + stress * 0.7,

        opacity: 0.55 + energy * 0.35 + familiarity * 0.1,
      };

      const adaptationSpeed = 0.025;

      for (const key of Object.keys(targetAnatomy)) {
        this.anatomy[key] = this.lerp(
          this.anatomy[key],
          targetAnatomy[key],
          adaptationSpeed,
        );
      }

      this.anatomy.tendrilCount = Math.round(this.anatomy.tendrilCount);

      const genome = this.updateGenome(this.anatomy);

      return {
        ...this.anatomy,
        genome,
      };
    }

    getAnatomy() {
      return { ...this.anatomy };
    }
    /**
     * Procesa un ecosistema.
     *
     * Por ahora devuelve una copia segura
     * sin modificar ningún estado.
     *
     * @param {Array<Object>} ecosystem
     * @param {Object|null} memory
     *
     * @returns {Array<Object>}
     */
    evolve(ecosystem, memory = null) {
      if (!Array.isArray(ecosystem)) {
        console.error(
          "[PARASITE] EVOLUTION RECEIVED INVALID ECOSYSTEM:",
          ecosystem,
        );

        return [];
      }

      if (memory) {
        console.log("[PARASITE] EVOLUTION MEMORY:", {
          pages: memory.observedPages ?? 0,

          links: memory.observedLinks ?? 0,

          nodes: Array.isArray(memory.graph?.nodes)
            ? memory.graph.nodes.length
            : 0,

          edges: Array.isArray(memory.graph?.edges)
            ? memory.graph.edges.length
            : 0,
        });
      }

      const evolvedEcosystem = ecosystem.map((link) => {
        const age = this.updateAge(link, memory);

        const familiarity = this.calculateFamiliarity(age);

        return {
          ...link,

          age,

          familiarity,

          evolution: {
            previousState: link.state ?? null,

            currentState: link.state ?? null,

            changed: false,

            evolvedAt: Date.now(),
          },
        };
      });

      console.log("[PARASITE] EVOLUTION SAMPLE:", evolvedEcosystem[0]);

      console.log(
        `[PARASITE] EVOLUTION PROCESSED ${evolvedEcosystem.length} LINKS`,
      );

      const ages = evolvedEcosystem
        .map((link) => link.age)
        .filter((age) => Number.isFinite(age));

      const familiarities = evolvedEcosystem
        .map((link) => link.familiarity)
        .filter((familiarity) => Number.isFinite(familiarity));

      let habitat = null;

      if (ages.length > 0) {
        const minAge = Math.min(...ages);

        const maxAge = Math.max(...ages);

        const totalAge = ages.reduce((sum, age) => sum + age, 0);

        const averageAge = totalAge / ages.length;

        const totalFamiliarity = familiarities.reduce(
          (sum, familiarity) => sum + familiarity,
          0,
        );

        const averageFamiliarity = totalFamiliarity / familiarities.length;

        habitat = {
          familiarity: averageFamiliarity,

          memory: averageAge,

          population: ages.length,
        };

        console.log("[PARASITE] AGE STATS:", {
          min: minAge,
          max: maxAge,
          average: Number(averageAge.toFixed(2)),
          measuredLinks: ages.length,
        });

        console.log("[PARASITE] HABITAT", {
          familiarity: Number(habitat.familiarity.toFixed(2)),

          memory: Number(habitat.memory.toFixed(2)),

          population: habitat.population,
        });

        const histogram = {
          "1-5": 0,
          "6-20": 0,
          "21-50": 0,
          "51-100": 0,
          "101+": 0,
        };

        for (const age of ages) {
          if (age <= 5) histogram["1-5"]++;
          else if (age <= 20) histogram["6-20"]++;
          else if (age <= 50) histogram["21-50"]++;
          else if (age <= 100) histogram["51-100"]++;
          else histogram["101+"]++;
        }

        console.log("[PARASITE] AGE HISTOGRAM:", histogram);
      }

      evolvedEcosystem.habitat = habitat;

      return evolvedEcosystem;
    }
  }

  window.parasiteEvolution = new ParasiteEvolution();
})();
