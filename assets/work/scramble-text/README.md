# ScrambleText

Drop-in replacement for the `ScrambleText` component used in the site header logo
(`turbopuffer.com/_next/static/chunks/7120-*.js`, module `83193`).

## Integration

Current call site (`Logo` component):

```tsx
<div className="flex flex-row gap-2" onMouseEnter={() => ref.current?.rescramble()}>
  <Image src={dark ? darkLogo : lightLogo} alt="Logo" width={26} height={16} />
  <ScrambleText ref={ref} texts={["turbopuffer"]} scrambleOnMount className="text-sm font-medium md:text-base" />
</div>
```

New call site — the `onMouseEnter`/`ref` wiring moves inside the component itself, since it
now needs real pointer coordinates over the letters (not just a "did you hover" signal):

```tsx
<div className="flex flex-row gap-2">
  <Image src={dark ? darkLogo : lightLogo} alt="Logo" width={26} height={16} />
  <ScrambleText text="turbopuffer" scrambleOnMount className="text-sm font-medium md:text-base" />
</div>
```

`texts={[...]}` (array, with an unused auto-cycle option) becomes `text="..."` (single string) —
the interactive version doesn't make sense combined with an automatic cycle, and the real call
site only ever passed one string.

**Behavior change to be aware of:** the original triggers off hovering the *whole* logo (icon +
text) via the wrapping div's `onMouseEnter`. This version listens on the text itself, since it
needs the pointer's x-position to know which letter to scramble. Hovering only the fish icon no
longer triggers anything. If that matters, extend the text's hit area with padding rather than
re-wiring the icon to forward pointer events — simpler and avoids two elements fighting over the
same interaction.

## What's added beyond the demo

- **Accessibility:** scrambled letters are `aria-hidden`; the real word is exposed once via a
  `sr-only` span (a class already used elsewhere in the site's markup), so screen readers get
  "turbopuffer," not a stream of mutating digits and symbols.
- **`prefers-reduced-motion`:** checked once on mount; if set, the component renders the plain
  word and pointer handlers no-op instead of animating.

## Verified

- `tsc --noEmit` — compiles clean in strict mode against TypeScript 5.9 and React 19 types.
- Bundled with esbuild and run in an actual browser (not just the hand-authored demo JS) —
  same converge-on-entry / hold-while-hovering / trail-along-path behavior confirmed via DOM
  inspection, zero console/runtime errors.
