"use client";

import { useCallback, useEffect, useRef } from "react";

const SCRAMBLE_CHARS = "0123456789&%$#@";
const FLICKER_MS = 450; // how long a trailing letter keeps flickering after being passed over
const STEP_MS = 80; // stagger between letters locking in during the entry ripple

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Ripple the whole word in once on mount, converging toward its center. */
  scrambleOnMount?: boolean;
}

export function ScrambleText({ text, className, scrambleOnMount = false }: ScrambleTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);
  const resolveAt = useRef<number[]>(text.split("").map(() => -Infinity));
  const hoverIndex = useRef(-1); // letter currently under the pointer — flickers continuously, no timeout
  const rafId = useRef<number | undefined>(undefined);
  const reducedMotion = useRef(false);

  const randomChar = () => SCRAMBLE_CHARS.charAt(Math.floor(Math.random() * SCRAMBLE_CHARS.length));

  // the live hover point flickers forever; everything else is a hard cutover —
  // flickers until resolveAt, then locks. No blending, so it stays crisp.
  const render = useCallback(() => {
    const now = performance.now();
    let active = false;
    text.split("").forEach((ch, i) => {
      const el = charEls.current[i];
      if (!el) return;
      if (i === hoverIndex.current || now < resolveAt.current[i]) {
        el.textContent = randomChar();
        active = true;
      } else {
        el.textContent = ch;
      }
    });
    rafId.current = active ? requestAnimationFrame(render) : undefined;
  }, [text]);

  const ensureLoop = useCallback(() => {
    if (rafId.current == null) rafId.current = requestAnimationFrame(render);
  }, [render]);

  const indexFromX = (clientX: number) => {
    const rect = rootRef.current!.getBoundingClientRect();
    const charWidth = rect.width / text.length;
    return Math.min(text.length - 1, Math.max(0, Math.floor((clientX - rect.left) / charWidth)));
  };

  // farthest-first staggered resolveAt for every letter except entryIndex (unless
  // includeEntry) — this is what makes the word visibly converge inward onto a point
  const staggerFrom = useCallback(
    (entryIndex: number, includeEntry: boolean) => {
      const now = performance.now();
      const order = text
        .split("")
        .map((_, i) => i)
        .filter((i) => includeEntry || i !== entryIndex)
        .sort((a, b) => Math.abs(b - entryIndex) - Math.abs(a - entryIndex));
      order.forEach((idx, rank) => {
        resolveAt.current[idx] = now + (rank + 1) * STEP_MS;
      });
    },
    [text],
  );

  // fresh entry: whole word converges onto entryIndex, which then becomes the live hover point
  const rippleInto = useCallback(
    (entryIndex: number) => {
      if (reducedMotion.current) return;
      staggerFrom(entryIndex, false);
      hoverIndex.current = entryIndex;
      ensureLoop();
    },
    [staggerFrom, ensureLoop],
  );

  // moves the live hover point to idx, releasing everywhere it passed through (including
  // the previous hover point) into the timed trail, so a fast swipe marks its whole path
  const moveHoverTo = useCallback(
    (idx: number) => {
      if (reducedMotion.current || idx === hoverIndex.current) return;
      const now = performance.now();
      const prev = hoverIndex.current === -1 ? idx : hoverIndex.current;
      const lo = Math.min(prev, idx);
      const hi = Math.max(prev, idx);
      for (let i = lo; i <= hi; i++) {
        if (i !== idx) resolveAt.current[i] = now + FLICKER_MS;
      }
      hoverIndex.current = idx;
      ensureLoop();
    },
    [ensureLoop],
  );

  // a fresh entry always ripples; a move while already hovering just extends the trail
  const handleMove = useCallback(
    (clientX: number) => {
      const idx = indexFromX(clientX);
      if (hoverIndex.current === -1) rippleInto(idx);
      else moveHoverTo(idx);
    },
    [rippleInto, moveHoverTo],
  );

  const releaseHover = useCallback(() => {
    if (hoverIndex.current === -1) return;
    resolveAt.current[hoverIndex.current] = performance.now() + FLICKER_MS;
    hoverIndex.current = -1;
    ensureLoop();
  }, [ensureLoop]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (scrambleOnMount && !reducedMotion.current) {
      staggerFrom(Math.floor(text.length / 2), true);
      ensureLoop();
    }
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
    // mount-only: re-running this on every text/prop change would re-trigger the intro ripple
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className={className}>
      <span
        ref={rootRef}
        aria-hidden="true"
        style={{ display: "inline-flex", whiteSpace: "pre" }}
        onMouseEnter={(e) => rippleInto(indexFromX(e.clientX))}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={releaseHover}
        onTouchStart={(e) => rippleInto(indexFromX(e.touches[0].clientX))}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={releaseHover}
        onTouchCancel={releaseHover}
      >
        {text.split("").map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              charEls.current[i] = el;
            }}
          >
            {ch}
          </span>
        ))}
      </span>
      {/* scrambled letters are decorative; screen readers get the real word once */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
