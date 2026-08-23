const snapshotWrap = document.querySelector(".snapshot-wrap");
const islandArt = document.querySelector(".island-art");
const islandStage = document.querySelector(".island-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (snapshotWrap) {
  snapshotWrap.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") {
      snapshotWrap.classList.toggle("is-tilted");
    }
  });
}

if (islandArt && islandStage && !reduceMotion.matches) {
  let frameRequested = false;

  const updateSky = () => {
    const artRect = islandArt.getBoundingClientRect();
    const stageRect = islandStage.getBoundingClientRect();
    const travel = Math.max(1, stageRect.height - artRect.height);
    const progress = Math.min(1, Math.max(0, -stageRect.top / travel));
    const smoothstep = (value) => value * value * (3 - 2 * value);
    const phase = (start, end) => smoothstep(Math.min(1, Math.max(0, (progress - start) / (end - start))));
    const linearPhase = (start, end) => Math.min(1, Math.max(0, (progress - start) / (end - start)));
    const sunPhase = linearPhase(0, 0.82);
    const moonPhase = linearPhase(0.42, 1);
    const daylightRainbow = 1 - phase(0.34, 0.68);
    const moonbow = phase(0.7, 0.84) * (1 - phase(0.9, 1));
    const sunY = artRect.height * (-0.4 + sunPhase * 1.15);
    const moonY = artRect.height * (0.7 - moonPhase * 1.05);

    islandArt.style.setProperty("--sun-y", `${sunY}px`);
    islandArt.style.setProperty("--moon-y", `${moonY}px`);
    islandArt.style.setProperty("--rainbow-opacity", (daylightRainbow * 0.72 + moonbow * 0.38).toFixed(3));
    islandArt.style.setProperty("--rainbow-saturation", (1.1 - moonbow * 0.38).toFixed(3));
    islandArt.style.setProperty("--night-opacity", phase(0.38, 0.92).toFixed(3));
    frameRequested = false;
  };

  const requestSkyUpdate = () => {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateSky);
    }
  };

  updateSky();
  window.addEventListener("scroll", requestSkyUpdate, { passive: true });
  window.addEventListener("resize", requestSkyUpdate);
}
