/**
 * ==========================================================
 * PARASITE
 * mutation.js
 * ----------------------------------------------------------
 * Traduce presión acumulada en niveles de intervención.
 *
 * Por ahora:
 * - clasifica;
 * - recuerda el último resultado;
 * - no modifica el DOM.
 * ==========================================================
 */

(() => {
    "use strict";

    class ParasiteMutation {
        constructor() {
            this.lastMutation = null;

            this.physics = {
                gravity: 1,
                alignment: 1,
                attraction: 0,
                hierarchy: 1,
                continuity: 1,
            };

            console.log("[PARASITE] MUTATION ONLINE");
        }

        classify(pressure = 0) {
            const value =
                Math.max(0, Math.min(1, Number(pressure) || 0));

            if (value >= 0.8) {
                return "CRITICAL";
            }

            if (value >= 0.55) {
                return "HIGH";
            }

            if (value >= 0.3) {
                return "MEDIUM";
            }

            return "LOW";
        }

        testMedium() {
            const target =
                globalThis.parasitePressure
                    ?.currentPressureTarget
                    ?.element;

            if (!target || !document.contains(target)) {
                console.warn(
                    "[PARASITE] NO PRESSURE TARGET FOR MEDIUM TEST",
                );

                return;
            }

            this.breakMedium(target);
        }

        evaluate(pressureAnalysis) {
            if (!pressureAnalysis) {
                return null;
            }

            const level =
                this.classify(pressureAnalysis.pressure);

            const mutation = {
                level,
                pressure: pressureAnalysis.pressure,
                element: pressureAnalysis.element,
                components: pressureAnalysis.components,
                createdAt: Date.now(),
            };

            this.lastMutation = mutation;

            console.log(
                "[PARASITE] MUTATION EVALUATED",
                {
                    level: mutation.level,
                    pressure: mutation.pressure.toFixed(2),
                    tag: mutation.element?.tagName ?? null,
                },
            );

            return mutation;
        }

        execute(mutation) {
            if (
                !mutation ||
                !mutation.element ||
                !document.contains(mutation.element)
            ) {
                return;
            }

            const element = mutation.element;

            if (mutation.level === "LOW") {
                return;
            }

            if (mutation.level === "MEDIUM") {
                this.breakMedium(element);
            }

            if (mutation.level === "HIGH") {
                this.breakHigh(element);
            }

            if (mutation.level === "CRITICAL") {
                this.breakCritical(element);
            }
        }

        breakMedium(element) {
            const mutation = {
                level: "MEDIUM",
                element,
                pressure:
                    this.lastMutation?.pressure ?? 0.3,
                components:
                    this.lastMutation?.components ?? {},
            };

            globalThis.parasiteBehavior
                ?.startVisualMutation(mutation);

            console.log(
                "[PARASITE] MEDIUM MISREGISTRATION",
                element,
            );
        }

        breakHigh(element) {
            console.log(
                "[PARASITE] HIGH RUPTURE PENDING",
                element,
            );
        }

        breakCritical(element) {
            console.log(
                "[PARASITE] CRITICAL RUPTURE PENDING",
                element,
            );
        }

        getPhysics() {
            return {
                ...this.physics,
            };
        }

        getLastMutation() {
            return this.lastMutation;
        }
    }

    globalThis.parasiteMutation =
        new ParasiteMutation();
})();