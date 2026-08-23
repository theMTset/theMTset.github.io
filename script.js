const snapshotWrap = document.querySelector(".snapshot-wrap");
const islandArt = document.querySelector(".island-art");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (snapshotWrap) {
  snapshotWrap.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") {
      snapshotWrap.classList.toggle("is-tilted");
    }
  });
}

if (islandArt && !reduceMotion.matches) {
  let frameRequested = false;

  const updateSky = () => {
    const rect = islandArt.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const travel = rect.height + viewportHeight * 0.64;
    const progress = Math.min(1, Math.max(0, (viewportHeight * 0.82 - rect.top) / travel));
    const smoothstep = (value) => value * value * (3 - 2 * value);
    const phase = (start, end) => smoothstep(Math.min(1, Math.max(0, (progress - start) / (end - start))));
    const sunPhase = phase(0.12, 0.55);
    const moonPhase = phase(0.35, 0.7);
    const sunY = rect.height * (-0.04 + sunPhase * 0.68);
    const moonY = rect.height * (0.64 - moonPhase * 0.68);

    islandArt.style.setProperty("--sun-y", `${sunY}px`);
    islandArt.style.setProperty("--moon-y", `${moonY}px`);
    islandArt.style.setProperty("--night-opacity", phase(0.3, 0.88).toFixed(3));
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
