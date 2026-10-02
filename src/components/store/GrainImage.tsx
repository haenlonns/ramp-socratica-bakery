import type { CSSProperties } from "react";
import { Grain } from "./Grain";
import "./grain.css";

/**
 * A transparent product cutout with grain clipped to its shape. The wrapper
 * takes the sizing class; the image fills it with `contain`, and the grain is
 * masked with the same image so it never lands on the empty space around it.
 */
export function GrainImage({
  src,
  alt = "",
  className,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`grainImage${className ? ` ${className}` : ""}`} style={style}>
      <img src={src} alt={alt} aria-hidden={alt ? undefined : true} />
      <Grain mask={src} />
    </span>
  );
}
