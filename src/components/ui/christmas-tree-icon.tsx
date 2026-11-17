import { cn } from "@/lib/cn";

const css = `
.rr-xmas-light{animation:rr-xmas-twinkle 1.6s ease-in-out infinite}
.rr-xmas-light-2{animation-delay:.4s}
.rr-xmas-light-3{animation-delay:.8s}
.rr-xmas-light-4{animation-delay:1.2s}
.rr-xmas-star{transform-box:fill-box;transform-origin:center;animation:rr-xmas-star 2.4s ease-in-out infinite}
@keyframes rr-xmas-twinkle{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes rr-xmas-star{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.3) rotate(18deg)}}
@media (prefers-reduced-motion: reduce){.rr-xmas-light,.rr-xmas-star{animation:none}}
`;

type ChristmasTreeIconProps = {
  active?: boolean;
  className?: string;
};

export function ChristmasTreeIcon({
  active = false,
  className,
}: ChristmasTreeIconProps) {
  const treeFill = active ? "currentColor" : "#16a34a";

  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
    >
      <style>{css}</style>
      <path
        d="M8 2.6 4.6 7h1.6L3.4 10.8h1.9L2.6 14h10.8l-2.7-3.2h1.9L9.8 7h1.6z"
        fill={treeFill}
      />
      <rect x="7" y="14" width="2" height="1.6" rx="0.3" fill="#92400e" />
      <path
        className="rr-xmas-star"
        d="M8 0.2l.62 1.26 1.38.2-1 .98.24 1.38L8 3.37l-1.24.65.24-1.38-1-.98 1.38-.2z"
        fill="#facc15"
      />
      <circle
        className="rr-xmas-light"
        cx="7.2"
        cy="6.2"
        r="0.85"
        fill="#ef4444"
      />
      <circle
        className="rr-xmas-light rr-xmas-light-2"
        cx="9.3"
        cy="9.3"
        r="0.85"
        fill="#facc15"
      />
      <circle
        className="rr-xmas-light rr-xmas-light-3"
        cx="5.9"
        cy="10.4"
        r="0.85"
        fill="#38bdf8"
      />
      <circle
        className="rr-xmas-light rr-xmas-light-4"
        cx="10.4"
        cy="12.6"
        r="0.85"
        fill="#f97316"
      />
      <circle
        className="rr-xmas-light rr-xmas-light-2"
        cx="6.8"
        cy="12.9"
        r="0.85"
        fill="#ef4444"
      />
    </svg>
  );
}
