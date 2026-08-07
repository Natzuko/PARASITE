/**
 * ==========================================================
 * PARASITE
 * audio/physiology.js
 * ----------------------------------------------------------
 * Estado fisiológico central del organismo sonoro.
 *
 * No produce audio.
 * No utiliza APIs del navegador.
 * No conoce AudioEngine.
 * ==========================================================
 */

(() => {

    "use strict";

    class Physiology {

        constructor() {

            this.state = {

                energy: 0,
                stress: 0,
                curiosity: 0,
                familiarity: 0,

                hunger: 1,
                danger: 0,
                orientation: 0

            };

            console.log(
                "[PARASITE] PHYSIOLOGY CREATED"
            );

        }

        normalize(value) {

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return 0;
            }

            return Math.min(
                1,
                Math.max(0, number)
            );

        }

        update(nextState = {}) {

            for (const key of Object.keys(this.state)) {

                if (nextState[key] !== undefined) {

                    this.state[key] =
                        this.normalize(nextState[key]);

                }

            }

            return this.snapshot();

        }

        snapshot() {

            return {
                ...this.state
            };

        }

    }

    globalThis.Physiology = Physiology;

})();