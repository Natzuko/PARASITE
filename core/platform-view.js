/**
 * ==========================================================
 * PARASITE
 * platform-view.js
 * ----------------------------------------------------------
 * Renderiza la visión de plataforma.
 *
 * No controla estados.
 * No crea timers.
 * No inicia procesos por su cuenta.
 *
 * behavior.js decide cuándo aparece.
 * ==========================================================
 */

(() => {
  "use strict";

  class ParasitePlatformView {
    constructor() {
      this.navigationNodes = [];

      this.consumption = {
        active: false,
        node: null,
        startedAt: 0,
        duration: 280,
        progress: 0,
      };

      console.log("[PARASITE] PLATFORM VIEW ONLINE");
    }

    drawEntityGraph({ ctx, time, progress, perception, organismX, organismY }) {
      if (
        !ctx ||
        !Array.isArray(perception) ||
        !Number.isFinite(organismX) ||
        !Number.isFinite(organismY)
      ) {
        return;
      }

      const visibleNodes = perception
        .filter((item) => {
          return item?.element && document.contains(item.element);
        })
        .slice(0, 10);

      if (visibleNodes.length === 0) {
        return;
      }

      this.navigationNodes = [];

      /*
       * Migración:
       * posición humana → posición de plataforma.
       */
      const migrationProgress = Math.max(
        0,
        Math.min(1, (progress - 0.25) / 0.6),
      );

      const migrationEase = 1 - Math.pow(1 - migrationProgress, 3);

      /*
       * Las relaciones entre nodos aparecen
       * después de que comienza la migración.
       */
      const relationProgress = Math.max(
        0,
        Math.min(1, (progress - 0.42) / 0.45),
      );

      const relationEase = 1 - Math.pow(1 - relationProgress, 3);

      const viewportRadius =
        Math.min(window.innerWidth, window.innerHeight) * 0.31;

      /*
       * Primero calculamos todos los nodos.
       * Después los dibujamos.
       */
      const nodes = visibleNodes.map((item, index) => {
        const rect = item.element.getBoundingClientRect();

        const domX = rect.left + rect.width / 2;

        const domY = rect.top + rect.height / 2;

        const normalizedIndex = index / visibleNodes.length;

        const baseAngle = normalizedIndex * Math.PI * 2 - Math.PI / 2;

        const phaseOffset = item.phase ?? index * 0.8;

        const irregularity = Math.sin(index * 2.37) * 0.22;

        const angle = baseAngle + irregularity;

        const ringVariation = 0.72 + (index % 3) * 0.13;

        const breathing = Math.sin(time * 0.0012 + phaseOffset) * 9;

        const internalRadius = viewportRadius * ringVariation + breathing;

        const platformX = organismX + Math.cos(angle) * internalRadius;

        const platformY = organismY + Math.sin(angle) * internalRadius * 0.72;

        const x = domX + (platformX - domX) * migrationEase;

        const y = domY + (platformY - domY) * migrationEase;

        let label = "INTERFACE_OBJECT";

        if (item.kind === "title") {
          label = "KNOWLEDGE_OBJECT";
        }

        if (item.kind === "text") {
          label = "CONTENT_FRAGMENT";
        }

        if (item.kind === "image") {
          label = "IMAGE_OBJECT";
        }

        if (item.kind === "button") {
          label = "ACTION_TRIGGER";
        }

        return {
          item,
          index,
          x,
          y,
          angle,
          phaseOffset,
          label,
        };
      });

      if (this.consumption.active) {
        this.consumption.progress = Math.min(
          1,
          (performance.now() -
            this.consumption.startedAt) /
          this.consumption.duration,
        );
      }

      /*
       * CONEXIONES ENTRE NODOS
       *
       * Cada nodo se conecta con sus
       * dos vecinos más próximos.
       */
      const drawnRelations = new Set();

      nodes.forEach((node) => {
        const nearestNodes = nodes
          .filter((candidate) => candidate.index !== node.index)
          .map((candidate) => {
            const dx = candidate.x - node.x;

            const dy = candidate.y - node.y;

            return {
              candidate,
              distance: Math.sqrt(dx * dx + dy * dy),
            };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);

        nearestNodes.forEach(({ candidate }) => {
          const smallerIndex = Math.min(node.index, candidate.index);

          const largerIndex = Math.max(node.index, candidate.index);

          const relationId = `${smallerIndex}-${largerIndex}`;

          if (drawnRelations.has(relationId)) {
            return;
          }

          drawnRelations.add(relationId);

          const middleX = (node.x + candidate.x) / 2;

          const middleY = (node.y + candidate.y) / 2;

          const dx = candidate.x - node.x;

          const dy = candidate.y - node.y;

          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const perpendicularX = -dy / distance;

          const perpendicularY = dx / distance;

          const movement =
            Math.sin(time * 0.001 + node.phaseOffset + candidate.phaseOffset) *
            12;

          const controlX = middleX + perpendicularX * movement;

          const controlY = middleY + perpendicularY * movement;

          ctx.beginPath();

          ctx.moveTo(node.x, node.y);

          ctx.quadraticCurveTo(controlX, controlY, candidate.x, candidate.y);

          let relationAlpha =
            relationEase * 0.22;

          if (this.consumption.active) {
            relationAlpha *=
              1 - this.consumption.progress;
          }

          ctx.strokeStyle =
            `rgba(215,255,0,${relationAlpha})`;

          ctx.lineWidth = 0.55;

          ctx.stroke();
        });
      });

      const pageLinks = [...document.querySelectorAll("a[href]")].filter(
        (link) => {
          const href = link.href;

          return href && !href.startsWith("javascript:");
        },
      );

      /*
       * CONEXIONES PARASITE → NODOS
       */
      nodes.forEach((node) => {
        const { item, x, y, angle, phaseOffset, label } = node;

        const directLink = item.element.matches?.("a[href]")
          ? item.element
          : null;

        const containedLink =
          item.element.querySelector?.("a[href]") ?? null;

        const closestLink =
          item.element.closest?.("a[href]") ?? null;

        const fallbackLink =
          pageLinks.length > 0
            ? pageLinks[node.index % pageLinks.length]
            : null;

        const navigationElement =
          directLink ||
          closestLink ||
          containedLink ||
          fallbackLink;

        const isConsumedNode =
          this.consumption.active &&
          this.consumption.node?.index ===
          node.index;

        const pulse = 0.72 + Math.sin(time * 0.002 + phaseOffset) * 0.18;

        const dx = x - organismX;

        const dy = y - organismY;

        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const perpendicularX = -dy / distance;

        const perpendicularY = dx / distance;

        const curve =
          Math.sin(time * 0.0014 + phaseOffset) * (18 + migrationEase * 24);

        const controlX = organismX + dx * 0.5 + perpendicularX * curve;

        const controlY = organismY + dy * 0.5 + perpendicularY * curve;

        const alpha = Math.max(0, Math.min(1, progress * pulse));

        ctx.beginPath();

        ctx.moveTo(organismX, organismY);

        ctx.quadraticCurveTo(controlX, controlY, x, y);

        ctx.strokeStyle = `rgba(215, 255, 0, ${alpha * (0.22 + migrationEase * 0.28)
          })`;

        ctx.lineWidth = 0.55 + (item.pressure ?? 0) * 1.1;

        ctx.stroke();

        /*
         * Nodo.
         */
        ctx.beginPath();

        ctx.arc(x, y, 2.5 + alpha * 2.4, 0, Math.PI * 2);

        let nodeAlpha =
          alpha * 0.92;

        if (isConsumedNode) {
          nodeAlpha *=
            1 - this.consumption.progress;
        }

        ctx.fillStyle =
          `rgba(215,255,0,${nodeAlpha})`;

        ctx.fill();

        if (navigationElement?.href) {
          this.navigationNodes.push({
            x,
            y,
            radius: 38,
            index: node.index,
            element: navigationElement,
          });
        }

        /*
         * Etiqueta.
         */
        ctx.font = "10px Consolas, monospace";

        ctx.textBaseline = "middle";

        ctx.fillStyle = `rgba(215, 255, 0, ${alpha * (0.62 + migrationEase * 0.3)
          })`;

        const labelDirection = Math.cos(angle) >= 0 ? 1 : -1;

        ctx.textAlign = labelDirection === 1 ? "left" : "right";

        ctx.fillText(label, x + labelDirection * 10, y);
      });

      ctx.textAlign = "left";
    }

    beginConsumption(node) {
      if (this.consumption.active || !node) {
        return;
      }

      this.consumption.active = true;
      this.consumption.node = node;
      this.consumption.startedAt = performance.now();

      console.log("[PARASITE] NODE CONSUMPTION STARTED");
    }

    getNavigationTarget(clientX, clientY) {
      if (!Array.isArray(this.navigationNodes)) {
        return null;
      }

      let nearestTarget = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      const pageLinks = [...document.querySelectorAll("a[href]")].filter(
        (link) => {
          const href = link.href;

          return href && !href.startsWith("javascript:");
        },
      );

      this.navigationNodes.forEach((node) => {
        const dx = clientX - node.x;

        const dy = clientY - node.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= node.radius && distance < nearestDistance) {
          nearestTarget = node;

          nearestDistance = distance;
        }
      });

      return nearestTarget;
    }

    draw({
      ctx,
      time,
      progress = 0,
      phase = "HUMAN",
      perception = [],
      organismX = null,
      organismY = null,
    }) {
      if (!ctx || progress <= 0) {
        return;
      }

      const safeProgress = Math.max(0, Math.min(1, progress));

      const eased = 1 - Math.pow(1 - safeProgress, 3);

      const width = window.innerWidth;

      const height = window.innerHeight;

      ctx.save();

      ctx.fillStyle = `rgba(0, 0, 0, ${phase === "PLATFORM" ? 1 : eased * 0.92
        })`;

      ctx.fillRect(0, 0, width, height);

      this.drawEntityGraph({
        ctx,
        time,
        progress: safeProgress,
        perception,
        organismX,
        organismY,
      });

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.025 + eased * 0.055})`;

      ctx.lineWidth = 0.5;

      const gridSize = 44;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const percentage = Math.round(safeProgress * 100);

      ctx.font = "12px Consolas, monospace";

      ctx.textBaseline = "top";

      ctx.fillStyle = "rgba(215, 255, 0, 0.92)";

      ctx.fillText(`PLATFORM TRANSLATION  ${percentage}%`, 28, 26);

      ctx.strokeStyle = "rgba(215, 255, 0, 0.65)";

      ctx.lineWidth = 1;

      ctx.strokeRect(28, 49, 240, 5);

      ctx.fillStyle = "rgba(215, 255, 0, 0.82)";

      ctx.fillRect(28, 49, 240 * safeProgress, 5);

      if (Number.isFinite(organismX) && Number.isFinite(organismY)) {
        ctx.fillStyle = "rgba(215, 255, 0, 0.78)";

        ctx.fillText(`ORGANISM_X ${Math.round(organismX)}`, 28, 69);

        ctx.fillText(`ORGANISM_Y ${Math.round(organismY)}`, 28, 86);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.48)";

      ctx.fillText(`PERCEIVED_OBJECTS ${perception.length}`, 28, 107);

      if (phase === "PLATFORM") {
        ctx.fillStyle = "rgba(215, 255, 0, 0.92)";

        ctx.fillText("PLATFORM VIEW ACTIVE", 28, height - 42);
      }

      ctx.restore();

      void time;
    }
  }

  globalThis.parasitePlatformView = new ParasitePlatformView();
})();
