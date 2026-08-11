# the MT set — Site Plan

**Status:** designer-role branch built through selected work, About, and Contact; shared foundation comes from `main`.
**Last updated:** 2026-08-11

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

The portfolio uses the same star-tetrahedron geometry but gives it a different expression.
Here it is found in the dark: cool blue rather than gold, already assembled, and always
turning. There is no click-to-begin or scripted Simply Curious story. Dragging turns the
shape directly; release returns it to its ambient track. This preserves the "same person
built both" connection without making the portfolio hero an offcut of the product hero.

---

## Structure

### Live now

| Section | Height | State | Purpose |
|---|---|---|---|
| `.opening` | 185vh | Built | "is it empty?" — invisible until lightning |
| `.answer` | 205vh | Built | "no. it is **MT**" |
| `.descent` | 500vh | Built | The fall. Copy collides into a persistent stack while the interactive geometry grows. |
| `.threshold` | 100vh | Built copy; transition open | Handoff to designer-specific selected work. |
| `.work` | Content height | Built | Three interaction, motion, and brand/build examples. |
| `.about` | Content height | Built | Plain-language account of method and range. |
| `.contact` | 60vh | Built | One direct email route. |

### Role-specific continuation

The generic `main` branch intentionally stops at the threshold. This
`designer-application` branch continues into selected work, About, and Contact. The
visual transition from the settled geometry into selected work still needs design.

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

The star tetrahedron sits above the copy stack, small at the top of the fall, and grows
with `descentProgress` until it reaches its final size near the bottom. The hole's visual
center is raised to keep the accumulated words clear.

The copy is a causal sequence:

> I need to know how things are built.
>
> so I can make things
>
> intuitive
>
> understandable
>
> interactive

Each line falls from above, bounces on arrival, jolts the existing stack, and remains.
The sequence is scroll-driven and reversible. Reduced-motion mode shows the completed
stack without falling or collision.

### Geometry source and behavior

`assets/work/star-tetrahedron-ambient.html` is generated from the latest pushed renderer
in `simply-curious/website`, component commit
`24f95c0314782f69706d2ec114fcafd67c1b9cfe`. It preserves the quaternion transform,
perspective projection, and hidden-line occlusion work while replacing the product's
scripted phase machine with a portfolio-specific ambient mode:

- the completed 3D star is visible immediately and rotates slowly;
- mouse or one-finger drag turns it about the screen axes;
- release takes the shortest eased path back to the ambient track;
- scroll never changes its speed or direction and clicks do not pause it;
- the host page supplies a full-screen overlay control;
- before the final part of the descent, the iframe ignores pointer input so it cannot
  trap a mobile scroll gesture;
- reduced-motion mode keeps the star static but still permits direct inspection.

The portfolio remains plain HTML, CSS, and JavaScript. The renderer is isolated in an
iframe so its canvas styles and pointer handling do not leak into the surrounding page.

### Turbopuffer React deliverable

The portfolio itself remains vanilla, but the Turbopuffer case study links the real,
tested React + TypeScript deliverable at
`assets/work/scramble-text/ScrambleText.tsx`. Its adjacent README documents the changed
props, integration call site, accessibility behavior, and reduced-motion handling. The
public link targets this branch in `theMTset/theMTset`; it will resolve after the branch
is pushed.

---

## The scroll cue

The cue now catches the same lightning as the question at scroll zero and fades out as
soon as `--progress` rises. It is not permanently visible in the dark, so the opening
keeps its atmosphere, but every readable strike also reveals the instruction to “look
deeper.” Reduced-motion mode supplies a static low-opacity fallback because no strike
will occur.

---

## Branching and role-specific portfolios

`main` is the generic, role-neutral portfolio foundation. Shared improvements belong on
`main` first: storm behavior, the opening and descent, accessibility, generic About or
contact content, shared components, and bug fixes.

Role-specific applications branch from `main`, for example:

- `designer-application` — interaction design, motion, brand, and Turbopuffer-specific copy;
- a future data-center branch — systems, operations, electrical work, troubleshooting,
  and infrastructure-specific selected work.

Do not merge job-targeted headlines, project ordering, employer references, or metadata
back into `main`. To make a new application, branch from current `main`, then tailor only
the role-specific layer. When a shared improvement is discovered on an application
branch, implement or cherry-pick it onto `main` and merge `main` back into every active
application branch that needs it. Never use an application branch as the base for an
unrelated role.

## Open questions

- [ ] How does the settled descent hand off to selected work without making the geometry
      disappear or turning the next section into an abrupt cut?
- [ ] Does the generic portfolio eventually include a conventional work index, or remain
      only the shared entrance used by role-specific branches?
- [ ] Is this the primary portfolio URL, or an entrance that hands off to a plainer site?
- [ ] Static site or Astro once generic case-study pages justify shared templates?
- [ ] Real name and contact surfaced on generic `main`, or only on application branches?
