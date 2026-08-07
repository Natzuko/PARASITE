/**
 * ==========================================================
 * PARASITE
 * service-worker.js
 * ==========================================================
 */

"use strict";

async function ensureOffscreenDocument() {

    const existing =
        await chrome.runtime.getContexts({
            contextTypes: ["OFFSCREEN_DOCUMENT"],
            documentUrls: [
                chrome.runtime.getURL("offscreen.html")
            ]
        });

    if (existing.length > 0) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification:
            "Persistent sound engine for PARASITE."
    });

    console.log(
        "[PARASITE] OFFSCREEN CREATED"
    );
}

chrome.runtime.onInstalled.addListener(async (details) => {

    console.log("[PARASITE] EXTENSION READY");
    console.log("[PARASITE] REASON:", details.reason);

    await ensureOffscreenDocument();

});

chrome.runtime.onStartup.addListener(async () => {

    await ensureOffscreenDocument();

});


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message?.type !== "PARASITE_AUDIO_DISCOVERY") {
            return;
        }

        ensureOffscreenDocument()
            .then(() => {
                return chrome.runtime.sendMessage({
                    type: "PARASITE_AUDIO_DISCOVERY_OFFSCREEN",
                    href: message.href ?? null,
                });
            })
            .then(() => {
                sendResponse({
                    ok: true,
                    action: "discovery-forwarded",
                });
            })
            .catch((error) => {
                console.error(
                    "[PARASITE] DISCOVERY FORWARD ERROR",
                    error,
                );

                sendResponse({
                    ok: false,
                    error: error.message,
                });
            });

        return true;
    },
);

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message?.type !== "PARASITE_AUDIO_MUTATION") {
            return;
        }

        ensureOffscreenDocument()
            .then(() =>
                chrome.runtime.sendMessage({
                    type: "PARASITE_AUDIO_MUTATION_OFFSCREEN",
                    previousState: message.previousState ?? null,
                    currentState: message.currentState ?? null,
                }),
            )
            .then(() => {
                sendResponse({
                    ok: true,
                    action: "mutation-forwarded",
                });
            })
            .catch((error) => {
                console.error(
                    "[PARASITE] MUTATION FORWARD ERROR",
                    error,
                );

                sendResponse({
                    ok: false,
                    error: error.message,
                });
            });

        return true;
    },
);

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message?.type !== "PARASITE_GLOBAL_ESCAPE") {
            return;
        }

        chrome.tabs
            .query({})
            .then((tabs) => {
                const messages = tabs
                    .filter((tab) => Number.isInteger(tab.id))
                    .map((tab) =>
                        chrome.tabs
                            .sendMessage(tab.id, {
                                type: "PARASITE_ESCAPE_ALL",
                            })
                            .catch(() => {
                                /*
                                 * Algunas pestañas no permiten
                                 * scripts de extensiones.
                                 */
                                return null;
                            }),
                    );

                return Promise.all(messages);
            })
            .then(() => {
                console.log("[PARASITE] GLOBAL ESCAPE SENT");

                sendResponse({
                    ok: true,
                    action: "global-escape-sent",
                });
            })
            .catch((error) => {
                console.error(
                    "[PARASITE] GLOBAL ESCAPE ERROR",
                    error,
                );

                sendResponse({
                    ok: false,
                    error: error.message,
                });
            });

        return true;
    },
);

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message?.type !== "PARASITE_COLONIZE_ALL") {
            return;
        }

        chrome.tabs
            .query({})
            .then((tabs) => {
                const messages = tabs
                    .filter((tab) => Number.isInteger(tab.id))
                    .map((tab) =>
                        chrome.tabs
                            .sendMessage(tab.id, {
                                type: "PARASITE_FORCE_PLATFORM",
                            })
                            .catch(() => null),
                    );

                return Promise.all(messages);
            })
            
            .then(async () => {
                await ensureOffscreenDocument();

                await chrome.runtime.sendMessage({
                    type: "PARASITE_AUDIO_NOISE02_OFFSCREEN",
                });

                console.log("[PARASITE] GLOBAL COLONIZATION SENT");

                sendResponse({
                    ok: true,
                    action: "global-colonization-sent",
                });
            })

            .catch((error) => {
                console.error(
                    "[PARASITE] GLOBAL COLONIZATION ERROR",
                    error,
                );

                sendResponse({
                    ok: false,
                    error: error.message,
                });
            });

        return true;
    },
);