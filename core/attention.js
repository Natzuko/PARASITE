class ParasiteAttention {
  constructor() {
    this.currentFocus = {
      subject: null,
      target: null,
      candidates: [],
      score: 0,
      focusedSince: null,
      focusDuration: null,
    };

    console.log("[PARASITE] ATTENTION ONLINE");
  }

  chooseSubject() {
    const selectedSubject = this.selectSubject();

    this.currentFocus.subject = selectedSubject;

    return selectedSubject;
  }

  selectSubject() {
    const subjects = ["TEXT", "IMAGE", "LINK"];

    const randomIndex = Math.floor(Math.random() * subjects.length);

    return subjects[randomIndex];
  }

  findCandidates(subject) {
    let candidates = [];

    switch (subject) {
      case "IMAGE":
        candidates = [...document.querySelectorAll("img")];
        break;

      case "LINK":
        candidates = [...document.querySelectorAll("a")];
        break;

      case "TEXT":
        candidates = [...document.querySelectorAll("p")];
        break;

      default:
        candidates = [];
    }

    this.currentFocus.candidates = candidates;

    return candidates;
  }

  selectTarget() {
    const candidates = this.currentFocus.candidates;

    if (!candidates || candidates.length === 0) {
      this.currentFocus.target = null;
      this.currentFocus.score = 0;

      return null;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);

    const selectedTarget = candidates[randomIndex];

    this.currentFocus.target = selectedTarget;

    this.currentFocus.score = Math.random();

    this.currentFocus.focusedSince = Date.now();

    return selectedTarget;
  }

  updateFocusDuration() {
    if (!this.currentFocus.focusedSince) {
      this.currentFocus.focusDuration = 0;
      return 0;
    }

    const duration = Date.now() - this.currentFocus.focusedSince;

    this.currentFocus.focusDuration = duration;

    return duration;
  }

  validateTarget() {
    const target = this.currentFocus.target;

    if (!target) {
      return false;
    }

    const isValid = document.contains(target);

    return isValid;
  }

  shouldReleaseTarget() {
    if (!this.currentFocus.focusDuration) {
      return false;
    }

    return this.currentFocus.focusDuration > 30000;
  }

  releaseTarget() {
    this.currentFocus.target = null;
    this.currentFocus.candidates = [];
    this.currentFocus.score = 0;

    this.currentFocus.focusedSince = null;
    this.currentFocus.focusDuration = null;

    console.log("[PARASITE] TARGET RELEASED");
  }

  updateFocus() {
    this.updateFocusDuration();

    if (!this.validateTarget()) {
      this.releaseTarget();
      return;
    }

    if (this.shouldReleaseTarget()) {
      this.releaseTarget();
    }
  }

  hasTarget() {
    return this.currentFocus.target !== null;
  }
}

window.parasiteAttention = new ParasiteAttention();
