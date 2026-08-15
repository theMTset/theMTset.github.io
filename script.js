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

  // Hold the viewport height still. The opening, the answer and the descent are scroll
  // runways: their height is how much scrolling their animation gets, and together they come
  // to 890vh. That made the document a nine-times lever on the viewport height — and on a
  // phone the viewport height is not a constant, because the toolbar slides away as you
  // scroll down and comes back as you scroll up. Roughly a hundred pixels of toolbar was
  // moving the bottom of the document by nearly nine hundred, which is felt as the closing
  // words leaping down the page at the moment you arrive at them.
  //
  // So the unit is taken once and only re-taken when the width changes, which is a real
  // layout change — a rotation, or a desktop window being resized. A height-only change is
  // the toolbar, and nothing should move for it.
  let lockedWidth = window.innerWidth;

  function lockViewportUnit() {
    root.style.setProperty('--vh', `${(window.innerHeight / 100).toFixed(3)}px`);
  }

  lockViewportUnit();

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
  const revealLines = [...document.querySelectorAll('.descent-copy [data-reveal-delay]')];
  const iuiTails = [...document.querySelectorAll('.iui-tail')];
  const geometry = document.querySelector('.descent-geometry');
  const geometryFrame = geometry?.querySelector('iframe');

  // The descent's passage. Two lines fade up in turn, then the three letters of the acronym
  // arrive on their own — meaning nothing yet — and the rest of each word crosses the screen
  // from the right and stops dead against its letter. The letter takes the hit and the row
  // rocks with it.
  const REVEAL_MS = 760;
  const SLAM_LEAD_MS = 2700;
  const SLAM_GAP_MS = 440;
  const SLAM_MS = 470;
  const GEOMETRY_START = .03;
  const GEOMETRY_END = .84;
  let descentSequenceStarted = reducedMotion;
  let lastGeometryProgress = -1;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  // Hand the finished state to inline styles and drop the animation, so nothing is left
  // holding a fill on an element the rest of the page still has to lay out.
  function settle(element, animation, onSettled) {
    animation.addEventListener('finish', () => {
      element.style.opacity = '1';
      element.style.transform = 'none';
      animation.cancel();
      onSettled?.();
    }, { once: true });
  }

  // The impact, felt from the letter outwards: the letter is squashed against the arriving
  // word, and the whole row is shoved left before it settles.
  function slamImpact(letter, row) {
    // Squashed from the right, which is the face the word hits, so the contact edge holds
    // still and the letter gives behind it.
    letter?.animate([
      { transform: 'none' },
      { transform: 'scaleX(.8)', offset: .3 },
      { transform: 'scaleX(1.05)', offset: .62 },
      { transform: 'none' }
    ], { duration: 340, easing: 'ease-out' });

    row?.animate([
      { transform: 'none' },
      { transform: 'translateX(-7px)', offset: .28 },
      { transform: 'translateX(2px)', offset: .6 },
      { transform: 'none' }
    ], { duration: 320, easing: 'ease-out' });
  }

  function startDescentSequence() {
    if (descentSequenceStarted) return;
    descentSequenceStarted = true;

    revealLines.forEach(line => {
      settle(line, line.animate([
        { opacity: 0, transform: 'translateY(.6rem)' },
        { opacity: 1, transform: 'none' }
      ], {
        duration: REVEAL_MS,
        delay: Number(line.dataset.revealDelay),
        easing: 'cubic-bezier(.22, .61, .36, 1)',
        fill: 'both'
      }));
    });

    iuiTails.forEach((tail, index) => {
      // Measured now, with the descent pinned and the tail already holding its final width,
      // so each word starts just off the right edge whatever the screen is.
      const start = window.innerWidth - tail.getBoundingClientRect().left + 48;
      const animation = tail.animate([
        { opacity: 0, transform: `translate3d(${start.toFixed(0)}px, 0, 0)` },
        { opacity: 1, offset: .14 },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: SLAM_MS,
        delay: SLAM_LEAD_MS + index * SLAM_GAP_MS,
        // Accelerating into the stop, so it arrives at speed rather than easing down.
        easing: 'cubic-bezier(.62, 0, .9, .34)',
        fill: 'both'
      });
      settle(tail, animation, () => slamImpact(tail.previousElementSibling, tail.parentElement));
    });
  }

  // The ∅ leaves the opening with the visitor and comes to rest just above "no", brightening
  // the whole way.
  //
  // On screen the ∅ does not move at all: it holds the spot it occupies in the opening
  // while the page descends past it. Only once the "no" line has risen far enough to sit
  // directly beneath it does it catch, and from that moment it rides with "no" — up and
  // off the top with the rest of the answer. So it travels down the document without ever
  // travelling across the viewport. Math.min is the whole handoff: whichever position is
  // higher wins, which is the resting spot until "no" overtakes it.
  const MARK_GAP_RATIO = .72;
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
    const gap = Math.max(30, size * MARK_GAP_RATIO);
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
    if (!descentSequenceStarted && rect.top <= 0 && rect.bottom > viewport) startDescentSequence();

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
      // At the same breakpoint as the CSS two-column composition, keep the geometry inside
      // its left half. Shorter desktops still hit the height cap first, so they retain the
      // same visual scale without crowding the copy on the right.
      const splitLayout = window.innerWidth >= 760;
      const maxSize = mobile
        ? Math.min(window.innerWidth * .86, viewport * .56)
        : Math.min(window.innerWidth * (splitLayout ? .43 : .56), viewport * .58);
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

  window.addEventListener('resize', () => {
    if (window.innerWidth !== lockedWidth) {
      lockedWidth = window.innerWidth;
      lockViewportUnit();
    }
    updateScroll();
  }, { passive: true });
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
    [...revealLines, ...iuiTails].forEach(element => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    });
  }

  // The closing set. The braces arrive empty, then the words slide in to fill them. The last
  // word in accelerates instead of easing down, and the impact knocks every letter in the set
  // out of place and out of upright. They then hop back over each other, left to right, into
  // the correct order.
  //
  // Two arrangements, decided by what the layout is actually doing:
  //   one line  — the words come in one at a time from alternating sides, and the final word
  //               lands the impact on its own.
  //   two rows  — phones, where the set is three words over three. The halves run side by side
  //               from opposite edges and their last words meet head on, so the impact is a
  //               collision rather than a single word arriving.
  //
  // The scramble is positional, not the glyph-cycling kind: each letter takes some other
  // letter's slot, measured against the whole set rather than its own word, which is what
  // lets them cross word boundaries — and, stacked, cross between rows too.
  const contact = document.querySelector('.contact');
  const contactSet = document.querySelector('.contact-set');

  const SET_LEAD_MS = 380;
  const SET_WORD_GAP_MS = 300;
  const SET_SLIDE_MS = 560;
  // The crash keeps its old speed. It is the one beat that is supposed to be too fast to
  // follow — slowing an impact is what turns it back into an arrival.
  const SET_CRASH_MS = 330;

  // Being knocked over is its own beat. The letters used to jump to their scattered positions
  // in a single frame, so the set was upright and then it was wreckage with nothing in
  // between — the impact had no visible consequence, just a cut. Now they travel there, and
  // the shockwave crosses the set outward from wherever it was struck, so you watch it happen
  // to one letter after another.
  const SET_KNOCK_MS = 420;
  const SET_KNOCK_SPREAD_MS = 240;

  // The reorder is the part worth watching, and what made it unreadable was overlap, not
  // speed. The gap between letters used to be a fortieth of how long a letter took to travel,
  // which put 38 of the set's 62 letters in the air at the same time: nothing to track, just
  // a general shimmer. The gap is what fixes that. At these values about 18 are moving at
  // once, so the wave is a third of the set wide and you can see it cross.
  //
  // The debris still holds before it sorts itself out, but for less time than it used to:
  // watching the scatter arrive does most of the work the hold was there to do.
  const SET_SCATTER_HOLD_MS = 480;
  const SET_LETTER_MS = 1000;
  const SET_LETTER_GAP_MS = 55;

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

  // Once the set has assembled it stays alive to the pointer: come near and the letters shove
  // away from wherever you are, leave and they drift back into their words. The same gesture
  // that put them there in the first place, now under the visitor's hand.
  //
  // Positions are cached rather than measured per frame — sixty-odd letters is too many to ask the
  // browser about sixty times a second. They are cached in page coordinates, so scrolling does
  // not invalidate them; only a resize does, and that resets and re-measures.
  const REPEL_RADIUS = 138;
  const REPEL_PUSH = 86;
  // How far each letter turns to lie along the way it was thrown. 1 would point it exactly
  // outward; a little under keeps the set readable while it splays.
  const REPEL_SPLAY = .85;
  const REPEL_EASE = .16;
  const REPEL_REST = .05;

  let repelLetters = null;
  let repelBounds = null;
  let repelPointer = null;
  let repelFrame = 0;

  function measureRepel(elements) {
    const set = contactSet.getBoundingClientRect();
    repelBounds = {
      left: set.left + window.scrollX - REPEL_RADIUS,
      right: set.right + window.scrollX + REPEL_RADIUS,
      top: set.top + window.scrollY - REPEL_RADIUS,
      bottom: set.bottom + window.scrollY + REPEL_RADIUS
    };

    return elements.map(element => {
      const box = element.getBoundingClientRect();
      return {
        element,
        // Where the letter sits in the document, independent of how far down the page is.
        cx: box.left + window.scrollX + box.width / 2,
        cy: box.top + window.scrollY + box.height / 2,
        // Per-letter variation. Without it every letter takes exactly the same path for its
        // distance and the whole thing reads as one smooth field rather than sixty objects.
        spread: random(.68, 1.4),
        skew: random(-.34, .34),
        spin: random(-1, 1),
        x: 0,
        y: 0,
        turn: 0,
        radial: 0
      };
    });
  }

  function repelStep() {
    const pointerX = repelPointer ? repelPointer.x + window.scrollX : 0;
    const pointerY = repelPointer ? repelPointer.y + window.scrollY : 0;
    // One box test before sixty-odd distance tests. The pointer spends almost all of its life
    // nowhere near the set, and every mousemove on the page reaches this loop.
    const near = repelPointer
      && pointerX > repelBounds.left && pointerX < repelBounds.right
      && pointerY > repelBounds.top && pointerY < repelBounds.bottom;
    let active = false;

    for (const letter of repelLetters) {
      let targetX = 0;
      let targetY = 0;
      let targetTurn = 0;

      if (near) {
        const dx = letter.cx - pointerX;
        const dy = letter.cy - pointerY;
        const distance = Math.hypot(dx, dy) || .001;
        if (distance < REPEL_RADIUS) {
          // Squared falloff, so the shove is concentrated right under the pointer instead of
          // nudging the whole set evenly.
          const force = 1 - distance / REPEL_RADIUS;
          const push = force * force * REPEL_PUSH * letter.spread;
          // Thrown outward, but deliberately not on a true radial. A field where every letter
          // moves exactly away from one point, by exactly the same rule, is the definition of
          // a lens — it reads as the text being distorted rather than as letters being
          // repelled. The per-letter skew and spread are what make them separate objects
          // flying off in their own directions.
          const heading = Math.atan2(dy, dx) + letter.skew;
          targetX = Math.cos(heading) * push;
          targetY = Math.sin(heading) * push;

          // And each one turns to lie along the way it was thrown, so the set splays outward
          // from the pointer instead of staying upright while it slides. A letter looks the
          // same rotated half a turn, so the outward angle is resolved to whichever half-turn
          // sits nearest the one it is already holding — without that, a letter passing
          // straight above the pointer spins the long way round to an identical angle.
          let radial = Math.atan2(dy, dx) * 180 / Math.PI;
          while (radial - letter.radial > 90) radial -= 180;
          while (letter.radial - radial > 90) radial += 180;
          letter.radial = radial;
          targetTurn = (radial * REPEL_SPLAY + letter.spin * 12) * force;
          active = true;
        }
      }

      letter.x += (targetX - letter.x) * REPEL_EASE;
      letter.y += (targetY - letter.y) * REPEL_EASE;
      letter.turn += (targetTurn - letter.turn) * REPEL_EASE;

      if (Math.abs(letter.x) > REPEL_REST || Math.abs(letter.y) > REPEL_REST || Math.abs(letter.turn) > REPEL_REST) {
        active = true;
        letter.element.style.transform = `translate3d(${letter.x.toFixed(2)}px, ${letter.y.toFixed(2)}px, 0) rotate(${letter.turn.toFixed(2)}deg)`;
      } else {
        letter.x = letter.y = letter.turn = 0;
        letter.element.style.transform = 'none';
      }
    }

    // Nothing displaced and nothing in range: the pointer may still be on the page, but there
    // is no reason to keep a frame loop running for it.
    repelFrame = active ? requestAnimationFrame(repelStep) : 0;
  }

  function runRepel() {
    if (repelLetters && !repelFrame) repelFrame = requestAnimationFrame(repelStep);
  }

  function enableRepel(letters) {
    repelLetters = measureRepel(letters);

    const track = (x, y) => {
      repelPointer = { x, y };
      runRepel();
    };
    const release = () => {
      repelPointer = null;
      runRepel();
    };

    window.addEventListener('mousemove', (event) => track(event.clientX, event.clientY), { passive: true });
    document.addEventListener('mouseleave', release);
    window.addEventListener('blur', release);
    window.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY);
    }, { passive: true });
    window.addEventListener('touchend', release, { passive: true });
    window.addEventListener('touchcancel', release, { passive: true });

    // The cursor can sit still while the page moves under it, which is just as much a change
    // in what it is near.
    window.addEventListener('scroll', () => { if (repelPointer) runRepel(); }, { passive: true });

    window.addEventListener('resize', () => {
      // Stop the loop before the reset, or an in-flight frame writes displacements straight
      // back onto letters that are about to be measured.
      if (repelFrame) cancelAnimationFrame(repelFrame);
      repelFrame = 0;
      repelPointer = null;
      repelLetters.forEach(letter => { letter.element.style.transform = 'none'; });
      // Re-measured only once the reset has been laid out, or every letter records the
      // position it was displaced to.
      requestAnimationFrame(() => {
        repelLetters = measureRepel(repelLetters.map(letter => letter.element));
      });
    }, { passive: true });
  }

  function scatterSet(letters, impactFrom, impactX) {
    const size = parseFloat(getComputedStyle(contactSet).fontSize) || 20;
    const boxes = letters.map(letter => letter.getBoundingClientRect());
    const order = shuffledOrder(letters.length);
    // Mostly turned over or onto their side; a few stay upright so it reads as debris
    // rather than a uniform effect.
    const turns = [90, -90, 180, 180, -90, 90, 0];

    // Where the blow landed, and how far the furthest letter is from it — the shockwave is
    // timed against that, so it sweeps the whole set in SET_KNOCK_SPREAD_MS however wide the
    // set happens to be. Stacked, the rows met in the middle and there is no single word to
    // point at, so the set's own centre stands in.
    const centres = boxes.map(box => box.left + box.width / 2);
    const origin = impactX ?? (Math.min(...centres) + Math.max(...centres)) / 2;
    const reach = Math.max(...centres.map(centre => Math.abs(centre - origin))) || 1;

    // Knock, hold and reorder run as one animation per letter on a timeline every letter
    // shares. Chaining separate animations would mean a later one's backwards fill stamping
    // its own first frame over whatever the earlier one was still doing.
    const knockEnd = SET_KNOCK_SPREAD_MS + SET_KNOCK_MS;
    const holdEnd = knockEnd + SET_SCATTER_HOLD_MS;
    const total = holdEnd + (letters.length - 1) * SET_LETTER_GAP_MS + SET_LETTER_MS;

    letters.forEach((letter, index) => {
      const box = boxes[index];
      const target = boxes[order[index]];
      const dx = target.left - box.left;
      const dy = target.top - box.top + random(-.22, .22) * size;
      const turn = turns[Math.floor(Math.random() * turns.length)];
      const scattered = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${turn}deg)`;
      const apex = random(.7, 1.3) * size;
      const arc = `translate(${(dx * .45).toFixed(1)}px, ${(dy * .45 - apex).toFixed(1)}px) rotate(${(turn * .35).toFixed(1)}deg)`;

      const knockAt = SET_KNOCK_SPREAD_MS * (Math.abs(centres[index] - origin) / reach);
      const returnAt = holdEnd + index * SET_LETTER_GAP_MS;

      // Offsets are absolute milliseconds divided through by the shared duration. Each letter
      // waits upright for the wave, is thrown, lies there, then hops home on its own beat.
      const frames = [];
      if (knockAt > 0) frames.push({ offset: 0, transform: 'none', easing: 'linear' });
      frames.push({ offset: knockAt / total, transform: 'none', easing: 'cubic-bezier(.16, .74, .3, 1)' });
      frames.push({ offset: (knockAt + SET_KNOCK_MS) / total, transform: scattered, easing: 'linear' });
      frames.push({ offset: returnAt / total, transform: scattered, easing: 'cubic-bezier(.3, .78, .32, 1)' });
      frames.push({ offset: (returnAt + SET_LETTER_MS * .5) / total, transform: arc, easing: 'cubic-bezier(.3, .78, .32, 1)' });
      frames.push({ offset: (returnAt + SET_LETTER_MS) / total, transform: 'none' });
      if (returnAt + SET_LETTER_MS < total) frames.push({ offset: 1, transform: 'none' });

      const animation = letter.animate(frames, { duration: total, fill: 'both' });
      animation.addEventListener('finish', () => {
        letter.style.transform = 'none';
        animation.cancel();
        // Every letter shares the timeline, so they all land together and this handler — the
        // last registered — runs with the whole set home and measurable.
        if (index === letters.length - 1) enableRepel(letters);
      }, { once: true });
    });

    // The braces take the hit too, otherwise only the letters were struck. impactFrom 0 is
    // the head-on case, where the two rows cancel sideways and the set just thuds downward.
    const drop = impactFrom ? 4 : 7;
    contactSet.animate([
      { transform: 'none' },
      { transform: `translate(${impactFrom * -5}px, ${drop}px)`, offset: .3 },
      { transform: `translate(${impactFrom * 2}px, ${(-drop * .35).toFixed(1)}px)`, offset: .65 },
      { transform: 'none' }
    ], { duration: 280, easing: 'ease-out' });
  }

  function revealContactSet() {
    const rows = [...contactSet.querySelectorAll('.set-row')];
    const words = [...contactSet.querySelectorAll('.key-word')];
    const letters = words.flatMap(splitLetters);
    const travel = Math.max(window.innerWidth, 320) * .46;

    // Ask the layout rather than re-deciding the breakpoint here: the rows only take a box
    // when the stylesheet has stopped dissolving them, which is exactly when the set is two
    // lines. So the choreography can never disagree with what is on screen.
    const stacked = rows.length > 1 && getComputedStyle(rows[0]).display !== 'contents';
    // Each group is one arriving line. Stacked, that is a row apiece, both running at once
    // from opposite edges; otherwise it is the whole set as a single sequence.
    const groups = stacked ? rows.map(row => [...row.querySelectorAll('.key-word')]) : [words];
    let scattered = false;

    groups.forEach((group, groupIndex) => {
      group.forEach((word, step) => {
        // Whatever closes a line is what lands the impact. Stacked, both lines close on the
        // same beat and hit each other.
        const crash = step === group.length - 1;
        const from = stacked ? (groupIndex % 2 ? 1 : -1) : (step % 2 ? 1 : -1);
        const animation = word.animate([
          { opacity: 0, transform: `translateX(${(from * travel).toFixed(0)}px)` },
          { opacity: 1, offset: .3 },
          { opacity: 1, transform: 'none' }
        ], {
          duration: crash ? SET_CRASH_MS : SET_SLIDE_MS,
          delay: SET_LEAD_MS + step * SET_WORD_GAP_MS,
          easing: crash ? 'cubic-bezier(.65, 0, .95, .35)' : 'cubic-bezier(.16, .9, .3, 1)',
          fill: 'both'
        });
        animation.addEventListener('finish', () => {
          word.style.opacity = '1';
          word.style.transform = 'none';
          animation.cancel();
          // Measure only now, with every word home. Two simultaneous crashes are still one
          // impact, so the first to land runs it and the guard drops the other.
          if (crash && !scattered) {
            scattered = true;
            const box = word.getBoundingClientRect();
            scatterSet(letters, stacked ? 0 : from, stacked ? null : box.left + box.width / 2);
          }
        }, { once: true });
      });
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
