/**
 * ==========================================================
 * PARASITE
 * pressure.js
 * ----------------------------------------------------------
 * Analiza la presión que los elementos de una plataforma
 * ejercen sobre la navegación y la atención.
 *
 * Todavía NO modifica el DOM.
 * ==========================================================
 */

(() => {
    "use strict";

    class ParasitePressure {
        constructor() {
            this.lastAnalysis = null;
            this.currentPressureTarget = null;

            console.log("[PARASITE] PRESSURE ONLINE");
        }

        clamp(value) {
            return Math.max(0, Math.min(1, value));
        }

        calculateProminence(element) {
            const rect = element.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) {
                return 0;
            }

            const viewportArea =
                window.innerWidth * window.innerHeight || 1;

            const elementArea =
                rect.width * rect.height;

            const areaScore =
                this.clamp(
                    elementArea / (viewportArea * 0.18),
                );

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            const viewportCenterX =
                window.innerWidth / 2;

            const viewportCenterY =
                window.innerHeight / 2;

            const distanceFromCenter =
                Math.sqrt(
                    Math.pow(centerX - viewportCenterX, 2) +
                    Math.pow(centerY - viewportCenterY, 2),
                );

            const maximumDistance =
                Math.sqrt(
                    Math.pow(viewportCenterX, 2) +
                    Math.pow(viewportCenterY, 2),
                ) || 1;

            const centralityScore =
                1 - this.clamp(
                    distanceFromCenter / maximumDistance,
                );

            const style =
                window.getComputedStyle(element);

            const fontSize =
                Number.parseFloat(style.fontSize) || 16;

            const fontScore =
                this.clamp((fontSize - 12) / 28);

            return this.clamp(
                areaScore * 0.5 +
                centralityScore * 0.3 +
                fontScore * 0.2,
            );
        }

        calculateObstruction(element) {

            const style =
                window.getComputedStyle(element);

            const rect =
                element.getBoundingClientRect();

            let score = 0;

            if (
                style.position === "fixed" ||
                style.position === "sticky"
            ) {
                score += 0.35;
            }

            if (
                rect.width >
                window.innerWidth * 0.65
            ) {
                score += 0.25;
            }

            if (
                rect.height >
                window.innerHeight * 0.35
            ) {
                score += 0.25;
            }

            if (
                Number(style.zIndex) > 100
            ) {
                score += 0.20;
            }

            return this.clamp(score);

        }

        calculateImperativeLanguage(element) {
            const text = (
                element.innerText ||
                element.textContent ||
                element.getAttribute("aria-label") ||
                ""
            )
                .trim()
                .toLowerCase();

            if (!text) {
                return 0;
            }

            const imperativeTerms = [
                "aceptar",
                "acepto",
                "continuar",
                "comprar",
                "suscribirse",
                "suscríbete",
                "registrarse",
                "regístrate",
                "descargar",
                "permitir",
                "activar",
                "confirmar",
                "iniciar sesión",
                "más información",

                "accept",
                "agree",
                "continue",
                "buy",
                "subscribe",
                "sign up",
                "register",
                "download",
                "allow",
                "enable",
                "confirm",
                "log in",
                "learn more",
            ];

            const matches = imperativeTerms.filter(
                (term) => text.includes(term),
            ).length;

            if (matches === 0) {
                return 0;
            }

            const shortTextBonus =
                text.length <= 40 ? 0.25 : 0;

            return this.clamp(
                0.45 +
                matches * 0.2 +
                shortTextBonus,
            );
        }

        analyze(element) {
            if (
                !element ||
                !(element instanceof Element) ||
                !document.contains(element)
            ) {
                return null;
            }

            const components = {
                persistence: 0,
                repetition: 0,
                prominence:
                    this.calculateProminence(element),
                obstruction:
                    this.calculateObstruction(element),
                imperativeLanguage:
                    this.calculateImperativeLanguage(element),
            };

            const pressure =
                this.clamp(
                    components.prominence * 0.3 +
                    components.obstruction * 0.4 +
                    components.imperativeLanguage * 0.3,
                );

            const result = {
                element,
                pressure,
                components,
            };

            this.lastAnalysis = result;

            return result;
        }

        scanDocument() {
            const selectors = [
                "button",
                "[role='button']",
                "[role='dialog']",
                "[aria-modal='true']",
                "dialog",
                "aside",
                "nav",
                "header",
                "footer",
                "iframe",
                "[class*='cookie']",
                "[id*='cookie']",
                "[class*='consent']",
                "[id*='consent']",
                "[class*='modal']",
                "[id*='modal']",
                "[class*='popup']",
                "[id*='popup']",
                "[class*='banner']",
                "[id*='banner']",
            ];

            const elements = [
                ...document.querySelectorAll(
                    selectors.join(","),
                ),
            ];

            const analyses = elements
                .filter((element) => {
                    const rect =
                        element.getBoundingClientRect();

                    return (
                        rect.width > 0 &&
                        rect.height > 0 &&
                        rect.bottom > 0 &&
                        rect.top < window.innerHeight &&
                        rect.right > 0 &&
                        rect.left < window.innerWidth
                    );
                })
                .map((element) => this.analyze(element))
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        b.pressure - a.pressure,
                );

            const strongest =
                analyses[0] ?? null;

            const topElements =
                analyses.slice(0, 20);

            this.currentPressureTarget =
                strongest;

            console.log(
                "[PARASITE] PAGE PRESSURE SCAN",
                {
                    analyzed: analyses.length,
                    strongest: strongest
                        ? {
                            pressure:
                                strongest.pressure.toFixed(2),

                            tag:
                                strongest.element.tagName,

                            text: (
                                strongest.element.innerText ||
                                strongest.element.textContent ||
                                ""
                            )
                                .trim()
                                .slice(0, 80),

                            components:
                                strongest.components,
                        }
                        : null,
                },
            );

            return {
                strongest,
                topElements,
                analyses,
            };
        }

        getLastAnalysis() {
            return this.lastAnalysis;
        }
    }

    globalThis.parasitePressure =
        new ParasitePressure();
})();