(() => {
  const root = document.documentElement;
  const flash = document.querySelector('.flash');
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
  const AFTERGLOW_MS = 4600;
  const AFTERGLOW_PEAK = .52;

  let stormTimer;
  let strikeCount = 0;
  let isFlashing = false;
  let audioContext;
  let soundOn = false;
  let scrollTicking = false;

  const random = (min, max) => min + Math.random() * (max - min);
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function makeBolt(big = false) {
    // The big strike comes down the middle and stops at the text (y ~500 is the vertical
    // centre of the viewBox). Straighter and more segmented, so it reads as a direct hit
    // rather than a wander across the sky.
    const startX = big ? random(440, 560) : random(260, 740);
    const finishY = big ? random(500, 545) : random(470, 920);
    const segments = Math.floor(big ? random(13, 18) : random(7, 13));
    const drift = big ? 48 : 85;
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

  // The words keep burning after the big strike, breathing down to nothing. Kept on its
  // own custom property so the sky can go black while the text is still lit.
  function afterglow(ms) {
    return new Promise(resolve => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / ms, 1);
        const decay = (1 - t) * (1 - t);
        const breath = .68 + .32 * Math.cos(t * Math.PI * 4);
        root.style.setProperty('--afterglow', (decay * breath * AFTERGLOW_PEAK).toFixed(3));
        if (t < 1) {
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

    for (let pulse = 0; pulse < pulses; pulse++) {
      setLight(intensity * random(.72, 1));
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

    if (big) await afterglow(AFTERGLOW_MS);

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

  function updateScroll() {
    const viewport = Math.max(window.innerHeight, 1);
    const progress = Math.min(window.scrollY / (viewport * .85), 1);
    root.style.setProperty('--progress', progress.toFixed(3));

    const descent = document.querySelector('.descent');
    const rect = descent.getBoundingClientRect();
    const descentProgress = Math.min(Math.max(-rect.top / Math.max(descent.offsetHeight - viewport, 1), 0), 1);
    const rings = document.querySelectorAll('.ring');
    rings.forEach((ring, index) => {
      const scale = 1 + descentProgress * (2.3 + index * .55);
      const rotation = descentProgress * (index % 2 ? -28 : 24);
      ring.style.translate = '-50% -50%';
      ring.style.transform = `rotate(${rotation + (index * 11)}deg) scale(${scale})`;
    });

    scrollTicking = false;
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

  if (reducedMotion) {
    setLight(.15);
  } else {
    scheduleStorm(true);
  }
  updateScroll();
})();
