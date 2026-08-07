class ParasiteOrganism {
  constructor() {
    this.mouseX = -1000;
    this.mouseY = -1000;

    this.tendrils = [];

    this.membranePoints = [];
    this.currentTopology = 0;

    this.buildMembrane(72);

    window.addEventListener("mousemove", (event) => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    });

    console.log("[PARASITE] ORGANISM ONLINE");
  }

  buildMembrane(count) {
    const safeCount = Math.max(24, Math.min(240, Math.round(count)));

    this.membranePoints = Array.from({ length: safeCount }, (_, index) => ({
      angle: (index / safeCount) * Math.PI * 2,
      radius: 70,
      velocity: 0,
      phase: Math.random() * Math.PI * 2,
      elasticity: 0.025 + Math.random() * 0.02,
    }));

    this.currentTopology = safeCount;

    console.log("[PARASITE] MEMBRANE REBUILT:", safeCount, "POINTS");
  }

  updateBodyTopology(anatomy) {
    if (!anatomy) {
      return;
    }

    const complexity = Number.isFinite(anatomy.membraneComplexity)
      ? anatomy.membraneComplexity
      : 1;

    const maturity = Number.isFinite(anatomy.maturity) ? anatomy.maturity : 0;

    const desiredPoints = Math.round(40 + complexity * 24 + maturity * 80);

    const difference = Math.abs(desiredPoints - this.currentTopology);

    if (difference >= 8) {
      this.buildMembrane(desiredPoints);
    }
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

  updateTendrils(centerX, centerY, currentTarget, tendrilStrength = 1) {
    const maxTendrils = Math.max(1, Math.round(8 * tendrilStrength));

    const candidates = [...document.querySelectorAll("a")]
      .filter((link) => {
        return link !== currentTarget && this.isVisible(link);
      })
      .map((link) => {
        const rect = link.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const dx = x - centerX;
        const dy = y - centerY;

        return {
          element: link,
          distance: Math.sqrt(dx * dx + dy * dy),
        };
      })
      .filter((item) => item.distance < 500)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxTendrils);

    const activeElements = new Set(candidates.map((item) => item.element));

    candidates.forEach((candidate) => {
      const exists = this.tendrils.find(
        (tendril) => tendril.element === candidate.element,
      );

      if (!exists) {
        this.tendrils.push({
          element: candidate.element,
          life: 0,
          phase: Math.random() * Math.PI * 2,
        });
      }
    });

    this.tendrils.forEach((tendril) => {
      const alive =
        activeElements.has(tendril.element) && this.isVisible(tendril.element);

      if (alive) {
        tendril.life += (1 - tendril.life) * 0.06 * tendrilStrength;
      } else {
        tendril.life -= 0.025;
      }

      tendril.life = Math.max(0, Math.min(1, tendril.life));
    });

    this.tendrils = this.tendrils.filter((tendril) => tendril.life > 0.01);
  }

  drawTendrils(ctx, centerX, centerY, radius, time, tendrilStrength = 1) {

    const visualProgress =
      globalThis.parasiteBehavior
        ?.getVisualMutationProgress?.(
          time,
        ) ?? 0;

    //const visualProgress = 1;

    const tissueTendrils =
      new Set(
        [...this.tendrils]
          .filter(
            (tendril) =>
              tendril.life > 0.35,
          )
          .sort(
            (a, b) =>
              b.life - a.life,
          )
          .slice(0, 3),
      );

    this.tendrils.forEach((tendril) => {
      if (!this.isVisible(tendril.element)) {
        return;
      }

      const rect = tendril.element.getBoundingClientRect();

      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      const dx = targetX - centerX;
      const dy = targetY - centerY;

      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      const directionX = dx / distance;
      const directionY = dy / distance;

      const life = tendril.life;

      const endX = centerX + dx * life;
      const endY = centerY + dy * life;

      const startX = centerX + directionX * radius;
      const startY = centerY + directionY * radius;

      const wave =
        Math.sin(time * 0.003 + tendril.phase) * 35 * life * tendrilStrength;

      const perpendicularX = -directionY;
      const perpendicularY = directionX;

      const controlX = (startX + endX) / 2 + perpendicularX * wave;

      const controlY = (startY + endY) / 2 + perpendicularY * wave;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      ctx.quadraticCurveTo(controlX, controlY, endX, endY);

      ctx.strokeStyle = `rgba(215, 255, 0, ${life * tendrilStrength})`;

      ctx.lineWidth = 0.8 + life * 1.2 * tendrilStrength;

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(endX, endY, 1 + life * 3 * tendrilStrength, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(215, 255, 0, ${life * tendrilStrength})`;

      ctx.fill();

      if (
        visualProgress > 0 &&
        tissueTendrils.has(tendril)
      ) {
        this.drawTendrilTissue({
          ctx,

          centerX: targetX,
          centerY: targetY,

          width:
            Math.max(40, rect.width * 0.9),

          height:
            Math.max(26, rect.height * 1.15),

          time,

          phase:
            tendril.phase,

          life,

          progress:
            visualProgress,
        });
      }
    });
  }

  drawTendrilTissue({
    ctx,
    centerX,
    centerY,
    width,
    height,
    time,
    phase,
    life,
    progress,
  }) {
    if (!ctx) {
      return;
    }

    const visibility =
      Math.max(0, Math.min(1, life * progress));

    const baseSize =
      Math.max(
        12,
        Math.min(
          34,
          Math.min(width, height) * 0.35,
        ),
      );

    const pulse =
      1 +
      Math.sin(
        time * 0.0022 + phase,
      ) * 0.12;

    const radius =
      baseSize * pulse;

    const filamentCount = 5;

    ctx.save();

    // Pequeña membrana abierta en el punto de contacto.
    ctx.beginPath();

    const pointCount = 16;

    for (
      let index = 0;
      index <= pointCount;
      index += 1
    ) {
      const normalized =
        index / pointCount;

      const angle =
        -Math.PI * 0.75 +
        normalized * Math.PI * 1.5;

      const deformation =
        Math.sin(
          angle * 4 +
          time * 0.002 +
          phase,
        ) * 3;

      const x =
        centerX +
        Math.cos(angle) *
        (radius + deformation);

      const y =
        centerY +
        Math.sin(angle) *
        (radius * 0.55 + deformation);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(215, 255, 0, ${Math.min(1, visibility * 1.15)
      })`;

    ctx.lineWidth =
      1 + visibility * 1.1;

    ctx.stroke();

    // Filamentos que crecen desde el tejido.
    for (
      let index = 0;
      index < filamentCount;
      index += 1
    ) {
      const angle =
        -Math.PI * 0.55 +
        (index / (filamentCount - 1)) *
        Math.PI *
        1.1;

      const length =
        radius *
        (0.65 +
          Math.sin(
            time * 0.0018 +
            phase +
            index,
          ) *
          0.18);

      const startX =
        centerX +
        Math.cos(angle) *
        radius *
        0.45;

      const startY =
        centerY +
        Math.sin(angle) *
        radius *
        0.25;

      const endX =
        centerX +
        Math.cos(angle) *
        length;

      const endY =
        centerY +
        Math.sin(angle) *
        length *
        0.6;

      const bend =
        Math.sin(
          time * 0.0025 +
          phase +
          index * 1.4,
        ) * 6;

      ctx.beginPath();

      ctx.moveTo(
        startX,
        startY,
      );

      ctx.quadraticCurveTo(
        (startX + endX) / 2 + bend,
        (startY + endY) / 2 - bend,
        endX,
        endY,
      );

      ctx.strokeStyle =
        `rgba(215, 255, 0, ${visibility * 0.5
        })`;

      ctx.lineWidth =
        0.45 + visibility * 0.45;

      ctx.stroke();
    }

    // Materia translúcida mínima.
    ctx.beginPath();

    ctx.ellipse(
      centerX,
      centerY,
      radius * 0.62,
      radius * 0.28,
      Math.sin(phase) * 0.25,
      0,
      Math.PI * 2,
    );

    ctx.fillStyle =
      `rgba(215, 255, 0, ${visibility * 0.16
      })`;

    ctx.fill();

    ctx.restore();
  }

  drawMembrane(ctx, centerX, centerY, baseRadius, time, anatomy = null) {
    const points = [];

    const complexity = anatomy?.membraneComplexity ?? 1;
    const mutations = anatomy?.genome?.mutations ?? [];
    const hasMutation = (name) => mutations.includes(name);
    const tension = anatomy?.membraneTension ?? 0.5;
    const elongation = anatomy?.bodyElongation ?? 0;

    const horizontalScale = 1 + elongation * 0.55;
    const verticalScale = 1 - elongation * 0.2;

    const frequencyA = 2 + Math.round(complexity);
    const frequencyB = 5 + Math.round(complexity * 2);

    const movementAmplitude = 5 + complexity * 2.5;

    const mouseDX = this.mouseX - centerX;
    const mouseDY = this.mouseY - centerY;

    const mouseDistance = Math.sqrt(mouseDX * mouseDX + mouseDY * mouseDY) || 1;

    const mouseAngle = Math.atan2(mouseDY, mouseDX);

    this.membranePoints.forEach((point) => {
      const organicMovement =
        Math.sin(point.angle * frequencyA + time * 0.0012 + point.phase) *
        movementAmplitude +
        Math.sin(point.angle * frequencyB - time * 0.0008) *
        movementAmplitude *
        0.45;

      let membraneDetail = 0;

      if (hasMutation("complex_membrane")) {
        membraneDetail =
          Math.sin(point.angle * 18 + time * 0.002 + point.phase * 2) * 2.2 +
          Math.sin(point.angle * 31 - time * 0.0015) * 1.2;
      }

      let desiredRadius = baseRadius + organicMovement + membraneDetail;

      if (mouseDistance < 240) {
        const angleDifference = Math.atan2(
          Math.sin(point.angle - mouseAngle),
          Math.cos(point.angle - mouseAngle),
        );

        const facingMouse = Math.max(0, Math.cos(angleDifference));

        const pressure = (1 - mouseDistance / 240) * facingMouse;

        desiredRadius -= pressure * 28;
      }

      const evolvedElasticity = point.elasticity * (0.45 + tension * 1.4);

      point.velocity += (desiredRadius - point.radius) * evolvedElasticity;

      const damping = 0.86 + tension * 0.08;

      point.velocity *= damping;
      point.radius += point.velocity;

      points.push({
        x: centerX + Math.cos(point.angle) * point.radius * horizontalScale,

        y: centerY + Math.sin(point.angle) * point.radius * verticalScale,
      });
    });

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];

      const midpointX = (current.x + next.x) / 2;

      const midpointY = (current.y + next.y) / 2;

      if (i === 0) {
        ctx.moveTo(midpointX, midpointY);
      } else {
        ctx.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
      }
    }

    ctx.closePath();

    ctx.fillStyle = "rgba(215, 255, 0, 0.15)";
    ctx.strokeStyle = "#d7ff00";
    ctx.lineWidth = 2;

    ctx.fill();
    ctx.stroke();
  }

  drawPerceptionMembrane({
    ctx,
    centerX,
    centerY,
    width,
    height,
    time,
    phase = 0,
    pressure = 0,
    progress = 1,
    morphology = 1,
  }) {
    if (
      !ctx ||
      !Number.isFinite(centerX) ||
      !Number.isFinite(centerY)
    ) {
      return;
    }

    const safeWidth =
      Math.max(18, Math.min(width, 420));

    const safeHeight =
      Math.max(12, Math.min(height, 220));

    const pointCount =
      Math.max(
        18,
        Math.min(
          42,
          Math.round(
            20 +
            pressure * 12 +
            morphology * 5,
          ),
        ),
      );

    const pulse =
      1 +
      Math.sin(
        time * 0.0018 + phase,
      ) *
      (0.025 + pressure * 0.035);

    const horizontalRadius =
      safeWidth * 0.5 * pulse;

    const verticalRadius =
      safeHeight * 0.5 * pulse;

    const movement =
      2.5 +
      pressure * 7;

    const points = [];

    for (
      let index = 0;
      index < pointCount;
      index += 1
    ) {
      const angle =
        (index / pointCount) *
        Math.PI *
        2;

      const organicMovement =
        Math.sin(
          angle * 3 +
          time * 0.0013 +
          phase,
        ) *
        movement +
        Math.sin(
          angle * 7 -
          time * 0.0009 +
          phase * 1.7,
        ) *
        movement *
        0.42;

      const normalizedMovement =
        organicMovement /
        Math.max(
          horizontalRadius,
          verticalRadius,
          1,
        );

      points.push({
        x:
          centerX +
          Math.cos(angle) *
          horizontalRadius *
          (1 + normalizedMovement),

        y:
          centerY +
          Math.sin(angle) *
          verticalRadius *
          (1 + normalizedMovement),
      });
    }

    ctx.save();

    ctx.beginPath();

    for (
      let index = 0;
      index < points.length;
      index += 1
    ) {
      const current =
        points[index];

      const next =
        points[
        (index + 1) %
        points.length
        ];

      const midpointX =
        (current.x + next.x) / 2;

      const midpointY =
        (current.y + next.y) / 2;

      if (index === 0) {
        ctx.moveTo(
          midpointX,
          midpointY,
        );
      } else {
        ctx.quadraticCurveTo(
          current.x,
          current.y,
          midpointX,
          midpointY,
        );
      }
    }

    ctx.closePath();

    const fillAlpha =
      (0.035 + pressure * 0.11) *
      progress;

    const strokeAlpha =
      (0.18 + pressure * 0.48) *
      progress;

    ctx.fillStyle =
      `rgba(215, 255, 0, ${fillAlpha})`;

    ctx.strokeStyle =
      `rgba(215, 255, 0, ${strokeAlpha})`;

    ctx.lineWidth =
      0.7 + pressure * 1.1;

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawNucleus(ctx, centerX, centerY, time, anatomy = null) {
    const mutations = anatomy?.genome?.mutations ?? [];

    const hasMutation = (name) => mutations.includes(name);

    const nucleusRadius = 10 + Math.sin(time * 0.004) * 3;

    if (!hasMutation("double_nucleus")) {
      ctx.beginPath();

      ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);

      ctx.fillStyle = "#d7ff00";
      ctx.fill();

      return;
    }

    const separation = 10 + Math.sin(time * 0.002) * 3;
    const orbitAngle = time * 0.0008;

    const offsetX = Math.cos(orbitAngle) * separation;
    const offsetY = Math.sin(orbitAngle) * separation * 0.55;

    const nucleusA = {
      x: centerX - offsetX,
      y: centerY - offsetY,
    };

    const nucleusB = {
      x: centerX + offsetX,
      y: centerY + offsetY,
    };

    // Filamento que conecta ambos núcleos.
    ctx.beginPath();
    ctx.moveTo(nucleusA.x, nucleusA.y);

    ctx.quadraticCurveTo(
      centerX + Math.sin(time * 0.003) * 5,
      centerY + Math.cos(time * 0.002) * 5,
      nucleusB.x,
      nucleusB.y,
    );

    ctx.strokeStyle = "rgba(215, 255, 0, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Núcleo A.
    ctx.beginPath();
    ctx.arc(nucleusA.x, nucleusA.y, nucleusRadius * 0.78, 0, Math.PI * 2);

    ctx.fillStyle = "#d7ff00";
    ctx.fill();

    // Núcleo B, con pulso desfasado.
    const secondRadius =
      nucleusRadius * 0.78 + Math.sin(time * 0.004 + Math.PI) * 1.5;

    ctx.beginPath();
    ctx.arc(nucleusB.x, nucleusB.y, secondRadius, 0, Math.PI * 2);

    ctx.fillStyle = "#d7ff00";
    ctx.fill();
  }

  drawInternalOrgans(ctx, centerX, centerY, radius, time, anatomy = null) {
    if (!anatomy) {
      return;
    }

    const mutations = anatomy.genome?.mutations ?? [];

    const hasMutation = (name) => mutations.includes(name);

    const complexity = anatomy.membraneComplexity ?? 1;
    const maturity = anatomy.maturity ?? 0;
    const branching = anatomy.branching ?? 0;
    const elongation = anatomy.bodyElongation ?? 0;

    const mutationLevel = Math.max(
      maturity,
      Math.max(0, Math.min(1, (complexity - 1) / 5)),
    );

    // Primera mutación:
    // aparecen nodos internos.
    if (!hasMutation("internal_organs")) {
      return;
    }

    let organCount = 2;

    if (hasMutation("vascular_network")) {
      organCount = 3;
    }

    if (hasMutation("internal_branching")) {
      organCount = 5;
    }

    if (hasMutation("mobile_organs")) {
      organCount = 8;
    }

    const horizontalScale = 1 + elongation * 0.45;
    const verticalScale = 1 - elongation * 0.15;

    const organs = [];
    const vascularNodes = [];

    for (let index = 0; index < organCount; index++) {
      const angle =
        (index / organCount) * Math.PI * 2 +
        time * (0.00012 + index * 0.000015) +
        Math.sin(index * 2.13) * 0.18;

      const randomFactor = 0.82 + Math.sin(index * 3.17) * 0.16;

      const orbit =
        radius *
        ((0.25 + (index % 3) * 0.08 + Math.sin(time * 0.001 + index) * 0.025) *
          randomFactor);

      const x = centerX + Math.cos(angle) * orbit * horizontalScale;

      const y = centerY + Math.sin(angle) * orbit * verticalScale;

      organs.push({ x, y });

      ctx.beginPath();

      ctx.arc(x, y, 2.5 + mutationLevel * 3, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(
      215,
      255,
      0,
      ${0.25 + mutationLevel * 0.45}
    )`;

      ctx.fill();
    }

    // Segunda mutación:
    // aparecen vasos principales desde el núcleo hacia cada órgano.
    if (hasMutation("vascular_network")) {
      organs.forEach((organ, index) => {
        const dx = organ.x - centerX;
        const dy = organ.y - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const directionX = dx / distance;
        const directionY = dy / distance;

        const nucleusRadius = 10 + Math.sin(time * 0.004) * 3;

        const membraneRadius = radius * 0.92;

        const startX = centerX + directionX * membraneRadius * horizontalScale;

        const startY = centerY + directionY * membraneRadius * verticalScale;

        const pulse = Math.sin(time * 0.0022 + index * 1.4) * radius * 0.035;

        const perpendicularX = -directionY;
        const perpendicularY = directionX;

        const membraneFlow = 18;

        const control1X = startX + perpendicularX * membraneFlow;

        const control1Y = startY + perpendicularY * membraneFlow;

        const control2X =
          organ.x - directionX * distance * 0.3 + perpendicularX * pulse;

        const control2Y =
          organ.y - directionY * distance * 0.3 + perpendicularY * pulse;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        ctx.bezierCurveTo(
          control1X,
          control1Y,
          control2X,
          control2Y,
          organ.x,
          organ.y,
        );

        ctx.strokeStyle = `rgba(
      215,
      255,
      0,
      ${0.16 + branching * 0.28}
    )`;

        ctx.lineWidth = 0.55 + branching * 0.8;
        ctx.stroke();

        const nodeRatio = 0.58;
        const inverseRatio = 1 - nodeRatio;

        const vascularNodeX =
          inverseRatio ** 3 * startX +
          3 * inverseRatio ** 2 * nodeRatio * control1X +
          3 * inverseRatio * nodeRatio ** 2 * control2X +
          nodeRatio ** 3 * organ.x;

        const vascularNodeY =
          inverseRatio ** 3 * startY +
          3 * inverseRatio ** 2 * nodeRatio * control1Y +
          3 * inverseRatio * nodeRatio ** 2 * control2Y +
          nodeRatio ** 3 * organ.y;

        vascularNodes.push({
          x: vascularNodeX,
          y: vascularNodeY,
          organX: organ.x,
          organY: organ.y,
          index,
        });

        ctx.beginPath();

        ctx.arc(
          vascularNodeX,
          vascularNodeY,
          1.4 + Math.sin(time * 0.004 + index) * 0.35,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = "rgba(215, 255, 0, 0.7)";
        ctx.fill();
      });
    }

    // Tercera mutación:
    // conexiones radiales con el núcleo.
    if (hasMutation("internal_branching")) {
      organs.forEach((organ, index) => {
        const controlOffset =
          Math.sin(time * 0.0025 + index) * radius * 0.12;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);

        ctx.quadraticCurveTo(
          (centerX + organ.x) / 2 + controlOffset,
          (centerY + organ.y) / 2 - controlOffset,
          organ.x,
          organ.y,
        );

        ctx.strokeStyle = `rgba(
      215,
      255,
      0,
      ${0.1 + mutationLevel * 0.25}
    )`;

        ctx.lineWidth = 0.6;
        ctx.stroke();
      });
    }

  }

  draw({
    ctx,
    currentTarget,
    centerX,
    centerY,
    radius,
    time,
    activity = 1,
    tendrilStrength = 1,
    anatomy = null,
  }) {
    this.updateBodyTopology(anatomy);

    const evolvedRadius = radius * (anatomy?.bodySize ?? 1);

    const evolvedTendrilStrength =
      tendrilStrength * (anatomy?.tendrilLength ?? 1);

    this.updateTendrils(
      centerX,
      centerY,
      currentTarget,
      evolvedTendrilStrength,
    );

    this.drawTendrils(
      ctx,
      centerX,
      centerY,
      evolvedRadius,
      time,
      evolvedTendrilStrength,
    );

    this.drawMembrane(ctx, centerX, centerY, evolvedRadius, time, anatomy);

    this.drawInternalOrgans(
      ctx,
      centerX,
      centerY,
      evolvedRadius,
      time,
      anatomy,
    );

    this.drawNucleus(ctx, centerX, centerY, time, anatomy);
  }
}

window.parasiteOrganism = new ParasiteOrganism();
