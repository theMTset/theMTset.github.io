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
  // that the storm settles into its sparse ambient rhythm and never does this again.
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
    if (isFlashing || document.hidden) return;
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
    if (soundOn) playThunder(intensity, big);

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
    if (reducedMotion) return;
    stormTimer = window.setTimeout(async () => {
      await strike();
      scheduleStorm();
    }, nextStrikeDelay(first));
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
  const rings = document.querySelectorAll('.ring');
  const dropLines = [...document.querySelectorAll('.drop-line')];
  const descentCopy = document.querySelector('.descent-copy');
  const geometry = document.querySelector('.descent-geometry');
  const geometryFrame = geometry?.querySelector('iframe');
  const geometryExpand = document.querySelector('.geometry-expand');

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBounce = (t) => {
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  };

  function updateDrops(descentProgress, viewport) {
    if (reducedMotion) {
      dropLines.forEach(line => {
        line.style.opacity = '1';
        line.style.transform = 'none';
      });
      return;
    }

    const duration = .115;
    let collision = 0;
    dropLines.forEach((line, index) => {
      const start = Number(line.dataset.dropStart);
      const local = clamp((descentProgress - start) / duration);
      const position = easeOutBounce(local);
      const fallDistance = viewport + line.offsetTop + line.offsetHeight;
      line.style.opacity = String(clamp(local * 3));
      line.style.transform = `translateY(${-fallDistance * (1 - position)}px)`;

      if (index > 0) {
        const sinceImpact = (descentProgress - (start + duration)) / .045;
        if (sinceImpact >= 0 && sinceImpact <= 1) {
          collision += Math.sin(sinceImpact * Math.PI * 4) * (1 - sinceImpact);
        }
      }
    });

    if (descentCopy) {
      descentCopy.style.transform = `translateY(${(collision * 7).toFixed(2)}px)`;
    }
  }

  function updateScroll() {
    const viewport = Math.max(window.innerHeight, 1);
    const progress = Math.min(window.scrollY / (viewport * .85), 1);
    root.style.setProperty('--progress', progress.toFixed(3));

    const rect = descent.getBoundingClientRect();
    const descentProgress = clamp(-rect.top / Math.max(descent.offsetHeight - viewport, 1));
    root.style.setProperty('--descent-progress', descentProgress.toFixed(3));

    rings.forEach((ring, index) => {
      const scale = 1 + descentProgress * (2.3 + index * .55);
      const rotation = descentProgress * (index % 2 ? -28 : 24);
      ring.style.translate = '-50% -50%';
      ring.style.transform = `rotate(${rotation + (index * 11)}deg) scale(${scale})`;
    });

    updateDrops(descentProgress, viewport);

    if (geometry && !geometry.classList.contains('is-expanded')) {
      const growth = reducedMotion ? 1 : easeOutCubic(clamp((descentProgress - .03) / .86));
      const mobile = window.innerWidth <= 650;
      const maxSize = mobile
        ? Math.min(window.innerWidth * .68, viewport * .43)
        : Math.min(window.innerWidth * .52, viewport * .54);
      const size = 72 + (maxSize - 72) * growth;
      geometry.style.width = `${Math.max(size, 72).toFixed(1)}px`;
      const ready = reducedMotion || descentProgress >= .84;
      geometry.classList.toggle('geometry-ready', ready);
      if (geometryExpand) geometryExpand.disabled = !ready;
      if (geometryFrame) geometryFrame.style.pointerEvents = ready ? 'auto' : 'none';
    }

    scrollTicking = false;
  }

  function setGeometryExpanded(expanded) {
    if (!geometry || !geometryExpand) return;
    geometry.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('geometry-open', expanded);
    geometryExpand.setAttribute('aria-pressed', String(expanded));
    geometryExpand.setAttribute('aria-label', expanded
      ? 'Exit full screen star tetrahedron'
      : 'Expand star tetrahedron to full screen');
    if (!expanded) updateScroll();
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleStorm();
  });
  soundButton.addEventListener('click', toggleSound);
  geometryExpand?.addEventListener('click', () => {
    setGeometryExpanded(!geometry.classList.contains('is-expanded'));
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && geometry?.classList.contains('is-expanded')) {
      setGeometryExpanded(false);
      geometryExpand.focus();
    }
  });

  if (reducedMotion) {
    setLight(.15);
  } else {
    scheduleStorm(true);
  }
  updateScroll();
})();
