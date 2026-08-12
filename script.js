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
  const openingSticky = document.querySelector('.opening-sticky');
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
  // the whole way.
  //
  // On screen the ∅ does not move at all: it holds the spot it occupies in the opening
  // while the page descends past it. Only once the "no." line has risen far enough to sit
  // directly beneath it does it catch, and from that moment it rides with "no." — up and
  // off the top with the rest of the answer. So it travels down the document without ever
  // travelling across the viewport. Math.min is the whole handoff: whichever position is
  // higher wins, which is the resting spot until "no." overtakes it.
  const MARK_GAP_RATIO = .58;
  // How far out the ∅ starts brightening, in viewports of remaining approach. Sized so the
  // glow is coming up through the whole descent and is full exactly as it catches.
  const MARK_APPROACH = 1.7;

  function updateMark(viewport) {
    if (!mark || !markSlot) return;

    const slot = markSlot.getBoundingClientRect();
    const size = slot.height || mark.offsetHeight;
    // Measured inside the opening's sticky frame, so it survives that frame scrolling away.
    const restCenter = slot.top - openingSticky.getBoundingClientRect().top + size / 2;

    const noLine = smallLine.getBoundingClientRect();
    const gap = Math.max(26, size * MARK_GAP_RATIO);
    const attachedCenter = noLine.top - gap - size / 2;

    const y = Math.min(restCenter, attachedCenter);
    mark.style.transform = `translate3d(-50%, ${(y - size / 2).toFixed(1)}px, 0)`;

    const travel = clamp(1 - (attachedCenter - restCenter) / (viewport * MARK_APPROACH));
    root.style.setProperty('--mark-travel', travel.toFixed(3));

    // It leaves by scrolling off the top with the answer, not by fading. Only stop it
    // being a floating link once it is genuinely gone.
    const gone = y + size / 2 < 0;
    mark.style.pointerEvents = gone ? 'none' : 'auto';
    mark.style.visibility = gone ? 'hidden' : 'visible';
  }

  // The ∅ answers a hand on the screen. Holding anywhere brings its light up; dragging while
  // you hold drives it past what a direct strike gives it, and it falls back off once you let
  // go. Touch events rather than pointer events on purpose: a drag that scrolls the page fires
  // pointercancel and stops sending moves, and a scrolling drag is exactly the gesture this is
  // meant to answer. Mouse is wired separately, and ignored once a touch has been seen, so the
  // synthetic mouse events a tap emits afterwards don't re-trigger the whole thing.
  const PRESS_LEVEL = .8;
  const DRAG_LEVEL = 1.45;
  const PRESS_RISE = .16;
  const PRESS_FALL = .055;
  // A pixel of drag is worth this much of the way from press to full; motion bleeds off at
  // MOTION_DECAY per frame, so the level tracks how fast you are moving, not how far.
  const MOTION_PER_PX = .006;
  const MOTION_DECAY = .9;

  let pressing = false;
  let pressGlow = 0;
  let pressMotion = 0;
  let pressPoint = null;
  let pressFrame = 0;
  let sawTouch = false;

  function pressStep() {
    const target = pressing ? PRESS_LEVEL + (DRAG_LEVEL - PRESS_LEVEL) * pressMotion : 0;
    pressGlow += (target - pressGlow) * (target > pressGlow ? PRESS_RISE : PRESS_FALL);
    pressMotion *= MOTION_DECAY;

    if (!pressing && pressGlow < .002) {
      pressGlow = 0;
      pressFrame = 0;
      root.style.setProperty('--mark-touch', '0');
      return;
    }

    root.style.setProperty('--mark-touch', pressGlow.toFixed(3));
    pressFrame = requestAnimationFrame(pressStep);
  }

  function runPressGlow() {
    if (!pressFrame) pressFrame = requestAnimationFrame(pressStep);
  }

  function pressStart(x, y) {
    pressing = true;
    pressPoint = { x, y };
    runPressGlow();
  }

  function pressMove(x, y) {
    if (!pressing || !pressPoint) return;
    pressMotion = clamp(pressMotion + Math.hypot(x - pressPoint.x, y - pressPoint.y) * MOTION_PER_PX);
    pressPoint = { x, y };
    runPressGlow();
  }

  function pressEnd() {
    pressing = false;
    pressPoint = null;
    runPressGlow();
  }

  function bindPressGlow() {
    window.addEventListener('touchstart', (event) => {
      sawTouch = true;
      const touch = event.touches[0];
      if (touch) pressStart(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (touch) pressMove(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('touchend', pressEnd, { passive: true });
    window.addEventListener('touchcancel', pressEnd, { passive: true });

    window.addEventListener('mousedown', (event) => {
      if (!sawTouch) pressStart(event.clientX, event.clientY);
    });
    window.addEventListener('mousemove', (event) => pressMove(event.clientX, event.clientY));
    window.addEventListener('mouseup', pressEnd);
    // A button released outside the window never reports its mouseup.
    window.addEventListener('blur', pressEnd);
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
  // The ∅'s resting spot is measured off the question's rendered box, which shifts when the
  // web fonts land. Without this it sits a few pixels out until the first scroll event.
  document.fonts?.ready.then(() => updateScroll());
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

  // The closing set. The braces arrive empty, then the words slide in one at a time from
  // alternating sides — slowly enough to read. The last one accelerates instead of easing
  // down, and the impact knocks every letter in the set out of place and out of upright.
  // They then hop back over each other, left to right, into the correct order.
  //
  // The scramble is positional, not the glyph-cycling kind: each letter takes some other
  // letter's slot, measured against the whole set rather than its own word, which is what
  // lets them cross word boundaries.
  const contact = document.querySelector('.contact');
  const contactSet = document.querySelector('.contact-set');

  const SET_LEAD_MS = 260;
  const SET_WORD_GAP_MS = 220;
  const SET_SLIDE_MS = 470;
  const SET_CRASH_MS = 330;
  const SET_LETTER_MS = 520;
  const SET_LETTER_GAP_MS = 13;

  function splitLetters(word) {
    const text = word.textContent;
    word.textContent = '';
    return [...text].map(character => {
      const letter = document.createElement('span');
      letter.className = 'ltr';
      letter.textContent = character === ' ' ? ' ' : character;
      word.appendChild(letter);
      return letter;
    });
  }

  function shuffledOrder(length) {
    const order = [...Array(length).keys()];
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  function scatterSet(letters, impactFrom) {
    const size = parseFloat(getComputedStyle(contactSet).fontSize) || 20;
    const boxes = letters.map(letter => letter.getBoundingClientRect());
    const order = shuffledOrder(letters.length);
    // Mostly turned over or onto their side; a few stay upright so it reads as debris
    // rather than a uniform effect.
    const turns = [90, -90, 180, 180, -90, 90, 0];

    letters.forEach((letter, index) => {
      const box = boxes[index];
      const target = boxes[order[index]];
      const dx = target.left - box.left;
      const dy = target.top - box.top + random(-.22, .22) * size;
      const turn = turns[Math.floor(Math.random() * turns.length)];
      const scattered = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${turn}deg)`;
      const apex = random(.7, 1.3) * size;

      letter.style.transform = scattered;
      const animation = letter.animate([
        { transform: scattered },
        { transform: `translate(${(dx * .45).toFixed(1)}px, ${(dy * .45 - apex).toFixed(1)}px) rotate(${(turn * .35).toFixed(1)}deg)`, offset: .5 },
        { transform: 'none' }
      ], {
        duration: SET_LETTER_MS,
        delay: index * SET_LETTER_GAP_MS,
        easing: 'cubic-bezier(.3, .78, .32, 1)',
        fill: 'both'
      });
      animation.addEventListener('finish', () => {
        letter.style.transform = 'none';
        animation.cancel();
      }, { once: true });
    });

    // The braces take the hit too, otherwise only the letters were struck.
    contactSet.animate([
      { transform: 'none' },
      { transform: `translate(${impactFrom * -5}px, 4px)`, offset: .3 },
      { transform: `translate(${impactFrom * 2}px, -1px)`, offset: .65 },
      { transform: 'none' }
    ], { duration: 280, easing: 'ease-out' });
  }

  function revealContactSet() {
    const words = [...contactSet.querySelectorAll('.key-word')];
    const letters = words.flatMap(splitLetters);
    const travel = Math.max(window.innerWidth, 320) * .46;

    words.forEach((word, index) => {
      const last = index === words.length - 1;
      const from = index % 2 ? 1 : -1;
      const animation = word.animate([
        { opacity: 0, transform: `translateX(${(from * travel).toFixed(0)}px)` },
        { opacity: 1, offset: .3 },
        { opacity: 1, transform: 'none' }
      ], {
        duration: last ? SET_CRASH_MS : SET_SLIDE_MS,
        delay: SET_LEAD_MS + index * SET_WORD_GAP_MS,
        easing: last ? 'cubic-bezier(.65, 0, .95, .35)' : 'cubic-bezier(.16, .9, .3, 1)',
        fill: 'both'
      });
      animation.addEventListener('finish', () => {
        word.style.opacity = '1';
        word.style.transform = 'none';
        animation.cancel();
        // The last word landing is the impact. Measure only now, with every word home.
        if (last) scatterSet(letters, from);
      }, { once: true });
    });
  }

  // The set fills itself once, when the visitor actually reaches it.
  if (contact) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      contact.classList.add('revealed');
    } else {
      const contactObserver = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        contact.classList.add('revealed');
        revealContactSet();
        contactObserver.disconnect();
      }, { threshold: .4 });
      contactObserver.observe(contact);
    }
  }

  syncStormRegion();
  if (!reducedMotion) bindPressGlow();
  if (reducedMotion) {
    setLight(.15);
  } else if (stormIsAllowed()) {
    scheduleStorm(true);
  }
  updateScroll();
})();
