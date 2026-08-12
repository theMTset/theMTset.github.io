(() => {
  const root = document.documentElement;
  const paths = {
    glow: document.querySelector('.bolt-glow'),
    core: document.querySelector('.bolt-core'),
    branch: document.querySelector('.bolt-branch')
  };
  const soundButton = document.querySelector('.sound-toggle');
  const soundLabel = document.querySelector('.sound-label');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Opening choreography. Strike 1 is distant and easy to miss — it only suggests there
  // is something to look at. Strike 2 comes down on top of the words: closer, louder,
  // and it leaves the text glowing for a few seconds so it can actually be read. After
  // that, sparse strikes continue only while the visitor remains in the opening or answer.
  const BIG_STRIKE_INDEX = 1;
  const AFTERGLOW_MS = 6400;
  const AFTERGLOW_HOLD_MS = 1600;
  const AFTERGLOW_PEAK = .66;

  let stormTimer;
  let strikeCount = 0;
  let isFlashing = false;
  let audioContext;
  let soundOn = false;
  let scrollTicking = false;

  const random = (min, max) => min + Math.random() * (max - min);
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function stormIsAllowed() {
    const boundary = document.querySelector('.descent');
    return !boundary || boundary.getBoundingClientRect().top > 0;
  }

  function makeBolt(big = false) {
    // The second strike crosses the question and reaches well below it. More segments and
    // a tighter drift make it read as one long, heavy strike rather than a wandering flash.
    const startX = big ? random(440, 560) : random(260, 740);
    const finishY = big ? random(680, 760) : random(470, 920);
    const segments = Math.floor(big ? random(17, 23) : random(7, 13));
    const drift = big ? 42 : 85;
    const points = [[startX, -20]];
    let x = startX;

    for (let i = 1; i <= segments; i++) {
      x += random(-drift, drift);
      const y = -20 + (finishY / segments) * i;
      points.push([x, y]);
    }

    const path = `M ${points.map(point => point.join(' ')).join(' L ')}`;
    paths.glow.setAttribute('d', path);
    paths.core.setAttribute('d', path);

    const branchAt = Math.floor(random(2, segments - 2));
    const [bx, by] = points[branchAt];
    const direction = Math.random() > .5 ? 1 : -1;
    const branch = `M ${bx} ${by} L ${bx + random(50, 105) * direction} ${by + random(50, 100)} L ${bx + random(85, 180) * direction} ${by + random(120, 210)}`;
    paths.branch.setAttribute('d', branch);
    root.style.setProperty('--strike-x', `${startX / 10}%`);
    root.classList.toggle('big-strike', big);
  }

  function setLight(value) {
    root.style.setProperty('--light', value.toFixed(3));
  }

  // Ease the sky back down to black instead of cutting it. The question decays like an
  // afterimage, which reads far longer than the same light held flat and dropped.
  function fadeLight(from, ms) {
    return new Promise(resolve => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / ms, 1);
        setLight(from * (1 - t) * (1 - t));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  // Begin the text afterglow on the first pulse, not after the sky has already faded. Holding
  // the peak before the decay removes the blank beat that used to separate strike and glow.
  function afterglow(ms) {
    return new Promise(resolve => {
      const start = performance.now();
      const step = (now) => {
        const elapsed = Math.min(now - start, ms);
        const decayTime = Math.max(ms - AFTERGLOW_HOLD_MS, 1);
        const decayProgress = Math.max(0, (elapsed - AFTERGLOW_HOLD_MS) / decayTime);
        const decay = Math.pow(1 - decayProgress, 1.55);
        root.style.setProperty('--afterglow', (decay * AFTERGLOW_PEAK).toFixed(3));
        if (elapsed < ms) {
          requestAnimationFrame(step);
        } else {
          root.style.setProperty('--afterglow', '0');
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  async function strike() {
    if (isFlashing || document.hidden || !stormIsAllowed()) return;
    isFlashing = true;

    const big = strikeCount === BIG_STRIKE_INDEX;
    strikeCount++;
    makeBolt(big);

    const intensity = big ? random(.94, 1) : random(.58, 1);
    const pulses = big ? Math.floor(random(3, 5)) : Math.random() < .64 ? 2 : Math.random() < .25 ? 3 : 1;
    let afterglowPromise = null;

    for (let pulse = 0; pulse < pulses; pulse++) {
      setLight(intensity * random(.72, 1));
      if (big && pulse === 0) afterglowPromise = afterglow(AFTERGLOW_MS);
      await wait(big ? random(80, 150) : random(35, 95));
      setLight(random(0, .07));
      if (pulse < pulses - 1) await wait(big ? random(40, 110) : random(45, 165));
    }

    // Kill the bolt first so only the sky keeps glowing through the decay.
    paths.glow.setAttribute('d', '');
    paths.core.setAttribute('d', '');
    paths.branch.setAttribute('d', '');
    if (soundOn && stormIsAllowed()) playThunder(intensity, big);

    await fadeLight(intensity * (big ? .34 : .16), big ? 620 : 380);
    setLight(0);

    if (afterglowPromise) await afterglowPromise;

    root.classList.remove('big-strike');
    isFlashing = false;
  }

  function nextStrikeDelay(first) {
    if (first) return 650;
    // Beat between the distant opener and the one that lands on the words.
    if (strikeCount === BIG_STRIKE_INDEX) return random(2100, 2900);
    return random(3200, 9800);
  }

  function scheduleStorm(first = false) {
    window.clearTimeout(stormTimer);
    if (reducedMotion || !stormIsAllowed()) return;
    stormTimer = window.setTimeout(async () => {
      await strike();
      scheduleStorm();
    }, nextStrikeDelay(first));
  }

  let stormWasAllowed = stormIsAllowed();

  function syncStormRegion() {
    const allowed = stormIsAllowed();
    root.classList.toggle('storm-paused', !allowed);

    if (!allowed) {
      window.clearTimeout(stormTimer);
      paths.glow.setAttribute('d', '');
      paths.core.setAttribute('d', '');
      paths.branch.setAttribute('d', '');
      setLight(0);
      root.style.setProperty('--afterglow', '0');
    } else if (!stormWasAllowed && !isFlashing) {
      scheduleStorm();
    }

    stormWasAllowed = allowed;
  }

  function getAudioContext() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audioContext = new Context();
    }
    return audioContext;
  }

  // `close` is the strike directly overhead: the crack arrives almost with the flash,
  // holds far more high end, and decays slower into the rumble.
  function playThunder(intensity = .8, close = false) {
    const context = getAudioContext();
    if (!context || context.state !== 'running') return;

    const duration = close ? random(4.2, 5.6) : random(2.8, 4.6);
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    let rolling = 0;

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      rolling = rolling * .985 + noise * .015;
      const crack = noise * Math.exp(-t * (close ? 6.5 : 13)) * (close ? 1.05 : .55);
      const rumble = rolling * Math.exp(-t * random(close ? .38 : .65, close ? .6 : .95)) * (close ? 5.6 : 4.2);
      // Soft clip — the close strike overdrives, and tanh saturates it instead of
      // letting it square off into digital distortion.
      data[i] = Math.tanh((crack + rumble) * intensity);
    }

    const source = context.createBufferSource();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = close ? random(430, 620) : random(120, 210);
    gain.gain.value = .0001;
    gain.gain.exponentialRampToValueAtTime((close ? .82 : .32) * intensity, context.currentTime + (close ? .012 : .035));
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    source.buffer = buffer;
    source.connect(lowpass).connect(gain).connect(context.destination);
    source.start(context.currentTime + (close ? random(.02, .07) : random(.12, .55)));
  }

  async function toggleSound() {
    const context = getAudioContext();
    if (!context) return;

    if (!soundOn) {
      await context.resume();
      soundOn = true;
      soundButton.setAttribute('aria-pressed', 'true');
      soundButton.setAttribute('aria-label', 'Turn thunder sound off');
      soundLabel.textContent = 'sound on';
      playThunder(.18);
    } else {
      soundOn = false;
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.setAttribute('aria-label', 'Turn thunder sound on');
      soundLabel.textContent = 'sound off';
    }
  }

  const descent = document.querySelector('.descent');
  const opening = document.querySelector('.opening');
  const openingSticky = document.querySelector('.opening-sticky');
  const answer = document.querySelector('.answer');
  const answerSticky = document.querySelector('.answer-sticky');
  const smallLine = document.querySelector('.small-line');
  const mark = document.querySelector('.mark');
  const markSlot = document.querySelector('.mark-slot');
  const rings = document.querySelectorAll('.ring');
  const dropLines = [...document.querySelectorAll('.drop-line')];
  const geometry = document.querySelector('.descent-geometry');
  const geometryFrame = geometry?.querySelector('iframe');

  const DROP_DURATION_MS = 900;
  const GEOMETRY_START = .03;
  const GEOMETRY_END = .84;
  let dropSequenceStarted = reducedMotion;
  let lastGeometryProgress = -1;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  function startDropSequence() {
    if (dropSequenceStarted) return;
    dropSequenceStarted = true;
    const viewport = Math.max(window.innerHeight, 1);
    const fallDistances = dropLines.map(line => viewport + line.offsetTop + line.offsetHeight);

    dropLines.forEach((line, index) => {
      const animation = line.animate([
        { opacity: 0, transform: `translate3d(0, ${-fallDistances[index]}px, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: DROP_DURATION_MS,
        delay: Number(line.dataset.dropDelay),
        easing: 'cubic-bezier(.16, 1, .3, 1)',
        fill: 'both'
      });
      animation.addEventListener('finish', () => {
        line.style.opacity = '1';
        line.style.transform = 'translate3d(0, 0, 0)';
        animation.cancel();
      }, { once: true });
    });
  }

  // The ∅ leaves the opening with the visitor and comes to rest just above "no.", brightening
  // the whole way. Both endpoints are measured inside their own sticky frame rather than in
  // the viewport, so they stay fixed while that frame scrolls past and stay correct at any
  // breakpoint. It fades out with the answer so a fixed element never floats over the work.
  const MARK_GAP_RATIO = .32;

  function updateMark(viewport) {
    if (!mark || !markSlot) return;

    const slot = markSlot.getBoundingClientRect();
    const size = slot.height || mark.offsetHeight;
    const openCenter = slot.top - openingSticky.getBoundingClientRect().top + size / 2;

    const noLine = smallLine.getBoundingClientRect();
    const gap = Math.max(20, size * MARK_GAP_RATIO);
    const settleCenter = noLine.top - answerSticky.getBoundingClientRect().top - gap - size / 2;

    // Ease-out: most of the movement lands in the first stretch of scroll, so the opening
    // answers the very first swipe instead of appearing to hold still.
    const travel = easeOutCubic(clamp(window.scrollY / Math.max(opening.offsetHeight * .9, 1)));
    root.style.setProperty('--mark-travel', travel.toFixed(3));

    const y = openCenter + (settleCenter - openCenter) * travel;
    mark.style.transform = `translate3d(-50%, ${(y - size / 2).toFixed(1)}px, 0)`;

    const tail = answer.getBoundingClientRect().bottom - viewport;
    const exit = clamp(1 - tail / (viewport * .6));
    mark.style.opacity = (1 - exit).toFixed(3);
    mark.style.pointerEvents = exit > .5 ? 'none' : 'auto';
    mark.style.visibility = exit >= 1 ? 'hidden' : 'visible';
  }

  function syncGeometryProgress(progress) {
    if (!geometryFrame?.contentWindow || Math.abs(progress - lastGeometryProgress) < .001) return;
    lastGeometryProgress = progress;
    geometryFrame.contentWindow.postMessage({
      type: 'mtset:geometry-progress',
      progress
    }, '*');
  }

  function updateScroll() {
    const viewport = Math.max(window.innerHeight, 1);
    const progress = easeOutCubic(clamp(window.scrollY / (viewport * .85)));
    root.style.setProperty('--progress', progress.toFixed(3));
    updateMark(viewport);

    const rect = descent.getBoundingClientRect();
    const descentProgress = clamp(-rect.top / Math.max(descent.offsetHeight - viewport, 1));
    root.style.setProperty('--descent-progress', descentProgress.toFixed(3));
    if (!dropSequenceStarted && rect.top <= 0 && rect.bottom > viewport) startDropSequence();

    rings.forEach((ring, index) => {
      const scale = 1 + descentProgress * (2.3 + index * .55);
      const rotation = descentProgress * (index % 2 ? -28 : 24);
      ring.style.translate = '-50% -50%';
      ring.style.transform = `rotate(${rotation + (index * 11)}deg) scale(${scale})`;
    });

    if (geometry) {
      const formation = reducedMotion
        ? 1
        : clamp((descentProgress - GEOMETRY_START) / (GEOMETRY_END - GEOMETRY_START));
      const growth = reducedMotion ? 1 : easeOutCubic(formation);
      const mobile = window.innerWidth <= 650;
      const maxSize = mobile
        ? Math.min(window.innerWidth * .86, viewport * .56)
        : Math.min(window.innerWidth * .56, viewport * .58);
      const size = 72 + (maxSize - 72) * growth;
      geometry.style.width = `${Math.max(size, 72).toFixed(1)}px`;
      const ready = formation >= 1;
      geometry.classList.toggle('geometry-ready', ready);
      if (geometryFrame) geometryFrame.style.pointerEvents = ready ? 'auto' : 'none';
      syncGeometryProgress(Number(formation.toFixed(4)));
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    syncStormRegion();
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncStormRegion();
      scheduleStorm();
    }
  });
  soundButton.addEventListener('click', toggleSound);
  geometryFrame?.addEventListener('load', () => {
    lastGeometryProgress = -1;
    updateScroll();
  });

  if (reducedMotion) {
    dropLines.forEach(line => {
      line.style.opacity = '1';
      line.style.transform = 'none';
    });
  }

  syncStormRegion();
  if (reducedMotion) {
    setLight(.15);
  } else if (stormIsAllowed()) {
    scheduleStorm(true);
  }
  updateScroll();
})();
