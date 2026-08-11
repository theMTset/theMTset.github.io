# the MT set — Copy Deck

Every word that appears on the site, in order. Live copy is marked **LIVE**; everything
else is draft and should be argued with.

**Last updated:** 2026-08-04

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

Invisible until lightning strikes. The visitor sees a black screen, then — for maybe
200ms — a question.

Scroll cue: `look deeper`

*Note: this is the riskiest thing on the site and the best.*

**Decided 2026-08-04:** the question stays fully black at rest (`--question-rest: 0`).
The bounce risk is handled by exposure budget, not by turning the text on — the storm
arrives close (first strike at 650ms, then ~1.3–3.2s gaps for four strikes) and the
flash decays like an afterimage instead of cutting to black. A new visitor gets several
long reads; a visitor who stays gets the sparse atmosphere. Tuning knobs live in
`ARRIVAL_STRIKES` and `nextStrikeDelay()` in [script.js](script.js).

**Still open:** the `look deeper` cue is invisible at scroll 0 — it fades *in* as you
scroll. So a cold visitor sees black, occasional lightning, and no affordance at all.
That is the real bounce risk, not the question. See PLAN.md.

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

## 3. The descent — fragments

Three fragments pass as you fall. **LIVE**, and they're good — keep the cadence, sharpen
the specificity.

> **01** — I make things at the edge of light and noise.
>
> **02** — Some are built. Some are found.
>
> **03** — This is where they collect.

**Draft alternate**, if the four-ring structure wins and fragments should name the work
rather than set mood:

> **01** — I take things apart to see how they work.
>
> **02** — Software. Graphics. A furnace two techs gave up on.
>
> **03** — Same question every time: how does this work?
>
> **04** — This is where the answers collect.

The alternate is less atmospheric and more useful. Test both. Fragment 02 in the
alternate is the single highest-value line on the site — it establishes range in nine
words.

---

## 4. Threshold — **LIVE**, needs replacing

> there is more down here.
>
> the MT set

Currently a dead end. This is where the star tetrahedron completes its reveal and the
site has to become a portfolio. Candidate replacements:

**Option A — the turn, stated plainly:**
> It looked empty.
>
> It never was.

**Option B — hand off to the work:**
> Everything below was built by someone who wanted to know how it worked.

**Option C — keep it short and let the geometry talk:**
> ∅
>
> not empty.

---

## 5. The four bodies of work — draft

Section intro:

> Not organized by job title. Organized by what came out of it.

### Building Digital Products
> Software, architecture, AI, and applications. The things that run.

### Designing Experiences
> Interfaces, brand, graphics, motion. Making complicated technology feel simple.

### Solving Complex Problems
> Case studies. The decisions, the dead ends, and what I'd do differently.

### Building Things
> Decks, bathrooms, furnaces, floors. Not construction credentials — evidence of method.

---

## 6. About — draft

The master plan's philosophy section, tightened. The original is good thinking but reads
like notes to self; this is the same content aimed at a reader.

> I've always been driven by curiosity.
>
> Designing software, drawing vector graphics, remodeling a bathroom, repairing an HVAC
> system, building a deck — it's the same question every time.
>
> **How does this work?**
>
> I like taking complex systems apart, understanding how they were built, improving
> them, and putting them back together better than before.
>
> I don't see software, design, and engineering as separate disciplines. They're the
> same process wearing different clothes: learn, understand, simplify, improve, build.
>
> My favorite thing is fixing what other people have given up on. Two HVAC technicians
> couldn't find what was wrong with my furnace. I found it.
>
> That's the whole portfolio, really. The projects are just evidence.

**Cut from the original on purpose:** the bulleted strengths list ("Systems Thinking,"
"Software Development," "User Experience"). Claiming systems thinking is weak; the
furnace sentence demonstrates it. Show, don't label.

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

## 8. Contact — draft

> Built something you want taken apart? Or have something that needs putting back
> together?
>
> [email]

One line, one address. No form.

---

## Unresolved

- [ ] Real name on the site, or does MT carry it? (Leaning: real name on About and
      contact. A portfolio that can't be attributed is a portfolio that can't be hired.)
- [ ] Does the atmospheric voice extend into case studies, or stop at the threshold?
      (Leaning: stop. Case studies should be readable by a hiring manager on a phone.)
- [ ] Tagline for meta/social preview. Current `<meta description>` is "The MT Set —
      something waits in the dark," which is mood, not information. Something that works
      as a link preview in Slack: *"Matt Titchenal — software, design, and taking things
      apart."*
