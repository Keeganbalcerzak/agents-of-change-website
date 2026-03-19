import { Children, type CSSProperties, type ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  repeat?: number;
}

export default function Marquee({
  children,
  className,
  speed = 32,
  reverse = false,
  pauseOnHover = true,
  repeat = 2,
}: MarqueeProps) {
  const items = Children.toArray(children);
  const loops = Array.from({ length: Math.max(2, repeat) }, (_, loopIndex) =>
    items.map((item, itemIndex) => (
      <div className="magic-marquee-item" key={`${loopIndex}-${itemIndex}`}>
        {item}
      </div>
    )),
  );

  return (
    <div
      className={["magic-marquee", className].filter(Boolean).join(" ")}
      data-reverse={reverse ? "true" : "false"}
      data-pause-on-hover={pauseOnHover ? "true" : "false"}
      style={{ "--marquee-duration": `${speed}s` } as CSSProperties}
    >
      <div className="magic-marquee-track" aria-label="Trust indicators">
        {loops}
      </div>
    </div>
  );
}
