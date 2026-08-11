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
decays within a 6.4-second total; it never drops to black between flash and glow. Those
two opening strikes are the entire storm—no ambient lightning follows the visitor down
the portfolio. Tuning knobs live beside `BIG_STRIKE_INDEX` and in `nextStrikeDelay()` in
[script.js](script.js).

The `look deeper` cue catches the same lightning at scroll zero and fades out once the
visitor moves. Reduced-motion mode shows it statically at low opacity.

---

## 2. The answer — **LIVE**

> no.
>
> # it is **MT**
>
> keep going

The pun lands here or it doesn't land at all. "MT" is set in white against the dimmer
line — it's the only fully-lit thing on the page so far.

---

## 3. The descent — **LIVE**

The descent now states method and outcome instead of adding more atmosphere. The lines
are unnumbered. They fall from above, collide into a bottom stack, and remain visible:

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

---

## 4. Threshold — **LIVE on `designer-application`**, transition open

> Everything below was built by someone who wanted to know how it worked.
>
> the MT set

The copy is settled for this branch. The visual handoff from the interactive geometry
to selected work still needs design. Generic `main` retains its placeholder until a
role-neutral handoff is chosen.

---

## 5. Selected work — **LIVE on `designer-application`**

Section heading: `selected work`

### Turbopuffer — interaction design

> turbopuffer's logo scrambles into place on hover. I reverse-engineered it from their
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

## 6. About — **LIVE on `designer-application`**

> I've always been driven by curiosity.
>
> Before software: physics, then electrical work, then whatever the house needed next.
> A bathroom. A deck. A furnace two HVAC technicians had already given up on. I found
> what they missed.
>
> Same question every time. How does this actually work?
>
> Now the question points at interfaces and motion instead of wiring. I design the surface
> and build what runs underneath it — I've never been able to treat those as separate
> disciplines. Learn, understand, simplify, improve, ship.
>
> The work above is the evidence.
>
> Matt Titchenal — the MT set

---

## 7. Case study template — draft structure

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

## 8. Contact — **LIVE on `designer-application`**

> Built something you want taken apart?
> Or have something that needs putting back together?
>
> theMTrepo@gmail.com

One prompt, one address. No form.

---

## Unresolved

- [ ] Design the handoff from the settled geometry into selected work.
- [ ] Real name on generic `main`, or only on role-specific application branches?
- [ ] Does the atmospheric voice extend into case studies, or stop at the threshold?
      (Leaning: stop. Case studies should be readable by a hiring manager on a phone.)
- [ ] Generic meta/social tagline for `main`. Application branches should provide their
      own role-specific title and description rather than merging those values upstream.
