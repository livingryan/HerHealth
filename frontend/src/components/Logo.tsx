/**
 * HerHealth wordmark.
 *
 * Mark: an abstract botanical form — a soft bud cradled by two protective arcs,
 * drawn entirely in SVG with the brand's baby-pink palette. No external assets.
 * Wordmark: "HerHealth" set in the display serif, "AI" set small and spaced in sans.
 */
export const Logo = () => (
  <>
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M14 22c-3.3 0-6-2.7-6-6 0-1.7 0.7-3.2 1.8-4.3C7.9 12.4 7 11 7 9a1 1 0 1 1 2 0c0 1.1 0.9 2 2 2 0.6 0 1.1-0.2 1.5-0.6l1.5 1.5c-0.4 0.4-0.9 0.6-1.5 0.6-1.1 0-2 0.9-2 2 0 1.1 0.9 2 2 2s2-0.9 2-2c0-1.1 0.9-2 2-2s2 0.9 2 2c0 2-0.9 3.4-2.2 4.7C18 14.8 14 19.3 14 22Z"
        fill="#8D435F"
      />
      <path
        d="M14 26a1 1 0 1 1 0-2c-3.9 0-7-3.1-7-7 0-1.1 0.2-2.1 0.6-3 0.1-0.2 0.1-0.4 0.1-0.6a1 1 0 1 1 2 0c0 0.2 0 0.4 0.1 0.6 0.4 0.9 0.6 1.9 0.6 3 0 3.9-3.1 7-7 7"
        fill="#F8DCE6"
      />
      <path
        d="M14 22c3.3 0 6-2.7 6-6 0-1.7-0.7-3.2-1.8-4.3C20.1 12.4 21 11 21 9a1 1 0 1 0-2 0c0 1.1-0.9 2-2 2-0.6 0-1.1 0.2-1.5 0.6l-1.5 1.5c0.4 0.4 0.9 0.6 1.5 0.6 1.1 0 2 0.9 2 2 0 1.1-0.9 2-2 2s-2-0.9-2-2c0-1.1-0.9-2-2-2s-2 0.9-2-2c0-2 0.9-3.4 2.2-4.7C10 14.8 14 19.3 14 22Z"
        fill="#E9A1BA"
      />
      <circle cx="14" cy="10" r="2.6" fill="#FCEBF1" />
      <circle cx="14" cy="10" r="1" fill="#8D435F" opacity="0.35" />
    </svg>
    <span className="font-serif text-xl font-semibold text-ink tracking-tight">
      HerHealth
    </span>
    <span className="text-xs font-sans font-semibold text-pink tracking-wider uppercase ml-1">
      AI
    </span>
  </>
);