# the MT set — Site Plan

**Status:** early. Concept is solid, copy is draft, structure is one section deep.
**Last updated:** 2026-08-04

---

## What this site is

A portfolio. Not organized by job title — organized by outcomes, per the master plan
in [aiconvo.md](aiconvo.md).

The name does the work. **MT set** reads aloud as *empty set* — ∅ — and MT is also
Matt Titchenal. The site opens on what appears to be nothing, and the whole experience
is the act of discovering it isn't.

That's not a gimmick layered on top of a portfolio. It *is* the thesis:

> Understand the system. Learn how it works. Improve it. Leave it better than you found it.

The site performs that thesis before it ever explains it. A visitor who scrolls to the
bottom has already done the thing the portfolio is about — looked closer at something
that seemed empty and found structure.

### The one-sentence version

*Looks empty. Isn't.*

---

## Relationship to Simply Curious

Both sites share a root idea — **curiosity reveals deeper structure**. They are not the
same brand and should not look like each other.

| | Simply Curious | the MT set |
|---|---|---|
| Tone | Meditative, warm, inviting | Cold, still, a little unnerving |
| Palette | Gold / teal, light + dark | Near-black, storm blue, paper white |
| Motion | Breathing, tidal, patient | Sudden, electrical, then falling |
| Ask of visitor | Observe or engage, both fine | Keep going. Descend. |
| Subject | The product | The person who built it |

**Open question — decide before building the descent animation.** Reusing the Simply
Curious star tetrahedron here is the current plan (see below). It's the strongest visual
asset available and it carries real meaning. But shipping the same hero on two sites
weakens both — a visitor who sees both will read the portfolio as an offcut of the
product rather than its author. Options:

- **(A) Reuse as-is.** Fastest. Accept the dilution.
- **(B) Reuse the geometry, change the expression.** Same star tetrahedron, but here it
  is *found in the dark* rather than *offered in the light* — no gold, no breathing,
  no click-to-begin. Scroll-driven only. Recommended.
- **(C) Different geometry entirely.** The empty set symbol ∅ has its own geometry to
  mine. Most distinct, most work, and loses the "same mind built both" signal.

Working assumption below is **(B)**.

---

## Structure

### Live now

| Section | Height | State | Purpose |
|---|---|---|---|
| `.opening` | 185vh | Built | "is it empty?" — invisible until lightning |
| `.answer` | 205vh | Built | "no. it is **MT**" |
| `.descent` | 390vh | Built (rings only) | The fall. Three fragments pass by. |
| `.threshold` | 100vh | Placeholder | "there is more down here." Dead end today. |

### Needed

The threshold is where the site currently stops being a site. Everything below is
unbuilt.

| Section | Purpose |
|---|---|
| **The four bodies of work** | The actual portfolio. See below. |
| **Case studies** | One page per project. The real substance. |
| **About** | Who's building this, in plain language. |
| **Contact** | One way to reach out. Not a form with six fields. |

### The four bodies of work

Straight from the master plan, unchanged — the categorization is the strongest part of it:

1. **Building Digital Products** — software, architecture, AI, applications
2. **Designing Experiences** — UI, UX, graphics, branding, animation
3. **Solving Complex Problems** — case studies, technical challenges, decisions, lessons
4. **Building Things** — selected physical projects, as evidence of method

**Structural idea worth testing:** the descent shaft currently has four rings you fall
past. Make them the four categories. You don't read a nav — you fall through the work.
Each ring gets a label that becomes legible as you approach it and passes out of frame
as you continue. At the bottom, a conventional index for anyone who wants to navigate
rather than fall.

This is elegant but risky: an experience with no escape hatch is hostile to a recruiter
with ninety seconds. **Requirement: a skip link and a plain index must exist from the
first screen.** Curiosity is rewarded, not required.

### The DIY section is the differentiator — don't bury it

Every developer portfolio has projects. Almost none can say *two HVAC techs couldn't
find it, I did.* That paragraph does more to establish systems thinking than any
architecture diagram. Frame it as evidence of method, not as a hobby log. The master
plan already says this and it's right.

---

## The descent animation

**Goal:** the star tetrahedron sits at the center of the shaft, small and nearly
invisible at the top of the fall, and grows as you descend until it fills the screen at
the bottom.

Read literally, the shaft is a hole and the geometry is what's at the bottom of it. The
"empty" set has something in it, and the further in you look the more of it there is.
That's the whole site in one motion.

### Current state

[script.js:150-159](script.js#L150-L159) already computes `descentProgress` (0→1 across
the `.descent` section) and uses it to scale and rotate four rings. The `.core` element
([index.html:59](index.html#L59)) is a static 8vmax blob at center — that's the slot the
animation goes into.

### Source

`~/Projects/Simply_Curious/src/components/StarTetrahedron.astro` — ~2300 lines. It is
**not** droppable as-is. It contains, roughly:

- **Geometry + math** (~lines 344-520): quaternions, rotation, projection. Portable.
- **Hidden-line occlusion** (~lines 539-670): front/back face tests, occluder building,
  segment runs. Portable, and this is the expensive, hard-won part — the reason the
  Star of David reveals itself cleanly.
- **The scripted click sequence** (~lines 672-1050, 1141-1800): hexagram → tetrahedra →
  merge → tilt → spin. **Not wanted here.** This site has no click-to-begin.
- **Logo background, theme colors, expand portal, drag, scroll lock** (~lines 1050-1140,
  1817-2340): Simply Curious product features. Not wanted.

### Port plan

Extract the render core into a plain `descent.js` — no Astro, no TypeScript, matching
this project's vanilla setup. Then drive it from scroll instead of from a timeline:

1. Replace the `.core` div with `<canvas class="core-canvas">`, absolutely centered in
   `.shaft`, `z-index` below `.fragment` (which is 2).
2. Feed `descentProgress` in as the single input. Everything else derives from it:
   - **Scale** — from roughly 4vmax at `p=0` to filling the viewport at `p=1`.
     Non-linear; slow at first, accelerating late, so the arrival lands.
   - **Rotation** — a slow constant Y-drift plus a `p`-driven tilt, so it's alive when
     static and responds when you move.
   - **Opacity / stroke alpha** — near-zero at the top. It should be *ambiguous* whether
     anything is there for the first 20% of the fall.
   - **The reveal** — the hidden-line Star of David resolves in the last ~25% of the
     descent. That's the payoff moment and it should coincide with the threshold copy.
3. Lightning already drives `--light` globally. Wire it into the stroke color so the
   geometry catches the storm the same way the text does. This is the detail that will
   make it feel like one system rather than two effects on one page.
4. `prefers-reduced-motion`: render the settled pose, fully revealed, no scroll coupling.

### Sequencing

Do the copy first. The animation is the expensive item and its pacing depends on how
much text it has to carry — build it against real words, not lorem.

---

## The scroll cue is the actual bounce risk

`--question-rest: 0` is settled — the question stays black and the storm timing carries
readability instead. But there's a second, quieter problem it exposes.

`.scroll-cue` opacity is `clamp(0, calc((var(--progress) - .03) * 8), .42)` — zero until
you've already started scrolling. So a visitor who lands and doesn't move sees a black
screen, some lightning, and **no indication that scrolling does anything.** The cue is a
reward for an action already taken rather than an invitation to take it.

Making the question readable at rest solves nothing here; the visitor who bounces isn't
squinting at the copy, they're deciding whether this page is broken.

**Recommendation:** invert it. Show `look deeper` faintly at rest and fade it *out* as
`--progress` rises — it has done its job the moment you move. Roughly:

```css
opacity: clamp(0, calc(.34 - var(--progress) * 4), .34);
```

Better still, let the cue catch the lightning like everything else so it belongs to the
storm rather than sitting on top of it. Not changed yet — this alters the feel of the
first screen and is your call.

---

## Open questions

- [ ] Which option for the Simply Curious relationship — A, B, or C?
- [ ] Does the descent hold four category rings, or stay abstract with a conventional
      portfolio section below the threshold?
- [ ] Is this the primary portfolio URL, or an entrance that hands off to a plainer site?
      Changes how much conventional navigation has to live inside the experience.
- [ ] Static site (current: hand-written HTML/CSS/JS) or Astro like Simply Curious?
      Case study pages will make plain HTML tedious around the third one.
- [ ] Real name and contact surfaced, or does "MT" carry it? A portfolio a recruiter
      can't attribute to a person is a portfolio that doesn't work.
