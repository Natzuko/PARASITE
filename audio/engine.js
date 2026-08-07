/**
 * ==========================================================
 * PARASITE
 * audio/engine.js
 * ----------------------------------------------------------
 * Motor sonoro persistente.
 * Primera capa: habitat.
 * ==========================================================
 */

(() => {
  "use strict";

  class AudioEngine {
    constructor() {
      this.initialized = false;

      this.context = null;
      this.masterGain = null;

      this.habitatBuffer = null;
      this.habitatSource = null;

      this.click01Buffer = null;
      this.click02Buffer = null;

      this.noiseBuffer = null;
      this.noiseSource = null;
      this.noiseGain = null;
      this.noise02Buffer = null;

      this.state = {
        energy: 0,
        stress: 0,
        curiosity: 0,
        familiarity: 0,
        active: false,
      };
    }

    initialize() {
      if (this.initialized) {
        return;
      }

      const AudioContextClass =
        globalThis.AudioContext || globalThis.webkitAudioContext;

      if (!AudioContextClass) {
        console.error("[PARASITE] WEB AUDIO NOT SUPPORTED");

        return;
      }

      this.context = new AudioContextClass();

      this.masterGain = this.context.createGain();

      this.masterGain.gain.value = 0;

      this.masterGain.connect(this.context.destination);

      this.initialized = true;

      console.log("[PARASITE] AUDIO ENGINE INITIALIZED");
    }

    async loadHabitat() {
      if (this.habitatBuffer) {
        return;
      }

      const habitatURL = chrome.runtime.getURL("audio/habitat/habitat_01.wav");

      const response = await fetch(habitatURL);

      if (!response.ok) {
        throw new Error(`Habitat could not be loaded: ${response.status}`);
      }

      const audioData = await response.arrayBuffer();

      this.habitatBuffer = await this.context.decodeAudioData(audioData);

      console.log("[PARASITE] HABITAT LOADED");
    }

    async loadClick01() {
      if (this.click01Buffer) {
        return;
      }

      const clickURL = chrome.runtime.getURL(
        "audio/events/click_01.wav",
      );

      const response = await fetch(clickURL);

      if (!response.ok) {
        throw new Error(
          `Click 01 could not be loaded: ${response.status}`,
        );
      }

      const audioData = await response.arrayBuffer();

      this.click01Buffer =
        await this.context.decodeAudioData(audioData);

      console.log("[PARASITE] CLICK 01 LOADED");
    }

    async loadClick02() {
      if (this.click02Buffer) {
        return;
      }

      const clickURL = chrome.runtime.getURL(
        "audio/events/click_02.wav",
      );

      const response = await fetch(clickURL);

      if (!response.ok) {
        throw new Error(
          `Click 02 could not be loaded: ${response.status}`,
        );
      }

      const audioData = await response.arrayBuffer();

      this.click02Buffer =
        await this.context.decodeAudioData(audioData);

      console.log("[PARASITE] CLICK 02 LOADED");
    }

    async loadNoise() {
      if (this.noiseBuffer) {
        return;
      }

      const noiseURL = chrome.runtime.getURL(
        "audio/textures/noise_01.wav",
      );

      const response = await fetch(noiseURL);

      if (!response.ok) {
        throw new Error(
          `Noise could not be loaded: ${response.status}`,
        );
      }

      const audioData = await response.arrayBuffer();

      this.noiseBuffer =
        await this.context.decodeAudioData(audioData);

      console.log("[PARASITE] NOISE LOADED");
    }

    async loadNoise02() {
      if (this.noise02Buffer) {
        return;
      }

      const noiseURL = chrome.runtime.getURL(
        "audio/textures/noise_02.wav",
      );

      const response = await fetch(noiseURL);

      if (!response.ok) {
        throw new Error(
          `Noise 02 could not be loaded: ${response.status}`,
        );
      }

      const audioData = await response.arrayBuffer();

      this.noise02Buffer =
        await this.context.decodeAudioData(audioData);

      console.log("[PARASITE] NOISE 02 LOADED");
    }

    playClick01() {
      if (!this.context || !this.click01Buffer) {
        return;
      }

      const source =
        this.context.createBufferSource();

      const gain =
        this.context.createGain();

      source.buffer =
        this.click01Buffer;

      gain.gain.value = 0.35;

      source.connect(gain);
      gain.connect(this.masterGain);

      source.start();

      console.log("[PARASITE] CLICK 01 PLAYED");
    }

    playClick02() {
      if (!this.context || !this.click02Buffer) {
        return;
      }

      const source = this.context.createBufferSource();
      const gain = this.context.createGain();

      source.buffer = this.click02Buffer;
      gain.gain.value = 0.35;

      source.connect(gain);
      gain.connect(this.masterGain);

      source.start();

      console.log("[PARASITE] CLICK 02 PLAYED");
    }

    startNoise(targetVolume = 0.12, duration = 3) {
      if (
        !this.context ||
        !this.noiseBuffer ||
        !this.masterGain
      ) {
        return;
      }

      if (!this.noiseSource) {
        this.noiseSource =
          this.context.createBufferSource();

        this.noiseGain =
          this.context.createGain();

        this.noiseSource.buffer =
          this.noiseBuffer;

        this.noiseSource.loop = true;

        this.noiseGain.gain.value = 0;

        this.noiseSource.connect(
          this.noiseGain,
        );

        this.noiseGain.connect(
          this.masterGain,
        );

        this.noiseSource.start();
      }

      const now =
        this.context.currentTime;

      this.noiseGain.gain.cancelScheduledValues(now);

      this.noiseGain.gain.setValueAtTime(
        this.noiseGain.gain.value,
        now,
      );

      this.noiseGain.gain.linearRampToValueAtTime(
        targetVolume,
        now + duration,
      );

      console.log("[PARASITE] NOISE ENTERING");
    }

    stopNoise(duration = 4) {
      if (!this.context || !this.noiseGain) {
        return;
      }

      const now =
        this.context.currentTime;

      this.noiseGain.gain.cancelScheduledValues(now);

      this.noiseGain.gain.setValueAtTime(
        this.noiseGain.gain.value,
        now,
      );

      this.noiseGain.gain.linearRampToValueAtTime(
        0,
        now + duration,
      );

      console.log("[PARASITE] NOISE RESTING");
    }

    playNoise02(volume = 1) {
      if (!this.context || !this.noise02Buffer) {
        return;
      }

      const source =
        this.context.createBufferSource();

      const gain =
        this.context.createGain();

      source.buffer =
        this.noise02Buffer;

      source.connect(gain);
      gain.connect(this.masterGain);

      const now =
        this.context.currentTime;

      gain.gain.setValueAtTime(0, now);

      gain.gain.linearRampToValueAtTime(
        volume,
        now + 0.25,
      );

      gain.gain.setValueAtTime(
        volume,
        now + 1.8,
      );

      gain.gain.linearRampToValueAtTime(
        0,
        now + 3,
      );

      source.start(now);

      console.log(
        "[PARASITE] NOISE 02 PLAYED",
      );
    }

    async start() {
      if (!this.initialized) {
        this.initialize();
      }

      if (!this.context || this.state.active) {
        return;
      }

      await this.context.resume();

      try {
        await this.loadHabitat();
        await this.loadClick01();
        await this.loadClick02();
        await this.loadNoise();
        await this.loadNoise02();

        this.habitatSource = this.context.createBufferSource();

        this.habitatSource.buffer = this.habitatBuffer;

        this.habitatSource.loop = true;

        this.habitatSource.connect(this.masterGain);

        this.habitatSource.start();

        const now = this.context.currentTime;

        this.masterGain.gain.cancelScheduledValues(now);

        this.masterGain.gain.setValueAtTime(0, now);

        this.masterGain.gain.linearRampToValueAtTime(0.18, now + 4);

        this.state.active = true;

        console.log("[PARASITE] HABITAT STARTED");
      } catch (error) {
        console.error("[PARASITE] HABITAT ERROR", error);
      }
    }

    stop() { }

    update(state) {

      if (!state) {
        return;
      }

      this.state = {
        ...this.state,
        ...state
      };

      /*
       * STRESS
       */

      if (this.state.stress < 0.35) {

        this.stopNoise(4);

      } else {

        const volume =
          0.22 +
          this.state.stress * 0.42;

        this.startNoise(
          volume,
          3
        );

      }

    }
  }

  globalThis.AudioEngine = AudioEngine;
})();
