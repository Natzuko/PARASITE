class ParasiteBehavior {
  constructor() {
    this.canvas = null;
    this.ctx = null;

    this.currentTarget = null;
    this.animationId = null;

    this.x = null;
    this.y = null;

    this.mouseX = -1000;
    this.mouseY = -1000;

    // Estados del organismo
    this.behaviorState = "ATTACHED";
    this.nextDecisionAt = 0;

    this.metabolism = {
      energy: 0.8,
      curiosity: 0.45,
      stress: 0.15,
      hunger: 0.25,
    };

    this.lastMetabolismUpdate = null;
    this.lastMetabolismLog = 0;
    this.lastAnatomyLog = 0;

    this.colonization = {
      active: false,
      retracting: false,
      startedAt: 0,
      retractionStartedAt: 0,
      duration: 6000,
      retractionDuration: 2000,
      previousState: "ATTACHED",
    };

    this.visualMutation = {
      active: false,
      level: "LOW",
      startedAt: 0,
      duration: 4000,
      analysis: null,
    };

    this.perception = [];

    this.platformTranslation = {
      active: false,
      phase: "HUMAN",

      humanStartedAt: performance.now(),

      coexistenceDuration: 45000,

      startedAt: 0,
      duration: 7000,
      progress: 0,
    };

    window.addEventListener("mousemove", (event) => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    });

    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      globalThis.browserAdapter
        .sendMessage({
          type: "PARASITE_GLOBAL_ESCAPE",
        })
        .catch((error) => {
          console.error(
            "[PARASITE] GLOBAL ESCAPE REQUEST ERROR",
            error,
          );

          this.exitPlatformView();
        });
    });

    globalThis.browserAdapter.addMessageListener(
      (message) => {
        if (message?.type === "PARASITE_ESCAPE_ALL") {
          this.exitPlatformView();
          return;
        }

        if (message?.type === "PARASITE_FORCE_PLATFORM") {
          this.startPlatformTranslation();
        }
      },
    );

    console.log("[PARASITE] BEHAVIOR ONLINE");
  }

  updateMetabolism(time) {
    if (this.lastMetabolismUpdate === null) {
      this.lastMetabolismUpdate = time;
      return;
    }

    const deltaSeconds = (time - this.lastMetabolismUpdate) / 1000;

    this.lastMetabolismUpdate = time;

    const metabolism = this.metabolism;

    // El organismo consume energía constantemente.
    metabolism.energy -= 0.006 * deltaSeconds;

    // El hambre aumenta con el tiempo.
    metabolism.hunger += 0.008 * deltaSeconds;

    // La curiosidad crece cuando permanece quieto.
    metabolism.curiosity += 0.005 * deltaSeconds;

    // El estrés baja lentamente.
    metabolism.stress -= 0.01 * deltaSeconds;

    // Consecuencias de cada comportamiento.
    if (this.behaviorState === "RESTING") {
      metabolism.energy += 0.018 * deltaSeconds;
      metabolism.stress -= 0.012 * deltaSeconds;
      metabolism.curiosity += 0.004 * deltaSeconds;
    }

    if (this.behaviorState === "ATTACHED") {
      metabolism.energy += 0.004 * deltaSeconds;
      metabolism.hunger -= 0.012 * deltaSeconds;
      metabolism.curiosity -= 0.003 * deltaSeconds;
    }

    if (this.behaviorState === "EXPLORING") {
      metabolism.energy -= 0.018 * deltaSeconds;
      metabolism.curiosity -= 0.018 * deltaSeconds;
      metabolism.hunger += 0.005 * deltaSeconds;
      metabolism.stress += 0.04 * deltaSeconds;
    }

    const dx = this.x - this.mouseX;
    const dy = this.y - this.mouseY;

    const mouseDistance = Math.sqrt(dx * dx + dy * dy);

    // El cursor cercano genera estrés.
    if (mouseDistance < 180) {
      metabolism.stress += 0.04 * deltaSeconds;
    }

    Object.keys(metabolism).forEach((key) => {
      metabolism[key] = Math.max(0, Math.min(1, metabolism[key]));
    });

    if (time - this.lastMetabolismLog > 3000) {
      console.log("[PARASITE] METABOLISM", {
        energy: metabolism.energy.toFixed(2),
        curiosity: metabolism.curiosity.toFixed(2),
        stress: metabolism.stress.toFixed(2),
        hunger: metabolism.hunger.toFixed(2),
      });

      globalThis.browserAdapter
        .sendMessage({
          type: "PARASITE_AUDIO_UPDATE",
          state: {
            energy: metabolism.energy,
            curiosity: metabolism.curiosity,
            stress: metabolism.stress,
            hunger: metabolism.hunger,
          },
        })
        .catch((error) => {
          console.error("[PARASITE] AUDIO UPDATE ERROR", error);
        });

      this.lastMetabolismLog = time;
    }
  }

  chooseAction(artisticState, habitat, memory) {
    const selectedAction = this.selectAction(artisticState, habitat, memory);

    return {
      action: selectedAction,
    };
  }

  selectAction(artisticState) {
    switch (artisticState?.practice) {
      case "RESEARCHING":
        return "SCAN_PAGE";

      case "CONTEMPLATING":
        return "OBSERVE_PATTERN";

      case "COMPOSING":
        return "CREATE_COMPOSITION";

      default:
        return "IDLE";
    }
  }

  execute(lastDecision) {
    if (!lastDecision?.href) {
      return;
    }

    const links = [...document.querySelectorAll("a[href]")];

    const target = links.find((link) => {
      try {
        return (
          new URL(link.href, location.href).href ===
          new URL(lastDecision.href, location.href).href
        );
      } catch {
        return link.href === lastDecision.href;
      }
    });

    if (!target) {
      return;
    }

    this.currentTarget = target;
    this.behaviorState = "ATTACHED";

    if (!this.canvas || !document.contains(this.canvas)) {
      this.createCanvas();
    }

    if (!this.animationId) {
      this.animate();
    }

    console.log("[PARASITE] ORGANISM ACTIVE");
  }

  createCanvas() {
    this.canvas = document.getElementById("parasite-overlay");

    if (!this.canvas) {
      this.canvas = document.createElement("canvas");

      this.canvas.id = "parasite-overlay";

      Object.assign(this.canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "2147483647",
      });

      document.documentElement.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext("2d");
  }

  resizeCanvas() {
    if (!this.canvas || !this.ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    const width = Math.floor(window.innerWidth * dpr);

    const height = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  isVisible(element) {
    if (!element || !document.contains(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    );
  }

  getVisibleLinks() {
    return [...document.querySelectorAll("a[href]")].filter((link) =>
      this.isVisible(link),
    );
  }

  chooseExplorationTarget() {
    const links = this.getVisibleLinks().filter(
      (link) => link !== this.currentTarget,
    );

    if (links.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * links.length);

    this.currentTarget = links[randomIndex];

    const pressure = globalThis.parasitePressure.analyze(this.currentTarget);

    console.log("[PARASITE] NEW AUTONOMOUS TARGET", this.currentTarget.href);

    console.log("[PARASITE] PRESSURE", {
      total: pressure.pressure.toFixed(2),

      prominence: pressure.components.prominence.toFixed(2),

      obstruction: pressure.components.obstruction.toFixed(2),

      imperativeLanguage: pressure.components.imperativeLanguage.toFixed(2),
    });

    const pagePressure = globalThis.parasitePressure.scanDocument();

    this.updatePerception(pagePressure);

    const mutation = globalThis.parasiteMutation.evaluate(
      pagePressure?.strongest,
    );

    globalThis.parasiteMutation.execute(mutation);

    if (mutation?.level === "CRITICAL") {
      this.startColonization();
    }

    if (pagePressure?.strongest) {
      console.log("[PARASITE] PRESSURE TARGET", {
        pressure: pagePressure.strongest.pressure.toFixed(2),

        tag: pagePressure.strongest.element.tagName,

        text: (
          pagePressure.strongest.element.innerText ||
          pagePressure.strongest.element.textContent ||
          ""
        )
          .trim()
          .slice(0, 80),
      });
    }

    globalThis.browserAdapter
      .sendMessage({
        type: "PARASITE_AUDIO_DISCOVERY",
        href: this.currentTarget.href,
      })
      .catch((error) => {
        console.error("[PARASITE] DISCOVERY AUDIO ERROR", error);
      });
  }

  chooseAutonomousBehavior(time) {
    const previousState = this.behaviorState;

    const { energy, curiosity, stress, hunger } = this.metabolism;

    if (energy < 0.3 || stress > 0.75) {
      this.behaviorState = "RESTING";
    } else if (curiosity > 0.65) {
      this.behaviorState = "EXPLORING";
      this.chooseExplorationTarget();
    } else if (hunger > 0.55) {
      this.behaviorState = "ATTACHED";
    } else {
      const random = Math.random();

      if (random < 0.4) {
        this.behaviorState = "RESTING";
      } else if (random < 0.75) {
        this.behaviorState = "ATTACHED";
      } else {
        this.behaviorState = "EXPLORING";
        this.chooseExplorationTarget();
      }
    }

    const nextDelay = 5000 + Math.random() * 7000;

    this.nextDecisionAt = time + nextDelay;

    console.log("[PARASITE] STATE:", this.behaviorState);

    if (previousState && previousState !== this.behaviorState) {
      globalThis.browserAdapter
        .sendMessage({
          type: "PARASITE_AUDIO_MUTATION",
          previousState,
          currentState: this.behaviorState,
        })
        .catch((error) => {
          console.error("[PARASITE] MUTATION AUDIO ERROR", error);
        });
    }
  }

  updateAutonomousBehavior(time) {
    if (
      this.colonization.active ||
      this.colonization.retracting ||
      this.platformTranslation.phase !== "HUMAN"
    ) {
      return;
    }

    if (time >= this.nextDecisionAt) {
      this.chooseAutonomousBehavior(time);
    }

    if (!this.currentTarget || !document.contains(this.currentTarget)) {
      this.chooseExplorationTarget();
    }
  }

  startColonization() {
    if (this.colonization.active || this.colonization.retracting) {
      return;
    }

    this.colonization.previousState = this.behaviorState;

    this.colonization.active = true;
    this.colonization.startedAt = performance.now();

    this.behaviorState = "COLONIZING";

    console.log("[PARASITE] COLONIZATION STARTED");
  }

  updateColonization(time) {
    if (this.colonization.active) {
      const elapsed = time - this.colonization.startedAt;

      if (elapsed >= this.colonization.duration) {
        this.colonization.active = false;
        this.colonization.retracting = true;

        this.colonization.retractionStartedAt = time;

        this.behaviorState = "RETRACTING";

        console.log("[PARASITE] RETRACTION STARTED");
      }

      return;
    }

    if (this.colonization.retracting) {
      const elapsed = time - this.colonization.retractionStartedAt;

      if (elapsed >= this.colonization.retractionDuration) {
        this.colonization.retracting = false;

        this.behaviorState = this.colonization.previousState || "RESTING";

        console.log("[PARASITE] COLONIZATION FINISHED", this.behaviorState);
      }
    }
  }

  startVisualMutation(mutation) {
    if (
      !mutation ||
      this.visualMutation.active ||
      this.colonization.active ||
      this.colonization.retracting
    ) {
      return;
    }

    this.visualMutation.active = false;
    this.visualMutation.level = "LOW";
    this.visualMutation.analysis = null;

    this.colonization.previousState = this.behaviorState;

    console.log("[PARASITE] VISUAL MUTATION STARTED", mutation.level);
  }

  updateVisualMutation(time) {
    if (!this.visualMutation.active) {
      return;
    }

    const elapsed = time - this.visualMutation.startedAt;

    if (elapsed >= this.visualMutation.duration) {
      this.visualMutation.active = false;
      this.visualMutation.level = "LOW";
      this.visualMutation.analysis = null;

      console.log("[PARASITE] VISUAL MUTATION FINISHED");
    }
  }

  getVisualMutationProgress(time) {
    if (!this.visualMutation.active) {
      return 0;
    }

    const elapsed = time - this.visualMutation.startedAt;

    const normalized = Math.min(1, elapsed / this.visualMutation.duration);

    return Math.sin(normalized * Math.PI);
  }

  exitPlatformView() {
    if (
      this.platformTranslation.phase !== "PLATFORM" &&
      this.platformTranslation.phase !== "TRANSLATING"
    ) {
      return;
    }

    this.platformTranslation.active = false;
    this.platformTranslation.phase = "HUMAN";
    this.platformTranslation.progress = 0;
    this.platformTranslation.startedAt = 0;
    this.platformTranslation.humanStartedAt = performance.now();

    this.behaviorState = "ATTACHED";

    if (globalThis.parasitePlatformView?.consumption) {
      globalThis.parasitePlatformView.consumption.active = false;
      globalThis.parasitePlatformView.consumption.node = null;
      globalThis.parasitePlatformView.consumption.progress = 0;
    }

    if (globalThis.parasiteNavigation) {
      globalThis.parasiteNavigation.locked = false;
    }

    console.log("[PARASITE] HUMAN VIEW RESTORED");
  }


  startPlatformTranslation() {
    if (
      this.platformTranslation.active ||
      this.platformTranslation.phase === "PLATFORM"
    ) {
      return;
    }

    this.platformTranslation.active = true;
    this.platformTranslation.phase = "TRANSLATING";
    this.platformTranslation.startedAt = performance.now();
    this.platformTranslation.progress = 0;

    this.behaviorState = "TRANSLATING";

    console.log("[PARASITE] PLATFORM TRANSLATION STARTED");
  }

  updatePlatformTranslation(time) {
    if (
      !this.platformTranslation.active ||
      this.platformTranslation.phase !== "TRANSLATING"
    ) {
      return;
    }

    const elapsed = time - this.platformTranslation.startedAt;

    this.platformTranslation.progress = Math.max(
      0,
      Math.min(1, elapsed / this.platformTranslation.duration),
    );

    if (this.platformTranslation.progress >= 1) {
      this.platformTranslation.progress = 1;
      this.platformTranslation.active = false;
      this.platformTranslation.phase = "PLATFORM";

      this.behaviorState = "PLATFORM";

      console.log("[PARASITE] PLATFORM VIEW ACTIVE");
    }
  }

  getPlatformTranslationProgress() {
    if (this.platformTranslation.phase === "PLATFORM") {
      return 1;
    }

    return this.platformTranslation.progress;
  }

  updatePlatformTrigger(time) {
    const translation = this.platformTranslation;

    if (translation.phase !== "HUMAN" || translation.active) {
      return;
    }

    const coexistenceElapsed = time - translation.humanStartedAt;

    const hasEnoughPerception =
      Array.isArray(this.perception) && this.perception.length >= 3;

    if (
      coexistenceElapsed >= translation.coexistenceDuration &&
      hasEnoughPerception
    ) {
      this.startPlatformTranslation();
    }
  }

  updatePerception(pagePressure) {
    const topElements = pagePressure?.analyses;

    if (!Array.isArray(topElements)) {
      return;
    }

    const nextPerception = topElements
      .map((analysis, index) => {
        const element = analysis?.element;

        if (!element || !document.contains(element)) {
          return null;
        }

        const rect = element.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          return null;
        }

        const tag = element.tagName.toLowerCase();

        let kind = "interface";

        if (tag === "h1" || tag === "h2" || tag === "h3") {
          kind = "title";
        } else if (tag === "p") {
          kind = "text";
        } else if (tag === "img" || tag === "iframe") {
          kind = "image";
        } else if (
          tag === "button" ||
          element.getAttribute("role") === "button"
        ) {
          kind = "button";
        }

        return {
          element,
          pressure: analysis.pressure ?? 0,

          components: analysis.components ?? {},

          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,

          centerX: rect.left + rect.width / 2,

          centerY: rect.top + rect.height / 2,

          kind,

          life: 1,

          pulse: 0.8 + Math.random() * 0.4,

          phase: index * 0.73 + Math.random() * Math.PI,

          opacity: 0.08 + (analysis.pressure ?? 0) * 0.22,

          morphology: 0.7 + (analysis.pressure ?? 0) * 0.8,

          attached: true,
        };
      })
      .filter(Boolean);

    if (nextPerception.length === 0) {
      return;
    }

    this.perception = nextPerception;

    console.log("[PARASITE] PERCEPTION UPDATED", {
      count: this.perception.length,
      kinds: this.perception.reduce((summary, item) => {
        summary[item.kind] = (summary[item.kind] || 0) + 1;

        return summary;
      }, {}),
    });
  }

  drawVisualMutation(time) {
    if (
      !this.ctx ||
      !this.visualMutation.active ||
      !Array.isArray(this.perception)
    ) {
      return;
    }

    const progress = this.getVisualMutationProgress(time);

    this.perception.forEach((matter) => {
      if (!matter?.element || !document.contains(matter.element)) {
        return;
      }

      const rect = matter.element.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.bottom <= 0 ||
        rect.top >= window.innerHeight ||
        rect.right <= 0 ||
        rect.left >= window.innerWidth
      ) {
        return;
      }

      const centerX = rect.left + rect.width / 2;

      const centerY = rect.top + rect.height / 2;

      const attractionX =
        this.x === null ? 0 : (this.x - centerX) * 0.018 * progress;

      const attractionY =
        this.y === null ? 0 : (this.y - centerY) * 0.018 * progress;

      window.parasiteOrganism.drawPerceptionMembrane({
        ctx: this.ctx,

        centerX: centerX + attractionX,

        centerY: centerY + attractionY,

        width: rect.width,

        height: rect.height,

        time,

        phase: matter.phase,

        pressure: matter.pressure,

        progress,

        morphology: matter.morphology,
      });
    });
  }

  getColonizationProgress(time) {
    if (this.colonization.active) {
      const elapsed = time - this.colonization.startedAt;

      const expansionDuration = 1500;

      return Math.min(1, elapsed / expansionDuration);
    }

    if (this.colonization.retracting) {
      const elapsed = time - this.colonization.retractionStartedAt;

      return Math.max(0, 1 - elapsed / this.colonization.retractionDuration);
    }

    return 0;
  }

  animate() {
    const drawFrame = (time) => {
      if (!this.canvas || !document.contains(this.canvas)) {
        this.createCanvas();
      }

      this.resizeCanvas();

      this.updateMetabolism(time);

      this.updateAutonomousBehavior(time);

      this.updateColonization(time);

      this.updateVisualMutation(time);

      this.updatePlatformTrigger(time);

      this.updatePlatformTranslation(time);

      this.draw(time);

      this.animationId = requestAnimationFrame(drawFrame);
    };

    this.animationId = requestAnimationFrame(drawFrame);
  }

  draw(time) {
    if (!this.ctx) {
      return;
    }

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const colonizationProgress = this.getColonizationProgress(time);

    if (colonizationProgress > 0) {
      this.ctx.save();

      this.ctx.fillStyle = `rgba(0,0,0,${colonizationProgress * 0.88})`;

      this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      this.ctx.restore();
    }

    this.drawVisualMutation(time);

    const platformProgress = this.getPlatformTranslationProgress();

    globalThis.parasitePlatformView?.draw({
      ctx: this.ctx,
      time,
      progress: platformProgress,
      phase: this.platformTranslation.phase,
      perception: this.perception,
      organismX: this.x,
      organismY: this.y,
    });

    if (!this.currentTarget || !document.contains(this.currentTarget)) {
      return;
    }

    const rect = this.currentTarget.getBoundingClientRect();

    const targetX = rect.left + rect.width / 2;

    const targetY = rect.top + rect.height / 2;

    if (this.x === null || this.y === null) {
      this.x = targetX;
      this.y = targetY;
    }

    let floatStrength = 1;
    let movementSpeed = 0.055;

    if (this.behaviorState === "RESTING") {
      floatStrength = 0.2;
      movementSpeed = 0.015;
    }

    if (this.behaviorState === "EXPLORING") {
      floatStrength = 1.5;
      movementSpeed = 0.025;
    }

    const floatX = Math.sin(time * 0.0012) * 18 * floatStrength;

    const floatY = Math.cos(time * 0.0015) * 12 * floatStrength;

    let desiredX = targetX + floatX;
    let desiredY = targetY + floatY;

    if (
      this.platformTranslation.phase === "TRANSLATING" ||
      this.platformTranslation.phase === "PLATFORM"
    ) {
      desiredX = window.innerWidth / 2;

      desiredY = window.innerHeight / 2;
    }

    const dx = this.x - this.mouseX;
    const dy = this.y - this.mouseY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const avoidRadius = 180;

    if (distance < avoidRadius && distance > 0) {
      const force = (avoidRadius - distance) / avoidRadius;

      desiredX += (dx / distance) * force * 140;

      desiredY += (dy / distance) * force * 140;
    }

    if (this.platformTranslation.phase === "PLATFORM") {
      desiredX = window.innerWidth / 2;

      desiredY = window.innerHeight / 2;

      movementSpeed = 0.04;
    }

    this.x += (desiredX - this.x) * movementSpeed;

    this.y += (desiredY - this.y) * movementSpeed;

    let radius = 70 + Math.sin(time * 0.002) * 8;
    let activity = 1;
    let tendrilStrength = 1;

    if (this.behaviorState === "RESTING") {
      radius = 62 + Math.sin(time * 0.0012) * 3;
      activity = 0.25;
      tendrilStrength = 0.2;
    }

    if (this.behaviorState === "ATTACHED") {
      radius = 70 + Math.sin(time * 0.002) * 8;
      activity = 1;
      tendrilStrength = 1;
    }

    if (this.behaviorState === "EXPLORING") {
      radius = 58 + Math.sin(time * 0.004) * 12;
      activity = 1.8;
      tendrilStrength = 0.5;
    }

    if (
      this.behaviorState === "COLONIZING" ||
      this.behaviorState === "RETRACTING"
    ) {
      const maximumRadius =
        Math.hypot(window.innerWidth, window.innerHeight) * 0.72;

      radius = 70 + (maximumRadius - 70) * colonizationProgress;

      activity = 2.5 + colonizationProgress * 2;

      tendrilStrength = 1 + colonizationProgress * 2;
    }

    const habitat =
      window.parasite?.state?.lastEcosystem?.habitat ?? {
        familiarity: 0,
        memory: 0,
        population: 0,
      };

    const anatomy =
      window.parasiteEvolution.updateAnatomy(
        this.metabolism,
        habitat,
      );

    if (time - this.lastAnatomyLog > 3000) {
      console.log("[PARASITE] ANATOMY", {
        bodySize: anatomy.bodySize.toFixed(2),
        tendrilCount: anatomy.tendrilCount,
        tendrilLength: anatomy.tendrilLength.toFixed(2),
        membraneComplexity: anatomy.membraneComplexity.toFixed(2),
        nucleusSize: anatomy.nucleusSize.toFixed(2),
        maturity: anatomy.maturity.toFixed(2),
      });

      this.lastAnatomyLog = time;
    }

    window.parasiteOrganism.draw({
      ctx: this.ctx,
      currentTarget: this.currentTarget,
      centerX: this.x,
      centerY: this.y,
      radius,
      time,
      activity,
      tendrilStrength,
      anatomy,
    });
  }
}

window.parasiteBehavior = new ParasiteBehavior();
