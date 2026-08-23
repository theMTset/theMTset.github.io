# Workaway introduction — site plan

**Status:** First draft on the `workaway` branch
**Target URL:** `https://themtset.github.io/workaway/`

## Purpose

Give a potential Hawaii Workaway host a quick, grounded answer to four questions:

1. Who is Matt?
2. What useful work can he do?
3. Does he understand Hawaii and work-trade living?
4. What will he be like to live and work with?

This is not a replacement for the Workaway profile. It is supporting evidence with more
room for work examples and context than the profile allows.

## Accepted direction

- Matt will travel alone.
- Matt is open to placements on any Hawaiian island. He already knows Kauai and the Big
  Island and would also welcome the chance to experience an island that is new to him.
- Hawaii is not new to him: he lived there, spent six months in farm work trades on
  Kauai, spent most of his Hawaii time on the Big Island, and one of his sons was born there.
- His broader farm background includes two years of work trade in Hawaii and two partial
  summers of work trade on the mainland, including exchanges through WWOOF. He later
  returned as a paid worker to a mainland farm where he had previously volunteered. The
  six months on Kauai is one specific part of his Hawaii experience, not the total.
- Lead with six years of professional electrical experience.
- Follow with construction and home-project experience: decks, bathroom remodels,
  flooring, repairs, and maintenance.
- Present web development and practical AI workflow work as a second substantial skill set.
- Keep prior farming and comfort in a family household as useful supporting experience.
- Do not make the divorce public. Describe the move as a considered life transition and
  make clear that building stability for time with his children is part of the goal.
- Do not imply that children or other guests would stay with a host. Any visit would be a
  private, advance discussion with a host.
- Be precise about electrical work: professional experience does not override Hawaii's
  licensing, permitting, insurance, or safety requirements.
- The concise statement of Matt's work ethic is: "Be honest and do good work."

## Design direction

The main portfolio is dark, atmospheric, and aimed at technical employers. This page is
warmer and more direct: deep green, ocean blue, sand, clay, and sun yellow. It shares Matt's
systems-minded identity but prioritizes trust, legibility, and relevant facts over spectacle.

The first draft deliberately uses a graphic island panel rather than generic stock imagery.
Real photos of Matt and his physical projects should replace or supplement it after suitable
images are selected.

The Hawaii panel is island-neutral rather than labeled Kauai. As it crosses the viewport,
the sun sets behind the ridges, the moon rises, and the sky moves toward night. Reduced-motion
mode holds a static twilight composition.

The At a Glance card has no large background accent. Its yellow offset layer remains fixed
while the green card tilts in the opposite direction on mouse hover or touch. On narrower
screens the complete card assembly is centered.

## Deployment

The existing Pages workflow assembles branch archives into one artifact:

- `main` → `/`
- `designer-application` → `/da`
- `workaway` → `/workaway`

The workflow change currently lives on this branch. Before treating `/workaway` as permanent,
the same workflow update should be merged to `main`; otherwise a later deployment from the old
`main` workflow would omit the Workaway branch.

## Open items after first review

- Add a current, friendly portrait.
- Add two to four photos of electrical, construction, remodeling, flooring, or farm work.
- Replace the general Workaway link with Matt's actual profile URL when available.
- Confirm exact travel dates and preferred minimum/maximum stay.
- Decide whether childcare should be stated explicitly after listing ages and relevant duties.
- Confirm whether any electrical credential should be named publicly.
