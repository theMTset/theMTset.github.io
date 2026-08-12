# the MT set — Copy Deck

Every word that appears on the site, in order. Live copy is marked **LIVE**; everything
else is draft and should be argued with.

**Last updated:** 2026-08-11

---

## Voice

Short lines. Lowercase for the atmospheric layer, sentence case for the substance.

The site whispers at the top and talks plainly at the bottom. That shift is intentional
— the atmosphere earns attention, then the work uses it. Do not stay cryptic past the
threshold. A visitor who has descended has committed; reward them with real information,
not more mood.

**Rules:**

- No exclamation points.
- No "passionate," "innovative," "cutting-edge," "leverage," "ninja," "rockstar."
- No em-dash-heavy breathlessness. One idea per line.
- First person, past tense, specific. "Diagnosed a furnace two techs couldn't" beats
  "strong troubleshooting skills."
- Never explain the joke. The site is called the MT set. If someone gets it, that's
  their moment, not ours.

---

## 1. Opening — **LIVE**

> **is it empty?**

Invisible until lightning strikes. The visitor sees a black screen, then the second
strike leaves the question readable as a sustained afterimage.

Scroll cue: `look deeper`

*Note: this is the riskiest thing on the site and the best.*

**Decided 2026-08-11:** the question stays fully black at rest (`--question-rest: 0`).
The first strike is distant. The second is longer, thicker, and reaches through the
question. Its text afterglow begins on the first pulse, holds at full strength, and then
decays within a 6.4-second total; it never drops to black between flash and glow. Sparse
lightning continues while the visitor remains in the opening or answer, then stops at the
descent boundary so it never flashes over the portfolio below. Tuning knobs live beside
`BIG_STRIKE_INDEX` and in `nextStrikeDelay()` in [script.js](script.js).

The `look deeper` cue catches the same lightning at scroll zero and fades out once the
visitor moves. Reduced-motion mode shows it statically at low opacity.

**Decided 2026-08-12:** the ∅ now travels down the document without ever moving across the
viewport. It is a fixed element rather than part of either sticky frame, and it holds the
spot it occupies in the opening while the page descends past it. Only when the `no.` line
of section 2 has risen far enough to sit directly beneath it does it catch — from then on it
rides with `no.`, holding a constant gap, and leaves by scrolling off the top with the rest
of the answer rather than by fading. Its glow rises through the whole approach and is full,
equal to a direct lightning strike, exactly as it catches.

The glow also has a resting floor (`--mark-rest`), raised on phones, which are dimmer and
rarely viewed in the dark — before this the mark was invisible on mobile between strikes.
Scroll response is eased (`easeOutCubic`) so the first swipe produces obvious motion instead
of the opening appearing to hold still.

---

## 2. The answer — **LIVE**

> no.
>
> # it is **MT**
>
> keep going

The pun lands here or it doesn't land at all. "MT" remains the brightest element, while
the smaller “no.” and “keep going” lines use enough contrast to remain legible on dark
mobile displays.

---

## 3. The descent — **LIVE**

The descent now states method and outcome instead of adding more atmosphere. The lines
are unnumbered. They fall from above, settle into a bottom stack, and remain visible:

> I need to know how things are built.
>
> so I can make things
>
> intuitive
>
> understandable
>
> interactive

The causal order is deliberate. “I need” is stronger than “I like,” and the three final
qualities give the falling-word animation a repeatable rhythm. “interactive” lands last
because the visitor can then directly manipulate the geometry above it.

The lines begin automatically on first entry and play once per page load. The geometry's
formation remains tied to scroll in both directions. When it finishes, the interaction
hint `drag to explore` rises beneath it.

---

## 4. Selected work — **LIVE on `designer-application`**

The designer branch moves directly from the final falling qualities into the work. The
former threshold sentence and extra full-height pause have been removed.

Section heading: `selected work`

### Turbopuffer — interaction design

> turbopuffer's logo scrambles into place on hover or touch. I reverse-engineered it from their
> production bundle, then rebuilt it with Claude Code: the word now converges onto wherever
> your pointer lands and trails precisely along its path as you move.
>
> Three rounds of iteration on the interaction model. Shipped as a typed, working
> component — not a mockup.

Source link: `view the React component repository ↗`

The linked `theMTset/scramble-text-interaction` repository contains the accessible,
reduced-motion-aware React component, live demo, and integration instructions.

### Simply Curious — motion, from scratch

> The hero geometry from Simply Curious. Two tetrahedra merge, resolve into a star, and spin.
>
> Hidden-line occlusion and direct manipulation, drawn by hand in canvas. No 3D libraries.

### Simply Curious — brand + full build

> Brand mark for Simply Curious, a product I designed and built end to end.
>
> Astro, Cloudflare Workers, D1 — logo to backend, one person.

---

### MaxCardPoints — product, full build

> MaxCardPoints finds the best credit-card stack for your actual spending. The optimizer
> runs entirely client-side — no calculation ever leaves the browser — while a Cloudflare
> Worker and D1 database keep the card catalog current behind the scenes.
>
> Astro, Cloudflare Workers, D1, Alpine.js. Installable as an offline-first PWA.

Source link: `visit maxcardpoints.com ↗`

---

## 5. About — **LIVE on `designer-application`**

> I've always been driven by curiosity.
>
> Before software: high-energy particle physics, organic farming, CNC machining, then
> electrical work — then whatever the house needed next. A bathroom. A deck. A furnace two
> HVAC technicians had already given up on; I found what they missed. I've always been the
> type to take apart what's broken, see how it works, then fix it.
>
> I'd played with web design before that — static sites, PWAs, drawing the logos and
> graphics myself, always my favorite part. With AI I can do far more of it, and I've come a
> long way in understanding not just how to use it but where its limits are. I'm still
> learning — about AI, and about the development process itself — so I can make that
> workflow correct, not just fast.
>
> Same question every time. How does this actually work?
>
> I design the surface and build what runs underneath it. As a solo dev I never really had
> a choice — not that I'd have it any other way. I want to understand the systems that make
> the software work.
>
> Now the question points at getting a job. I've been a stay-at-home dad for the past few
> years, still working part-time as an electrician. My son is getting older, so it's time to
> think about full-time again. My boss would take me back tomorrow, but I've enjoyed working
> with AI too much to go back to wiring. As my older brother put it: "You're the only one who
> actually enjoys work." He's watched me at it constantly these past few months — building,
> talking about it, losing whole days to it. The time just flies.
>
> So here I am. Portfolio site, updated resume, looking for full-time work where I can build
> and understand the systems underneath.
>
> I heard about turbopuffer on The Pragmatic Engineer — the team, the way you work — and
> thought it might be a fit. Then I saw the logo animation. I liked it, but I caught myself
> hovering over it wishing it responded to where my pointer actually was. So I built that.
> AI made it quick, but not one-shot; you have to iterate to get it where you want it. Then I
> packaged it as a React component and put it on GitHub, so it's yours if you want it.
>
> I'd like to build things with you.
>
> The work above is the evidence.
>
> MT

The long personal middle is deliberate and stays first person and plain. It breaks the
"short lines" rule on purpose: by this point the visitor has descended past the atmosphere
and is owed the actual reason for the application, not more mood.

---

## 6. Case study template — draft structure

Every project page uses the same five beats. Consistency here is what turns a list of
projects into an argument about how someone thinks.

1. **What it is** — one sentence, no jargon.
2. **The actual problem** — what was hard, stated honestly.
3. **How I took it apart** — the process. This is the section that matters.
4. **What I built** — the solution, with the tradeoffs named.
5. **What I'd do differently** — non-negotiable. Its absence reads as inexperience.

For graphic design pieces, the master plan's three-step reveal is a strong format:
AI concept → morph → finished SVG. It demonstrates judgment *and* craft in one motion,
and it's honest about the tools.

---

## 7. Contact — **LIVE on `designer-application`**

> { curious, adaptable, self-taught, hands-on, thorough, still learning }
>
> theMTrepo@gmail.com

**Decided 2026-08-12:** replaced the "Built something you want taken apart?" prompt with the
closing beat of the site's own question. The page ends by proving the set is not empty.

The words describe the person, not the biography — the About section directly above already
tells the physics/farming/machining story, and repeating it here would only echo. Each one
is something the page above it has already earned: "adaptable" by the run from physics to
farming to CNC to wiring to software, "thorough" by the furnace two technicians gave up on,
"still learning" by the admission that AI made the scramble component quick but not
one-shot. "honest" and "trustworthy" were considered and cut — they are the kind of word a
reader discounts on sight, and "still learning" already carries that note with evidence
behind it.

**The animation.** The braces arrive first and empty. The words then slide in one at a time
from alternating sides, slowly enough to read. The last one accelerates into the set instead
of easing down onto it, and that impact knocks every letter loose: all 62 scatter across the
whole set — each taking some other letter's slot, most turned onto their side or fully over
— and then hop back over each other, left to right, into the correct order.

Two things make it work. The reader has already read all six words before the set comes
apart, so the jumble hides nothing; and the resolve runs left to right rather than all at
once, so it reads as a reveal instead of noise. Total: about three seconds.

The scramble is **positional**, not the glyph-cycling kind turbopuffer's logo uses. Each
letter physically travels to another letter's place. Letters are measured against the whole
set rather than their own word, which is what lets them cross word boundaries. Tuning knobs
are the `SET_*` constants in [script.js](script.js).

The set reveals once, on first entry, via IntersectionObserver. Reduced-motion mode never
splits the words at all and shows the set complete and static. `<html class="js">` is set
inline in the head so the words are never left invisible if the script fails to run, and a
visually hidden copy of the line carries the reading for assistive technology, which would
otherwise spell out 62 separate fragments.

One set, one address. No form.

---

## Unresolved

- [ ] Real name on generic `main`, or only on role-specific application branches?
- [ ] Does the atmospheric voice extend into case studies?
      (Leaning: stop. Case studies should be readable by a hiring manager on a phone.)
- [ ] Generic meta/social tagline for `main`. Application branches should provide their
      own role-specific title and description rather than merging those values upstream.
