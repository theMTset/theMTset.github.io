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
    const travel = window.innerHeight + rect.height;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));

    islandArt.style.setProperty("--sun-y", `${progress * 520}px`);
    islandArt.style.setProperty("--moon-y", `${(1 - progress) * 520}px`);
    islandArt.style.setProperty("--night-opacity", Math.max(0, (progress - 0.28) / 0.72).toFixed(3));
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
